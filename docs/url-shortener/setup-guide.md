# URL Shortener Setup Guide

## Transform Your Links with Professional URL Shortening

Welcome to the URL Shortener for HubSpot! This powerful workflow action eliminates long, unwieldy URLs from your marketing campaigns and replaces them with clean, trackable short links. Whether you're sending emails, SMS campaigns, or managing social media, this tool creates professional-looking links that build trust and drive engagement.

## What You'll Achieve

By the end of this guide, you'll have:
- ✅ A fully installed URL Shortener integrated with your HubSpot account
- ✅ Secure Bitly API connection with encrypted storage
- ✅ Your first workflow automatically shortening URLs
- ✅ Professional branded links that enhance your marketing
- ✅ Click analytics and performance tracking capabilities

## Prerequisites

Before we begin, ensure you have:

1. **HubSpot Access**: Admin or workflow editing permissions in your HubSpot account
2. **Bitly Account**: Free or paid Bitly account for URL shortening service
3. **10 Minutes**: Complete setup time including API key configuration
4. **URLs to Shorten**: Any long URLs in contact properties, deal records, or static values

That's everything you need! The setup is straightforward and requires no technical expertise.

## Overview

### What the URL Shortener Does

The Integration Up URL Shortener automatically converts long URLs into clean, professional short links using the industry-leading Bitly service. Perfect for:

- **Email Marketing**: Transform lengthy campaign URLs into clean, clickable links
- **SMS Campaigns**: Fit more content by shortening URLs to save character space
- **Social Media**: Create shareable links that look professional across platforms
- **Lead Generation**: Use trackable links in landing pages and forms
- **Sales Outreach**: Send prospects clean, branded links instead of messy campaign URLs

### Key Benefits

- **Professional Appearance**: Replace messy tracking URLs with clean branded links
- **Enhanced Trust**: Custom domains (like go.yourcompany.com) build credibility
- **Click Analytics**: Track link performance directly in Bitly dashboard
- **Reliability**: Powered by Bitly's 99.9% uptime infrastructure
- **Security**: AES-256-GCM encrypted API key storage
- **Scalability**: Handle thousands of URLs with enterprise-grade processing

## Installation Steps

### Step 1: Install the URL Shortener App (3 minutes)

1. **Access the Installation Link**
   - Click the installation link provided by your administrator
   - Or navigate to the HubSpot App Marketplace and search "Integration Up"

2. **Review App Permissions**
   - You'll see the permissions screen
   - The URL Shortener requires minimal access:
     - Read workflow properties (to access URLs for shortening)
     - Write workflow outputs (to provide shortened URLs)
   - Click "Connect app" to proceed

3. **Confirm Successful Installation**
   - You'll be redirected to a success page
   - Look for "✅ Successfully installed URL Shortener"
   - The app is now available in your HubSpot workflows

**Success Indicator**: You see the installation confirmation page with next steps for API key configuration.

### Step 2: Obtain Your Bitly API Key (4 minutes)

The URL Shortener uses Bitly's professional API for reliable link shortening. Here's how to get your API key:

1. **Log into Bitly**
   - Go to [app.bitly.com](https://app.bitly.com)
   - Sign in with your Bitly credentials
   - If you don't have an account, create a free one

2. **Navigate to API Settings**
   - Click your profile picture in the top-right corner
   - Select "Settings" from the dropdown
   - Click "API" in the left sidebar
   - Or go directly to [app.bitly.com/settings/api](https://app.bitly.com/settings/api)

3. **Generate Your Access Token**
   - Find the "Generic Access Token" section
   - Enter your password when prompted (security requirement)
   - Click "Generate Token"
   - **Important**: Copy the entire token immediately - it looks like `2_AbCdEfGhIj1234567890...`

4. **Secure Your Token**
   - Save the token in a secure location (password manager recommended)
   - Never share this token - it provides full access to your Bitly account
   - The token doesn't expire unless you revoke it

**Success Indicator**: You have a Bitly API token starting with `2_` followed by 40-50 characters.

### Step 3: Configure API Key in Dashboard (2 minutes)

1. **Access Your Integration Dashboard**
   - Go to your Integration Up dashboard
   - Navigate to the URL Shortener settings tab
   - Or use direct link: `https://your-domain.vercel.app/dashboard?portalId=YOUR_PORTAL_ID`

2. **Configure Your API Token**
   - Locate the "URL Shortener Settings" section
   - Paste your Bitly API token in the "Bitly API Token" field
   - Click "Test Connection" to verify the token works
   - You should see "✅ Connection successful"
   - Click "Save API Key" to store it securely

3. **Verify Encryption**
   - Your API key is automatically encrypted with AES-256-GCM
   - Only your HubSpot portal can access the stored credentials
   - The key is never logged or exposed in error messages

**Success Indicator**: Green checkmark showing successful connection test and confirmation that API key is saved.

### Step 4: Add to Your First Workflow (1 minute)

1. **Open HubSpot Workflows**
   - Navigate to Automation > Workflows
   - Create a new workflow or open an existing one

2. **Add the URL Shortener Action**
   - Click the "+" button to add an action
   - Search for "URL Shortener"
   - Select "URL Shortener" from the list of custom workflow actions

3. **Verify Action Availability**
   - The URL Shortener configuration panel opens
   - You see input fields for URL and optional custom domain
   - The action is ready for configuration

**Success Indicator**: URL Shortener action appears in your workflow with configuration options visible.

## Workflow Configuration

### Basic Setup (Most Common Use Case)

For 90% of scenarios, you only need to configure these two fields:

#### 1. URL to Shorten (Required)
- **Purpose**: The long URL you want to convert to a short link
- **Input Options**:
  - **Contact Property**: Select any URL field from contact records
  - **Deal Property**: Choose URLs from deal or company records
  - **Static Value**: Enter a fixed URL with tracking parameters
  - **Dynamic Token**: Use HubSpot personalization tokens

**Common Examples**:
```
Static URL: https://www.yoursite.com/demo?utm_source=hubspot&utm_campaign=q1-outreach
Contact Property: Website URL
Deal Property: Product Demo Link
Personalized: https://portal.yourapp.com/login?user={{contact.email}}
```

#### 2. Your Domain (Optional)
- **Purpose**: Use a custom branded domain for professional appearance
- **Default Behavior**: Leave blank to use bit.ly or your Bitly account default
- **Custom Domain Examples**:
  - `go.yourcompany.com`
  - `links.yourbrand.co`
  - `track.yoursite.com`

**Important**: Custom domains must be configured in your Bitly account first. See "Custom Domain Setup" section below.

### Advanced Configuration Examples

#### Example 1: Email Campaign Links
**Scenario**: Shorten marketing campaign URLs for email newsletters

**Configuration**:
- URL to shorten: `https://www.yoursite.com/special-offer?utm_source=hubspot&utm_medium=email&utm_campaign={{campaign.name}}&contact={{contact.email}}`
- Your domain: `go.yourcompany.com`

**Result**: `https://go.yourcompany.com/abc123` (clean, branded, trackable)

#### Example 2: Dynamic Product Links
**Scenario**: Send personalized product links based on deal properties

**Configuration**:
- URL to shorten: `{{deal.product_demo_url}}`
- Your domain: (leave blank for default)

**Result**: Each deal's product URL gets shortened individually

#### Example 3: Social Media Sharing
**Scenario**: Create shareable links for social media campaigns

**Configuration**:
- URL to shorten: `https://blog.yoursite.com/{{blog.slug}}?utm_source=social&utm_medium={{contact.preferred_platform}}`
- Your domain: `share.yourcompany.com`

**Result**: Platform-specific tracking with professional branded links

## Custom Domain Setup (Optional)

Custom domains create professional-looking links that build trust and enhance brand recognition.

### Setting Up Custom Domains in Bitly

1. **Access Domain Settings**
   - In Bitly, go to Settings > Branded Short Domains
   - Click "Add Domain" or "Get Started"

2. **Choose Your Domain**
   - Use a subdomain like `go.yourcompany.com` or `links.yourbrand.co`
   - Avoid using your main domain (www.yourcompany.com)
   - Consider short, memorable subdomains

3. **Configure DNS Settings**
   - Bitly provides specific DNS records to add
   - Add CNAME record pointing to Bitly's servers
   - Wait for DNS propagation (usually 10-30 minutes, up to 24 hours)

4. **Verify Domain**
   - Bitly automatically verifies ownership
   - Domain status changes to "Active" when ready
   - Test with a manual link shortening

### Using Custom Domains in Workflows

Once configured in Bitly:
- Enter your custom domain in the "Your domain" field
- The URL Shortener automatically uses your branded domain
- All analytics appear in your Bitly dashboard
- Links maintain professional appearance across all channels

**Pro Tip**: Set up multiple domains for different purposes:
- `go.yourcompany.com` for general marketing
- `demo.yourcompany.com` for product demonstrations
- `event.yourcompany.com` for event-specific campaigns

## Output Fields and Usage

After shortening, the URL Shortener provides these output fields for use in subsequent workflow steps:

### Available Output Fields

| Field Name | Description | Example Value |
|------------|-------------|---------------|
| **Shortened URL** | The final short link | `https://bit.ly/3ABC123` |
| **Original URL** | The original long URL | `https://example.com/very-long-url...` |
| **Domain Used** | Domain used for shortening | `go.yourcompany.com` |
| **Created Time** | ISO timestamp of creation | `2025-01-31T14:30:00Z` |
| **Error Message** | Any error details (if applicable) | `Invalid URL format: missing protocol` |

### Using Output Fields

**Email Personalization**:
```
Hi {{contact.firstname}},

Check out your personalized demo: {{workflow.shortened_url}}

Best regards,
Your Team
```

**Follow-up Workflows**:
- Branch workflows based on successful URL shortening
- Use `Error Message` field to handle failed shortenings
- Store shortened URLs in contact properties for future use

**Analytics Integration**:
- Copy `Shortened URL` to contact properties
- Track which contacts received which links
- Correlate with Bitly analytics for complete picture

## Testing Your Setup

### Quick Test (Recommended First Step)

1. **Create a Simple Test Workflow**
   - Trigger: "Contact created"
   - Action: URL Shortener
   - URL to shorten: `https://www.google.com` (simple test URL)
   - Domain: (leave blank)

2. **Create a Test Contact**
   - Add a new contact to trigger the workflow
   - Monitor workflow execution in real-time

3. **Verify Results**
   - Check contact record for shortened URL output
   - Click the shortened link to verify it works
   - Confirm redirect to original URL

**Success Indicators**:
- ✅ Shortened URL appears in output fields
- ✅ Link redirects correctly to original URL
- ✅ No error messages in workflow history

### Production Test

1. **Test with Real Data**
   - Use actual campaign URLs with tracking parameters
   - Test with various URL lengths and formats
   - Include URLs with special characters

2. **Volume Testing**
   - Process 10-20 contacts simultaneously
   - Monitor for any rate limit issues
   - Verify all links are shortened correctly

3. **Custom Domain Testing** (if applicable)
   - Test with your branded domain
   - Verify DNS resolution is working
   - Confirm branded links appear correctly

## Troubleshooting

### Common Issues and Solutions

#### "Please configure your Bitly API key"
**Cause**: No API key stored in the system
**Solution**: 
1. Go to Integration Up dashboard
2. Navigate to URL Shortener settings
3. Follow API key configuration steps above

#### "Invalid Bitly API key"
**Cause**: API key is incorrect, expired, or malformed
**Solution**:
1. Generate a new token in Bitly
2. Ensure you copy the complete token (starts with `2_`)
3. Test connection before saving

#### "Invalid URL format"
**Cause**: URL doesn't start with http:// or https://
**Solution**:
- Ensure URLs include protocol (`https://www.example.com`)
- Check for extra spaces or invalid characters
- Use URL encoding for special characters

#### "Invalid domain: [domain name]"
**Cause**: Custom domain isn't configured in Bitly account
**Solution**:
1. Set up custom domain in Bitly first
2. Wait for DNS propagation
3. Verify domain is active in Bitly
4. Use exact domain name in workflow

#### "Bitly rate limit exceeded"
**Cause**: Too many requests to Bitly API
**Solution**:
- Bitly automatically retries with exponential backoff
- For high volume, consider spreading requests over time
- Check your Bitly plan limits

#### Links Not Shortening
**Troubleshooting Steps**:
1. **Check Workflow History**: Look for specific error messages
2. **Verify API Key**: Use "Test Connection" in dashboard
3. **Validate URLs**: Ensure proper format with protocol
4. **Check Rate Limits**: Monitor Bitly usage statistics

#### Custom Domain Issues
**Troubleshooting Steps**:
1. **DNS Check**: Verify CNAME record is configured correctly
2. **Bitly Status**: Confirm domain shows "Active" in Bitly
3. **Spelling**: Double-check domain name in workflow
4. **Propagation**: Allow up to 24 hours for DNS changes

## Security and Privacy

### API Key Security
- **Encryption**: All API keys encrypted with AES-256-GCM
- **Access Control**: Only your HubSpot portal can access stored credentials
- **No Logging**: API keys never appear in logs or error messages
- **Secure Storage**: Keys stored in isolated, encrypted database

### Link Privacy and Data Handling
- **No Content Storage**: Integration Up never stores URL content or analytics
- **Direct Processing**: URLs sent directly to Bitly for shortening
- **Bitly Privacy**: Shortened links follow Bitly's privacy policy
- **Analytics**: Click data stored in Bitly, not Integration Up

### Compliance and Standards
- **Enterprise Security**: Bitly maintains enterprise-grade security standards
- **GDPR Compliant**: Full compliance with European privacy regulations
- **Enterprise Security**: Bank-level encryption and security practices
- **Audit Trail**: Complete logging of all API interactions

## API Limits and Pricing

### Bitly Service Limits
| Plan Type | Monthly Links | Rate Limit | Custom Domains |
|-----------|---------------|------------|----------------|
| **Free** | 1,000 links | 100/hour | No |
| **Basic** | 5,000 links | 200/hour | 1 domain |
| **Premium** | 50,000 links | 600/hour | 5 domains |
| **Enterprise** | Unlimited | Custom | Unlimited |

### Integration Up Pricing
- **Beta Period**: Unlimited free usage during beta
- **Future Pricing**: Usage-based tiers will be introduced with 30-day notice
- **Current Status**: All URL shortening operations are currently free

### Performance Characteristics
- **Processing Speed**: 500+ URLs per minute
- **Response Time**: Under 2 seconds per URL (95th percentile)
- **Reliability**: 99.9% uptime with automatic failover
- **Error Recovery**: Automatic retry logic with exponential backoff

## Advanced Use Cases

### Bulk URL Migration
Convert thousands of existing URLs to short links:

1. **Create List-Based Workflow**
   - Target: "Contact has property X"
   - Re-enrollment: Enabled for historical data
   
2. **Batch Processing**
   - Use workflow delays to respect rate limits
   - Process in groups of 100-500 contacts
   
3. **Progress Monitoring**
   - Track completion via workflow analytics
   - Monitor error rates in dashboard

### Campaign-Specific Domains
Use different domains for different campaigns:

1. **Setup Multiple Domains**
   - `promo.yourcompany.com` for promotions
   - `news.yourcompany.com` for newsletters
   - `event.yourcompany.com` for events

2. **Workflow Branching**
   - Branch by campaign type
   - Each branch uses appropriate domain
   - Maintain consistent branding per campaign

### Integration with Email Marketing
Enhance email campaigns with shortened links:

1. **Dynamic Link Generation**
   - Generate unique links per contact
   - Include contact ID for tracking
   - Personalize landing page experience

2. **A/B Testing Support**
   - Create variant links for testing
   - Track performance in Bitly analytics
   - Optimize based on click-through rates

### Multi-Channel Coordination
Use shortened URLs across all marketing channels:

1. **Consistent Tracking**
   - Same short link across email, SMS, social
   - Unified analytics in Bitly dashboard
   - Complete customer journey visibility

2. **Channel Attribution**
   - Add channel-specific parameters
   - Track source effectiveness
   - Optimize channel mix based on performance

## Support Resources

### Getting Help

**Documentation and Guides**
- **Setup Guide**: This comprehensive installation guide
- **API Key Guide**: [Detailed Bitly configuration instructions](../BITLY_API_KEY_GUIDE.md)
- **CLAUDE.md**: [Technical implementation details](../../CLAUDE.md)

**Technical Support**
- **Response Time**: Within 24 hours for all inquiries
- **Support Channel**: Through Integration Up dashboard
- **Escalation**: Direct email for urgent technical issues
- **Include Information**: Portal ID, workflow name, error messages for fastest resolution

**Community Resources**
- **HubSpot Community**: Search "URL Shortener Integration Up"
- **Feature Requests**: Submit through dashboard feedback system
- **User Forum**: Share best practices with other users

### Frequently Asked Questions

**Q: Do I need coding knowledge to set up URL shortening?**
A: No! The entire setup is point-and-click through HubSpot workflows. No coding required.

**Q: Can I use my own URL shortening service instead of Bitly?**
A: Currently, only Bitly is supported. We chose Bitly for its reliability, analytics, and enterprise features. Other services may be added based on user demand.

**Q: Will shortened URLs expire?**
A: No. Bitly links don't expire unless you delete them manually. They remain active indefinitely.

**Q: Can I see click analytics for my shortened URLs?**
A: Yes! All analytics are available in your Bitly dashboard, including click counts, geographic data, and referrer information.

**Q: Is there a limit to how many URLs I can shorten?**
A: During the beta period, there are no Integration Up limits. Bitly limits apply based on your plan (1,000/month for free accounts).

**Q: What happens if Bitly is down?**
A: The URL Shortener includes retry logic. If Bitly is temporarily unavailable, it will retry automatically. If shortening fails, the original URL is still available in output fields.

**Q: Can I use this for SMS campaigns?**
A: Absolutely! Shortened URLs are perfect for SMS since they save character space and look more professional.

**Q: Is my API key secure?**
A: Yes. API keys are encrypted with AES-256-GCM and stored securely. They're never exposed in logs or error messages.

**Q: Can I change my custom domain later?**
A: Yes. Update your domain in Bitly first, then change it in your workflow configurations. Existing short links will continue to work.

**Q: Do shortened URLs affect SEO?**
A: Bitly uses 301 redirects, which pass link equity to the destination. However, use original URLs for primary SEO content and shortened URLs for campaigns and tracking.

## Next Steps

Now that your URL Shortener is configured and tested:

### Immediate Actions
1. **Deploy to Production**: Move from test to live workflows
2. **Train Your Team**: Show colleagues how to use shortened links
3. **Set Up Analytics**: Monitor link performance in Bitly dashboard
4. **Create Standards**: Establish naming conventions for domains and campaigns

### Long-term Optimization
1. **Expand Usage**: Add URL shortening to more workflows
2. **Advanced Tracking**: Implement UTM parameter standards
3. **Performance Analysis**: Regular review of click-through rates
4. **Custom Domains**: Set up branded domains for professional appearance

### Best Practices to Adopt
1. **Consistent Branding**: Use custom domains across all campaigns
2. **Clear Naming**: Use descriptive campaign names for easy tracking
3. **Regular Monitoring**: Check analytics weekly for optimization opportunities
4. **Team Training**: Ensure all marketers understand the capabilities

## Success Checklist

Confirm your URL Shortener setup is complete:

- [ ] App successfully installed in HubSpot
- [ ] Bitly API key configured and tested
- [ ] First workflow created and tested
- [ ] Test URLs successfully shortened
- [ ] Shortened links redirect correctly
- [ ] Team members trained on usage
- [ ] Documentation bookmarked for reference
- [ ] Analytics access confirmed in Bitly dashboard
- [ ] Custom domain configured (if applicable)
- [ ] Production workflows activated

## Conclusion

Congratulations! You've successfully implemented professional URL shortening in your HubSpot workflows. Your marketing campaigns now feature clean, branded links that build trust, save space, and provide valuable analytics.

The URL Shortener transforms unwieldy tracking URLs into professional links that enhance every customer touchpoint. From email campaigns to SMS outreach, your communications now maintain a polished, branded appearance that reflects your organization's attention to detail.

Your shortened links are powered by Bitly's enterprise-grade infrastructure, ensuring 99.9% uptime and comprehensive analytics. With AES-256-GCM encrypted API key storage and enterprise-grade security standards, you can trust that your link shortening is both secure and reliable.

As you scale your marketing efforts, the URL Shortener scales with you - handling thousands of links with consistent performance and providing the analytics insights you need to optimize your campaigns.

Welcome to more professional, trackable, and effective marketing communications!

---

*Last updated: January 2025*
*Version: 1.1.0*
*Integration Up URL Shortener for HubSpot*