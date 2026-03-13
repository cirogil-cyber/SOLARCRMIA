/*
  # Create Core CRM Tables for Solar Power Sales

  1. New Tables
    - `leads` - Main leads table for solar power sales
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, lead name)
      - `phone` (text, contact phone)
      - `email` (text, contact email)
      - `fase_crm` (text, pipeline stage - new/contact/meeting/proposal/negotiation/closed)
      - `source` (text, lead source - Manual/Indicação/Site/Instagram)
      - `created_at` (timestamp)
      - `consumption_kwh` (numeric)
      - `utility_company` (text)
      - `amount_due` (numeric)
      - `roof_notes` (text)
      - `ai_handled` (boolean, whether handled by AI)
      - `address` (text)
      - `assigned_to` (text)
      - `campaign` (text)
      - `revenue` (numeric)
      - `potencia_interesse` (text, kW interest)
      - `valor_proposta` (text, proposal value)
      - `forma_pagamento_interesse` (text, payment method)
      - `data_agendamento` (text, scheduled visit date)
    
    - `interacoes_chat` - Chat history for leads
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `role` (text, user/assistant)
      - `text` (text, message content)
      - `audio_url` (text)
      - `timestamp` (timestamp)
    
    - `projects` - Construction projects linked to leads
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `name` (text, project name)
      - `status` (text, project status)
      - `start_date` (timestamp)
      - `estimated_completion_date` (timestamp)
      - `assigned_to` (text)
      - `notes` (text)
    
    - `settings` - User configuration
      - `user_id` (uuid, primary key)
      - `system_instruction` (text, AI instructions)
      - `auto_reply` (boolean)
      - `proposal_template` (text)

  2. Security
    - Enable RLS on all tables
    - Users can only view/edit their own leads and related data
    - All policies check auth.uid() = user_id for data ownership

  3. Important Notes
    - All lead data is isolated by user_id for multi-tenancy
    - The schema focuses on solar power sales (construction, not rental)
    - Cascade delete on interacoes_chat and projects when lead is deleted
*/

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

CREATE TABLE IF NOT EXISTS interacoes_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS settings (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  system_instruction TEXT,
  auto_reply BOOLEAN DEFAULT true,
  proposal_template TEXT
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacoes_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON leads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view interactions of their leads"
  ON interacoes_chat FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = interacoes_chat.lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interactions for their leads"
  ON interacoes_chat FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = interacoes_chat.lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = projects.lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = projects.lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = projects.lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their settings"
  ON settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
