'use client'

import { Container } from '@/components/Container'
import { useState } from 'react'

interface HeaderProps {
  currentPage?: string
}

export function Header({ currentPage }: HeaderProps) {
  const [isSetupMenuOpen, setIsSetupMenuOpen] = useState(false)

  return (
    <nav className="border-b border-slate-200">
      <Container className="py-6">
        <div className="flex justify-between items-center">
          <div className="font-display text-xl font-semibold text-slate-900 flex items-center">
            <a href="/" className="hover:text-slate-700">Integration Up</a>
          </div>
          <div className="flex gap-6 text-sm items-center">
            <a
              href="/"
              className={`${currentPage === 'home' ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Home
            </a>

            {/* Only show Demo link on demo page */}
            {currentPage === 'demo' && (
              <a
                href="/demo"
                className="text-slate-900 font-semibold"
              >
                Demo
              </a>
            )}

            {/* Setup Guide with Submenu */}
            <div className="relative">
              <button
                onClick={() => setIsSetupMenuOpen(!isSetupMenuOpen)}
                className={`flex items-center ${currentPage?.startsWith('setup') ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Setup Guide
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isSetupMenuOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-50">
                  <div className="py-1">
                    <a
                      href="/docs/date-formatter/setup-guide"
                      className={`block px-4 py-2 text-sm hover:bg-slate-50 ${currentPage === 'setup-date-formatter' ? 'text-slate-900 font-semibold bg-slate-50' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Date Formatter
                    </a>
                    <a
                      href="/docs/url-shortener/setup-guide"
                      className={`block px-4 py-2 text-sm hover:bg-slate-50 ${currentPage === 'setup-url-shortener' ? 'text-slate-900 font-semibold bg-slate-50' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      URL Shortener
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="mailto:hi.upchen@gmail.com"
              className="text-slate-600 hover:text-slate-900"
            >
              Contact
            </a>
          </div>
        </div>
      </Container>
    </nav>
  )
}