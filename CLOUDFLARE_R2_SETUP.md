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

1. Go to **Workers & Pages** → **KV** in Cloudflare dashboard
2. Click **Create a namespace**
3. Name it: `portfolio-metadata` (or your preferred name)
4. Click **Add**
5. **Copy the Namespace ID** (you'll need this)

## Step 5: Get Cloudflare API Token

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template
4. Set permissions:
   - **Account** → **Workers KV Storage** → **Edit**
5. Click **Continue to summary** → **Create Token**
6. **Copy the token** (you'll only see it once!)

## Step 6: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
# R2 Storage (for files)
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_BUCKET_NAME=danielbau-portfolio
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket-name.r2.cloudflarestorage.com

# KV Storage (for metadata)
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_KV_NAMESPACE_ID=your_kv_namespace_id_here
```

**Note**: For `CLOUDFLARE_R2_PUBLIC_URL`, you can either:
- Use a custom domain (recommended)
- Use the R2 public URL format: `https://[account-id].r2.cloudflarestorage.com/[bucket-name]`

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
