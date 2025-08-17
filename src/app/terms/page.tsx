import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'

export default function TermsOfService() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Header */}
      <Container className="pt-20 pb-16 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl mb-6">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            These terms govern your use of HubSpot Integration Up's workflow automation services. 
            Please read them carefully.
          </p>
          <div className="text-sm text-slate-500 mb-8">
            <p><strong>Effective Date:</strong> January 17, 2025</p>
            <p><strong>Last Updated:</strong> January 17, 2025</p>
          </div>
          
          {/* Service Highlights */}
          <div className="border-l-4 border-slate-400 pl-6 mb-8">
            <h2 className="font-semibold text-slate-900 mb-4">Service Summary</h2>
            <ul className="space-y-2 text-slate-700">
              <li>• Zero access to your contacts, deals, or CRM data</li>
              <li>• Currently free during beta period</li>
              <li>• Enterprise-grade security and reliability</li>
              <li>• 30-day advance notice for any pricing changes</li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Main Content */}
      <Container className="pb-16">
        <div className="mx-auto max-w-4xl prose prose-slate max-w-none">
          
          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-slate-700 mb-4">
              By accessing or using HubSpot Integration Up's services ("Services"), you ("User," "you," or "your") 
              agree to be bound by these Terms of Service ("Terms"). If you are using the Services on behalf of 
              an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>
            <p className="text-slate-700 mb-4">
              If you do not agree to these Terms, do not use our Services. These Terms form a legally binding 
              agreement between you and HubSpot Integration Up ("we," "us," or "our").
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">2. Service Description</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">2.1 Our Services</h3>
            <p className="text-slate-700 mb-4">
              HubSpot Integration Up provides workflow automation tools for HubSpot users, including:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li><strong>Date Formatter:</strong> Professional date formatting for customer communications</li>
              <li><strong>URL Shortener:</strong> Branded short links for marketing and communications</li>
              <li><strong>Additional Apps:</strong> Future workflow automation tools and integrations</li>
            </ul>
            
            <h3 className="font-semibold text-slate-900 mb-4">2.2 Privacy-First Design</h3>
            <p className="text-slate-700 mb-4">Our Services are designed with privacy-by-design principles:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Zero access to your HubSpot contacts, deals, or customer data</li>
              <li>Only processes workflow-provided values under your complete control</li>
              <li>Only collect minimal authentication and usage data</li>
              <li>Enterprise-grade security and encryption</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">2.3 Service Limitations</h3>
            <p className="text-slate-700 mb-4">
              Our Services integrate with third-party platforms (HubSpot, Bitly) and are subject to their 
              availability and terms. We do not control these third-party services.
            </p>
          </section>

          {/* Account Registration */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">3. Account Registration and Security</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">3.1 HubSpot Account Required</h3>
            <p className="text-slate-700 mb-4">
              To use our Services, you must have a valid HubSpot account with appropriate permissions to 
              install third-party applications and create workflows.
            </p>
            
            <h3 className="font-semibold text-slate-900 mb-4">3.2 Account Security</h3>
            <p className="text-slate-700 mb-4">You are responsible for:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Maintaining the confidentiality of your HubSpot account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breaches</li>
              <li>Ensuring your use complies with your organization's policies</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">3.3 API Keys and Third-Party Credentials</h3>
            <p className="text-slate-700 mb-4">
              For certain services (like URL Shortener), you may need to provide third-party API keys. 
              You are responsible for obtaining and maintaining these credentials in compliance with 
              third-party terms of service.
            </p>
          </section>

          {/* Acceptable Use */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">4. Acceptable Use Policy</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">4.1 Permitted Uses</h3>
            <p className="text-slate-700 mb-4">You may use our Services to:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Format dates for professional customer communications</li>
              <li>Create shortened URLs for marketing and business purposes</li>
              <li>Automate legitimate business workflows within HubSpot</li>
              <li>Integrate with your business systems and processes</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">4.2 Prohibited Uses</h3>
            <p className="text-slate-700 mb-4">You may NOT use our Services to:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on others' intellectual property rights</li>
              <li>Send spam, malware, or malicious content</li>
              <li>Attempt to circumvent security measures or access controls</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Use automated tools to abuse or overload our Services</li>
              <li>Create misleading or fraudulent shortened URLs</li>
              <li>Violate third-party terms of service (HubSpot, Bitly, etc.)</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">4.3 Usage Limits</h3>
            <p className="text-slate-700 mb-4">
              We reserve the right to implement reasonable usage limits to ensure fair access and 
              service quality for all users. Current limits and any future changes will be communicated 
              with advance notice.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">5. Intellectual Property Rights</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">5.1 Our Rights</h3>
            <p className="text-slate-700 mb-4">
              HubSpot Integration Up retains all rights, title, and interest in our Services, including:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Software code, algorithms, and technical implementations</li>
              <li>Service names, trademarks, and branding</li>
              <li>Documentation, guides, and support materials</li>
              <li>Aggregated usage data and analytics (anonymized)</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">5.2 License to You</h3>
            <p className="text-slate-700 mb-4">
              We grant you a limited, non-exclusive, non-transferable license to use our Services 
              during your subscription period, subject to these Terms and payment of applicable fees.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">5.3 Your Content</h3>
            <p className="text-slate-700 mb-4">
              You retain ownership of all data you submit to our Services. By using our Services, 
              you grant us a limited license to process your data solely to provide the Services. 
              We do not claim ownership of your business data or content.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">5.4 Feedback and Suggestions</h3>
            <p className="text-slate-700 mb-4">
              Any feedback, suggestions, or ideas you provide about our Services become our property 
              and may be used to improve our Services without compensation to you.
            </p>
          </section>

          {/* Privacy and Data */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">6. Privacy and Data Processing</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">6.1 Privacy Policy</h3>
            <p className="text-slate-700 mb-4">
              Our collection, use, and protection of your information is governed by our 
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>, 
              which is incorporated by reference into these Terms.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">6.2 Data Processing</h3>
            <p className="text-slate-700 mb-4">
              We process data submitted to our webhooks (dates, URLs) for the purpose of providing our services. 
              We maintain usage logs for service improvement and analytics purposes.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">6.3 Data Security</h3>
            <p className="text-slate-700 mb-4">
              We implement industry-standard security measures including encryption, access controls, 
              and monitoring. However, no system is completely secure, and you use our Services at your own risk.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">6.4 Compliance</h3>
            <p className="text-slate-700 mb-4">
              You are responsible for ensuring your use of our Services complies with applicable data 
              protection laws (GDPR, CCPA, etc.) in your jurisdiction.
            </p>
          </section>

          {/* Payment Terms */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">7. Payment Terms</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">7.1 Beta Period</h3>
            <p className="text-slate-700 mb-4">
              Our Services are currently offered free of charge during the beta period. We will provide 
              30 days advance notice before implementing any pricing or billing.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">7.2 Future Pricing</h3>
            <p className="text-slate-700 mb-4">When pricing is implemented, it will be usage-based:</p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li><strong>Free Tier:</strong> 3,000 requests per month</li>
              <li><strong>Starter:</strong> $19/month for 30,000 requests</li>
              <li><strong>Professional:</strong> $99/month for 300,000 requests</li>
              <li><strong>Enterprise:</strong> $499/month for 3,000,000 requests</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">7.3 Billing and Payment</h3>
            <p className="text-slate-700 mb-4">
              When billing begins, payments will be processed monthly in advance. We will provide 
              clear usage dashboards and billing transparency. Non-payment may result in service suspension.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">7.4 Refunds</h3>
            <p className="text-slate-700 mb-4">
              Refunds will be considered on a case-by-case basis for unused services. 
              We do not provide refunds for usage-based billing once services have been consumed.
            </p>
          </section>

          {/* Service Availability */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">8. Service Availability and Support</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">8.1 Service Level</h3>
            <p className="text-slate-700 mb-4">
              We strive to maintain 99.9% uptime for our Services, but we do not guarantee uninterrupted 
              access. Scheduled maintenance will be announced in advance when possible.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">8.2 Support</h3>
            <p className="text-slate-700 mb-4">
              We provide email support and documentation. Response times vary based on the nature 
              of your inquiry and current service level.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">8.3 Service Modifications</h3>
            <p className="text-slate-700 mb-4">
              We may modify, update, or discontinue features with reasonable notice. 
              Material changes that affect functionality will be communicated 30 days in advance.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">9. Limitation of Liability</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">9.1 Disclaimer of Warranties</h3>
            <p className="text-slate-700 mb-4">
              OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
              WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
              AND NON-INFRINGEMENT.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">9.2 Limitation of Damages</h3>
            <p className="text-slate-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED 
              THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM. DURING THE FREE BETA 
              PERIOD, OUR LIABILITY IS LIMITED TO $100.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">9.3 Excluded Damages</h3>
            <p className="text-slate-700 mb-4">
              WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
              INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">9.4 Third-Party Services</h3>
            <p className="text-slate-700 mb-4">
              We are not responsible for third-party services (HubSpot, Bitly) or their availability, 
              performance, or compliance with their terms of service.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">10. Indemnification</h2>
            <p className="text-slate-700 mb-4">
              You agree to indemnify and hold us harmless from any claims, damages, or expenses 
              (including reasonable attorney fees) arising from:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Your use or misuse of our Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any applicable laws or regulations</li>
              <li>Your violation of third-party rights</li>
              <li>Content you submit or process through our Services</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">11. Termination</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">11.1 Termination by You</h3>
            <p className="text-slate-700 mb-4">
              You may terminate your use of our Services at any time by uninstalling our applications 
              from your HubSpot account and ceasing to use our Services.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">11.2 Termination by Us</h3>
            <p className="text-slate-700 mb-4">
              We may suspend or terminate your access to our Services immediately if you:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-1">
              <li>Violate these Terms or our Acceptable Use Policy</li>
              <li>Fail to pay applicable fees (when billing begins)</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Pose a security risk to our Services or other users</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mb-4">11.3 Effect of Termination</h3>
            <p className="text-slate-700 mb-4">
              Upon termination, your right to use our Services ends immediately. We will delete 
              your account data according to our data retention policies outlined in our Privacy Policy.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">12. Dispute Resolution</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">12.1 Informal Resolution</h3>
            <p className="text-slate-700 mb-4">
              Before filing any formal dispute, please contact us at 
              <a href="mailto:legal@hubspotintegrationup.com" className="text-blue-600 hover:underline">legal@hubspotintegrationup.com</a> 
              to attempt informal resolution. We will respond within 30 days.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">12.2 Binding Arbitration</h3>
            <p className="text-slate-700 mb-4">
              Any disputes not resolved informally will be settled through binding arbitration under 
              the Commercial Arbitration Rules of the American Arbitration Association in the 
              United States.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">12.3 Governing Law</h3>
            <p className="text-slate-700 mb-4">
              These Terms are governed by the laws of the United States and the state of [Your State], 
              without regard to conflict of law principles.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">12.4 Class Action Waiver</h3>
            <p className="text-slate-700 mb-4">
              You agree to resolve disputes individually and waive your right to participate in 
              class actions or collective proceedings.
            </p>
          </section>

          {/* General Provisions */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">13. General Provisions</h2>
            
            <h3 className="font-semibold text-slate-900 mb-4">13.1 Entire Agreement</h3>
            <p className="text-slate-700 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between 
              you and us regarding our Services.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">13.2 Modifications</h3>
            <p className="text-slate-700 mb-4">
              We may update these Terms from time to time. Material changes will be communicated 
              30 days in advance via email or dashboard notification. Continued use constitutes 
              acceptance of updated Terms.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">13.3 Severability</h3>
            <p className="text-slate-700 mb-4">
              If any provision of these Terms is found invalid or unenforceable, the remaining 
              provisions will continue in full force and effect.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">13.4 Assignment</h3>
            <p className="text-slate-700 mb-4">
              You may not assign or transfer your rights under these Terms without our written consent. 
              We may assign these Terms without restriction.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">13.5 Force Majeure</h3>
            <p className="text-slate-700 mb-4">
              We are not liable for delays or failures due to circumstances beyond our reasonable control, 
              including natural disasters, government actions, or third-party service failures.
            </p>

            <h3 className="font-semibold text-slate-900 mb-4">13.6 Waiver</h3>
            <p className="text-slate-700 mb-4">
              Our failure to enforce any provision does not waive our right to enforce it later. 
              Waivers must be in writing to be effective.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">Contact Information</h2>
            <p className="text-slate-700 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Legal & Contract Inquiries</h4>
                  <p className="text-sm text-slate-700 mb-1">
                    Email: <a href="mailto:hi.upchen@gmail.com" className="text-blue-600 hover:underline">hi.upchen@gmail.com</a>
                  </p>
                  <p className="text-sm text-slate-700">Terms, disputes, and legal matters</p>
                  <p className="text-sm text-slate-600 mt-1">Response time: 5 business days</p>
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
              These Terms of Service are effective as of January 17, 2025. 
              For the most current version, please visit this page. By using our Services, 
              you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}