# Facebook Portfolio Setup Guide

This guide will help you set up the Facebook Graph API integration to display photos and videos from your Facebook page on your website.

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** in the top right
3. Click **"Create App"**
4. Select **"Business"** as the app type
5. Fill in:
   - **App Name**: e.g., "DANIELBAU Portfolio"
   - **App Contact Email**: Your email
   - Click **"Create App"**

## Step 2: Get Your Facebook Page ID

1. Go to your Facebook page
2. Click **"About"** on the left sidebar
3. Scroll down to find **"Page ID"** (it's a long number)
4. **Copy this ID** - you'll need it later

Alternatively:
- Go to your page: `https://www.facebook.com/yourpagename`
- View page source (right-click → View Page Source)
- Search for `"page_id"` - you'll find it there

## Step 3: Get a Page Access Token

### Option A: Using Graph API Explorer (Easiest)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. In the top right, select your app from the dropdown
3. Click **"Generate Access Token"**
4. Select these permissions:
   - ``pages_read_engagement
   - `pages_read_user_content`
   - `pages_show_list`
5. Click **"Generate Access Token"**
6. **Copy the token** (it will be a long string)

### Option B: Get a Long-Lived Token (Recommended for Production)

The token from Graph API Explorer expires in 1-2 hours. For production, you need a long-lived token:

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Generate a short-lived token (as above)
3. Open a new browser tab and go to:
   ```
   https://graph.facebook.com/v18.0/oauth/access_token?
     grant_type=fb_exchange_token&
     client_id=YOUR_APP_ID&
     client_secret=YOUR_APP_SECRET&
     fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
   ```
   Replace:
   - `YOUR_APP_ID`: Found in your app's dashboard under "Settings" → "Basic"
   - `YOUR_APP_SECRET`: Found in your app's dashboard under "Settings" → "Basic" (click "Show")
   - `YOUR_SHORT_LIVED_TOKEN`: The token from step 2

4. This will return a long-lived token (valid for ~60 days)

### Option C: Get a Permanent Page Access Token

For a token that doesn't expire:

1. Get a long-lived user access token (Option B)
2. Get your page ID (Step 2)
3. Go to:
   ```
   https://graph.facebook.com/v18.0/YOUR_PAGE_ID?
     fields=access_token&
     access_token=YOUR_LONG_LIVED_TOKEN
   ```
4. This returns a permanent page access token

## Step 4: Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   **Variable 1:**
   - **Name**: `FACEBOOK_PAGE_ID`
   - **Value**: Your Facebook Page ID (from Step 2)
   - **Environment**: Production, Preview, Development (select all)

   **Variable 2:**
   - **Name**: `FACEBOOK_ACCESS_TOKEN`
   - **Value**: Your Page Access Token (from Step 3)
   - **Environment**: Production, Preview, Development (select all)

5. Click **"Save"**

## Step 5: Deploy to Vercel

1. Push your code to GitHub (if not already done)
2. Vercel will automatically deploy
3. The API endpoint will be available at: `https://yourdomain.com/api/facebook-portfolio`

## Step 6: Test the Integration

1. Visit your website
2. Navigate to the Portfolio section
3. You should see photos and videos from your Facebook page

## Troubleshooting

### "Facebook credentials not configured" error
- Make sure environment variables are set in Vercel
- Redeploy after adding environment variables
- Check that variable names are exactly: `FACEBOOK_PAGE_ID` and `FACEBOOK_ACCESS_TOKEN`

### "Failed to fetch portfolio" error
- Check that your access token is valid
- Verify your Page ID is correct
- Make sure your Facebook page is public (or the token has proper permissions)
- Check Vercel function logs for detailed error messages

### No items showing
- Your Facebook page might not have photos/videos yet
- The page might be private - make sure it's public or the token has access
- Check the browser console for errors

### Token expired
- Short-lived tokens expire in 1-2 hours
- Long-lived tokens expire in ~60 days
- Use a permanent page access token (Option C) for production

## Security Notes

⚠️ **Important:**
- Never commit your access tokens to GitHub
- Always use environment variables
- Use permanent page access tokens for production
- Regularly rotate tokens if compromised

## API Rate Limits

Facebook Graph API has rate limits:
- **200 calls per hour per user** (for user tokens)
- **200 calls per hour per app** (for app tokens)

The portfolio endpoint caches results for 1 hour to minimize API calls.

## Need Help?

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- Check Vercel function logs in your dashboard for detailed error messages
