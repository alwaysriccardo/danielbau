# Supabase Setup Guide for Portfolio Sync

This guide will help you set up Supabase to make your portfolio public and synced across all devices.

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new project:
   - **Name**: `danielbau-portfolio` (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `West US` or `Central EU`)
   - Click "Create new project"
   - Wait 2-3 minutes for setup to complete

## Step 2: Create Database Table

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste this SQL code:

```sql
-- Create portfolio_projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_order ON portfolio_projects("order");

-- Enable Row Level Security (RLS)
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read (public access)
CREATE POLICY "Public read access" ON portfolio_projects
  FOR SELECT
  USING (true);

-- Create policy: Only authenticated users can insert/update/delete
-- For now, we'll allow all operations (you can restrict later with authentication)
CREATE POLICY "Public write access" ON portfolio_projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings** (gear icon, bottom left)
2. Click **API** (under Project Settings)
3. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 4: Add Environment Variables

### For Local Development:

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add these lines:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace:
- `your-project-id` with your actual Supabase project ID
- `your-anon-key-here` with your actual anon public key

3. **Important**: Add `.env` to `.gitignore` (already should be there)

### For Vercel Deployment:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: Production, Preview, Development (check all)
5. Add second variable:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon public key
   - **Environment**: Production, Preview, Development (check all)
6. Click **Save**
7. **Redeploy** your site (Vercel will automatically redeploy, or go to Deployments and click "Redeploy")

## Step 5: Install Supabase Client

Run this command in your terminal:

```bash
npm install @supabase/supabase-js
```

## Step 6: Test the Setup

1. Start your dev server: `npm run dev`
2. Go to the Portfolio section
3. Try adding a project (as admin)
4. Check your Supabase dashboard → **Table Editor** → `portfolio_projects`
5. You should see your project appear there!

## Troubleshooting

### Portfolio not syncing?
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure Supabase table was created successfully
- Check Supabase logs: Dashboard → Logs → API Logs

### "Invalid API key" error?
- Double-check your environment variables
- Make sure you're using the **anon public** key, not the service_role key
- Restart your dev server after adding .env file

### Still using localStorage?
- The code has a fallback to localStorage if Supabase isn't configured
- Once Supabase is set up, it will automatically use the API instead

## Security Note

Currently, the setup allows anyone to read/write to the portfolio. For production, you should:
1. Add authentication (Supabase Auth)
2. Restrict write access to authenticated admin users only
3. Keep read access public

Would you like me to add authentication later? Just ask!
