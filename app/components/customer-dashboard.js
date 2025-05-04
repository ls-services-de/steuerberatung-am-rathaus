"use client"

import { useState, useEffect } from "react"
import { getAssignedForms, getCompletedForms, submitCompletedForm, removeFormAfterCompletion } from "@/sanity/lib"

export default function CustomerDashboard({ user, onLogout }) {
  const [assignedForms, setAssignedForms] = useState([])
  const [completedForms, setCompletedForms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentForm, setCurrentForm] = useState(null)
  const [formAnswers, setFormAnswers] = useState({
    frageeins: "",
    fragezwei: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch assigned forms
        const assigned = await getAssignedForms(user._id)
        setAssignedForms(assigned.assignedForms || [])

        // Fetch completed forms
        const completed = await getCompletedForms(user._id)
        setCompletedForms(completed.ausgefuellteformulare || [])
      } catch (error) {
        console.error("Error fetching forms:", error)
        setError("Fehler beim Laden der Formulare")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user._id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormAnswers({
      ...formAnswers,
      [name]: value,
    })
  }

  const handleStartForm = (form) => {
    setCurrentForm(form)
    setFormAnswers({
      frageeins: "",
      fragezwei: "",
    })
  }

  const handleCancelForm = () => {
    setCurrentForm(null)
    setFormAnswers({
      frageeins: "",
      fragezwei: "",
    })
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      // Submit completed form to Sanity
      await submitCompletedForm(user._id, currentForm, formAnswers)

      // Remove the form from assigned forms
      await removeFormAfterCompletion(user._id, currentForm._id)

      // Update local state - remove from assigned forms
      setAssignedForms(assignedForms.filter((form) => form._id !== currentForm._id))

      // Refresh completed forms
      const completed = await getCompletedForms(user._id)
      setCompletedForms(completed.ausgefuellteformulare || [])

      setSuccess("Formular erfolgreich ausgefüllt")
      setCurrentForm(null)
      setFormAnswers({
        frageeins: "",
        fragezwei: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Fehler beim Absenden des Formulars")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#E3DAC9] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Kundenportal</h1>
          <button
            onClick={onLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Card */}
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-white">Willkommen</h2>
            <p className="mt-1 max-w-2xl text-xl text-[#E3DAC9] ">
              Hallo, {user.firstName} {user.lastName}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <p className="text-white">
              Ihre Kundennummer: <span className="font-medium text-[#E3DAC9]">{user.kundennummer}</span>
            </p>
            <p className="text-white mt-2">
              Ihre E-Mail-Adresse: <span className="font-medium text-[#E3DAC9]">{user.email}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-900 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div>
                <p className="text-sm text-white">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-900 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div>
                <p className="text-sm text-white">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Form */}
        {currentForm && (
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
              <h2 className="text-lg leading-6 font-medium text-white">Formular ausfüllen</h2>
            </div>
            <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmitForm}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="frageeins" className="block text-sm font-medium text-white">
                      {currentForm.frageeins}
                    </label>
                    <input
                      type="text"
                      name="frageeins"
                      id="frageeins"
                      value={formAnswers.frageeins}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                    />
                  </div>
                  <div>
                    <label htmlFor="fragezwei" className="block text-sm font-medium text-white">
                      {currentForm.fragezwei}
                    </label>
                    <input
                      type="text"
                      name="fragezwei"
                      id="fragezwei"
                      value={formAnswers.fragezwei}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9] disabled:opacity-50"
                  >
                    {isSubmitting ? "Wird gesendet..." : "Absenden"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="inline-flex justify-center py-2 px-4 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assigned Forms */}
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
            <h2 className="text-lg leading-6 font-medium text-white">Zugewiesene Formulare</h2>
            <p className="mt-1 max-w-2xl text-sm text-white">Bitte füllen Sie diese Formulare aus</p>
          </div>
          <div className="border-t border-gray-700">
            {isLoading ? (
              <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
            ) : assignedForms.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Formulare zugewiesen</div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {assignedForms.map((form) => (
                  <li key={form._id} className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-white">Formular</h3>
                        <p className="mt-1 max-w-2xl text-sm text-white">Frage 1: {form.frageeins}</p>
                        <p className="mt-1 max-w-2xl text-sm text-white">Frage 2: {form.fragezwei}</p>
                      </div>
                      <button
                        onClick={() => handleStartForm(form)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                      >
                        Ausfüllen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Completed Forms */}
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
            <h2 className="text-lg leading-6 font-medium text-white">Ausgefüllte Formulare</h2>
            <p className="mt-1 max-w-2xl text-sm text-white">Ihre bereits ausgefüllten Formulare</p>
          </div>
          <div className="border-t border-gray-700">
            {isLoading ? (
              <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
            ) : completedForms.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center text-white">Keine ausgefüllten Formulare</div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {completedForms.map((completed, index) => (
                  <li key={index} className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-white">Ausgefülltes Formular</h3>
                        <p className="mt-1 max-w-2xl text-sm text-white">Formular {index + 1}</p>
                      </div>
                      <a
                        href={`https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${completed.asset._ref.replace("file-", "").replace("-pdf", ".pdf")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                      >
                        PDF öffnen
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
