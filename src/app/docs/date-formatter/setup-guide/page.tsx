import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'

export default function DateFormatterSetupGuide() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Header */}
      <Container className="pt-20 pb-16 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
                Date Formatter Setup Guide
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Transform confusing dates into crystal-clear formats for professional customer communications
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">Setup Time: 5-10 minutes</p>
            </div>
            <p className="text-green-700 mt-1 text-sm">No technical knowledge required. Zero access to your contacts or deals.</p>
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
                The Date Formatter transforms confusing date formats like "7/24/25" into clear, professional formats 
                that your customers actually understand. Perfect for international businesses, customer communications, 
                and maintaining brand consistency across all workflows.
              </p>
              
              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-slate-900 mb-4">Key Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">15+ professional date formats</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Smart 2-digit year handling</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">International format support</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Zero access to your customer data</span>
                  </div>
                </div>
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
                  5 minutes of setup time
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
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Install the Date Formatter App</h3>
                  <p className="text-slate-700 mb-4">
                    Click the install button to connect the Date Formatter to your HubSpot account. This process is secure 
                    and won't access your contacts, deals, or customer data.
                  </p>
                  <Button href="/api/hubspot/date-formatter/install" color="blue" className="mb-4">
                    Install Date Formatter
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
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Navigate to HubSpot Workflows</h3>
                  <p className="text-slate-700 mb-4">
                    In your HubSpot account, go to <strong>Automation → Workflows</strong> and either create a new workflow 
                    or edit an existing one where you want to format dates.
                  </p>
                  <div className="bg-slate-100 rounded-lg p-4 mb-4">
                    <code className="text-sm">HubSpot → Automation → Workflows → [Your Workflow]</code>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Success Indicator:</strong> You can see the workflow editor with available actions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Add the Date Formatter Action</h3>
                  <p className="text-slate-700 mb-4">
                    Click the <strong>+</strong> button to add a new action, then search for "Date Formatter" in the action library. 
                    Select the Date Formatter action to add it to your workflow.
                  </p>
                  <div className="bg-slate-100 rounded-lg p-4 mb-4">
                    <p className="text-sm font-mono">Search: "Date Formatter" → Select "Date Formatter v1.0.0"</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Success Indicator:</strong> The Date Formatter action appears in your workflow with configuration options.
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
                  <h3 className="font-semibold text-slate-900 mb-2">Configure Date Formatting</h3>
                  <p className="text-slate-700 mb-4">
                    Configure the source date field, source format detection, and target format. The next section 
                    provides detailed configuration options.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Complete!</strong> Your Date Formatter is now installed and ready to configure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Configuration */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Configuration Options</h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Source Date Field</h3>
                  <p className="text-slate-700 mb-4">
                    Select the HubSpot property containing the date you want to format. This can be any date property 
                    from your contact, company, deal, or ticket records.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      <strong>Tip:</strong> Use personalization tokens like {`{{contact.createdate}}`} or custom date properties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Source Format Detection</h3>
                  <p className="text-slate-700 mb-4">
                    Choose how the Date Formatter should interpret your source date:
                  </p>
                  <ul className="text-sm text-slate-700 space-y-1 ml-4 mb-4">
                    <li><strong>Auto-detect:</strong> Automatically identifies common formats (recommended)</li>
                    <li><strong>US Standard:</strong> MM/DD/YYYY or MM/DD/YY format</li>
                    <li><strong>International:</strong> DD/MM/YYYY or DD/MM/YY format</li>
                    <li><strong>ISO Date:</strong> YYYY-MM-DD format</li>
                  </ul>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      <strong>Tip:</strong> Choose based on your HubSpot's Date, time, and number format settings. If you're not quite sure, then select <strong>Auto-detect</strong>. If you are in EU format, select <strong>International</strong>. If you are in US format, select <strong>US Standard</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900 mb-2">Target Format</h3>
                  <p className="text-slate-700 mb-4">
                    Select your desired output format from 15+ professional options, or create a custom format. See the <strong>Available Date Formats</strong> section below for all default formats and <strong>Custom Format Tokens</strong> for creating custom formats.
                  </p>
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
                  <h3 className="font-semibold text-slate-900 mb-2">Using Workflow Outputs</h3>
                  <p className="text-slate-700 mb-4">
                    <strong>Important:</strong> For security reasons, the Date Formatter does not automatically store results back to your HubSpot objects. 
                    Instead, you can access the formatted date from the workflow's output fields.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-800 mb-2"><strong>Available Output Fields:</strong></p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• <strong>Formatted date</strong> - The date in your chosen format</li>
                      <li>• <strong>Original date</strong> - The source date that was formatted</li>
                      <li>• <strong>Applied format</strong> - The format that was applied</li>
                      <li>• <strong>Error message</strong> - Any error details if formatting failed</li>
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

          {/* Format Options */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Available Date Formats</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-slate-200 rounded-lg">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Format Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Example Output</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">US Standard</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">01/24/2025</td>
                    <td className="px-6 py-4 text-sm text-slate-700">US customer communications</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">UK Standard</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">24/01/2025</td>
                    <td className="px-6 py-4 text-sm text-slate-700">UK and European markets</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Long Format</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">January 24, 2025</td>
                    <td className="px-6 py-4 text-sm text-slate-700">Professional communications</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Short Format</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">Jan 24, 2025</td>
                    <td className="px-6 py-4 text-sm text-slate-700">Casual communications</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">ISO Date</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">2025-01-24</td>
                    <td className="px-6 py-4 text-sm text-slate-700">Technical documentation</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Taiwan Standard</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">2025年1月24日</td>
                    <td className="px-6 py-4 text-sm text-slate-700">Traditional Chinese markets</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Korea Standard</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">2025년 1월 24일</td>
                    <td className="px-6 py-4 text-sm text-slate-700">Korean market communications</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Custom Format</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">Tuesday 2nd of September</td>
                    <td className="px-6 py-4 text-sm text-slate-700">Branded communications with ordinals</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Custom Format Tokens</h3>
              <p className="text-blue-800 mb-4">Create your own format using these tokens:</p>
              
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-blue-200 rounded-lg">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Token</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Output Range</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    <tr className="bg-blue-25">
                      <td colSpan="3" className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-75">Year Tokens</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">YY</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">18, 25, 99</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Two-digit year</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">YYYY</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">2018, 2025, 1999</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Four-digit year</td>
                    </tr>
                    <tr className="bg-blue-25">
                      <td colSpan="3" className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-75">Month Tokens</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">M</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">1-12</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The month, beginning at 1</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">MM</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">01-12</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The month, 2-digits</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">MMM</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">Jan-Dec</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The abbreviated month name</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">MMMM</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">January-December</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The full month name</td>
                    </tr>
                    <tr className="bg-blue-25">
                      <td colSpan="3" className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-75">Day of Month Tokens</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">D</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">1-31</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The day of the month</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">DD</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">01-31</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The day of the month, 2-digits</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">Do</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">1st, 2nd, 3rd...31st</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Day of month with ordinal</td>
                    </tr>
                    <tr className="bg-blue-25">
                      <td colSpan="3" className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-75">Day of Week Tokens</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">d</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">0-6</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The day of the week, with Sunday as 0</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">dd</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">Su-Sa</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The min name of the day of the week</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">ddd</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">Sun-Sat</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The short name of the day of the week</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">dddd</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">Sunday-Saturday</td>
                      <td className="px-4 py-3 text-sm text-slate-700">The name of the day of the week</td>
                    </tr>
                    <tr className="bg-blue-25">
                      <td colSpan="3" className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-75">Special Tokens</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">Q</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">1-4</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Quarter</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono bg-blue-50">[text]</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">text</td>
                      <td className="px-4 py-3 text-sm text-slate-700">Literal text (wrap in square brackets)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-blue-100 border border-blue-300 rounded p-4">
                <h4 className="font-medium text-blue-900 mb-2">Example Custom Formats</h4>
                <p className="text-blue-800 text-sm mb-2">Using date September 2, 2025 (Tuesday):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div><code>YYYY-MM-DD</code> → 2025-09-02</div>
                  <div><code>DD/MM/YYYY</code> → 02/09/2025</div>
                  <div><code>MMM DD, YYYY</code> → Sep 02, 2025</div>
                  <div><code>MMMM DD, YYYY</code> → September 02, 2025</div>
                  <div><code>dddd Do [of] MMMM</code> → Tuesday 2nd of September</div>
                  <div><code>MMMM Do, YYYY</code> → September 2nd, 2025</div>
                  <div><code>dddd, MMMM Do</code> → Tuesday, September 2nd</div>
                  <div><code>[The] Do [of] MMMM</code> → The 2nd of September</div>
                  <div><code>ddd, MMM Do</code> → Tue, Sep 2nd</div>
                  <div><code>Do MMMM YYYY</code> → 2nd September 2025</div>
                  <div><code>YYYY年MM月DD日</code> → 2025年09月02日</div>
                  <div><code>dddd [at] Do [day]</code> → Tuesday at 2nd day</div>
                </div>
              </div>
            </div>
          </section>


          {/* Troubleshooting */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Troubleshooting</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why doesn't the Date Formatter appear in my workflow action list?</h3>
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
                <h3 className="font-semibold text-slate-900 mb-2">Why does the formatted date appear empty in my workflow outputs?</h3>
                <p className="text-slate-700 mb-2">
                  Empty output typically means the source date field contains no data, invalid date values, or a format that couldn't 
                  be recognized by the auto-detection system or specified source format.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> First verify your source field contains valid date data. Try switching to "Auto-detect" 
                  for source format to let the system identify the format automatically. Check that dates aren't stored as text with 
                  extra spaces or invalid characters.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why are my 2-digit years being interpreted incorrectly?</h3>
                <p className="text-slate-700 mb-2">
                  The system follows standard conventions for 2-digit year interpretation: 00-49 maps to 2000-2049, while 50-99 maps 
                  to 1950-1999. This may not match your specific data expectations.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Use 4-digit years in your source data when possible for unambiguous results. If you need 
                  different 2-digit year logic for your specific use case, contact support to discuss custom interpretation rules.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why isn't my custom format pattern working as expected?</h3>
                <p className="text-slate-700 mb-2">
                  Custom format issues usually stem from using unsupported tokens, incorrect token casing, or patterns that conflict 
                  with the token replacement order (longer tokens are processed before shorter ones).
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Verify you're using only supported tokens: YYYY, YY, MMMM, MMM, MM, M, DD, Do, D, dddd, ddd, dd, d, Q, and literal text in [brackets]. Check that 
                  token casing is exact (uppercase for date/month tokens, lowercase for day-of-week tokens). For literal text that might contain letters used as tokens, 
                  wrap it in square brackets like <code>[The]</code> or <code>[of]</code>.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Why do I get "Invalid date values" errors for dates that look correct?</h3>
                <p className="text-slate-700 mb-2">
                  This error occurs when date components fall outside valid ranges (month &gt; 12, day &gt; 31, impossible dates like Feb 31) 
                  or when the selected source format doesn't match the actual data structure.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Verify the source format matches your data exactly. For example, don't use "US Format" for 
                  dates that are actually in UK format (DD/MM vs MM/DD). Check for impossible dates like leap year February 29th in 
                  non-leap years, or months with incorrect day counts.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">How do I save the formatted date to a contact property?</h3>
                <p className="text-slate-700 mb-2">
                  The Date Formatter provides output fields but doesn't automatically store them in your HubSpot objects for security reasons. 
                  You need to manually configure where to store the results.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Add a "Set property value" action after the Date Formatter action. Select "Formatted date" 
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
                  <p className="text-slate-700 text-sm mb-4">Get personalized help from our team</p>
                  <Button href="mailto:hi.upchen@gmail.com?subject=Date Formatter Setup Help" variant="outline" color="slate" className="w-full">
                    Contact Support
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">GitHub</h3>
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
            <Button href="/docs/url-shortener/setup-guide" color="blue">
              URL Shortener Setup Guide →
            </Button>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}