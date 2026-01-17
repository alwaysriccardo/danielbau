# Quick Start: Portfolio Sync Setup

## What's Been Done

✅ Supabase integration code added  
✅ Portfolio component updated to use API  
✅ Fallback to localStorage if Supabase not configured  
✅ Package.json updated with Supabase dependency  

## Next Steps (5 minutes)

### 1. Install Supabase Package
```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Account & Project
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Wait 2-3 minutes for setup

### 3. Run SQL Script
1. In Supabase dashboard → **SQL Editor**
2. Copy SQL from `SUPABASE_SETUP.md` (Step 2)
3. Run it

### 4. Get API Keys
1. Settings → API
2. Copy **Project URL** and **anon public** key

### 5. Add to Vercel
1. Vercel dashboard → Your project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Redeploy

### 6. Test Locally (Optional)
Create `.env` file:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Then run: `npm run dev`

## That's It! 🎉

Your portfolio will now sync across all devices automatically!

See `SUPABASE_SETUP.md` for detailed instructions.
