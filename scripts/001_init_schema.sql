-- Initialize Database Schema for AI-Powered Network Design Assistant
-- This migration creates all necessary tables for user management, projects, and chat history

-- ============================================================================
-- 1. Enable Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. Create Auth-Related Tables (Enhanced User Management)
-- ============================================================================

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  industry TEXT,
  role TEXT DEFAULT 'user',
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_save_designs BOOLEAN DEFAULT TRUE,
  export_format TEXT DEFAULT 'pdf',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. Create Network Design Project Tables
-- ============================================================================

-- Network design projects
CREATE TABLE IF NOT EXISTS public.network_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  project_type TEXT,
  company_size INTEGER,
  budget DECIMAL(12, 2),
  office_users INTEGER DEFAULT 0,
  remote_users INTEGER DEFAULT 0,
  server_count INTEGER DEFAULT 0,
  printer_count INTEGER DEFAULT 0,
  department_count INTEGER DEFAULT 0,
  network_diagram JSONB,
  requirements JSONB,
  recommendations JSONB,
  cost_estimation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_template BOOLEAN DEFAULT FALSE,
  template_category TEXT
);

-- Network design components/devices
CREATE TABLE IF NOT EXISTS public.network_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.network_projects(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  device_name TEXT,
  quantity INTEGER DEFAULT 1,
  specifications JSONB,
  cost DECIMAL(10, 2),
  placement TEXT,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments within a network project
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.network_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_count INTEGER,
  server_count INTEGER,
  printer_count INTEGER,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. Create Chat and Conversation Tables
-- ============================================================================

-- Chat conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.network_projects(id) ON DELETE SET NULL,
  title TEXT,
  conversation_type TEXT DEFAULT 'network_design',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. Create Template and Library Tables
-- ============================================================================

-- Network design templates
CREATE TABLE IF NOT EXISTS public.design_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level TEXT DEFAULT 'beginner',
  company_size_range TEXT,
  template_data JSONB NOT NULL,
  thumbnail_url TEXT,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Device library/catalog
CREATE TABLE IF NOT EXISTS public.device_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_type TEXT NOT NULL,
  manufacturer TEXT,
  model_name TEXT NOT NULL,
  specifications JSONB,
  ports_config JSONB,
  price DECIMAL(10, 2),
  image_url TEXT,
  datasheet_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. Create Analytics and Feedback Tables
-- ============================================================================

-- User activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feedback_type TEXT,
  message TEXT NOT NULL,
  rating INTEGER,
  attached_data JSONB,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. Create Indexes for Performance
-- ============================================================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Project-related indexes
CREATE INDEX IF NOT EXISTS idx_network_projects_user_id ON public.network_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_network_projects_created_at ON public.network_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_network_projects_status ON public.network_projects(status);
CREATE INDEX IF NOT EXISTS idx_network_components_project_id ON public.network_components(project_id);

-- Conversation-related indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON public.conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);

-- Template and catalog indexes
CREATE INDEX IF NOT EXISTS idx_design_templates_category ON public.design_templates(category);
CREATE INDEX IF NOT EXISTS idx_device_catalog_type ON public.device_catalog(device_type);

-- Activity and feedback indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- ============================================================================
-- 8. Create Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/write own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- User preferences: Can only access own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Network projects: Can view own projects + public templates
CREATE POLICY "Users can view own projects" ON public.network_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" ON public.network_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.network_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.network_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Network components: Access through project ownership
CREATE POLICY "Access components through project" ON public.network_components
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.network_projects
      WHERE id = network_components.project_id
      AND user_id = auth.uid()
    )
  );

-- Departments: Access through project ownership
CREATE POLICY "Access departments through project" ON public.departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.network_projects
      WHERE id = departments.project_id
      AND user_id = auth.uid()
    )
  );

-- Conversations: Can only view own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages: Access through conversation ownership
CREATE POLICY "Access messages through conversation" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- User activity: Can only view own activity
CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

-- Feedback: Can only view own feedback
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 9. Create Trigger Functions for Updated_at Timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_projects_updated_at BEFORE UPDATE ON public.network_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_components_updated_at BEFORE UPDATE ON public.network_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_templates_updated_at BEFORE UPDATE ON public.design_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_catalog_updated_at BEFORE UPDATE ON public.device_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. Seed Data - Device Catalog
-- ============================================================================

INSERT INTO public.device_catalog (device_type, manufacturer, model_name, specifications, ports_config, price, image_url, is_active) 
VALUES 
  ('router', 'Cisco', 'ISR 4321 Router', '{"cpu": "2-core", "memory": "4 GB DRAM", "storage": "4 GB flash"}'::jsonb, '{"ge": 2, "sfp": 2}'::jsonb, 2000, 'https://api.iconify.design/mdi:router-wireless.svg', true),
  ('firewall', 'Fortinet', 'FortiGate 60F', '{"cpu": "dual-core", "memory": "4 GB"}'::jsonb, '{"ge": 10, "sfp": 2}'::jsonb, 1500, 'https://api.iconify.design/mdi:firewall.svg', true),
  ('switch', 'Cisco', 'Catalyst 9200 24-port', '{"cpu": "quad-core", "memory": "8 GB DRAM", "storage": "16 GB flash"}'::jsonb, '{"ge": 24, "sfp": 4}'::jsonb, 3000, 'https://api.iconify.design/mdi:switch.svg', true),
  ('server', 'Dell', 'PowerEdge R440', '{"processor": "Intel Xeon Silver 4210", "memory": "32 GB", "storage": "2x 480GB SSD"}'::jsonb, '{"ge": 4}'::jsonb, 5000, 'https://api.iconify.design/mdi:server.svg', true),
  ('printer', 'HP', 'LaserJet Pro M404dn', '{"processor": "1200 MHz", "memory": "256 MB"}'::jsonb, '{"ge": 1, "usb": 1}'::jsonb, 500, 'https://api.iconify.design/mdi:printer.svg', true),
  ('wireless_controller', 'Cisco', '3504 Wireless Controller', '{"cpu": "4-core", "memory": "8 GB DRAM"}'::jsonb, '{"ge": 8}'::jsonb, 2000, 'https://api.iconify.design/mdi:wifi.svg', true),
  ('access_point', 'Cisco', 'Aironet 2800 Series', '{"streams": "4x4 MU-MIMO with 3 spatial streams"}'::jsonb, '{"ge": 1}'::jsonb, 500, 'https://api.iconify.design/mdi:access-point.svg', true);

-- Create a default template for small businesses
INSERT INTO public.design_templates (name, description, category, difficulty_level, company_size_range, template_data, is_public)
VALUES (
  'Small Business Network',
  'A scalable network design suitable for small businesses with 10-50 employees',
  'small_business',
  'beginner',
  '10-50',
  '{
    "components": [
      {"type": "router", "quantity": 1},
      {"type": "firewall", "quantity": 1},
      {"type": "switch", "quantity": 2},
      {"type": "access_point", "quantity": 2}
    ],
    "topology": "hierarchical"
  }'::jsonb,
  true
);

-- ============================================================================
-- 11. Create Views for Common Queries
-- ============================================================================

-- Project summary view
CREATE OR REPLACE VIEW public.vw_project_summary AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.status,
  p.created_at,
  p.updated_at,
  COUNT(DISTINCT c.id) as conversation_count,
  COUNT(DISTINCT nc.id) as component_count
FROM public.network_projects p
LEFT JOIN public.conversations c ON p.id = c.project_id
LEFT JOIN public.network_components nc ON p.id = nc.project_id
GROUP BY p.id, p.user_id, p.name, p.status, p.created_at, p.updated_at;

-- User stats view
CREATE OR REPLACE VIEW public.vw_user_stats AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT c.id) as total_conversations,
  MAX(u.last_login) as last_login
FROM public.users u
LEFT JOIN public.network_projects p ON u.id = p.user_id
LEFT JOIN public.conversations c ON u.id = c.user_id
GROUP BY u.id, u.email, u.created_at;

-- Conversation summary view
CREATE OR REPLACE VIEW public.vw_conversation_summary AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.created_at,
  COUNT(cm.id) as message_count,
  MAX(cm.created_at) as last_message_at
FROM public.conversations c
LEFT JOIN public.chat_messages cm ON c.id = cm.conversation_id
GROUP BY c.id, c.user_id, c.title, c.created_at;

COMMIT;
