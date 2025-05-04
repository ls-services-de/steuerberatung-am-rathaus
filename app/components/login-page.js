"use client"

import { HelpCircle } from "lucide-react"
import { useState } from "react"

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await onLogin(username, password)
      if (!result.success) {
        setError(result.error)
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-4 left-4">
        <a href="/">
          <button className="absolute bg-[rgba(227,218,201,0.1)] rounded-md hover:bg-[#E3DAC9] hover:text-black border-2 border-[#E3DAC9] p-4 text-white">
            Zurück
          </button>
        </a>
      </div>
      <div className="max-w-md w-full space-y-8 p-10 bg-[rgba(227,218,201,0.1)] rounded-xl shadow-md relative">
        {/* Fragezeichen-Symbol mit Link zur Anleitung */}
        <div className="absolute top-4 right-4">
          <a
            href="/kundenkonto-anleitung"
            className="flex items-center text-[#E3DAC9] hover:text-white transition-colors"
            title="Hilfe zur Anmeldung"
          >
            <HelpCircle className="w-6 h-6" />
          </a>
        </div>

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Login</h2>
          <div className="mt-2">
            <div className="h-1 w-20 bg-[#E3DAC9] mx-auto"></div>
          </div>
          <p className="mt-2 text-sm text-[#E4E4E4]">Melden Sie sich als Admin oder Kunde an</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Email / Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-[#E4E4E4] text-white bg-[rgba(227,218,201,0.05)] rounded-t-md focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9] focus:z-10 sm:text-sm"
                placeholder="Email / Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-[#E4E4E4] text-white bg-[rgba(227,218,201,0.05)] rounded-b-md focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9] focus:z-10 sm:text-sm"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#d6cbb8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
            >
              {isLoading ? "Anmelden..." : "Anmelden"}
            </button>
          </div>

          {/* Hilfetext unter dem Button */}
          <div className="text-center text-sm">
            <a href="/kundenkonto-anleitung" className="text-[#E3DAC9] hover:text-white">
              Benötigen Sie Hilfe bei der Anmeldung?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
