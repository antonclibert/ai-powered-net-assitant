# Deploying AI Net Assist to Vercel

This guide will walk you through deploying your AI Net Assist application to Vercel in just a few minutes.

## Prerequisites

1. A GitHub account
2. A Vercel account (free at vercel.com)
3. A Supabase account (free at supabase.com)
4. An OpenAI API key

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: ai-net-assist (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Select the region closest to you
4. Click "Create new project"
5. Wait for the project to be provisioned (2-5 minutes)
6. Once ready, go to **Project Settings** → **API**
7. Copy these values (you'll need them later):
   - `SUPABASE_URL` (under "Project URL")
   - `SUPABASE_ANON_KEY` (under "Project API keys")
   - `SUPABASE_SERVICE_ROLE_KEY` (under "Project API keys")

## Step 2: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Click on your profile → "API keys"
4. Click "Create new secret key"
5. Copy the key and save it securely (you won't be able to see it again)

## Step 3: Push Code to GitHub

The code should already be connected to GitHub (from v0). If not:

1. Go to [github.com](https://github.com) and sign in
2. Create a new repository named `ai-powered-net-assistant`
3. Follow GitHub's instructions to push your local code to the repository

## Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Search for `ai-powered-net-assistant` and select it
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
6. Add Environment Variables:
   - Click "Add Environment Variable"
   - Add these variables (get values from Supabase and OpenAI):
     ```
     NEXT_PUBLIC_SUPABASE_URL = (from Supabase)
     NEXT_PUBLIC_SUPABASE_ANON_KEY = (from Supabase)
     SUPABASE_SERVICE_ROLE_KEY = (from Supabase)
     SUPABASE_URL = (same as NEXT_PUBLIC_SUPABASE_URL)
     POSTGRES_URL = (from Supabase - Connection Pooling string)
     OPENAI_API_KEY = (from OpenAI)
     ```
7. Click "Deploy"
8. Wait for deployment to complete (2-5 minutes)

### Option B: Using v0 Publish Button

If you created this in v0:
1. Click the "Publish" button in the top right
2. Select Vercel as the deployment target
3. Follow the prompts to connect your Vercel account
4. Environment variables will be auto-populated if Supabase is connected

## Step 5: Initialize Database

After deployment:

1. Wait for the deployment to complete
2. Go to your Vercel app URL: `https://[your-project-name].vercel.app`
3. Click the "Setup" button in the navigation
4. Click "Start Setup" to initialize the database
5. Wait for all steps to complete (should take ~30 seconds)

## Step 6: Create Your First Account

1. Once setup is complete, click "Create Your First Account"
2. You'll be redirected to the signup page
3. Enter your email and password
4. Verify your email (check your inbox)
5. Log in to start designing networks!

## Verifying Deployment

### Check Deployment Status
1. Go to [vercel.com](https://vercel.com)
2. Click your project
3. Go to "Deployments" tab
4. Verify the latest deployment shows "Ready"

### Test the Application

1. Visit your app: `https://[your-project-name].vercel.app`
2. Click "Setup" to verify database is initialized
3. Sign up with a test email
4. Create a new project
5. Chat with the AI assistant

## Environment Variables Explained

| Variable | Source | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Public Supabase endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Public Supabase API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Service role key for admin operations |
| `SUPABASE_URL` | Same as NEXT_PUBLIC_SUPABASE_URL | Backend Supabase URL |
| `POSTGRES_URL` | Supabase → Settings → Database | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI Platform | OpenAI API key for GPT-4 |

## Troubleshooting

### "Database schema error"
1. Go to `/setup` page
2. Click "Start Setup" again
3. Check Supabase dashboard to verify tables were created

### "Authentication failed"
1. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
2. Check that Supabase project is active
3. Try clearing browser cookies and trying again

### "AI chat not working"
1. Verify `OPENAI_API_KEY` is set in Vercel
2. Check that you have API credits in OpenAI account
3. Go to [platform.openai.com](https://platform.openai.com) to check usage

### "Environment variables not working"
1. Re-deploy the project after adding variables:
   - Go to Vercel dashboard
   - Click your project
   - Go to "Deployments"
   - Click the three dots on latest deployment
   - Select "Redeploy"

## Next Steps

After successful deployment:

1. **Customize Branding**:
   - Edit colors in `app/globals.css`
   - Update company name in navigation
   - Add your logo

2. **Configure AI Behavior**:
   - Edit system prompt in `app/api/chat/route.ts`
   - Adjust model parameters (temperature, max tokens)

3. **Add Team Members**:
   - Go to Supabase dashboard
   - Invite team members to your project

4. **Monitor Usage**:
   - Vercel Analytics: Built-in performance monitoring
   - OpenAI Usage: Check at platform.openai.com
   - Supabase Metrics: Check at supabase.com

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- OpenAI Docs: [platform.openai.com/docs](https://platform.openai.com/docs)
- GitHub Issues: Report bugs or request features

## Security Notes

- Never commit `.env` files to GitHub
- Use strong database passwords
- Rotate API keys periodically
- Enable Supabase RLS (enabled by default)
- Monitor API usage to prevent unexpected costs

Congratulations! Your AI Net Assist application is now live and ready for use! 🎉
