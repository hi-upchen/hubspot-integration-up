import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'

export default function PrivacyPolicy() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Header */}
      <Container className="pt-20 pb-16 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Your privacy is our priority. This policy explains how HubSpot Integration Up collects, 
            uses, and protects your information.
          </p>
          <div className="text-sm text-slate-500 mb-8">
            <p><strong>Effective Date:</strong> January 17, 2025</p>
            <p><strong>Last Updated:</strong> January 17, 2025</p>
          </div>
          
          {/* Privacy Highlights */}
          <div className="border-l-4 border-slate-400 pl-6 mb-8">
            <h2 className="font-semibold text-slate-900 mb-4">Privacy Protection Summary</h2>
            <ul className="space-y-2 text-slate-700">
              <li>• Zero access to your HubSpot data</li>
              <li>• No contact or deal data stored</li>
              <li>• Only receive pure strings from workflow actions</li>
              <li>• GDPR & CCPA compliant</li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Main Content */}
      <Container className="pb-16">
        <div className="mx-auto max-w-4xl prose prose-slate max-w-none">
          
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">1. Introduction</h2>
            <p className="text-slate-700 mb-4">
              HubSpot Integration Up ("we," "our," or "us") provides workflow automation tools for HubSpot users. 
              We are committed to protecting your privacy and have designed our services with privacy-by-design principles.
            </p>
            <p className="text-slate-700 mb-4">
              This Privacy Policy describes how we collect, use, disclose, and protect information when you use our 
              Date Formatter, URL Shortener, and other workflow automation services (collectively, the "Services").
            </p>
            <div className="border-l-4 border-slate-300 pl-4 my-4">
              <p className="text-slate-700 text-sm italic">
                <strong>Key Principle:</strong> Our Services are designed to process your data instantly without storing 
                it. We never access your HubSpot contacts, deals, or other customer data.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">2. Information We Collect</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">2.1 Account Information</h3>
            <p className="text-slate-700 mb-4">When you install our apps, we collect:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li><strong>HubSpot Portal ID:</strong> To identify your account and provide services</li>
              <li><strong>OAuth Tokens:</strong> To authenticate API requests (encrypted and stored securely)</li>
              <li><strong>Portal Information:</strong> Basic account details like portal name and domain</li>
              <li><strong>Installation Date:</strong> When you first installed our services</li>
            </ul>
            
            <h3 className="font-semibold text-slate-900 mb-4">2.2 Usage Information</h3>
            <p className="text-slate-700 mb-4">To improve our services, we collect minimal usage data:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li><strong>Request Counts:</strong> Number of times you use each service (aggregated monthly)</li>
              <li><strong>Response Times:</strong> Performance metrics to ensure service quality</li>
              <li><strong>Error Logs:</strong> Technical errors to improve reliability (no personal data)</li>
              <li><strong>Feature Usage:</strong> Which date formats or URL shortening options you use</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">2.3 API Keys (URL Shortener)</h3>
            <p className="text-slate-700 mb-4">For URL Shortener users:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li><strong>Bitly API Keys:</strong> Encrypted using AES-256-GCM and stored securely</li>
              <li><strong>Custom Domain Settings:</strong> If you configure branded short domains</li>
            </ul>

            <div className="border-l-4 border-slate-300 pl-4 my-6">
              <h4 className="font-semibold text-slate-900 mb-2">What We DON'T Collect</h4>
              <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
                <li>Your HubSpot contacts, companies, or deals</li>
                <li>Email content or communication data</li>
                <li>Personal information from your HubSpot database</li>
                <li>Workflow configurations or business logic</li>
                <li>Any data processed through our webhooks (deleted immediately)</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">3. How We Use Information</h2>
            <p className="text-slate-700 mb-4">We use the information we collect solely to:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
              <li><strong>Provide Services:</strong> Process date formatting and URL shortening requests</li>
              <li><strong>Authentication:</strong> Verify your identity and authorize API requests</li>
              <li><strong>Service Improvement:</strong> Analyze usage patterns to enhance performance and reliability</li>
              <li><strong>Technical Support:</strong> Diagnose and resolve technical issues</li>
              <li><strong>Security:</strong> Detect and prevent fraud, abuse, or security threats</li>
              <li><strong>Legal Compliance:</strong> Meet legal obligations and protect our rights</li>
            </ul>
            
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">4. Information Sharing and Disclosure</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">4.1 Third-Party Service Providers</h3>
            <p className="text-slate-700 mb-4">We may share information with trusted service providers who assist us:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li><strong>Vercel:</strong> Hosting and serverless computing</li>
              <li><strong>Supabase:</strong> Database services for account and usage data</li>
              <li><strong>Bitly:</strong> URL shortening services (when you use URL Shortener)</li>
            </ul>
            
            <h3 className="font-semibold text-slate-900 mb-4">4.2 Legal Requirements</h3>
            <p className="text-slate-700 mb-4">We may disclose information when required by law or to:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Comply with legal process or government requests</li>
              <li>Protect our rights, property, or safety</li>
              <li>Prevent fraud or security threats</li>
              <li>Enforce our Terms of Service</li>
            </ul>

            <div className="border-l-4 border-slate-300 pl-4 my-4">
              <p className="text-slate-700 text-sm italic">
                <strong>No Data Sales:</strong> We never sell, rent, or trade your personal information to third parties 
                for marketing or advertising purposes.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">5. Data Security</h2>
            <p className="text-slate-700 mb-4">We implement comprehensive security measures to protect your information:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Encryption</h4>
                <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
                  <li>TLS 1.2+ for data in transit</li>
                  <li>AES-256-GCM for API keys at rest</li>
                  <li>End-to-end encrypted communications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Access Controls</h4>
                <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
                  <li>Multi-factor authentication required</li>
                  <li>Role-based access permissions</li>
                  <li>Regular access reviews and audits</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Infrastructure</h4>
                <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
                  <li>Enterprise-grade hosting providers</li>
                  <li>Regular security monitoring</li>
                  <li>Automated vulnerability scanning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Data Handling</h4>
                <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
                  <li>Immediate deletion of processed data</li>
                  <li>Secure data disposal procedures</li>
                  <li>No persistent data caching</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">6. Your Privacy Rights</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">6.1 GDPR Rights (EU Residents)</h3>
            <p className="text-slate-700 mb-4">If you're in the European Union, you have the right to:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Restrict:</strong> Limit how we process your data</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">6.2 CCPA Rights (California Residents)</h3>
            <p className="text-slate-700 mb-4">If you're a California resident, you have the right to:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li><strong>Know:</strong> What personal information we collect and how it's used</li>
              <li><strong>Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-Out:</strong> Opt out of the sale of personal information (we don't sell data)</li>
              <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">6.3 Exercising Your Rights</h3>
            <p className="text-slate-700 mb-4">
              To exercise any of these rights, contact us at <a href="mailto:privacy@hubspotintegrationup.com" className="text-blue-600 hover:underline">privacy@hubspotintegrationup.com</a>. 
              We'll respond within 30 days and may need to verify your identity.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">7. Data Retention</h2>
            <p className="text-slate-700 mb-4">We retain different types of data for different periods:</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Account Data</h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>OAuth tokens: Until app uninstalled</li>
                    <li>Portal info: Until account deletion</li>
                    <li>API keys: Until removed by user</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Usage Data</h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>Raw usage logs: 90 days</li>
                    <li>Aggregated statistics: 3 years</li>
                    <li>Error logs: 30 days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Processed Data</h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>Dates/URLs: 90 days (usage logs)</li>
                    <li>Webhook requests: 90 days (usage logs)</li>
                    <li>Response data: Not cached</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Legal Requirements</h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>Audit logs: 7 years</li>
                    <li>Security incidents: 2 years</li>
                    <li>Legal hold: Until resolved</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">8. Children's Privacy</h2>
            <p className="text-slate-700 mb-4">
              Our Services are not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you become aware that a child has provided us 
              with personal information, please contact us immediately.
            </p>
          </section>

          {/* International Transfers */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">9. International Data Transfers</h2>
            <p className="text-slate-700 mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Standard Contractual Clauses for EU data transfers</li>
              <li>Adequacy decisions where available</li>
              <li>Data processing agreements with all service providers</li>
              <li>Regular compliance audits and assessments</li>
            </ul>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">10. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 mb-4">
              We may update this Privacy Policy from time to time. When we make changes:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>We'll update the "Last Updated" date at the top of this policy</li>
              <li>For material changes, we'll notify you via email or dashboard notification</li>
              <li>Changes take effect 30 days after notification</li>
              <li>Continued use of our Services constitutes acceptance of changes</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">11. Contact Us</h2>
            <p className="text-slate-700 mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Privacy & Data Protection</h4>
                  <p className="text-sm text-slate-700 mb-1">
                    Email: <a href="mailto:hi.upchen@gmail.com" className="text-blue-600 hover:underline">hi.upchen@gmail.com</a>
                  </p>
                  <p className="text-sm text-slate-700">For all privacy and GDPR inquiries</p>
                  <p className="text-sm text-slate-600 mt-1">Response time: 48 hours</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">General Support</h4>
                  <p className="text-sm text-slate-700 mb-1">
                    Email: <a href="mailto:hi.upchen@gmail.com" className="text-blue-600 hover:underline">hi.upchen@gmail.com</a>
                  </p>
                  <p className="text-sm text-slate-700">Technical support and questions</p>
                  <p className="text-sm text-slate-600 mt-1">Response time: 24 hours</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-8 mt-12">
            <p className="text-sm text-slate-500">
              This Privacy Policy is effective as of January 17, 2025. 
              For the most current version, please visit this page.
            </p>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}