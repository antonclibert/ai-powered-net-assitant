# AI Net Assist - Setup & Deployment Guide

## Project Overview

AI Net Assist is a modern, AI-powered network design assistant built with Next.js 14, Supabase, and the Vercel AI SDK. It helps IT professionals and organizations design optimal network infrastructure with intelligent recommendations, cost estimations, and real-time collaboration.

### Key Features

- **AI-Powered Recommendations**: Get intelligent network design suggestions using OpenAI GPT-4
- **Real-time Chat**: Interactive conversations with the AI assistant about network requirements
- **Project Management**: Create, save, and manage multiple network design projects
- **User Authentication**: Secure Supabase authentication with email verification
- **User Preferences**: Customizable settings for theme, language, and export formats
- **Database Integration**: Complete backend with PostgreSQL via Supabase
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Mobile-friendly interface for all screen sizes

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account (free tier available at https://supabase.com)
- OpenAI API key (for GPT-4 access)
- Git installed

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
POSTGRES_URL=your_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host
SUPABASE_JWT_SECRET=your_jwt_secret

# AI Provider (OpenAI recommended, but supports others via Vercel AI Gateway)
# If using Vercel AI Gateway (recommended - no key needed if using OpenAI via Vercel)
# For direct OpenAI access:
OPENAI_API_KEY=sk-your-openai-api-key
```

### Getting Supabase Credentials

1. Go to https://supabase.com and create a new project
2. In the project settings, find:
   - API URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`
3. In Database settings, copy the connection strings

### Getting OpenAI API Key

1. Go to https://platform.openai.com
2. Create an API key in your account settings
3. Use it as `OPENAI_API_KEY` (or configure via Vercel AI Gateway)

## Database Setup

The database schema is defined in `/scripts/001_init_schema.sql`. 

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `/scripts/001_init_schema.sql`
5. Paste it into the query editor
6. Click "Run" to execute the migration

### Option 2: Using psql (PostgreSQL CLI)

```bash
psql -h your_postgres_host -U your_postgres_user -d your_database_name < scripts/001_init_schema.sql
```

## Installation

1. **Clone the repository** (or download the code)
```bash
git clone <repository-url>
cd ai-powered-net-assistant
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local` (if it exists)
   - Fill in all required environment variables
   - Ensure all Supabase and AI provider keys are correctly set

4. **Create database schema**
   - Follow the "Database Setup" section above
   - Verify all tables are created in Supabase SQL Editor

5. **Run the development server**
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

6. **Open in browser**
   - Navigate to http://localhost:3000
   - Create a new account or sign in
   - Start designing networks!

## Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI chat endpoint with streaming
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── dashboard/
│   │   └── page.tsx              # Projects dashboard
│   ├── designer/
│   │   └── [projectId]/
│   │       └── page.tsx          # Main design workspace
│   ├── settings/
│   │   └── page.tsx              # User settings
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles & design tokens
├── components/
│   ├── providers/
│   │   └── auth-provider.tsx     # Auth context provider
│   ├── network-design-assistant-v2.tsx  # Main AI assistant component
│   └── ui/                       # shadcn/ui components
├── hooks/
│   ├── use-conversations.ts      # Conversation data hooks
│   └── use-projects.ts           # Project data hooks
├── lib/
│   ├── supabase.ts               # Supabase client & helpers
│   └── utils.ts                  # Utility functions
├── middleware.ts                  # Next.js middleware for auth
├── scripts/
│   └── 001_init_schema.sql       # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts            # Tailwind CSS config
└── next.config.mjs               # Next.js config
```

## Key Dependencies

### Core Framework
- **Next.js 14.2**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety

### AI & LLM
- **ai** (^6.5.2): Vercel AI SDK for LLM integration
- **@ai-sdk/openai**: OpenAI provider integration
- **@ai-sdk/anthropic**: Anthropic Claude provider (optional)

### Backend & Database
- **@supabase/supabase-js**: Supabase JavaScript client
- **@supabase/auth-helpers-nextjs**: Supabase authentication helpers

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: High-quality React component library
- **lucide-react**: Icon library
- **@radix-ui/***: Unstyled, accessible components

### Data Management
- **swr**: Data fetching and caching library
- **vis-network**: Network diagram visualization
- **vis-data**: Data manipulation for vis-network

### Export & File Handling
- **jspdf**: PDF generation
- **html2canvas**: HTML to canvas conversion
- **xlsx**: Excel file manipulation
- **file-saver**: File download utilities

## Important Features

### Authentication Flow

1. Users sign up with email and password
2. Supabase sends verification email
3. After verification, users can sign in
4. JWT token stored in secure HTTP-only cookies
5. Middleware protects routes requiring authentication

### AI Chat Integration

- Uses Vercel AI SDK for streaming responses
- Supports multiple AI providers (OpenAI, Anthropic, etc.)
- Real-time message streaming for better UX
- Conversation history saved to Supabase
- Tool calling for structured outputs

### Database Row-Level Security (RLS)

- All tables protected with RLS policies
- Users can only access their own data
- Service role key used only for admin operations
- Follows PostgreSQL security best practices

## API Endpoints

### POST `/api/chat`
Handles AI chat requests with streaming support.

**Request:**
```json
{
  "messages": [{"role": "user", "content": "..."}],
  "conversationId": "...",
  "projectId": "..."
}
```

**Response:** Server-Sent Events (SSE) stream with AI responses

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com and sign in
3. Click "New Project" and select your repository
4. Configure environment variables in project settings
5. Click "Deploy"

### Deploy to Other Platforms

The application can be deployed to any platform supporting Node.js 18+:

- **Netlify**: Use Next.js preset
- **Heroku**: Follow Vercel guides (adapted)
- **AWS**: Use Amplify or Elastic Beanstalk
- **Docker**: Create Dockerfile for containerization

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Supabase credentials
- OpenAI/AI provider API key
- Any other secrets

## Development Tips

### Local Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Database Debugging

Access your Supabase database:
1. Go to Supabase project dashboard
2. Click "SQL Editor"
3. Write queries to inspect tables and data
4. Check RLS policies in "Authentication" → "Policies"

### AI Response Debugging

Enable debug logging in development:
```typescript
// In API routes
console.log("[v0] Request:", { messages, projectId });
```

## Troubleshooting

### "Supabase Connection Failed"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check internet connection
- Ensure Supabase project is active

### "Authentication not working"
- Clear browser cookies
- Check email verification status in Supabase dashboard
- Verify JWT secret is set correctly

### "AI responses not streaming"
- Verify OpenAI API key is valid
- Check account has credits
- Verify model name in `route.ts` is correct

### "Database schema not created"
- Check SQL execution in Supabase SQL Editor
- Verify user has adequate permissions
- Review SQL error messages carefully

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Database**: All tables have RLS enabled - users can only access own data
3. **Authentication**: Uses Supabase secure authentication with JWT
4. **API Keys**: Store all sensitive keys in environment variables
5. **HTTPS**: Always use HTTPS in production
6. **Password Hashing**: Supabase handles password security

## Performance Optimization

- Uses SWR for efficient data fetching and caching
- Implements lazy loading for components
- Optimizes database queries with indexes
- Uses streaming for AI responses to reduce latency
- CDN delivery via Vercel

## Support & Resources

- **Documentation**: See README.md and CONTRIBUTING.md
- **Supabase Docs**: https://supabase.com/docs
- **Vercel AI SDK**: https://sdk.vercel.ai
- **Next.js Docs**: https://nextjs.org/docs
- **OpenAI API**: https://platform.openai.com/docs

## License

See LICENSE file for details.

## Contributing

See CONTRIBUTING.md for contribution guidelines.

---

**Last Updated**: February 2024
**Version**: 2.0.0 (Complete Rewrite with AI SDK & Supabase)
