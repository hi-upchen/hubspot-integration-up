'use client'

import { useState } from 'react'
import { Container } from '@/components/Container'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    id: 'beta-period',
    question: 'What happens after the beta period ends?',
    answer: 'Current beta users will receive 30 days advance notice before any billing begins. Your beta pricing will be locked in permanently as our thank you for early adoption.'
  },
  {
    id: 'request-definition',
    question: 'What counts as a "request"?',
    answer: 'Each successful workflow action call counts as one request. Failed requests do not count towards your quota.'
  },
  {
    id: 'plan-changes',
    question: 'Can I change plans anytime?',
    answer: 'Sure, please contact us anytime.'
  },
  {
    id: 'data-security',
    question: 'Is my data secure?',
    answer: 'Absolutely. Your data stays completely private. This app operates with zero access to your contacts, deals, or any HubSpot records—it only processes the specific values you send through workflows. We\'re fully open source and follow enterprise security standards.'
  },
  {
    id: 'refunds',
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied within 30 days of your first payment, we\'ll provide a full refund, no questions asked.'
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards only.'
  }
]

export default function FAQAccordion() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <section className="py-20 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-slate-700">
            Everything you need to know about our pricing and beta period.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {faqData.map((item) => {
              const isOpen = openItems.has(item.id)
              
              return (
                <div key={item.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <h3 className="font-semibold text-slate-900 pr-4">
                      {item.question}
                    </h3>
                    <div 
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200 ease-in-out"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <svg 
                        className="w-4 h-4 text-slate-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d={isOpen ? "M18 12H6" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} 
                        />
                      </svg>
                    </div>
                  </button>
                  
                  <div
                    id={`faq-answer-${item.id}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-4">
                      <p className="text-slate-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}