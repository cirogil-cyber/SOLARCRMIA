import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("VITE_GEMINI_API_KEY is not set. AI features will not work.");
      throw new Error("API Key do Gemini não configurada. Verifique as configurações de ambiente.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// 1. AI powered chatbot (gemini-3.1-pro-preview)
export async function chatWithLead(history: any[], message: string, systemInstruction: string) {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction,
    },
  });
  
  // Replay history (simplified for this demo, usually we'd pass history to create)
  // For now, we'll just send the latest message with context if needed, or use a fresh chat
  // In a real app, we'd maintain the chat session or pass the full history.
  const prompt = `History:\n${history.map(h => `${h.role}: ${h.text}`).join('\n')}\n\nLead: ${message}`;
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text;
}

// 2. Fast AI responses (gemini-3.1-flash-lite-preview)
export async function quickReplySuggestion(context: string) {
  const response = await getAI().models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Based on this context, suggest 3 quick reply options for the sales rep to send to the lead. Context: ${context}`,
  });
  return response.text;
}

// 3. Analyze images (gemini-3.1-pro-preview)
export async function analyzeEnergyBill(base64Image: string, mimeType: string) {
  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Analyze this energy bill. Extract the monthly consumption in kWh, the utility company name, and the total amount due. Return as JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          consumptionKwh: { type: Type.NUMBER },
          utilityCompany: { type: Type.STRING },
          amountDue: { type: Type.NUMBER }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

// 4. Video understanding (gemini-3.1-pro-preview)
export async function analyzeRoofVideo(base64Video: string, mimeType: string) {
  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Video, mimeType } },
        { text: "Analyze this video of a roof. Identify potential shading issues, roof type (e.g., tile, metal), and estimate available space for solar panels. Provide a brief summary." }
      ]
    }
  });
  return response.text;
}

// 5. Transcribe audio (gemini-3-flash-preview)
export async function transcribeAudioNote(base64Audio: string, mimeType: string) {
  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Audio, mimeType } },
        { text: "Transcribe this audio note accurately." }
      ]
    }
  });
  return response.text;
}

// 6. Think more when needed (gemini-3.1-pro-preview, ThinkingLevel.HIGH)
export async function generateComplexProposal(leadData: any) {
  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a detailed, high-ticket solar energy proposal for this lead. Consider ROI, payback period, equipment tier, and financing options. Lead Data: ${JSON.stringify(leadData)}`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });
  return response.text;
}

// 7. Generate speech (gemini-2.5-flash-preview-tts)
export async function generateVoiceMessage(text: string) {
  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Professional sounding voice
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

// 8. Use Google Maps data (gemini-2.5-flash)
export async function checkLocationIrradiance(address: string) {
  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: `What is the solar potential and average irradiance for this address? Also, are there any notable solar installations nearby? Address: ${address}`,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });
  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
}

// 9. Use Google Search data (gemini-3-flash-preview)
export async function searchUtilityRates(region: string) {
  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `What are the current electricity tariffs and net metering regulations for solar energy in ${region}?`,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });
  return response.text;
}

// 10. Live API will be handled in a separate component due to its streaming nature.
