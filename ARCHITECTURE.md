# AI Net Assist - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                    (Next.js + React)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │  Landing    │    │  Dashboard   │    │   Designer      │    │
│  │   Page      │───▶│   (Projects) │───▶│   Workspace     │    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
│                                                                   │
│  ┌──────────────────────────┐    ┌──────────────────────────┐   │
│  │   Auth Pages             │    │  Settings                │   │
│  │ (Login/Signup)           │    │  (Preferences)           │   │
│  └──────────────────────────┘    └──────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          shadcn/ui Components                            │   │
│  │  Button, Card, Input, Select, Tabs, Slider, etc.        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
│               (Next.js Route Middleware)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  • Route Protection (Authentication)                             │
│  • Session Validation (JWT from Cookies)                         │
│  • Redirect to Login for Protected Routes                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                   │
│            (Next.js Route Handlers)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/chat ──▶ Streaming responses with SSE               │
│                                                                   │
│  ┌────────────────────────────────────────┐                     │
│  │  AI Chat Handler                       │                     │
│  │  ├─ Convert messages to model format   │                     │
│  │  ├─ Stream AI responses                │                     │
│  │  ├─ Execute AI tools                   │                     │
│  │  └─ Persist to database                │                     │
│  └────────────────────────────────────────┘                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ Streaming (SSE)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI PROVIDER LAYER                             │
│                  (Vercel AI SDK 6)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  OpenAI      │  │  Anthropic   │  │  Groq        │           │
│  │  GPT-4       │  │  Claude      │  │  (Fast)      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌────────────────────────────────────────┐                     │
│  │  AI Tools                              │                     │
│  │  ├─ saveNetworkDesign()                │                     │
│  │  ├─ getDeviceRecommendations()         │                     │
│  │  └─ analyzeBudget()                    │                     │
│  └────────────────────────────────────────┘                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                              │
│                (Supabase + Supabase.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────┐                     │
│  │  Supabase Client                       │                     │
│  │  ├─ Authentication                     │                     │
│  │  ├─ Database Operations (CRUD)         │                     │
│  │  └─ Real-time Subscriptions            │                     │
│  └────────────────────────────────────────┘                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ PostgreSQL Protocol
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│            (PostgreSQL via Supabase)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  14 Tables (with RLS & Indexes)                            │ │
│  │                                                             │ │
│  │  Users         │ Projects      │ Chat                       │ │
│  │  ├─ users      │ ├─ projects   │ ├─ conversations          │ │
│  │  ├─ prefs      │ ├─ components │ └─ chat_messages          │ │
│  │  └─ activity   │ └─ departments│                           │ │
│  │                │               │ Content                    │ │
│  │  Auth          │ Analytics     │ ├─ templates              │ │
│  │  └─ auth.users │ ├─ activity   │ ├─ device_catalog         │ │
│  │                │ └─ feedback   │ └─ (3 views)              │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────┐                     │
│  │  Security & Performance                │                     │
│  │  ├─ Row-Level Security (RLS)           │                     │
│  │  ├─ 25+ Performance Indexes            │                     │
│  │  ├─ Automatic Timestamp Triggers       │                     │
│  │  └─ Connection Pooling                 │                     │
│  └────────────────────────────────────────┘                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Authentication Flow

```
User                Browser              Middleware          Supabase Auth
 │                    │                      │                     │
 │──Sign Up────────────│                      │                     │
 │                     │──Hash Password───────────────────────────▶ │
 │                     │                      │                     │
 │                     │◀─────Create User─────────────────────────── │
 │                     │                      │                     │
 │                     │──Send Verification Email                  │
 │                     │                      │                     │
 │◀─Verification Link──│                      │                     │
 │                     │──Confirm Email───────────────────────────▶ │
 │                     │                      │                     │
 │──Sign In────────────│                      │                     │
 │                     │──Verify Password─────────────────────────▶ │
 │                     │                      │                     │
 │                     │◀────Create JWT───────────────────────────── │
 │                     │                      │                     │
 │                     │──Store JWT in Cookie                       │
 │                     │                      │                     │
 │──Request────────────│──Include JWT─────────│                     │
 │                     │                      │──Validate JWT─────▶ │
 │                     │                      │◀────Valid ─────── │
 │                     │──Allow Request───────│                     │
 │                     │                      │                     │
```

### Project Creation Flow

```
User               Frontend              API Route          Database
 │                    │                      │                   │
 │──Click "New"──────▶│                      │                   │
 │                    │──GET/POST────────────│                   │
 │                    │                      │──INSERT────────────│
 │                    │                      │                    │
 │                    │                      │◀─New Project ID ── │
 │                    │◀─Return data────────│                   │
 │                    │                      │                   │
 │◀─Redirect to Designer─                   │                   │
 │                    │                      │                   │
 │                    │◀─Fetch Project──────────────────────────▶ │
 │                    │◀─Get RLS Filtered Data                    │
 │                    │                      │                   │
```

### AI Chat Flow

```
User              Frontend           API Route           AI Provider      Database
 │                   │                   │                    │              │
 │──Submit Form──────│                   │                    │              │
 │                   │──POST /api/chat──│                    │              │
 │                   │ (messages[])      │                    │              │
 │                   │                   │──Convert────────▶ │              │
 │                   │                   │  (prepare format)  │              │
 │                   │                   │                    │              │
 │                   │                   │──Stream Text──────▶│              │
 │                   │                   │◀─Streaming Response│              │
 │                   │◀─SSE Stream──────│                    │              │
 │                   │                   │                    │              │
 │◀─Display Response │                   │──Execute Tool─────│              │
 │                   │                   │                   │──INSERT──────│
 │                   │                   │◀──Tool Result─────│ (save chat)  │
 │                   │                   │                    │◀─Result ─── │
 │                   │                   │──More Text────────▶│              │
 │                   │◀─Final Response──│                    │              │
 │                   │                   │                    │              │
```

---

## Component Architecture

```
App Root (layout.tsx)
├── AuthProvider
│   │
│   ├── Public Routes
│   │   ├── / (Landing)
│   │   ├── /auth/login
│   │   └── /auth/signup
│   │
│   └── Protected Routes
│       ├── /dashboard
│       │   └── ProjectCard (multiple)
│       │
│       ├── /designer/[projectId]
│       │   ├── Tabs
│       │   │   ├── AssistantTab
│       │   │   │   └── NetworkDesignAssistantV2
│       │   │   │       ├── Form (left)
│       │   │   │       └── Chat (right)
│       │   │   │
│       │   │   ├── DiagramTab
│       │   │   └── SettingsTab
│       │   │
│       │   └── Header
│       │       └── Save button
│       │
│       └── /settings
│           ├── ProfileSection
│           └── PreferencesSection

Custom Hooks (Data Layer)
├── useProjects()
│   └── fetches: network_projects
│
├── useConversation(id)
│   └── fetches: conversations
│
└── useConversationMessages(id)
    └── fetches: chat_messages

UI Components (shadcn/ui)
├── Button
├── Card
├── Input
├── Select
├── Slider
├── Switch
├── Tabs
├── Tooltip
├── Alert
├── Skeleton
└── (20+ components)
```

---

## Database Schema (Simplified)

```
┌─────────────────────┐
│      USERS          │
├─────────────────────┤
│ id (PK) [UUID]      │ ◄──┐ Linked to Supabase Auth
│ email               │    │
│ full_name           │    │
│ company_name        │    │
│ role                │    │
│ created_at          │    │
└─────────────────────┘    │
         │                 │
         ▼                 │
┌──────────────────────┐   │
│ USER_PREFERENCES     │   │
├──────────────────────┤   │
│ id (PK)              │   │
│ user_id (FK) ────────┴───┤
│ theme                │    │
│ language             │    │
│ notifications_enabled│    │
└──────────────────────┘    │
                            │
┌──────────────────────┐    │
│ NETWORK_PROJECTS     │    │
├──────────────────────┤    │
│ id (PK)              │    │
│ user_id (FK) ────────┴───┐
│ name                 │    │
│ description          │    │
│ status               │    │
│ budget               │    │
│ company_size         │    │
│ network_diagram (JSON)   │
│ created_at           │    │
└──────────────────────┘    │
    │                │       │
    ▼                ▼       │
┌──────────────────┐ ┌──────────────────┐
│ NETWORK_         │ │ CONVERSATIONS    │
│ COMPONENTS       │ │                  │
├──────────────────┤ ├──────────────────┤
│ id (PK)          │ │ id (PK)          │
│ project_id (FK)  │ │ user_id (FK) ───┘
│ device_type      │ │ project_id (FK)  │
│ quantity         │ │ conversation_    │
│ specifications   │ │ type             │
│ (JSON)           │ │ created_at       │
└──────────────────┘ └──────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ CHAT_MESSAGES    │
                   ├──────────────────┤
                   │ id (PK)          │
                   │ conversation_id  │
                   │ (FK)             │
                   │ user_id (FK)     │
                   │ role             │
                   │ content          │
                   │ context_data JSON│
                   │ created_at       │
                   └──────────────────┘

Security: All tables have RLS enabled
         Users can only access their own data
```

---

## State Management

```
Global State (React Context)
│
├── AuthContext
│   ├── session (JWT token)
│   ├── user (User object)
│   ├── loading (boolean)
│   └── signOut() (function)
│
├── useProjects Hook (SWR)
│   ├── projects (array)
│   ├── isLoading (boolean)
│   ├── error (Error)
│   └── mutate() (refresh)
│
└── useConversation Hook (SWR)
    ├── conversation (object)
    ├── messages (array)
    ├── isLoading (boolean)
    ├── error (Error)
    └── mutate() (refresh)

Component Local State
│
├── Form inputs (formData)
├── UI state (isOpen, isLoading)
├── Chat messages (from API streaming)
└── Temporary edits (before save)
```

---

## API Endpoint Details

### POST /api/chat

**Purpose**: Stream AI responses with tool calling

**Request**:
```javascript
{
  messages: [
    { role: "user", content: "..." },
    { role: "assistant", content: "..." }
  ],
  conversationId: "uuid",
  projectId: "uuid"
}
```

**Response**: Server-Sent Events (SSE)
```
data: {"type":"text-delta","delta":"recommendation"}
data: [DONE]
```

**Features**:
- Message format conversion
- Streaming responses
- Tool execution (saveNetworkDesign, etc.)
- Error handling
- Database persistence

---

## Security Architecture

### Authentication
```
1. User signs up with email/password
   ↓
2. Supabase hashes password (bcrypt)
   ↓
3. Verification email sent
   ↓
4. User clicks verification link
   ↓
5. Email confirmed in Supabase
   ↓
6. User signs in
   ↓
7. JWT token created and stored in secure cookie
   ↓
8. Middleware validates JWT on each request
   ↓
9. User session established
```

### Data Access (RLS)
```
User 1          User 2          Database
  │               │               │
  └──Request───────────────┐      │
                            ├─RLS Policy Check
                            │  ├─ Allow if user_id matches
  └────────────────────────├─ Deny otherwise
                            │
                            └─Return filtered results
```

### API Security
```
1. Request arrives with JWT cookie
2. Middleware validates JWT signature
3. If invalid → Redirect to login
4. If valid → Extract user_id from token
5. Pass user_id to Supabase queries
6. RLS ensures only user's data returned
7. No sensitive data in response
```

---

## Performance Optimization

### Frontend
- SWR: Automatic caching + revalidation
- Lazy loading: Code splitting via Next.js
- Skeleton screens: Better perceived performance
- Image optimization: Next.js Image component

### Backend
- Database indexes: 25+ indexes on frequent columns
- Connection pooling: Via Supabase
- Query optimization: Specific column selection
- Streaming: No response size limits

### Deployment
- CDN: Via Vercel edge network
- Compression: gzip for assets
- Caching: Browser cache headers
- Minification: CSS, JavaScript bundles

---

## Scaling Considerations

### Current Capacity
- Database: 1 GB free (can scale to 100+ GB)
- Users: Unlimited
- Conversations: Unlimited
- API rate limit: Depends on AI provider

### Scaling Path
```
Stage 1 (Prototype)     → Free tier
  Max: 100 concurrent users
  
Stage 2 (MVP)          → Paid Supabase
  Max: 1,000 concurrent users
  
Stage 3 (Growth)       → Multi-instance + Load balancer
  Max: 10,000+ concurrent users
  
Stage 4 (Enterprise)   → Custom infrastructure
  Max: 100,000+ concurrent users
```

### Optimization Tips
1. Add database replication for read scaling
2. Implement caching layer (Redis)
3. Use CDN for static assets
4. Implement API rate limiting
5. Add monitoring and alerting
6. Database query profiling
7. Connection pool optimization

---

## Development Workflow

```
Local Development
  │
  ├── npm install
  ├── .env.local setup
  ├── npm run dev (localhost:3000)
  │
  └── Feature branches
      ├── Create feature branch
      ├── Make changes
      ├── Test locally
      ├── Push to GitHub
      └── Create Pull Request
             │
             ├── Tests run
             ├── Review
             └── Merge
                   │
                   └── Vercel Auto-Deploy
                       ├── Build
                       ├── Test
                       ├── Deploy to staging
                       ├── Verify
                       └── Deploy to production
```

---

## Monitoring & Debugging

### Client-side
- Browser DevTools
- Network tab (API calls)
- Console logs (errors)
- React DevTools extension

### Server-side
- Vercel logs (deployment)
- Supabase dashboard (database)
- API logs (route handlers)
- Error tracking (optional)

### Database
- Supabase SQL Editor (queries)
- Table Editor (data browsing)
- Logs (query performance)

---

## Architecture Summary

| Layer | Technology | Responsibility |
|-------|-----------|-----------------|
| UI | React 18 + shadcn/ui | User interface & interactions |
| Styling | Tailwind CSS | Responsive design & theming |
| Frontend State | SWR + Context | Data fetching & global state |
| Routing | Next.js 14 App Router | Page routing & navigation |
| API | Next.js Route Handlers | REST endpoints |
| AI | Vercel AI SDK 6 | LLM integration & streaming |
| Auth | Supabase Auth | User authentication |
| Database | PostgreSQL (Supabase) | Data persistence |
| Security | RLS + JWT | Data access control |

This architecture is:
- ✅ Scalable (horizontal & vertical)
- ✅ Secure (encryption, RLS, JWT)
- ✅ Performant (caching, indexing)
- ✅ Maintainable (modular, typed)
- ✅ Production-ready (error handling)

---

**Last Updated**: February 2024
**Architecture Version**: 2.0 (Post-Modernization)
