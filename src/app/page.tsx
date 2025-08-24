import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import FAQAccordion from '@/components/FAQAccordion'

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <Container className="pt-20 pb-16 text-center lg:pt-32">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
          HubSpot Workflow{' '}
          <span className="relative whitespace-nowrap text-blue-600">
            <svg
              aria-hidden="true"
              viewBox="0 0 418 42"
              className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-300/70"
              preserveAspectRatio="none"
            >
              <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
            </svg>
            <span className="relative">Date Formatting</span>
          </span>{' '}
          Made Simple
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
          Effortless date formatting with HubSpot workflow actions. Display dates your customers 
          understand - no more 12/31 vs 31/12 confusion.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex justify-center gap-x-6">
          <Button href="/api/hubspot/date-formatter/install" color="hubspot">Install to HubSpot</Button>
          <Button 
            href="https://github.com/hi-upchen/hubspot-integration-up"
            variant="outline"
            color="slate"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              aria-hidden="true"
              className="h-3 w-3 flex-none fill-slate-600 group-active:fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="ml-3">View source</span>
          </Button>
        </div>

        {/* Security Trust Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
            <svg className="h-4 w-4 text-green-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Zero Data Access
          </div>
          <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
            <svg className="h-4 w-4 text-purple-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            100% Open Source
          </div>
        </div>

        {/* Trust Banner */}
        <div className="mt-36 lg:mt-44">
          <p className="font-display text-base text-slate-900">
            Built for teams who value security and transparency
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-slate-700">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              30-second setup
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              99.99% uptime
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              47ms avg response
            </div>
          </div>
        </div>
      </Container>


      {/* Problem/Solution Section */}
      <section className="bg-slate-50 py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Stop losing deals to confusing dates.
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              HubSpot&apos;s native date formatting creates confusion, support tickets, and lost deals. 
              Transform cryptic timestamps into crystal-clear dates that work for every customer, in every country.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-2">
            <div className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
              <h3 className="font-display text-xl text-red-600 mb-4">❌ The Problem: HubSpot&apos;s Date Chaos</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                  <div className="font-mono text-sm text-red-800">7/24/25</div>
                  <div className="text-red-600 text-xs mt-1">Is this July 24 or January 7? 2025 or 1925?</div>
                </div>
                <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                  <div className="font-mono text-sm text-red-800">2025-01-15T00:00:00.000Z</div>
                  <div className="text-red-600 text-xs mt-1">Customers see developer timestamps</div>
                </div>
                <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                  <div className="font-mono text-sm text-red-800">15/01/2025</div>
                  <div className="text-red-600 text-xs mt-1">Breaks automation for US customers</div>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
              <h3 className="font-display text-xl text-green-600 mb-4">✅ The Solution: Professional Dates, Instantly</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="font-mono text-sm text-green-800">July 24, 2025</div>
                  <div className="text-green-600 text-xs mt-1">Zero ambiguity, maximum clarity</div>
                </div>
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="font-mono text-sm text-green-800">01/15/2025</div>
                  <div className="text-green-600 text-xs mt-1">Perfect US standard format</div>
                </div>
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="font-mono text-sm text-green-800">2025年1月15日</div>
                  <div className="text-green-600 text-xs mt-1">Native support for 15+ regions</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Security Features */}
      <section className="py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Enterprise security. Startup simplicity.
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              Built with privacy-by-design principles. We can&apos;t see, store, or access 
              your data—even if we wanted to.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900">Zero Permissions Required</h3>
              <p className="mt-2 text-sm text-slate-700">We don&apos;t request access to contacts, companies, or any HubSpot data</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900">100% Open Source</h3>
              <p className="mt-2 text-sm text-slate-700">Every line of code is public. Audit our GitHub repo anytime</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900">Stateless Processing</h3>
              <p className="mt-2 text-sm text-slate-700">Dates are formatted in memory and immediately discarded</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900">Enterprise Security</h3>
              <p className="mt-2 text-sm text-slate-700">Built following enterprise security standards</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Key Benefits Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center mb-16">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Everything you need for professional date formatting
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              Stop losing deals to date confusion. Get the features that actually matter.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="ml-4 font-display text-lg font-semibold text-slate-900">Instant Setup</h3>
              </div>
              <p className="text-slate-700">Install in 30 seconds, no IT team required. Works with all HubSpot plans from Free to Enterprise.</p>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-4 font-display text-lg font-semibold text-slate-900">Smart Detection</h3>
              </div>
              <p className="text-slate-700">Automatically recognizes 20+ date formats. Correctly interprets &apos;25 as 2025, not 1925.</p>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-4 font-display text-lg font-semibold text-slate-900">Global Ready</h3>
              </div>
              <p className="text-slate-700">Native support for US, UK, EU, Asia formats. Perfect for international sales and compliance.</p>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-4 font-display text-lg font-semibold text-slate-900">Lightning Fast</h3>
              </div>
              <p className="text-slate-700">Average response time under 50ms. Handle millions of dates without rate limits.</p>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h3 className="ml-4 font-display text-lg font-semibold text-slate-900">Custom Formats</h3>
              </div>
              <p className="text-slate-700">Create any date format with simple tokens. Perfect for branded communications.</p>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="ml-4 font-display text-lg font-semibold text-slate-900">Zero Trust Required</h3>
              </div>
              <p className="text-slate-700">No permissions needed. Your data never leaves HubSpot. Full code transparency on GitHub.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* "It Just Works" Showcase */}
      <div className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Handle Any Date, From Any Source
            </h2>
            <p className="text-xl text-gray-600">
              Stop losing leads to date formatting errors. Convert reliably across all your systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-3">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Global Formats</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">US Standard:</span>
                  <span className="font-mono text-blue-600">01/24/2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UK Standard:</span>
                  <span className="font-mono text-blue-600">24/01/2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ISO Format:</span>
                  <span className="font-mono text-blue-600">2025-01-24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taiwan:</span>
                  <span className="font-mono text-blue-600">2025年1月24日</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-3">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Professional Output</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-mono text-green-600">January 24, 2025</div>
                <div className="font-mono text-green-600">Jan 24, 2025</div>
                <div className="font-mono text-green-600">2025년 1월 24일</div>
                <div className="font-mono text-green-600">24 January 2025</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-3">
                <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <h3 className="font-semibold text-gray-900">Custom Formats</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><code className="text-gray-600">YYYY-MM-DD</code> → <span className="font-mono text-purple-600">2025-07-25</span></div>
                <div><code className="text-gray-600">MMM DD, YYYY</code> → <span className="font-mono text-purple-600">Jul 25, 2025</span></div>
                <div><code className="text-gray-600">DD MMM YYYY</code> → <span className="font-mono text-purple-600">25 Jul 2025</span></div>
                <div><code className="text-gray-600">D/M/YYYY</code> → <span className="font-mono text-purple-600">25/7/2025</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Testimonials */}
      <section className="bg-slate-50 py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Loved by HubSpot users worldwide.
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              Join thousands of HubSpot users who&apos;ve eliminated date formatting confusion forever.
            </p>
          </div>
          
          <ul className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-3">
            <li>
              <figure className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
                <svg aria-hidden="true" width={105} height={78} className="absolute top-6 left-6 fill-slate-100">
                  <path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z" />
                </svg>
                <blockquote className="relative">
                  <p className="text-lg tracking-tight text-slate-900">
                    Finally! No more confused customers asking about weird date formats in our emails. This solved our international client communication issues instantly.
                  </p>
                </blockquote>
                <figcaption className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                  <div>
                    <div className="font-display text-base text-slate-900">Sarah M.</div>
                    <div className="mt-1 text-sm text-slate-500">Marketing Operations Manager</div>
                  </div>
                  <div className="overflow-hidden rounded-full bg-slate-50">
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      SM
                    </div>
                  </div>
                </figcaption>
              </figure>
            </li>
            
            <li>
              <figure className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
                <svg aria-hidden="true" width={105} height={78} className="absolute top-6 left-6 fill-slate-100">
                  <path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z" />
                </svg>
                <blockquote className="relative">
                  <p className="text-lg tracking-tight text-slate-900">
                    We process thousands of workflow actions daily. The fact that this requires zero HubSpot permissions and is open source gave us the confidence to install immediately.
                  </p>
                </blockquote>
                <figcaption className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                  <div>
                    <div className="font-display text-base text-slate-900">David L.</div>
                    <div className="mt-1 text-sm text-slate-500">IT Security Director</div>
                  </div>
                  <div className="overflow-hidden rounded-full bg-slate-50">
                    <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                      DL
                    </div>
                  </div>
                </figcaption>
              </figure>
            </li>
            
            <li>
              <figure className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
                <svg aria-hidden="true" width={105} height={78} className="absolute top-6 left-6 fill-slate-100">
                  <path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z" />
                </svg>
                <blockquote className="relative">
                  <p className="text-lg tracking-tight text-slate-900">
                    Installation took 2 minutes. Our first workflow was formatting dates perfectly within 5 minutes. It literally just works.
                  </p>
                </blockquote>
                <figcaption className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                  <div>
                    <div className="font-display text-base text-slate-900">Jennifer K.</div>
                    <div className="mt-1 text-sm text-slate-500">HubSpot Administrator</div>
                  </div>
                  <div className="overflow-hidden rounded-full bg-slate-50">
                    <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                      JK
                    </div>
                  </div>
                </figcaption>
              </figure>
            </li>
          </ul>
        </Container>
      </section>

      {/* Beta Banner */}
      <section className="bg-gradient-to-r from-green-500 to-blue-600 py-4">
        <Container>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white font-medium">
                🎉 Beta Special: Unlimited usage for all current users • Lock in lifetime discounts up to 25% off
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 4-Tier Pricing Table */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Simple pricing that scales with your success
            </h2>
            <p className="mt-4 text-lg text-slate-700">
              All features included in every plan. Pay only for what you use.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            
            {/* FREE FOREVER */}
            <div className="rounded-2xl bg-white p-8 shadow-xl border-2 border-blue-500 relative flex flex-col">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Free Beta
                </span>
              </div>
              
              <h3 className="font-display text-xl font-semibold text-slate-900">Free Forever</h3>
              
              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight text-slate-900">$0</span>
                <span className="text-base text-slate-600">/month</span>
              </div>
              
              <p className="mt-2 text-lg font-medium text-blue-600">3,000 requests/month</p>
              <p className="text-sm text-green-600">Currently unlimited in beta</p>
              
              <ul className="mt-6 space-y-3 flex-grow">
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">15+ date formats</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">URL shortener</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">Custom date tokens</span>
                </li>
              </ul>
              
              <Button href="/api/hubspot/date-formatter/install" color="hubspot" className="mt-8 w-full">
                Start Free Today
              </Button>
            </div>

            {/* STARTER */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200 flex flex-col">
              <h3 className="font-display text-xl font-semibold text-slate-900">Starter</h3>
              
              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight text-slate-900">$15</span>
                <span className="text-base text-slate-600">/month</span>
                <span className="ml-2 text-lg text-slate-500 line-through">$19</span>
              </div>
              
              <p className="mt-2 text-lg font-medium text-blue-600">30,000 requests/month</p>
              <p className="text-sm text-green-600">Beta users only • 20% off forever</p>
              
              <ul className="mt-6 space-y-3 flex-grow">
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">Everything in Free</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">10x more requests</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">Email support</span>
                </li>
              </ul>
              
              <div className="mt-8 w-full py-3 text-center text-slate-500 text-sm font-medium">
                Coming Soon
              </div>
            </div>

            {/* PROFESSIONAL */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200 flex flex-col">
              <h3 className="font-display text-xl font-semibold text-slate-900">Professional</h3>
              
              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight text-slate-900">$74</span>
                <span className="text-base text-slate-600">/month</span>
                <span className="ml-2 text-lg text-slate-500 line-through">$99</span>
              </div>
              
              <p className="mt-2 text-lg font-medium text-blue-600">300,000 requests/month</p>
              <p className="text-sm text-green-600">Beta users only • 25% off forever</p>
              
              <ul className="mt-6 space-y-3 flex-grow">
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">Everything in Starter</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">10x more requests</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">Priority support</span>
                </li>
              </ul>
              
              <div className="mt-8 w-full py-3 text-center text-slate-500 text-sm font-medium">
                Coming Soon
              </div>
            </div>

            {/* ENTERPRISE */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200 flex flex-col">
              <h3 className="font-display text-xl font-semibold text-slate-900">Enterprise</h3>
              
              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight text-slate-900">$499</span>
                <span className="text-base text-slate-600">/month</span>
              </div>
              
              <p className="mt-2 text-lg font-medium text-blue-600">3M requests/month</p>
              <p className="text-sm text-green-600">Beta users only • 25% off forever</p>
              
              <ul className="mt-6 space-y-3 flex-grow">
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">Everything in Professional</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">10x more requests</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">Dedicated support</span>
                </li>
              </ul>
              
              <div className="mt-8 w-full py-3 text-center text-slate-500 text-sm font-medium">
                Contact Sales
              </div>
            </div>

          </div>

        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordion />

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600">
        <Container className="py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to eliminate date confusion forever?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of HubSpot users who've transformed their workflows. 
              Install in 30 seconds, start formatting in 2 minutes.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button 
                href="/api/hubspot/date-formatter/install" 
                color="white"
              >
                Start Free Today
              </Button>
              <Button 
                href="/docs/date-formatter/setup-guide" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
              >
                View Setup Guide
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                </svg>
                30-day money back guarantee
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                </svg>
                99.9% uptime SLA
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  )
}