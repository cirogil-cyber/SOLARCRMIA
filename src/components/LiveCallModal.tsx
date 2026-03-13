import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { PhoneOff, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveCallModalProps {
  leadName: string;
  onClose: () => void;
}

export const LiveCallModal: React.FC<LiveCallModalProps> = ({ leadName, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is not set.");
        alert("Erro: Chave da API do Gemini não configurada. Adicione VITE_GEMINI_API_KEY nas variáveis de ambiente.");
        setIsConnecting(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `Você é um consultor de energia solar conversando por telefone com o lead ${leadName}. Seja educado, persuasivo e tente agendar uma visita técnica.`,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            processor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
              }
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data
                  }
                });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              try {
                const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
              } catch (e) {
                console.error("Audio decode error", e);
              }
            }
          },
          onclose: () => {
            handleDisconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            handleDisconnect();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (sessionRef.current) {
      // sessionRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsConnected(false);
    onClose();
  };

  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center text-white relative overflow-hidden"
      >
        {/* Background Animation */}
        {isConnected && !isMuted && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-48 h-48 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
          </div>
        )}

        <div className="relative z-10">
          <div className="w-24 h-24 bg-neutral-800 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-neutral-700">
            <Volume2 className={`w-10 h-10 ${isConnected ? 'text-emerald-400' : 'text-neutral-500'}`} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">{leadName}</h2>
          <p className="text-neutral-400 mb-8">
            {isConnecting ? 'Conectando com a IA...' : isConnected ? 'Em chamada com Agente IA' : 'Pronto para ligar'}
          </p>

          <div className="flex justify-center gap-6">
            {!isConnected && !isConnecting ? (
              <button 
                onClick={connect}
                className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/20"
              >
                <PhoneOff className="w-6 h-6 rotate-[135deg]" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-amber-500/20 text-amber-500' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <button 
                  onClick={handleDisconnect}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-red-500/20"
                >
                  {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <PhoneOff className="w-6 h-6" />}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
