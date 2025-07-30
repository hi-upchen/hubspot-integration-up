import { Button } from '@/components/Button'
import { Container } from '@/components/Container'

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <Container className="pt-20 pb-16 text-center lg:pt-32">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
          HubSpot Date Formatting{' '}
          <span className="relative whitespace-nowrap text-blue-600">
            <svg
              aria-hidden="true"
              viewBox="0 0 418 42"
              className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-300/70"
              preserveAspectRatio="none"
            >
              <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
            </svg>
            <span className="relative">that just works</span>
          </span>{' '}
          for your workflows.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
          Give your customers the right date format. Zero permissions required, 
          open source, and your data stays totally safe.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex justify-center gap-x-6">
          <Button href="/api/auth/hubspot/install" color="hubspot">Install to HubSpot</Button>
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
            Security First
          </div>
          <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
            <svg className="h-4 w-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Zero Permissions
          </div>
          <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
            <svg className="h-4 w-4 text-purple-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Open Source
          </div>
        </div>

        {/* Trust Banner */}
        <div className="mt-36 lg:mt-44">
          <p className="font-display text-base text-slate-900">
            🔒 Your Data is Totally Safe
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-slate-700">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              No data stored
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              No permissions required
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Full code transparency
            </div>
          </div>
        </div>
      </Container>


      {/* Problem/Solution Section */}
      <section className="bg-slate-50 py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center">
            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Stop frustrating your customers.
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              HubSpot's date formatting is confusing and unprofessional. 
              Get crystal clear dates that customers actually understand.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-2">
            <div className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
              <h3 className="font-display text-xl text-red-600 mb-4">❌ Before: Confusing</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                  <div className="font-mono text-sm text-red-800">7/24/25</div>
                  <div className="text-red-600 text-xs mt-1">July or January? 2025 or 1925?</div>
                </div>
                <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                  <div className="font-mono text-sm text-red-800">2025-01-15T00:00:00.000Z</div>
                  <div className="text-red-600 text-xs mt-1">Technical gibberish</div>
                </div>
                <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                  <div className="font-mono text-sm text-red-800">15/01/2025</div>
                  <div className="text-red-600 text-xs mt-1">Wrong for US customers</div>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
              <h3 className="font-display text-xl text-green-600 mb-4">✅ After: Crystal Clear</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="font-mono text-sm text-green-800">July 24, 2025</div>
                  <div className="text-green-600 text-xs mt-1">Clear and professional</div>
                </div>
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="font-mono text-sm text-green-800">01/15/2025</div>
                  <div className="text-green-600 text-xs mt-1">Perfect US format</div>
                </div>
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="font-mono text-sm text-green-800">2025年1月15日</div>
                  <div className="text-green-600 text-xs mt-1">International support</div>
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
              Built security-first.
            </h2>
            <p className="mt-4 text-lg tracking-tight text-slate-700">
              Enterprise-grade security without the enterprise complexity. 
              Zero permissions, full transparency.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900">Zero Permissions</h3>
              <p className="mt-2 text-sm text-slate-700">No access to your HubSpot data, contacts, or workflows</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900">Open Source</h3>
              <p className="mt-2 text-sm text-slate-700">Full code transparency - audit anytime on GitHub</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900">No Data Storage</h3>
              <p className="mt-2 text-sm text-slate-700">Dates processed instantly and forgotten immediately</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900">Enterprise Ready</h3>
              <p className="mt-2 text-sm text-slate-700">Built for Fortune 500 workflow requirements</p>
            </div>
          </div>
        </Container>
      </section>

      {/* "It Just Works" Showcase */}
      <div className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              It Just Works
            </h2>
            <p className="text-xl text-gray-600">
              Professional date formatting in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">15+ Formats</h3>
              <div className="space-y-2 text-sm">
                <div className="font-mono text-blue-600">07/24/2025</div>
                <div className="font-mono text-blue-600">24/07/2025</div>
                <div className="font-mono text-blue-600">July 24, 2025</div>
                <div className="font-mono text-blue-600">2025-07-24</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">Smart Years</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-mono text-gray-500">25</span> → <span className="font-mono text-green-600">2025</span></div>
                <div><span className="font-mono text-gray-500">99</span> → <span className="font-mono text-green-600">1999</span></div>
                <div><span className="font-mono text-gray-500">01</span> → <span className="font-mono text-green-600">2001</span></div>
                <div><span className="font-mono text-gray-500">50</span> → <span className="font-mono text-green-600">1950</span></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">International</h3>
              <div className="space-y-2 text-sm">
                <div className="font-mono text-blue-600">2025年7月24日</div>
                <div className="font-mono text-blue-600">24 July 2025</div>
                <div className="font-mono text-blue-600">24.07.2025</div>
                <div className="font-mono text-blue-600">2025/07/24</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">Custom Formats</h3>
              <div className="space-y-2 text-sm">
                <div className="font-mono text-blue-600">Thu, Jul 24</div>
                <div className="font-mono text-blue-600">Q3 2025</div>
                <div className="font-mono text-blue-600">Week 30</div>
                <div className="font-mono text-blue-600">Day 205</div>
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
              Join thousands of HubSpot users who've eliminated date formatting confusion forever.
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

      {/* Pricing */}
      <section className="bg-slate-900 py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl md:text-center">
            <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
              Simple pricing, no surprises.
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Start formatting dates today. Everything you need is included in the free tier.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-white/10 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <div className="flex items-center">
                <h3 className="text-2xl font-bold tracking-tight text-white">Free Beta</h3>
                <div className="ml-4 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400 ring-1 ring-inset ring-green-500/20">
                  100% Free
                </div>
              </div>
              <p className="mt-6 text-base leading-7 text-slate-300">
                Get professional date formatting for all your HubSpot workflows. No limits during beta.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-blue-400">What's included</h4>
                <div className="h-px flex-auto bg-slate-600" />
              </div>
              <ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-slate-300 sm:grid-cols-2 sm:gap-6">
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                  </svg>
                  15+ date formats
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                  </svg>
                  Unlimited workflows
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                  </svg>
                  Zero permissions required
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                  </svg>
                  30-day billing notice
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                  </svg>
                  International formats
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143Z" clipRule="evenodd" />
                  </svg>
                  Open source code
                </li>
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-slate-50 py-10 text-center ring-1 ring-inset ring-slate-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-slate-600">Currently free during beta</p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-slate-900">3,000</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-slate-600">requests/month</span>
                  </p>
                  <Button href="/api/auth/hubspot/install" color="hubspot" className="mt-10 block w-full">
                    Install for free
                  </Button>
                  <p className="mt-6 text-xs leading-5 text-slate-600">
                    No credit card required. Install in 2 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50">
        <Container className="py-16">
          <div className="flex flex-col items-center justify-between gap-y-12 pt-6 sm:flex-row sm:gap-y-0 sm:py-16">
            <div>
              <div className="flex items-center text-slate-900">
                <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div className="ml-4">
                  <p className="text-base font-semibold">HubSpot Integration Up</p>
                  <p className="mt-1 text-sm text-slate-500">Professional date formatting</p>
                </div>
              </div>
            </div>
            <div className="flex gap-x-6 text-sm font-semibold leading-6 text-slate-700">
              <a href="/install" className="hover:text-slate-900">Install</a>
              <a href="https://github.com/hi-upchen/hubspot-integration-up" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">GitHub</a>
              <a href="mailto:hi.upchen@gmail.com" className="hover:text-slate-900">Support</a>
            </div>
          </div>
          <div className="flex flex-col items-center border-t border-slate-400/10 pt-8 sm:flex-row-reverse sm:justify-between">
            <div className="flex gap-x-6">
              <a href="https://github.com/hi-upchen/hubspot-integration-up" target="_blank" rel="noopener noreferrer" className="group" aria-label="HubSpot Integration Up on GitHub">
                <svg aria-hidden="true" className="h-6 w-6 fill-slate-500 group-hover:fill-slate-700">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                </svg>
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-500 sm:mt-0">
              Copyright &copy; 2025 HubSpot Integration Up. Built with security and privacy in mind.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  )
}