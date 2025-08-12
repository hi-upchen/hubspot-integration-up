# URL Shortener Setup Guide

## Overview

The Integration Up URL Shortener allows you to automatically shorten URLs in your HubSpot workflows using the Bitly service. This is perfect for creating clean, trackable links in emails, SMS campaigns, or any workflow that needs shortened URLs.

## Prerequisites

1. **HubSpot Account**: You need an active HubSpot account with workflow access
2. **Bitly Account**: You need a Bitly account to generate API tokens
3. **Integration Up App**: The URL Shortener app must be installed in your HubSpot account

## Installation Steps

### Step 1: Install the URL Shortener App

1. Go to the [Integration Up installation page](https://your-domain.vercel.app/install)
2. Select "URL Shortener" from the available apps
3. Click "Install to HubSpot"
4. Authorize the app to access your HubSpot account
5. You'll be redirected to a success page

### Step 2: Get Your Bitly API Token

1. Log in to your [Bitly account](https://app.bitly.com)
2. Navigate to **Settings** → **API**
3. Enter your password to access API settings
4. Click **"Generate Token"**
5. Copy the generated token (it starts with something like `2_AbCdEfGhIj...`)
6. **Keep this token secure** - treat it like a password

### Step 3: Configure Your API Token

1. Go to your [Integration Up Dashboard](https://your-domain.vercel.app/dashboard?portalId=YOUR_PORTAL_ID)
2. Click on the **"URL Shortener"** tab
3. In the "URL Shortener Settings" section:
   - Paste your Bitly API token in the **"Bitly API Token"** field
   - Click **"Test Connection"** to verify it works
   - Click **"Save API Key"** to store it securely

### Step 4: Test the Integration

1. Go to your HubSpot account
2. Navigate to **Automation** → **Workflows**
3. Create a new workflow or edit an existing one
4. Add a **"Custom workflow action"**
5. Select **"URL Shortener"** from your installed actions
6. Configure the action (see Configuration section below)

## Configuration

### Input Fields

The URL Shortener action has two input fields:

#### 1. URL to shorten (Required)
- **Type**: Text/Property
- **Description**: The long URL you want to shorten
- **Examples**:
  - Static value: `https://www.example.com/very-long-marketing-campaign-url`
  - Contact property: `Website URL`
  - Deal property: `Product Demo Link`

#### 2. Your domain (Optional)
- **Type**: Text/Property
- **Description**: Custom branded domain for your short links
- **Default**: Uses your Bitly account's default domain (usually bit.ly)
- **Examples**:
  - `yourbrand.co` (if you have a custom Bitly domain)
  - `go.yourcompany.com`
- **Leave blank** to use bit.ly or your account default

### Output Fields

The action provides these output fields that you can use in subsequent workflow steps:

- **Shortened URL**: The final shortened URL (e.g., `https://bit.ly/3ABC123`)
- **Original URL**: The original long URL that was shortened
- **Domain Used**: The domain that was used for shortening
- **Created Time**: ISO timestamp of when the link was created
- **Error Message**: Any error that occurred (only populated if something goes wrong)

## Usage Examples

### Example 1: Shorten Marketing Campaign URLs

**Scenario**: You want to send personalized demo links to prospects

**Configuration**:
- URL to shorten: `https://www.yoursite.com/demo?utm_source=hubspot&utm_campaign=q1-outreach&contact={{contact.email}}`
- Your domain: `go.yourcompany.com`

**Result**: Gets shortened to something like `https://go.yourcompany.com/abc123`

### Example 2: Dynamic Property-Based URLs

**Scenario**: Each contact has a unique portal URL stored in a custom property

**Configuration**:
- URL to shorten: `{{contact.custom_portal_url}}`
- Your domain: (leave blank)

**Result**: Each contact's portal URL gets shortened individually

### Example 3: E-commerce Product Links

**Scenario**: Sending personalized product recommendations

**Configuration**:
- URL to shorten: `https://shop.yourstore.com/products/{{deal.product_id}}?ref=hubspot`
- Your domain: `shop.co` (your custom domain)

## Error Handling

The URL Shortener includes robust error handling:

### Common Errors and Solutions

| Error Message | Cause | Solution |
|--------------|--------|----------|
| "Please configure your Bitly API key..." | No API key stored | Follow Step 3 to configure your Bitly token |
| "Invalid Bitly API key..." | API key is wrong/expired | Generate a new token from Bitly and update it |
| "Invalid URL format..." | The URL to shorten is malformed | Check the URL format - it must start with http:// or https:// |
| "Invalid domain: [domain]..." | Custom domain doesn't exist in your Bitly account | Check your custom domain settings in Bitly |
| "Bitly rate limit exceeded..." | Too many requests to Bitly API | Wait a few moments and try again |

### Workflow Behavior

- **On Success**: The shortened URL is available in output fields for use in subsequent actions
- **On Error**: The workflow continues, but the "Error Message" field contains details about what went wrong
- **Original URL Preserved**: Even if shortening fails, the original URL is still available in outputs

## Best Practices

### 1. Test First
- Always test your workflow with a few sample records before activating it
- Use the "Test Connection" button in the dashboard to verify your API key

### 2. URL Validation
- Ensure URLs start with `http://` or `https://`
- Avoid URLs with spaces - use URL encoding if needed
- Test with sample data that represents your actual use case

### 3. Custom Domains
- Set up custom domains in Bitly first before using them in workflows
- Custom domains improve brand recognition and trust
- Leave the domain field blank if you're not sure

### 4. Rate Limits
- Bitly has rate limits - avoid running massive batches simultaneously
- The integration includes retry logic for temporary failures
- Consider spreading large campaigns over time

### 5. Monitor Usage
- Check your Integration Up dashboard regularly for usage stats
- Monitor error rates to identify issues early
- Review Bitly analytics for link performance

## Troubleshooting

### Links Not Shortening
1. **Check API Key**: Go to dashboard → URL Shortener tab → Test Connection
2. **Verify URL Format**: Ensure URLs are valid and properly formatted
3. **Check Workflow Logs**: Look for specific error messages in HubSpot workflow history

### Custom Domain Not Working
1. **Verify Domain Setup**: Check that custom domain is configured in your Bitly account
2. **Test Manually**: Try shortening a URL with your custom domain in Bitly directly
3. **Check Spelling**: Ensure domain name is spelled correctly in the workflow

### Rate Limit Issues
1. **Reduce Batch Size**: Process smaller groups of contacts at a time
2. **Add Delays**: Use workflow delays between URL shortening actions
3. **Monitor Usage**: Check your Bitly account usage and limits

### Integration Not Available
1. **Check Installation**: Verify the URL Shortener app is installed in HubSpot
2. **Refresh Workflow**: Try refreshing the workflow editor page
3. **Contact Support**: If the action doesn't appear, contact Integration Up support

## API Limits and Pricing

### Bitly Limits
- **Free Plan**: 1,000 links per month
- **Paid Plans**: Higher limits available - check [Bitly pricing](https://bitly.com/pages/pricing)

### Integration Up Limits
- **Beta Period**: Free unlimited usage during beta
- **Future Pricing**: Usage-based pricing will be introduced with advance notice
- **Current Status**: All URL shortening is currently free

## Security and Privacy

### API Key Security
- Your Bitly API token is encrypted and stored securely
- Only your HubSpot portal can access your stored credentials
- Tokens are never logged or exposed in error messages

### Link Privacy
- Shortened links follow Bitly's privacy policy
- No link content is stored by Integration Up
- All shortening happens directly with Bitly's service

### Data Handling
- Integration Up only processes URLs for shortening
- No URL content or analytics are stored permanently
- Usage statistics are anonymized and aggregated

## Support and Resources

### Getting Help
- **Documentation**: This guide and [CLAUDE.md](../CLAUDE.md)
- **Dashboard**: Check your usage and error stats
- **Support Email**: Contact support through your Integration Up dashboard

### Useful Links
- [Bitly API Documentation](https://dev.bitly.com/)
- [HubSpot Workflows Guide](https://knowledge.hubspot.com/workflows)
- [Integration Up GitHub](https://github.com/your-repo/hubspot-integration-up)

### Feature Requests
- Future enhancements: Support for other URL shorteners (TinyURL, Rebrandly)
- Bulk shortening capabilities
- Advanced analytics integration
- Custom slug generation

---

*Last updated: January 2025*
*Version: 1.0.0*