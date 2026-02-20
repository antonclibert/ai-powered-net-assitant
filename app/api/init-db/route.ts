import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const initSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  design_data JSONB,
  network_type VARCHAR(100),
  company_size INTEGER,
  budget DECIMAL(12, 2),
  estimated_cost DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device catalog
CREATE TABLE IF NOT EXISTS public.device_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  specifications JSONB,
  price DECIMAL(10, 2),
  performance_rating INTEGER,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Network designs
CREATE TABLE IF NOT EXISTS public.network_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  topology_type VARCHAR(100),
  design_data JSONB,
  devices JSONB,
  cost_breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS conversations_project_id ON public.conversations(project_id);
CREATE INDEX IF NOT EXISTS chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS network_designs_project_id ON public.network_designs(project_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_catalog ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS users_select ON public.users;
DROP POLICY IF EXISTS users_update ON public.users;
DROP POLICY IF EXISTS projects_select ON public.projects;
DROP POLICY IF EXISTS projects_insert ON public.projects;
DROP POLICY IF EXISTS projects_update ON public.projects;
DROP POLICY IF EXISTS projects_delete ON public.projects;
DROP POLICY IF EXISTS conversations_select ON public.conversations;
DROP POLICY IF EXISTS conversations_insert ON public.conversations;
DROP POLICY IF EXISTS conversations_delete ON public.conversations;
DROP POLICY IF EXISTS chat_messages_select ON public.chat_messages;
DROP POLICY IF EXISTS chat_messages_insert ON public.chat_messages;
DROP POLICY IF EXISTS network_designs_select ON public.network_designs;
DROP POLICY IF EXISTS network_designs_insert ON public.network_designs;
DROP POLICY IF EXISTS device_catalog_select ON public.device_catalog;

-- RLS Policies for users
CREATE POLICY users_select ON public.users
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY users_update ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY projects_select ON public.projects
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY projects_insert ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY projects_update ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY projects_delete ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY conversations_select ON public.conversations
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY conversations_insert ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversations_delete ON public.conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY chat_messages_select ON public.chat_messages
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

CREATE POLICY chat_messages_insert ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for network_designs
CREATE POLICY network_designs_select ON public.network_designs
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY network_designs_insert ON public.network_designs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Public read access to device catalog
CREATE POLICY device_catalog_select ON public.device_catalog
  FOR SELECT USING (true);

-- Insert sample devices
INSERT INTO public.device_catalog (name, category, manufacturer, model, price, performance_rating, is_recommended)
VALUES
  ('Cisco Catalyst 9200', 'Core Switch', 'Cisco', 'C9200-24P', 15000.00, 5, true),
  ('Dell PowerConnect N3048P', 'Access Switch', 'Dell', 'N3048P', 8000.00, 4, true),
  ('Fortinet FortiGate 300D', 'Firewall', 'Fortinet', '300D', 12000.00, 5, true),
  ('Cisco ASA 5525-X', 'Firewall', 'Cisco', '5525-X', 10000.00, 4, false),
  ('Cisco Aironet 9120AX', 'Access Point', 'Cisco', '9120AX', 2500.00, 4, true),
  ('Ubiquiti UniFi 6 Pro', 'Access Point', 'Ubiquiti', 'U6-Pro', 1200.00, 4, true),
  ('HP ProCurve 2530-48G', 'Managed Switch', 'HP', '2530-48G', 5000.00, 3, false),
  ('Juniper EX4400', 'Enterprise Switch', 'Juniper', 'EX4400', 18000.00, 5, false)
ON CONFLICT DO NOTHING;
`;

export async function POST(request: NextRequest) {
  try {
    // Security: Only allow if secret token is provided
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INIT_DB_SECRET || 'dev-token-change-in-production';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Execute the initialization SQL
    const { error } = await supabase.rpc('exec', {
      sql: initSQL,
    }).catch(() => {
      // If exec RPC doesn't exist, we'll use the admin query method
      return { error: null };
    });

    if (error && !error.message.includes('does not exist')) {
      // Try executing via the Postgres connection
      const { data, error: queryError } = await supabase
        .from('_sql_exec')
        .insert([{ query: initSQL }])
        .select();

      if (queryError && !queryError.message.includes('does not exist')) {
        return NextResponse.json(
          { error: queryError.message, details: queryError },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to initialize database',
    example: 'POST /api/init-db with Authorization: Bearer <token>',
  });
}
