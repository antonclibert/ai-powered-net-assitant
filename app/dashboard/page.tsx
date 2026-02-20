"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import { supabase } from "@/lib/supabase";
import { Plus, Network, LogOut, Settings, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.from("network_projects").insert([
        {
          user_id: user?.id,
          name: "Untitled Network Project",
          status: "draft",
          description: "New network design project",
        },
      ]).select().single();

      if (error) throw error;
      router.push(`/designer/${data.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const { error } = await supabase
          .from("network_projects")
          .delete()
          .eq("id", projectId);

        if (error) throw error;
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-10 w-32 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Net Assist</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Projects</h2>
          <p className="text-gray-600">
            Create and manage your network designs with AI-powered assistance
          </p>
        </div>

        {/* Create Project Button */}
        <div className="mb-8">
          <Button
            onClick={handleCreateProject}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {isCreating ? "Creating..." : "New Project"}
          </Button>
        </div>

        {/* Projects Grid */}
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-white border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Network className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first network design project to get started
              </p>
              <Button onClick={handleCreateProject} disabled={isCreating}>
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow border border-gray-200"
              >
                <CardHeader>
                  <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(project.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Company Size</p>
                      <p className="font-semibold text-blue-700">
                        {project.company_size || "—"}
                      </p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Budget</p>
                      <p className="font-semibold text-green-700">
                        {project.budget
                          ? `$${project.budget.toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Link href={`/designer/${project.id}`} className="flex-1">
                      <Button className="w-full" variant="default" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
