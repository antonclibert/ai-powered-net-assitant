# Quick Start Guide - AI Net Assist

Get up and running in 5 minutes!

## Prerequisites
- Node.js 18+
- Free Supabase account (https://supabase.com)
- Free OpenAI account with API key (https://platform.openai.com)

## Step 1: Clone & Install (1 min)

```bash
# Clone the project
git clone <repo-url>
cd ai-powered-net-assistant

# Install dependencies
npm install
```

## Step 2: Create Supabase Project (2 min)

1. Go to https://supabase.com and sign up
2. Create a new project (gives you free PostgreSQL database)
3. Go to **Settings** → **API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (your Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service role secret)
   - `SUPABASE_JWT_SECRET` (JWT secret)

4. Go to **Settings** → **Database** and copy:
   - PostgreSQL connection string (for `POSTGRES_URL`)

## Step 3: Get OpenAI API Key (1 min)

1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy it (you won't see it again!)

## Step 4: Configure Environment (1 min)

Create `.env.local` in the project root:

```env
# Supabase (from Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
POSTGRES_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=postgres
POSTGRES_HOST=db.supabase.co

# OpenAI (from Step 3)
OPENAI_API_KEY=sk-proj-...your-key-here...
```

## Step 5: Setup Database (2 min)

1. Go to your Supabase dashboard
2. Click **SQL Editor** → **New Query**
3. Open `/scripts/001_init_schema.sql` in your editor
4. Copy all the SQL and paste into Supabase
5. Click **Run** button
6. Wait for "Success" message

## Step 6: Run Locally (1 min)

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## First Run Checklist

- [ ] You see the landing page
- [ ] Sign up button works
- [ ] Can create account with email
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Sign in with email and password
- [ ] See dashboard
- [ ] Click "New Project"
- [ ] Configure network requirements
- [ ] Click "Get AI Recommendations"
- [ ] See AI responses streaming in

## Troubleshooting

**"Cannot find module" error**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Supabase connection failed"**
- Double-check environment variables in `.env.local`
- Verify URL format: `https://xxx.supabase.co`
- Check keys aren't accidentally modified

**"Auth provider not found"**
- Ensure `SUPABASE_JWT_SECRET` is set
- Restart dev server: `Ctrl+C` then `npm run dev`

**"Database tables missing"**
- Open Supabase SQL Editor
- Check if tables exist (look for `users`, `network_projects`)
- If missing, re-run the migration script

**"AI responses not working"**
- Verify `OPENAI_API_KEY` is correct
- Check OpenAI account has credits (https://platform.openai.com/account/billing/overview)
- Try creating a new conversation

## What's Included

After setup, you have:

✅ User authentication (email/password)
✅ Project management (create, edit, delete)
✅ AI chat interface with GPT-4
✅ Database storage with Supabase
✅ User preferences and settings
✅ Responsive design (mobile, tablet, desktop)

## Next Steps

1. **Explore the Dashboard**: Create a few test projects
2. **Test AI Features**: Try different network specifications
3. **Customize**: Edit colors, fonts, company name in code
4. **Deploy**: See SETUP.md for production deployment

## File Structure Quick Reference

```
app/
  page.tsx           ← Landing page
  api/chat/         ← AI endpoint
  auth/             ← Login/signup pages
  dashboard/        ← Projects overview
  designer/         ← Network design workspace
  settings/         ← User preferences

components/
  network-design-assistant-v2.tsx  ← Main AI interface

lib/
  supabase.ts       ← Database client

scripts/
  001_init_schema.sql  ← Database setup
```

## Common Tasks

### Reset Your Database
```bash
# In Supabase SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
# Then re-run the migration script
```

### View Database Data
1. Go to Supabase Dashboard
2. Click **Table Editor** in left sidebar
3. Select any table to view data

### View User Activity Logs
1. In Supabase, go to **Authentication** → **Users**
2. See all registered users and their last sign-in

### Change AI Model
Edit `/app/api/chat/route.ts`:
```typescript
// Change from:
model: openai("gpt-4-turbo")

// To:
model: openai("gpt-4")  // Cheaper, slightly less capable
model: openai("gpt-3.5-turbo")  // Fastest, cheapest
```

## Support & Resources

- **Setup Issues**: See SETUP.md
- **Supabase Help**: https://supabase.com/docs
- **AI SDK Docs**: https://sdk.vercel.ai
- **Next.js Docs**: https://nextjs.org/docs

## Time Estimate Breakdown

| Task | Time |
|------|------|
| Clone & install | 1 min |
| Create Supabase | 2 min |
| Get OpenAI key | 1 min |
| Environment setup | 1 min |
| Database setup | 2 min |
| Run locally | 1 min |
| **Total** | **~8 minutes** |

## Success Indicators

After completing setup, you should see:

1. ✅ Landing page loads at http://localhost:3000
2. ✅ Can sign up and receive verification email
3. ✅ Can sign in after email verification
4. ✅ Dashboard shows "No projects yet"
5. ✅ Can create a new project
6. ✅ Network requirements form appears
7. ✅ AI responds to recommendations request
8. ✅ Chat interface shows streaming responses

If all these work, you're ready to develop or deploy!

## Ready to Deploy?

See **SETUP.md** for:
- Vercel deployment (1 click)
- Environment production setup
- Database performance tuning
- Security checklist

---

**Estimated Setup Time**: 8-10 minutes
**Difficulty Level**: Beginner-friendly
**Last Updated**: February 2024
