# Bitly API Key Generation Guide

## Overview

To use the Integration Up URL Shortener, you need a Bitly API token (also called an "Access Token" or "Generic Access Token"). This guide walks you through obtaining this token step-by-step.

## Prerequisites

- An active Bitly account (free or paid)
- Administrator access to your Bitly account

## Step-by-Step Instructions

### Step 1: Log into Bitly

1. Go to [app.bitly.com](https://app.bitly.com)
2. Sign in with your Bitly credentials
3. Make sure you're logged into the correct account if you have multiple

### Step 2: Navigate to API Settings

1. Click on your **profile picture** or **account menu** in the top-right corner
2. Select **"Settings"** from the dropdown menu
3. In the left sidebar, click on **"API"**

Alternative path:
- Direct URL: [app.bitly.com/settings/api](https://app.bitly.com/settings/api)

### Step 3: Access API Token Section

1. You'll see a page titled "API Settings"
2. Look for the section labeled **"Generic Access Token"**
3. If prompted, **enter your password** to access sensitive settings

### Step 4: Generate Your Token

1. Click the **"Generate Token"** button
2. A new token will appear - it looks like: `2_AbCdEfGhIj1234567890...`
3. **Copy the entire token immediately** - it will be partially hidden after you leave the page

⚠️ **Important**: Copy the token now! For security reasons, Bitly will only show the full token once.

### Step 5: Secure Your Token

1. **Save the token** in a secure location (password manager recommended)
2. **Never share** your token with anyone
3. **Treat it like a password** - it gives full access to your Bitly account

## Token Details

### What the Token Looks Like
- Format: `2_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
- Length: Usually 40-50 characters
- Always starts with `2_` or similar version prefix

### Token Permissions
Your generic access token can:
- ✅ Shorten URLs
- ✅ Access your branded domains
- ✅ View your account information
- ✅ Create and manage links
- ❌ Cannot modify billing settings
- ❌ Cannot add/remove team members

### Token Security
- Tokens don't expire unless you revoke them
- Each token is unique to your account
- You can generate multiple tokens if needed
- Tokens work with all your custom domains

## Testing Your Token

### Manual Test (Optional)
You can test your token using a simple curl command:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"long_url": "https://example.com/test"}' \
     https://api-ssl.bitly.com/v4/shorten
```

Replace `YOUR_TOKEN_HERE` with your actual token.

### Test in Integration Up
1. Go to your Integration Up dashboard
2. Navigate to the URL Shortener settings
3. Paste your token
4. Click **"Test Connection"**
5. You should see a success message

## Custom Domains (Optional)

If you have custom branded domains in Bitly:

### Setting Up Custom Domains
1. In Bitly, go to **Settings** → **Branded Short Domains**
2. Follow Bitly's guide to set up your domain
3. Verify domain ownership
4. Wait for DNS propagation (can take up to 24 hours)

### Using Custom Domains
- Your API token automatically works with all your custom domains
- Specify the domain in the Integration Up workflow action
- Leave blank to use your account default (usually bit.ly)

## Common Issues

### "Invalid API Key" Error
**Cause**: Token was copied incorrectly or has expired
**Solution**: 
1. Generate a new token
2. Ensure you copy the entire token
3. Check for extra spaces or characters

### "Forbidden" Error
**Cause**: Token doesn't have required permissions
**Solution**:
1. Make sure you're using a "Generic Access Token"
2. Verify your Bitly account is active
3. Check if your account has URL shortening permissions

### Token Not Working
**Cause**: Various authentication issues
**Solution**:
1. Try generating a fresh token
2. Check if your Bitly account is suspended
3. Verify you're using the correct Bitly account

## Token Management Best Practices

### Security
- Store tokens in a password manager
- Never commit tokens to version control
- Don't share tokens in screenshots or documentation
- Rotate tokens periodically for security

### Organization
- Use descriptive names if you have multiple integrations
- Keep track of which tokens are used where
- Document token purposes for your team

### Monitoring
- Regularly check your Bitly usage statistics
- Monitor for unusual activity
- Set up alerts for rate limit approaches

## Revoking a Token

If you need to revoke a token:

1. Go back to **Settings** → **API** in Bitly
2. Find the token in your list
3. Click **"Revoke"** or the trash icon
4. Confirm the revocation

⚠️ **Warning**: Revoking a token will immediately break all integrations using that token.

## Account Types and Limits

### Free Account
- 1,000 links per month
- bit.ly domain only
- Basic analytics
- Generic access tokens included

### Paid Accounts
- Higher monthly link limits
- Custom branded domains
- Advanced analytics
- API access included
- Team management features

### Enterprise
- Unlimited links
- Multiple custom domains
- Advanced security features
- Dedicated support
- API rate limit increases

## Rate Limits

Bitly API has these limits:
- **Free accounts**: 100 requests per hour
- **Paid accounts**: Higher limits (varies by plan)
- **Rate limit resets**: Every hour
- **Burst allowance**: Short bursts of higher usage allowed

Integration Up automatically handles rate limits with retry logic.

## Troubleshooting

### Can't Find API Settings
- Make sure you're logged into the correct Bitly account
- Check if your account has API access (some old accounts may not)
- Try logging out and back in

### Password Required
- Bitly requires password confirmation for API access
- This is a security feature
- Use your current Bitly password

### Token Generation Failed
- Try refreshing the page
- Clear browser cache and cookies
- Try a different browser
- Contact Bitly support if issues persist

## Support Resources

### Bitly Help
- [Bitly Support Center](https://support.bitly.com/)
- [API Documentation](https://dev.bitly.com/)
- Email: support@bitly.com

### Integration Up Support
- Check your Integration Up dashboard for help
- Review error messages in HubSpot workflow logs
- Contact Integration Up support through the dashboard

---

*Last updated: January 2025*
*For Integration Up URL Shortener v1.0.0*