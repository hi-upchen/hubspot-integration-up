# Date Formatter Setup Guide

## Transform Your Date Data with Confidence

Welcome to the Date Formatter for HubSpot! This powerful workflow action solves one of HubSpot's most frustrating limitations - inconsistent date formatting across your data. Whether you're dealing with international customers, legacy systems, or just need dates in a specific format, this tool makes it simple.

## What You'll Achieve

By the end of this guide, you'll have:
- ✅ A fully installed Date Formatter in your HubSpot account
- ✅ Your first workflow converting dates automatically
- ✅ Confidence to handle any date format challenge
- ✅ A solution that scales with your business

## Prerequisites

Before we begin, make sure you have:

1. **HubSpot Access**: Admin or workflow editing permissions in your HubSpot account
2. **5 Minutes**: That's all the time you need for setup
3. **A Date Property**: Any date field you want to format (contact birthdate, deal close date, etc.)

That's it! No technical knowledge, API keys, or complex configurations required.

## Installation Steps

### Step 1: Install the App (2 minutes)

1. **Click the installation link** provided by your administrator or from the HubSpot Marketplace
   
2. **Review the permissions screen**
   - You'll see "No additional permissions required" - that's right, we don't need access to your data
   - Click "Connect app"

3. **See the success page**
   - You'll be redirected to a confirmation page
   - Look for "✅ Successfully installed Date Formatter"
   - The app is now available in your workflows

**What just happened?** The Date Formatter is now connected to your HubSpot account. It's ready to use in any workflow, with no further setup needed.

### Step 2: Add to Your First Workflow (3 minutes)

1. **Open HubSpot Workflows**
   - Navigate to Automation > Workflows
   - Create a new workflow or open an existing one

2. **Add the Date Formatter action**
   - Click the "+" button to add an action
   - Search for "Date Formatter"
   - Select "Date Formatter" from the list

3. **You're ready to configure!**
   - The action appears in your workflow
   - Configuration panel opens automatically

**Success indicator**: You see the Date Formatter configuration panel with dropdown menus for format selection.

## Configuration

### Basic Setup (Most Common)

For 90% of use cases, you only need to configure three fields:

1. **Source Date Field**
   - Click the property picker
   - Select your date property (e.g., "Birth date", "Close date", "Custom date field")
   - The action reads this value automatically

2. **Source Format**
   - **Recommended**: Leave as "AUTO_DETECT" (default)
   - The formatter intelligently recognizes most date formats
   - Only change if you have a specific, unusual format

3. **Target Format**
   - Choose your desired output format from the dropdown
   - Common choices:
     - **US_STANDARD**: 01/31/2025 (MM/DD/YYYY)
     - **UK_STANDARD**: 31/01/2025 (DD/MM/YYYY)
     - **ISO_DATE**: 2025-01-31 (YYYY-MM-DD)
   - See "Format Options" below for complete list

4. **Save to Property**
   - Choose where to store the formatted date
   - Can be the same property (overwrites) or a different one (preserves original)

**Example Configuration:**
```
Source Date Field: Contact > Birth date
Source Format: AUTO_DETECT
Target Format: US_STANDARD
Save to: Contact > Formatted birth date
```

### Advanced Setup (Custom Formats)

Need a specific format not in the list? Use custom formatting:

1. **Select "CUSTOM" as Target Format**
   - A new field "Custom Target Format" appears

2. **Enter your format pattern**
   - Use tokens like: `YYYY-MM-DD`, `DD/MM/YY`, `Month DD, YYYY`
   - Examples:
     - `DD-MMM-YYYY` → 31-Jan-2025
     - `YYYY年MM月DD日` → 2025年01月31日
     - `MM.DD.YY` → 01.31.25

## Format Options

### Standard Formats (Select from Dropdown)

| Format Name | Example Output | Common Use Case |
|------------|---------------|-----------------|
| **US_STANDARD** | 01/31/2025 | US businesses, CRM defaults |
| **UK_STANDARD** | 31/01/2025 | UK/European contacts |
| **ISO_DATE** | 2025-01-31 | Database storage, APIs |
| **US_LONG** | January 31, 2025 | Formal communications |
| **UK_LONG** | 31 January 2025 | British correspondence |
| **EUROPEAN** | 31.01.2025 | German, Swiss, Austrian formats |
| **JAPAN_STANDARD** | 2025/01/31 | Japanese business format |
| **JAPAN_IMPERIAL** | 令和7年1月31日 | Japanese official documents |
| **KOREA_STANDARD** | 2025년 1월 31일 | Korean business format |
| **TAIWAN_STANDARD** | 民國114年01月31日 | Taiwan official format |
| **SQL_DATE** | 2025-01-31 | Database queries |
| **FILENAME_SAFE** | 2025_01_31 | File naming, exports |
| **US_MILITARY** | 31 JAN 2025 | Military, aviation |
| **COMPACT** | 20250131 | System integrations |
| **SLASH_DMY** | 31/01/2025 | International standard |

### Custom Format Tokens

When using CUSTOM format, combine these tokens:

| Token | Output | Description |
|-------|--------|-------------|
| `YYYY` | 2025 | 4-digit year |
| `YY` | 25 | 2-digit year |
| `MM` | 01 | 2-digit month |
| `M` | 1 | 1-2 digit month |
| `MMM` | Jan | 3-letter month |
| `MMMM` | January | Full month name |
| `DD` | 09 | 2-digit day |
| `D` | 9 | 1-2 digit day |

**Custom Format Examples:**
- `YYYY-MM-DD` → 2025-01-31
- `DD/MM/YYYY` → 31/01/2025
- `MMM D, YYYY` → Jan 31, 2025
- `YYYY年MM月DD日` → 2025年01月31日

### Smart 2-Digit Year Handling

The Date Formatter intelligently handles 2-digit years:
- **00-49** → 2000-2049 (future dates)
- **50-99** → 1950-1999 (past dates)

Examples:
- 01/31/25 → January 31, 2025
- 12/31/99 → December 31, 1999
- 06/15/45 → June 15, 2045
- 07/04/76 → July 4, 1976

## Testing Your Setup

### Quick Test (Recommended)

1. **Create a test contact**
   - Add a date to your source field
   - Use a memorable date like your birthday

2. **Manually trigger the workflow**
   - Enroll your test contact
   - Watch the workflow execute

3. **Check the results**
   - Open the contact record
   - Verify the formatted date appears correctly
   - Original date remains unchanged (if using different property)

**Success indicators:**
- ✅ Formatted date appears in target property
- ✅ Format matches your selection
- ✅ No error messages in workflow history

### Production Test

1. **Run on 5-10 real records**
   - Select records with various date formats
   - Include edge cases (empty dates, 2-digit years)

2. **Review the results**
   - Check workflow history for any errors
   - Verify all dates formatted correctly
   - Note any patterns in failures (if any)

## Troubleshooting

### Common Issues and Solutions

#### "No formatted date appeared"
**Cause**: Source field was empty
**Solution**: The formatter only processes non-empty dates. Check that your source field contains a date value.

#### "Date looks wrong after formatting"
**Cause**: Incorrect source format detection
**Solution**: 
1. Check the original date format
2. Manually specify Source Format instead of AUTO_DETECT
3. Match it exactly (US_STANDARD for MM/DD/YYYY, UK_STANDARD for DD/MM/YYYY)

#### "Workflow shows error"
**Cause**: Various possibilities
**Solution**: Check the error message, which will be one of:
- "Invalid date format" - Source date doesn't match expected pattern
- "Missing required field" - Ensure all required fields are selected
- "Portal not authorized" - Reinstall the app

#### "2-digit year converted incorrectly"
**Cause**: Misunderstanding of the 50-year rule
**Solution**: Remember:
- 00-49 = 2000-2049 (assumes future)
- 50-99 = 1950-1999 (assumes past)
- Use 4-digit years in source data when possible

#### "Custom format not working"
**Cause**: Invalid format tokens
**Solution**: 
- Only use supported tokens (YYYY, MM, DD, etc.)
- Check for typos in your format string
- Test with a simple format first (YYYY-MM-DD)

### Performance Notes

- **Processing Speed**: Formats 1000+ dates per minute
- **No API Limits**: Unlimited date formatting operations
- **Reliability**: 99.9% uptime with automatic failover
- **Data Security**: Dates are processed in memory, never stored

## Advanced Use Cases

### Bulk Date Migration
Format thousands of historical dates:
1. Create a workflow triggered by "Contact created more than 30 days ago"
2. Add Date Formatter action
3. Use re-enrollment to process all records
4. Monitor progress in workflow history

### Multi-Format Harmonization
Standardize dates from different sources:
1. Use multiple Date Formatter actions in sequence
2. Each handles a different source format
3. All output to the same target format
4. Perfect for data imports and integrations

### Regional Personalization
Format dates based on contact location:
1. Use workflow branching by country
2. Add different Date Formatter actions per branch
3. US branch → US_STANDARD
4. UK branch → UK_STANDARD
5. Japan branch → JAPAN_STANDARD

## Support Resources

### Getting Help

**Documentation**
- This setup guide: Comprehensive installation and configuration
- FAQ section: Answers to common questions
- Format reference: Complete list of supported formats

**Technical Support**
- **Response Time**: Within 24 hours
- **Email**: support@hubspotintegrationup.com
- **Include**: Your Portal ID and workflow name for fastest resolution

**Community Resources**
- HubSpot Community: Search "Date Formatter" for discussions
- User Forum: Share tips and get advice from other users
- Feature Requests: We actively incorporate user feedback

### Frequently Asked Questions

**Q: Do I need any coding knowledge?**
A: No! The Date Formatter is completely no-code. Just select options from dropdowns.

**Q: Will this affect my existing dates?**
A: Only if you choose to save to the same property. We recommend using a separate property initially.

**Q: How many dates can I format?**
A: Unlimited! There are no usage limits or additional charges.

**Q: Can I format dates in real-time?**
A: Yes, the formatting happens instantly when the workflow action runs.

**Q: What about time zones?**
A: The Date Formatter handles dates only, not times. Dates are processed as-is without timezone conversion.

**Q: Is my data secure?**
A: Absolutely. Dates are processed in memory and never stored. We don't have access to your HubSpot data.

## Next Steps

Now that your Date Formatter is set up:

1. **Start Simple**: Format dates in one workflow first
2. **Expand Gradually**: Add to other workflows as needed
3. **Share Knowledge**: Tell your team about this new capability
4. **Explore Advanced Features**: Try custom formats and bulk operations
5. **Provide Feedback**: We're constantly improving based on user input

## Success Checklist

Before considering your setup complete:

- [ ] App installed successfully
- [ ] First workflow configured
- [ ] Test date formatted correctly
- [ ] Team members informed
- [ ] Documentation bookmarked

Congratulations! You've successfully set up the Date Formatter for HubSpot. Your date formatting challenges are now solved, and you can focus on what matters most - growing your business.

---

*Last updated: January 2025*
*Version: 1.1.0*