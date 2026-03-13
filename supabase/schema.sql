-- Create Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  fase_crm TEXT NOT NULL DEFAULT 'new',
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  consumption_kwh NUMERIC,
  utility_company TEXT,
  amount_due NUMERIC,
  roof_notes TEXT,
  ai_handled BOOLEAN DEFAULT true,
  address TEXT,
  assigned_to TEXT,
  campaign TEXT,
  revenue NUMERIC,
  potencia_interesse TEXT,
  valor_proposta TEXT,
  forma_pagamento_interesse TEXT,
  data_agendamento TEXT
);

-- Create Interactions table (Chat History)
CREATE TABLE IF NOT EXISTS interacoes_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  notes TEXT
);

-- Create Settings table
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  system_instruction TEXT,
  auto_reply BOOLEAN DEFAULT true,
  proposal_template TEXT
);

-- Set up Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacoes_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);

-- Interactions policies
CREATE POLICY "Users can view interactions of their leads" ON interacoes_chat
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = interacoes_chat.lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interactions for their leads" ON interacoes_chat
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = interacoes_chat.lead_id AND leads.user_id = auth.uid()
    )
  );

-- Projects policies
CREATE POLICY "Users can view their projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = projects.lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = projects.lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = projects.lead_id AND leads.user_id = auth.uid()
    )
  );

-- Settings policies
CREATE POLICY "Users can view their settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);
