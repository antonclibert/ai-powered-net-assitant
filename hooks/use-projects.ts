import useSWR from "swr";
import { supabase, NetworkProject } from "@/lib/supabase";

const fetcher = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("network_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as NetworkProject[];
};

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR(
    "user-projects",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    projects: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
