import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client for browser/client-side operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side operations (with service role - bypasses RLS)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Type definitions for database tables
export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  industry: string | null;
  role: string;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
};

export type NetworkProject = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  project_type: string | null;
  company_size: number | null;
  budget: number | null;
  office_users: number;
  remote_users: number;
  server_count: number;
  printer_count: number;
  department_count: number;
  network_diagram: any;
  requirements: any;
  recommendations: any;
  cost_estimation: any;
  created_at: string;
  updated_at: string;
  is_template: boolean;
  template_category: string | null;
};

export type Conversation = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string | null;
  conversation_type: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  context_data: any;
  metadata: any;
  created_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  auto_save_designs: boolean;
  export_format: string;
  language: string;
  created_at: string;
  updated_at: string;
};

// Helper functions for common operations
export async function createNetworkProject(
  userId: string,
  projectData: Partial<NetworkProject>
) {
  const { data, error } = await supabase
    .from("network_projects")
    .insert([
      {
        user_id: userId,
        name: projectData.name || "Untitled Project",
        ...projectData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProjects(userId: string) {
  const { data, error } = await supabase
    .from("network_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createConversation(
  userId: string,
  projectId?: string
) {
  const { data, error } = await supabase
    .from("conversations")
    .insert([
      {
        user_id: userId,
        project_id: projectId || null,
        conversation_type: "network_design",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addChatMessage(
  conversationId: string,
  userId: string,
  role: "user" | "assistant",
  content: string,
  contextData?: any
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert([
      {
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
        context_data: contextData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
) {
  const { data, error } = await supabase
    .from("user_preferences")
    .update(preferences)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDeviceCatalog() {
  const { data, error } = await supabase
    .from("device_catalog")
    .select("*")
    .eq("is_active", true)
    .order("device_type", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getDesignTemplates() {
  const { data, error } = await supabase
    .from("design_templates")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
