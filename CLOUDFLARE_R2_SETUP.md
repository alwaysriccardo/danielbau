# Cloudflare R2 Setup Guide

## Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Go to **R2** in the sidebar
4. Click **Create bucket**
5. Name it: `danielbau-portfolio` (or your preferred name)
6. Choose a location (closest to your users)
7. Click **Create bucket**

## Step 2: Get API Credentials

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Set permissions:
   - **Object Read & Write** (for uploads and reads)
   - **Bucket Read & Write** (for managing objects)
4. Click **Create API Token**
5. **IMPORTANT**: Copy and save:
   - **Account ID**
   - **Access Key ID**
   - **Secret Access Key**

## Step 3: Set CORS (for direct uploads)

1. In your R2 bucket, go to **Settings**
2. Scroll to **CORS Policy**
3. Add this CORS configuration:

```json
[
  {
    "AllowedOrigins": ["https://www.dani-bau.ch", "https://dani-bau.ch"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Click **Save**

## Step 4: Set Up Cloudflare Workers KV

1. Go to **Storage & databases** → **Workers KV** in Cloudflare dashboard
2. You'll see a box that says "Create a KV namespace"
   - **Option A**: Click on the box itself (it should be clickable)
   - **Option B**: If there's no button, look for a "+" or "Add" button in the top right
   - **Option C**: Use the command line shown: `npx wrangler kv namespace create portfolio-metadata`
3. Name it: `portfolio-metadata` (or your preferred name)
4. Click **Add** or **Create**
5. **Copy the Namespace ID** (you'll need this - it's shown after creation)

## Step 5: Get Cloudflare API Token (for KV)

This token is used to access Cloudflare KV from your serverless functions.

1. Go to **My Profile** → **API Tokens** (top right corner, click your profile icon)
2. Click **Create Token**
3. You have two options:
   - **Option A**: Use **Edit Cloudflare Workers** template (recommended)
     - This automatically sets the right permissions
   - **Option B**: Create a custom token
     - Set permissions manually:
       - **Account** → **Workers KV Storage** → **Edit**
       - **Account** → **Account** → **Read** (if needed)
4. Set TTL (Time To Live):
   - **Start Date**: Today (or leave default)
   - **End Date**: Set far in future (e.g., 2034) or leave blank for no expiration
5. Click **Continue to summary** → **Create Token**
6. **IMPORTANT**: Copy the token immediately - you'll only see it once!
   - This is your `CLOUDFLARE_API_TOKEN` value for Vercel

## Step 6: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Click **Add New** (or **+ Add** button)
4. For each variable, fill in:
   - **Key** (left field): The variable name (e.g., `CLOUDFLARE_ACCOUNT_ID`)
   - **Value** (right field): The actual value (e.g., your account ID)
5. Click **Save** after each variable

### Add these 7 environment variables:

**1. R2 - Account ID**
- **Key**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: Your Cloudflare Account ID (from dashboard sidebar)

**2. R2 - Access Key ID**
- **Key**: `CLOUDFLARE_ACCESS_KEY_ID`
- **Value**: Your R2 Access Key ID (from Step 2)

**3. R2 - Secret Access Key**
- **Key**: `CLOUDFLARE_SECRET_ACCESS_KEY`
- **Value**: Your R2 Secret Access Key (from Step 2)

**4. R2 - Bucket Name**
- **Key**: `CLOUDFLARE_R2_BUCKET_NAME`
- **Value**: `danielbau-portfolio` (or whatever you named your bucket)

**5. R2 - Public URL**
- **Key**: `CLOUDFLARE_R2_PUBLIC_URL`
- **Value**: `https://e8ce8fbe1fc59ae9fca00f3b2fbc6621.r2.cloudflarestorage.com/danielbau-portfolio`
  - (Ready to copy - uses your account ID: `e8ce8fbe1fc59ae9fca00f3b2fbc6621`)

**6. KV - API Token**
- **Key**: `CLOUDFLARE_API_TOKEN`
- **Value**: Your Cloudflare API Token (from Step 5)

**7. KV - Namespace ID**
- **Key**: `CLOUDFLARE_KV_NAMESPACE_ID`
- **Value**: Your KV Namespace ID (from Step 4, e.g., `823c05d998814240822ff03688a39865`)

**Note**: For `CLOUDFLARE_R2_PUBLIC_URL`, you can either:
- Use a custom domain (recommended): `https://cdn.dani-bau.ch`
- Use the R2 public URL format: `https://[account-id].r2.cloudflarestorage.com/[bucket-name]`
- Or use: `https://[account-id].r2.cloudflarestorage.com/danielbau-portfolio`

## Step 7: Set Up Custom Domain (Optional but Recommended)

1. In R2 bucket settings, go to **Public Access**
2. Enable **Custom Domain**
3. Add your domain (e.g., `cdn.dani-bau.ch`)
4. Follow Cloudflare's instructions to verify DNS

## Step 8: Test the Setup

After deploying, test by:
1. Opening the admin panel
2. Creating a test project
3. Uploading a test image
4. Verifying it appears in the portfolio

## Security Notes

- Never commit API keys to git
- Use environment variables only
- The presigned URLs expire after 1 hour (configurable)
- Admin authentication is required for all write operations
