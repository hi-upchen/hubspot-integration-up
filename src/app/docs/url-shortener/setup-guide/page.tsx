import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export default function UrlShortenerSetupGuide() {
  return (
    <div className="overflow-hidden bg-white">
      <Header currentPage="setup-url-shortener" />

      {/* Header */}
      <Container className="pt-20 pb-16 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
                URL Shortener Setup Guide
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Create branded short links for professional customer communications
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">Setup Time: 10-15 minutes</p>
            </div>
            <p className="text-green-700 mt-1 text-sm">Includes Bitly account setup and API key configuration. No technical knowledge required.</p>
          </div>
        </div>
      </Container>

      {/* Main Content */}
      <Container className="pb-16">
        <div className="mx-auto max-w-4xl">
          {/* Overview */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Overview</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-700 mb-6">
                The URL Shortener creates professional, branded short links for your HubSpot workflows. 
                Perfect for email campaigns, SMS marketing, and customer communications where link aesthetics 
                and click tracking matter for your brand reputation.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-green-900 mb-4">Common Use Cases</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 text-sm"><strong>Email Campaigns:</strong> Professional links that fit in subject lines</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 text-sm"><strong>SMS Marketing:</strong> Save character count with short, trackable links</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 text-sm"><strong>Social Media:</strong> Clean, branded links for platform sharing</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 text-sm"><strong>Print Materials:</strong> Memorable links for business cards and brochures</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prerequisites */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Prerequisites</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Before You Start</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-blue-800">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  HubSpot Administrator or Super Admin access
                </li>
                <li className="flex items-center text-blue-800">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Access to HubSpot Workflows (Marketing Hub Professional or Enterprise)
                </li>
                <li className="flex items-center text-blue-800">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Bitly account (free or paid - we'll help you set this up)
                </li>
                <li className="flex items-center text-blue-800">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  10-15 minutes of setup time
                </li>
              </ul>
            </div>
          </section>

          {/* Installation Steps */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Installation Steps</h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">1</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Install the URL Shortener App</h3>
                  <p className="text-slate-700 mb-4">
                    Click the install button to connect the URL Shortener to your HubSpot account. This process is secure 
                    and requires zero permissions to your HubSpot data.
                  </p>
                  <Button href="/api/hubspot/url-shortener/install" color="blue" className="mb-4">
                    Install URL Shortener
                  </Button>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Success Indicator:</strong> You'll be redirected to HubSpot's authorization page, then back to a success confirmation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">2</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Create Bitly Account & Get API Key</h3>
                  <p className="text-slate-700 mb-4">
                    You'll need a Bitly API key to power your URL shortening. Don't worry - this is easier than it sounds!
                  </p>
                  
                  <div className="bg-slate-100 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">Quick Bitly Setup</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                      <li>Go to <a href="https://bitly.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">bitly.com</a> and create a free account</li>
                      <li>Navigate to Settings → Developer Settings → API</li>
                      <li>Click "Generate Token" and copy your API key</li>
                      <li>Keep this key secure - you'll paste it in the next step</li>
                    </ol>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Success Indicator:</strong> You have a Bitly API key that looks like "1234abcd5678efgh"
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Configure API Key in Dashboard</h3>
                  <p className="text-slate-700 mb-4">
                    Visit your dashboard to securely store your Bitly API key. This is encrypted and only accessible by your workflows.
                  </p>
                  <Button href="/dashboard" color="blue" className="mb-4">
                    Open Dashboard
                  </Button>
                  <div className="bg-slate-100 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-700">
                      In the dashboard: URL Shortener Tab → API Settings → Paste your Bitly API key → Test Connection → Save
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Success Indicator:</strong> You see "✅ Connection verified" after testing your API key.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Add to HubSpot Workflow</h3>
                  <p className="text-slate-700 mb-4">
                    Navigate to your HubSpot workflows and add the URL Shortener action where you need shortened links.
                  </p>
                  <div className="bg-slate-100 rounded-lg p-4 mb-4">
                    <p className="text-sm font-mono">HubSpot → Automation → Workflows → [Your Workflow] → Add Action → Search "URL Shortener"</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Complete!</strong> Your URL Shortener is now installed and ready to use.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Workflow Configuration */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Workflow Configuration</h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">1</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Long URL</h3>
                  <p className="text-slate-700 mb-4">
                    Enter the full URL you want to shorten. This can be a static URL or a HubSpot personalization token.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      <strong>Examples:</strong> https://yoursite.com/landing-page or {`{{contact.website}}`}/special-offer
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">2</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Custom Domain (Optional)</h3>
                  <p className="text-slate-700 mb-4">
                    If you have a custom Bitly domain (like go.yourcompany.com), enter it here for branded links.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> Custom domains must be configured in your Bitly account first.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Using Workflow Outputs</h3>
                  <p className="text-slate-700 mb-4">
                    <strong>Important:</strong> For security reasons, the URL Shortener does not automatically store results back to your HubSpot objects. 
                    Instead, you can access the shortened URL from the workflow's output fields.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-800 mb-2"><strong>Available Output Fields:</strong></p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• <strong>Shortened URL</strong> - The generated short link</li>
                      <li>• <strong>Original URL</strong> - The URL that was shortened</li>
                      <li>• <strong>Domain Used</strong> - Which domain was used (bit.ly or custom)</li>
                      <li>• <strong>Created Time</strong> - When the link was created</li>
                      <li>• <strong>Error Message</strong> - Any error details if shortening failed</li>
                    </ul>
                  </div>
                  <p className="text-slate-700 text-sm">
                    You can use these outputs as HubSpot personalization tokens in subsequent workflow actions, save them back to 
                    object properties using "Set property value" actions, or reference them directly in emails and other actions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Custom Domain Setup */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Custom Domain Setup (Optional)</h2>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Professional Branded Links</h3>
              <p className="text-slate-700 mb-4">
                Transform your links from <code className="bg-white px-2 py-1 rounded">bit.ly/abc123</code> to 
                <code className="bg-white px-2 py-1 rounded">go.yourcompany.com/offer</code> for maximum brand impact.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Setup Process</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                    <li>Follow <a href="https://support.bitly.com/hc/en-us/articles/360025607351-How-do-I-add-my-own-custom-domain-to-Bitly" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Bitly's custom domain setup guide</a> to configure your branded domain</li>
                    <li>Once your custom domain is verified in Bitly, simply enter it in the "Custom Domain" field in the URL Shortener workflow action</li>
                  </ol>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded">
                <p className="text-purple-800 text-sm">
                  <strong>Pro Tip:</strong> Custom domains typically increase click-through rates by 25-35% due to increased trust.
                </p>
              </div>
            </div>
          </section>


          {/* Troubleshooting */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Troubleshooting</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why doesn't the URL Shortener appear in my workflow action list?</h3>
                <p className="text-slate-700 mb-2">
                  This typically indicates that the app installation process didn't complete successfully. The OAuth authorization 
                  may have been interrupted or cancelled before completion.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Return to the installation link and ensure you complete the entire OAuth authorization process. 
                  You should be redirected back to a success confirmation page after authorization.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why do I get "Please configure your Bitly API key" error in workflows?</h3>
                <p className="text-slate-700 mb-2">
                  The workflow action cannot locate your Bitly API key, or the stored key is invalid/expired. This prevents 
                  the system from authenticating with Bitly's services to create short links.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Access your dashboard, verify your Bitly API key is correctly entered, and use the 
                  "Test Connection" feature to confirm it's working. If testing fails, generate a new API key from your Bitly account.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why aren't my custom domain links working correctly?</h3>
                <p className="text-slate-700 mb-2">
                  Custom domain issues usually stem from incomplete domain configuration in your Bitly account, incorrect DNS settings, 
                  or the domain not being properly verified by Bitly before use in workflows.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> First verify your custom domain is properly configured and verified in your Bitly account. 
                  Check that DNS records are correctly set up as specified by Bitly. Allow up to 24 hours for DNS propagation if you've 
                  recently made changes. Test the domain directly in Bitly before using it in workflows.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why am I receiving rate limit errors from Bitly?</h3>
                <p className="text-slate-700 mb-2">
                  Bitly enforces API rate limits based on your account tier. Free accounts have lower limits that can be quickly 
                  exceeded by high-volume workflows or multiple concurrent workflow executions.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Monitor your Bitly usage in your account dashboard. Consider upgrading to Bitly Pro ($35/month) 
                  for higher rate limits (10,000 links/month vs 1,000 for free). For enterprise needs, contact us about dedicated 
                  rate limit solutions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why do I get "Invalid URL format" errors?</h3>
                <p className="text-slate-700 mb-2">
                  The URL provided to the shortener doesn't meet Bitly's format requirements. This includes missing protocols, 
                  invalid characters, or URLs that are already shortened links.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Ensure URLs include the protocol (http:// or https://). Avoid submitting already-shortened 
                  URLs (bit.ly, tinyurl.com, etc.). Check for invalid characters or formatting in personalization tokens that might 
                  be populating the URL field.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">How do I save the shortened URL to a contact property?</h3>
                <p className="text-slate-700 mb-2">
                  The URL Shortener provides output fields but doesn't automatically store them in your HubSpot objects for security reasons. 
                  You need to manually configure where to store the results.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Add a "Set property value" action after the URL Shortener action. Select "Shortened URL" 
                  from the workflow action outputs and set it to your desired contact, company, or deal property. You can also use the output 
                  directly in emails as personalization tokens.
                </p>
              </div>
            </div>
          </section>


          {/* Support */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Need Help?</h2>
            
            <div className="bg-slate-50 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
                  <p className="text-slate-700 text-sm mb-4">Get personalized help with setup</p>
                  <Button href="mailto:hi.upchen@gmail.com?subject=URL Shortener Setup Help" variant="outline" color="slate" className="w-full">
                    Contact Support
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Bitly Help Center</h3>
                  <p className="text-slate-700 text-sm mb-4">Official Bitly documentation</p>
                  <Button href="https://support.bitly.com" variant="outline" color="slate" className="w-full" target="_blank" rel="noopener noreferrer">
                    Bitly Support
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">GitHub Community</h3>
                  <p className="text-slate-700 text-sm mb-4">Open source community and issues</p>
                  <Button href="https://github.com/hi-upchen/hubspot-integration-up" variant="outline" color="slate" className="w-full" target="_blank" rel="noopener noreferrer">
                    View Repository
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                <p className="text-slate-600 text-sm">
                  Average response time: <strong>24 hours</strong> • Available Monday-Friday 9AM-6PM PST
                </p>
              </div>
            </div>
          </section>

          {/* Back Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-200">
            <Button href="/docs" variant="outline" color="slate">
              ← Back to Setup Guides
            </Button>
            <Button href="/docs/date-formatter/setup-guide" color="blue">
              Date Formatter Setup Guide →
            </Button>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}