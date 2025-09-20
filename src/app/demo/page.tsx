import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export const metadata = {
  title: 'HubSpot Date Formatter Demo - See the Solution in Action',
  description: 'Watch our 2-minute demo showing how to eliminate global date confusion in HubSpot workflows',
}

export default function DemoPage() {
  return (
    <div className="overflow-hidden bg-white">
      <Header currentPage="demo" />

      {/* Hero Section */}
      <Container className="pt-20 pb-16 text-center lg:pt-24">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl">
          Stop Losing Deals due to Date Confusion
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
          HubSpot Date Formatting Demo<br />
          Watch how we eliminate HubSpot&apos;s global date formatting problem in 2 minutes
        </p>

        {/* Step 1: Problem Statement Box */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-white p-8 shadow-xl shadow-slate-900/10">
          <h3 className="font-display text-xl text-red-600 mb-6">❌ <strong>The Problem: The Meeting Mix-Up</strong></h3>

          <div className="space-y-4 text-slate-700">
            <p>Your HubSpot sends: <span className="font-mono bg-slate-100 px-2 py-1 rounded">&quot;Meeting on 03/05/2025&quot;</span></p>

            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="space-y-2">
                <p>🇺🇸 <strong>US client thinks</strong>: March 5th → Shows up</p>
                <p>🇬🇧 <strong>UK client thinks</strong>: May 3rd → Misses meeting</p>
              </div>
            </div>

            <p>🌍 <strong>Result</strong>: Lost deal, damaged relationship, frustrated teams</p>

            <p className="text-slate-600 text-sm italic text-center mt-6">
              *This happens to 67% of companies with international clients*
            </p>
          </div>
        </div>

        {/* Step 2: Solution Teaser - Simplified */}
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
          <h3 className="font-display text-xl text-green-600 mb-4">✅ <strong>Our Solution: One Simple Fix Changes Everything</strong></h3>
          <div className="space-y-4 text-center">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <div className="space-y-2">
                <div className="font-mono text-lg text-slate-700">Transform: 03/05/2025 ❌</div>
                <div className="font-mono text-lg text-green-800">Into: &quot;5th March, 2025&quot; ✅</div>
              </div>
            </div>
            <div className="space-y-2 text-slate-700">
              <p>Your clients see their regional format automatically.</p>
              <p><strong>Zero confusion. Zero missed meetings. Happy customers.</strong></p>
            </div>
          </div>
        </div>

      </Container>

      {/* Video Section with Beta Banner Style */}
      <section className="py-12 bg-gradient-to-r from-green-500 to-blue-600 relative">
        <Container>
          {/* See the Complete Solution Header */}
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-6">
              <strong>See The Complete Solution (2-Minute Demo):</strong>
            </h2>
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🎯</span>
                <span className="text-white">Real HubSpot workflow showing the exact date confusion</span>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚡</span>
                <span className="text-white">Our 2-minute installation process (seriously, it&apos;s that fast)</span>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✨</span>
                <span className="text-white">Before/After transformation: messy → crystal clear</span>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">🌍</span>
                <span className="text-white">Global format examples: US, UK, EU, APAC</span>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">🛡️</span>
                <span className="text-white">100% secure (no HubSpot permissions needed)</span>
              </div>
            </div>
            <svg className="mx-auto mt-6 h-12 w-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Video */}
            <div className="relative mx-auto max-w-3xl">
              <video
                controls
                className="rounded-lg shadow-2xl w-full"
                style={{ aspectRatio: '3324 / 2494' }}
                preload="metadata"
              >
                <source src="/videos/date-formatter-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

          </div>
        </Container>
      </section>

      {/* Beta User Testimonial */}
      <section className="bg-white px-6 py-24 sm:py-32 lg:px-8">
        <figure className="mx-auto max-w-2xl">
          <p className="sr-only">5 out of 5 stars</p>
          <div className="flex gap-x-1 text-indigo-600">
            <svg aria-hidden="true" className="h-5 w-5 flex-none fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <svg aria-hidden="true" className="h-5 w-5 flex-none fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <svg aria-hidden="true" className="h-5 w-5 flex-none fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <svg aria-hidden="true" className="h-5 w-5 flex-none fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <svg aria-hidden="true" className="h-5 w-5 flex-none fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </div>
          <blockquote className="mt-10 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            <p>
              "This is super useful and we&apos;re really grateful for what you&apos;ve done."
            </p>
          </blockquote>
          <figcaption className="mt-10 flex items-center gap-x-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              KM
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">K.M.</div>
              <div className="mt-0.5 text-gray-600">Data Executive at Healthcare Academy</div>
            </div>
          </figcaption>
        </figure>
      </section>


      {/* Benefits Section */}
      <section className="py-20">
        <Container>
          <h2 className="font-display text-3xl tracking-tight text-slate-900 text-center mb-12">
            <strong>Why This Solves Your International Client Problem</strong>
          </h2>

          <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900"><strong>Faster Than Coffee</strong></h3>
              <p className="mt-2 text-sm text-slate-700">Complete setup in under 2 minutes - workflow integration, done</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900"><strong>Bulletproof Security</strong></h3>
              <p className="mt-2 text-sm text-slate-700">Zero access to your HubSpot data. Open source code</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900"><strong>Actually Global</strong></h3>
              <p className="mt-2 text-sm text-slate-700">Support regional formats and even custom formats - works for Asia-Pacific, Latin America</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-slate-900"><strong>Instant ROI</strong></h3>
              <p className="mt-2 text-sm text-slate-700">Stop losing deals to simple date mix-ups. Your clients thank you, refer more business</p>
            </div>
          </div>
        </Container>
      </section>


      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-black/10"></div>
        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight text-white">
              Ready to Never Lose Another Deal to Date Confusion?
            </h2>

            {/* Get Implementation Support - White card */}
            <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
              <h3 className="font-display text-xl font-semibold text-slate-900 mb-6">
                Get Implementation Support:
              </h3>
              <ul className="space-y-4 text-left">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 font-bold">✅</span>
                  <span className="text-slate-700">Personal 15-minute demo/setup session (I&apos;ll screen-share and configure it with you)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 font-bold">✅</span>
                  <span className="text-slate-700">Direct access to the developer (no support tickets, just email me)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 font-bold">✅</span>
                  <span className="text-slate-700">Works immediately - your next client email will have perfect dates</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 max-w-lg mx-auto">
              <Button
                href="https://calendly.com/hi-upchen/hubspot-date-formatter-demo"
                color="hubspot"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 text-lg font-bold w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Book 15-Min Demo Session
              </Button>
              <Button
                href="/api/hubspot/date-formatter/install"
                variant="outline"
                color="white"
                className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-indigo-600 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Install HubSpot Integration
              </Button>
            </div>

            {/* Contact Email */}
            <div className="mt-8 text-center">
              <p className="text-white text-sm">
                Questions? Email: <a href="mailto:hi.upchen@gmail.com" className="underline hover:no-underline">hi.upchen@gmail.com</a>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  )
}