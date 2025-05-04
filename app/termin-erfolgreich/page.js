"use client"

import { CheckCircle } from "lucide-react"

export default function TerminBestaetigung() {
  return (
    <div className="min-h-[100vh]">
      {/* Header */}
      <header className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Steuerberatung am Rathaus</h1>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:text-black bg-[rgba(227,218,201,0.1)] hover:bg-[#E3DAC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
          >
            Zurück zur Startseite
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]">
            <h2 className="text-2xl font-semibold text-black">Terminbestätigung</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-12 sm:p-12 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-24 w-24 text-[#E3DAC9] mb-6" />
              <h3 className="text-2xl font-medium text-white mb-4">Vielen Dank für Ihre Terminbuchung</h3>
              <p className="text-xl text-[#E4E4E4] mb-8">Sie haben eine E-Mail zur Bestätigung erhalten.</p>
              <p className="text-[#E4E4E4] max-w-2xl mb-8">
                Bitte überprüfen Sie Ihren E-Mail-Eingang und gegebenenfalls auch Ihren Spam-Ordner. Falls Sie innerhalb
                der nächsten 30 Minuten keine Bestätigungs-E-Mail erhalten haben, kontaktieren Sie uns bitte telefonisch
                unter +49 020414066389.
              </p>
              <div className="mt-6 space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#d1c3a8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                >
                  Zurück zur Startseite
                </a>
                <a
                  href="/#kontakt"
                  className="inline-flex items-center justify-center px-6 py-3 border border-[#E3DAC9] text-base font-medium rounded-md text-white hover:text-black hover:bg-[#E3DAC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                >
                  Kontakt
                </a>
              </div>
            </div>
          </div>
        </div>

        
      </main>

      {/* Footer */}
      <footer className="bg-[#747171] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2025 Steuerberatung am Rathaus und Liam Schneider. Alle Rechte vorbehalten.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/datenschutz" className="text-sm text-[#E3DAC9] hover:text-white">
                Datenschutz
              </a>
              <a href="/impressum" className="text-sm text-[#E3DAC9] hover:text-white">
                Impressum
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
