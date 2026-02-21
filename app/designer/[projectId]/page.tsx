"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase, NetworkProject } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NetworkDesignAssistantV2 } from "@/components/network-design-assistant-v2";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DesignerPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<NetworkProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!projectId || !user) return;

    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from("network_projects")
          .select("*")
          .eq("id", projectId)
          .eq("user_id", user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // Project not found
            router.push("/dashboard");
          }
          throw error;
        }

        setProject(data);
        setProjectName(data.name);
        setProjectDescription(data.description || "");
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user, router]);

  const handleSaveProject = async () => {
    if (!project) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("network_projects")
        .update({
          name: projectName,
          description: projectDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;

      // Update local state
      setProject({
        ...project,
        name: projectName,
        description: projectDescription,
      });

      alert("Project saved successfully!");
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-4">Project not found.</p>
            <Link href="/dashboard">
              <Button className="w-full">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 focus-visible:border-b focus-visible:border-blue-600"
                placeholder="Project Name"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProject}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="assistant" className="h-full flex flex-col">
          <TabsList className="rounded-none border-b border-gray-200 bg-gray-50 w-full justify-start px-6 py-0 h-12">
            <TabsTrigger value="assistant" className="rounded-none">
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="diagram" className="rounded-none">
              Network Diagram
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none">
              Project Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="flex-1 overflow-hidden m-0">
            <NetworkDesignAssistantV2 projectId={projectId} />
          </TabsContent>

          <TabsContent value="diagram" className="flex-1 overflow-hidden m-0 p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Network Diagram</CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center text-gray-500">
                  Network diagram visualization coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-auto m-0 p-6">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Describe your network project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <p className="text-sm text-gray-600 capitalize">
                    {project.status || "draft"}
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSaveProject}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
