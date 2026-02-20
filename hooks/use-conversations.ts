import useSWR from "swr";
import { supabase, Conversation } from "@/lib/supabase";

const fetcher = async (conversationId?: string) => {
  if (!conversationId) return null;

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  return data as Conversation;
};

const messagesFetcher = async (conversationId?: string) => {
  if (!conversationId) return [];

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export function useConversation(conversationId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    conversationId ? ["conversation", conversationId] : null,
    () => fetcher(conversationId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    conversation: data || null,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useConversationMessages(conversationId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    conversationId ? ["messages", conversationId] : null,
    () => messagesFetcher(conversationId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000,
    }
  );

  return {
    messages: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
