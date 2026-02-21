# AI Net Assist - AI-Powered Network Design Assistant

The **AI Net Assist** is a modern, full-stack web application designed to help **SMEs (Small-Medium Enterprises)** and **network engineers** design professional network infrastructure with AI assistance. It features real-time collaboration, intelligent recommendations, automated diagrams, device selection, and cost estimation powered by OpenAI GPT-4.

**Live Application**: Deploy to Vercel with a single click. See [Deployment Instructions](#-deployment-to-vercel) below.

---

## Features

- **AI-Powered Chat Assistant**: Real-time network design assistance using OpenAI GPT-4 Turbo
- **Project Management**: Create, edit, and manage multiple network design projects
- **Device Recommendations**: AI-driven device suggestions based on requirements and budget
- **Cost Estimation**: Accurate cost analysis and budget allocation recommendations
- **User Authentication**: Secure email/password authentication with Supabase
- **Real-time Data Sync**: Cloud-based PostgreSQL database with automatic synchronization
- **Interactive Workspace**: Modern UI with tabs for chat, design, and settings
- **Responsive Design**: Mobile-to-desktop responsive interface
- **Enterprise Security**: Row-Level Security (RLS) policies and JWT authentication

---

## Technology Stack

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui  
**Backend**: Node.js, Next.js API Routes, Vercel  
**Database**: PostgreSQL (Supabase), 14 tables with RLS  
**Authentication**: Supabase Auth with JWT  
**AI/LLM**: Vercel AI SDK 6, OpenAI GPT-4 Turbo  
**Deployment**: Vercel (1-click deploy)

---

## Quick Start - Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project and note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`

2. **Deploy to Vercel**:
   - Click the "Publish" button in v0 or go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Add environment variables from your Supabase project
   - Deploy automatically

3. **Initialize Database**:
   - Visit `https://your-app.vercel.app/setup` after deployment
   - Click "Start Setup" to initialize the database

4. **Create Account & Start Designing**:
   - Sign up with your email
   - Create your first network design project
   - Chat with AI assistant for recommendations

### Option 2: Manual Local Setup

```bash
# Clone the repository
git clone https://github.com/antonclibert/ai-powered-net-assistant.git
cd ai-powered-net-assistant

# Install dependencies
npm install

# Create .env.local with your Supabase credentials
cp .env.example .env.local

# Start development server
npm run dev

# Visit http://localhost:3000/setup to initialize database
```

---

## Environment Variables

Required for Vercel deployment:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

All environment variables are automatically configured by Vercel when you connect Supabase integration.

---

## Project Structure

```
app/
├── page.tsx              # Landing page
├── setup/               # Database initialization
├── auth/                # Login & signup pages
├── api/
│   ├── chat/           # AI streaming endpoint
│   └── init-db/        # Database setup endpoint
├── dashboard/          # Project management
├── designer/           # Design workspace
└── settings/           # User settings

components/
├── network-design-assistant-v2.tsx  # AI chat interface
├── providers/                        # Auth provider
└── ui/                              # shadcn/ui components

lib/
├── supabase.ts         # Database client
hooks/
├── use-projects.ts     # Projects data hook
└── use-conversations.ts # Conversations hook

scripts/
└── 001_init_schema.sql # Database schema
```

---

## Database Schema

The application uses PostgreSQL with 14 tables:
- `users` - User profiles and preferences
- `projects` - Network design projects
- `conversations` - Chat conversations
- `chat_messages` - Chat message history
- `device_catalog` - Device library with recommendations
- `network_designs` - Saved network designs
- And more for comprehensive data management

All tables include Row-Level Security (RLS) policies to ensure users can only access their own data.

---

## API Endpoints

- `POST /api/chat` - Stream AI responses with tool calling
- `POST /api/init-db` - Initialize database schema
- `GET /setup` - Database initialization UI
- `GET /dashboard` - User dashboard
- `GET /designer/[projectId]` - Design workspace

---

## Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Submit a pull request with a description

---

## License

MIT License - See LICENSE file for details

---

## Support

- Documentation: See `SETUP.md`, `QUICK_START.md`, and `ARCHITECTURE.md`
- Issues: Create a GitHub issue for bugs and feature requests
- Questions: Check existing documentation or open a discussion

---

## What's New (v2 - 2024)

- Complete backend with PostgreSQL database
- Supabase authentication system
- OpenAI GPT-4 AI integration
- Real-time chat with streaming responses
- User project management
- Modern responsive UI design
- Production-ready code quality
- Comprehensive documentation
- One-click Vercel deployment
```

