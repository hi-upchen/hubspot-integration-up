import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'

export default function DocsPage() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Header */}
      <Container className="pt-20 pb-16 text-center lg:pt-32">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl">
          Setup Guides
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
          Get your HubSpot workflow automation tools up and running in minutes. 
          Professional-grade integrations that just work.
        </p>
      </Container>

      {/* App Overview Cards */}
      <section className="bg-slate-50 py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center mb-16">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Choose Your Workflow Tool
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              Professional automation tools designed for HubSpot administrators and developers.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-2">
            {/* Date Formatter Card */}
            <div className="relative rounded-2xl bg-white p-8 shadow-xl shadow-slate-900/10">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="ml-4 font-display text-xl font-semibold text-slate-900">Date Formatter</h3>
              </div>
              
              <p className="text-slate-700 mb-6">
                Transform confusing dates into crystal-clear formats. Supports 15+ international formats, 
                smart 2-digit year handling, and custom format tokens for professional customer communications.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  15+ date formats (US, UK, ISO, Taiwan, Korea, Japan)
                </div>
                <div className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Smart 2-digit year conversion (25→2025, 99→1999)
                </div>
                <div className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Custom format tokens for branded communications
                </div>
                <div className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Zero permissions required, enterprise security
                </div>
              </div>
              
              <Button href="/docs/date-formatter/setup-guide" color="blue" className="w-full">
                View Setup Guide
              </Button>
            </div>
            
            {/* URL Shortener Card */}
            <div className="relative rounded-2xl bg-white p-8 shadow-xl shadow-slate-900/10">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="ml-4 font-display text-xl font-semibold text-slate-900">URL Shortener</h3>
              </div>
              
              <p className="text-slate-700 mb-6">
                Create branded short links for professional customer communications. Powered by Bitly with 
                custom domain support, click analytics, and enterprise-grade reliability.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Bitly-powered with 99.9% uptime guarantee
                </div>
                <div className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Custom branded domains (yourbrand.co/link)
                </div>
                <div className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Use your own Bitly API keys for full control
                </div>
                <div className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Custom domains (setup in Bitly first)
                </div>
              </div>
              
              <Button href="/docs/url-shortener/setup-guide" color="blue" className="w-full">
                View Setup Guide
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Start Process */}
      <section className="py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center mb-16">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Quick Start Process
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              Get up and running in under 5 minutes with our streamlined setup process.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">Install App</h3>
              <p className="text-sm text-slate-700">Click install and authorize with your HubSpot account. Zero permissions required.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">Configure Settings</h3>
              <p className="text-sm text-slate-700">Follow our step-by-step setup guide to configure your preferences.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">Test Workflow</h3>
              <p className="text-sm text-slate-700">Run a test workflow to verify everything is working correctly.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                <span className="text-2xl font-bold text-green-600">✓</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">Go Live</h3>
              <p className="text-sm text-slate-700">Deploy to your production workflows with confidence.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Enterprise Features */}
      <section className="bg-slate-50 py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center mb-16">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Enterprise-Grade Reliability
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              Built for Fortune 500 companies with security and performance requirements.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">Security First</h3>
              <p className="text-sm text-slate-700">OAuth authentication, encrypted storage, and enterprise-grade security for peace of mind.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-sm text-slate-700">Sub-500ms response times with 99.9% uptime. Built to handle thousands of concurrent workflows.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-6">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">24/7 Support</h3>
              <p className="text-sm text-slate-700">Dedicated support team and comprehensive documentation to help you succeed.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Support Section */}
      <section className="py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center mb-16">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Need Help Getting Started?
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              Our team is here to help you succeed with your workflow automation.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-2">
            <div className="text-center">
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">Email Support</h3>
              <p className="text-sm text-slate-700 mb-4">Get personalized help from our technical team.</p>
              <Button href="mailto:hi.upchen@gmail.com" variant="outline" color="slate">
                Contact Support
              </Button>
            </div>
            
            <div className="text-center">
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-3">GitHub Community</h3>
              <p className="text-sm text-slate-700 mb-4">Open source community and issue tracking.</p>
              <Button href="https://github.com/hi-upchen/hubspot-integration-up" variant="outline" color="slate" target="_blank" rel="noopener noreferrer">
                Join Community
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  )
}