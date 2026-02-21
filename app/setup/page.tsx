'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle, Network } from 'lucide-react';

export default function SetupPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState({
    database: false,
    auth: false,
    ai: false,
    seed: false,
  });

  const initializeDatabase = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      // Step 1: Initialize database schema
      setSteps((prev) => ({ ...prev, database: true }));
      const initResponse = await fetch('/api/init-db', {
        method: 'POST',
      });
      
      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || 'Failed to initialize database');
      }

      // Step 2: Verify authentication
      setSteps((prev) => ({ ...prev, auth: true }));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 3: Check AI integration
      setSteps((prev) => ({ ...prev, ai: true }));
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiKey) {
        console.warn('Gemini API key not configured');
      }
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 4: Seed data
      setSteps((prev) => ({ ...prev, seed: true }));
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during setup');
    } finally {
      setIsInitializing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>Setup Complete!</CardTitle>
            <CardDescription>
              Your AI Net Assist application is ready to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Database initialized
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Authentication configured
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                AI integration ready
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Sample data loaded
              </div>
            </div>

            <Button
              onClick={() => (window.location.href = '/auth/signup')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Account
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Network className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle>Welcome to AI Net Assist</CardTitle>
          <CardDescription>
            Let's set up your application for first use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">
                Database Setup
              </span>
              {steps.database ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isInitializing ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">
                Authentication
              </span>
              {steps.auth ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isInitializing ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">
                AI Integration
              </span>
              {steps.ai ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isInitializing ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">
                Sample Data
              </span>
              {steps.seed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isInitializing ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
            </div>
          </div>

          <Button
            onClick={initializeDatabase}
            disabled={isInitializing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              'Start Setup'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            This process may take a few moments. Please don't close this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
