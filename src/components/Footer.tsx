import { Container } from '@/components/Container'

export function Footer() {
  return (
    <footer className="bg-slate-50">
      <Container className="py-16">
        {/* Brand Section */}
        <div className="mb-16">
          <div className="flex items-center text-slate-900">
            <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div className="ml-4">
              <p className="text-base font-semibold">HubSpot Integration Up</p>
              <p className="mt-1 text-sm text-slate-500">Professional workflow automation tools</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Product Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="/api/hubspot/date-formatter/install" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Date Formatter
                </a>
              </li>
              <li>
                <a href="/api/hubspot/url-shortener/install" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  URL Shortener
                </a>
              </li>
              <li>
                <a href="https://github.com/hi-upchen/hubspot-integration-up" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="/docs" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Setup Guides
                </a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="/privacy" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hi.upchen@gmail.com" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-y-6 pt-8 mt-12 border-t border-slate-400/10 sm:flex-row sm:gap-y-0">
          <p className="text-sm text-slate-500">
            Copyright &copy; 2025 HubSpot Integration Up. Built with security and privacy in mind.
          </p>
          <div className="flex gap-x-6">
            <a href="https://github.com/hi-upchen/hubspot-integration-up" target="_blank" rel="noopener noreferrer" className="group" aria-label="HubSpot Integration Up on GitHub">
              <svg aria-hidden="true" className="h-6 w-6 fill-slate-500 group-hover:fill-slate-700">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}