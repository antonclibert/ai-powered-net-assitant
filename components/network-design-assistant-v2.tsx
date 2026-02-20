"use client";

import React, { useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, Zap, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface NetworkDesignAssistantV2Props {
  projectId?: string;
}

export function NetworkDesignAssistantV2({
  projectId,
}: NetworkDesignAssistantV2Props) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companySize: 50,
    budget: 50000,
    officeUsers: 40,
    remoteUsers: 10,
    requiredBandwidth: 1000,
    redundancyRequired: true,
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
    body: {
      conversationId,
      projectId,
    },
    onResponse: async (response) => {
      // Create conversation on first message
      if (!conversationId && projectId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from("conversations")
              .insert([
                {
                  user_id: user.id,
                  project_id: projectId,
                  conversation_type: "network_design",
                  title: `Network Design - ${new Date().toLocaleDateString()}`,
                },
              ])
              .select()
              .single();

            if (data) {
              setConversationId(data.id);
            }
          }
        } catch (error) {
          console.error("Failed to create conversation:", error);
        }
      }
    },
  });

  const handleFormChange = (
    field: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedMessage = `
    I need help designing a network with the following specifications:
    - Company Size: ${formData.companySize} employees
    - Budget: $${formData.budget.toLocaleString()}
    - Office Users: ${formData.officeUsers}
    - Remote Users: ${formData.remoteUsers}
    - Required Bandwidth: ${formData.requiredBandwidth} Mbps
    - Redundancy Required: ${formData.redundancyRequired ? "Yes" : "No"}
    
    Please provide recommendations for network infrastructure, devices, and cost estimation.
    `;

    handleInputChange({
      target: { value: formattedMessage },
    } as any);

    originalHandleSubmit(
      { preventDefault: () => {} } as any
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Left Panel - Form */}
      <div className="flex-1 overflow-auto p-6 border-r border-gray-200 max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Network Requirements
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Size */}
          <div className="space-y-2">
            <Label htmlFor="companySize" className="text-sm font-medium">
              Company Size (Employees)
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="companySize"
                min={10}
                max={5000}
                step={50}
                value={[formData.companySize]}
                onValueChange={(value) =>
                  handleFormChange("companySize", value[0])
                }
                className="flex-1"
              />
              <span className="text-sm font-semibold text-gray-900 min-w-16">
                {formData.companySize}
              </span>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-medium">
              Total Budget (USD)
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="budget"
                min={10000}
                max={500000}
                step={5000}
                value={[formData.budget]}
                onValueChange={(value) =>
                  handleFormChange("budget", value[0])
                }
                className="flex-1"
              />
              <span className="text-sm font-semibold text-gray-900 min-w-20">
                ${(formData.budget / 1000).toFixed(0)}K
              </span>
            </div>
          </div>

          {/* Office Users */}
          <div className="space-y-2">
            <Label htmlFor="officeUsers" className="text-sm font-medium">
              Office Users
            </Label>
            <Input
              id="officeUsers"
              type="number"
              value={formData.officeUsers}
              onChange={(e) =>
                handleFormChange("officeUsers", parseInt(e.target.value) || 0)
              }
              min="0"
            />
          </div>

          {/* Remote Users */}
          <div className="space-y-2">
            <Label htmlFor="remoteUsers" className="text-sm font-medium">
              Remote Users
            </Label>
            <Input
              id="remoteUsers"
              type="number"
              value={formData.remoteUsers}
              onChange={(e) =>
                handleFormChange("remoteUsers", parseInt(e.target.value) || 0)
              }
              min="0"
            />
          </div>

          {/* Required Bandwidth */}
          <div className="space-y-2">
            <Label htmlFor="bandwidth" className="text-sm font-medium">
              Required Bandwidth (Mbps)
            </Label>
            <Select
              value={formData.requiredBandwidth.toString()}
              onValueChange={(value) =>
                handleFormChange("requiredBandwidth", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 Mbps</SelectItem>
                <SelectItem value="500">500 Mbps</SelectItem>
                <SelectItem value="1000">1 Gbps</SelectItem>
                <SelectItem value="10000">10 Gbps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Redundancy */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Redundancy Required</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.redundancyRequired}
                onChange={(e) =>
                  handleFormChange("redundancyRequired", e.target.checked)
                }
                className="rounded border-gray-300"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Getting Recommendations..." : "Get AI Recommendations"}
            <Zap className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-sm">Configure your network requirements and click "Get AI Recommendations" to begin</p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-sm px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              originalHandleSubmit(e);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask follow-up questions about your network design..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
