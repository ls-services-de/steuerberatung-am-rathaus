"use client"

import { useState, useEffect } from "react"
import { Phone, Mail, Calendar, Search, X, AlertTriangle } from "lucide-react"
import sanityClient from "@sanity/client"
import { createContactInquiryNotification } from "@/sanity/lib"

// Initialize Sanity client
const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-11-21",
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
})

export default function ContactForm() {
  const [showChat, setShowChat] = useState(false) // State to toggle the iframe

  const toggleChat = () => {
    setShowChat(!showChat)
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    file: null,
  })

  const [statusQuery, setStatusQuery] = useState({
    supportNumber: "",
    email: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [supportNumber, setSupportNumber] = useState("")
  const [statusResult, setStatusResult] = useState(null)
  const [statusError, setStatusError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState("")

  // Generate a unique support number on component mount
  useEffect(() => {
    const uniqueSupportNumber = `S_${Math.floor(1000000000 + Math.random() * 9000000000)}`
    setSupportNumber(uniqueSupportNumber)
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (name === "file") {
      setFormData({
        ...formData,
        file: files[0],
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleStatusChange = (e) => {
    const { name, value } = e.target
    setStatusQuery({
      ...statusQuery,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if required fields are filled
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.")
      setSuccess("")
      return
    }

    setIsLoading(true)

    try {
      // Handle file upload if present
      let fileUpload = null
      if (formData.file) {
        const fileAsset = await client.assets.upload("file", formData.file)
        fileUpload = fileAsset._id
      }

      // Prepare data for Sanity
      const submissionData = {
        _type: "contactForm",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        supportNumber: supportNumber,
        status: "Offen", // Ensure status is capitalized to match the schema
        timestamp: new Date().toISOString(),
      }

      // Add file reference if uploaded
      if (fileUpload) {
        submissionData.file = { _type: "file", asset: { _ref: fileUpload } }
      }

      // Submit to Sanity
      const createdInquiry = await client.create(submissionData)

      // Create notification for the new contact inquiry
      await createContactInquiryNotification(createdInquiry)

      // Show success message and support number
      setSuccess(`Ihre Nachricht wurde erfolgreich versendet. Ihre Support-Nummer: ${supportNumber}`)
      setError("")

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        file: null,
      })

      // Generate a new support number for the next submission
      const newSupportNumber = `S_${Math.floor(1000000000 + Math.random() * 9000000000)}`
      setSupportNumber(newSupportNumber)
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Es gab einen Fehler beim Senden des Formulars.")
      setSuccess("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusCheck = async (e) => {
    e.preventDefault()

    // Validate inputs
    if (!statusQuery.supportNumber || !statusQuery.email) {
      setStatusError("Bitte geben Sie sowohl die Support-Nummer als auch Ihre E-Mail-Adresse ein.")
      setStatusResult(null)
      return
    }

    setIsLoading(true)
    setStatusError("")
    setStatusResult(null)
    setDeleteSuccess("")

    try {
      // Query Sanity for the submission with matching support number and email
      const query = `*[_type == "contactForm" && supportNumber == $supportNumber && email == $email][0]{
        _id,
        firstName,
        lastName,
        email,
        subject,
        status,
        timestamp
      }`

      const params = {
        supportNumber: statusQuery.supportNumber,
        email: statusQuery.email,
      }

      const result = await client.fetch(query, params)

      if (result) {
        setStatusResult(result)
      } else {
        setStatusError("Keine Anfrage mit dieser Support-Nummer und E-Mail-Adresse gefunden.")
      }
    } catch (err) {
      console.error("Error checking status:", err)
      setStatusError("Es gab einen Fehler bei der Statusabfrage.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseResult = () => {
    setStatusResult(null)
    setDeleteSuccess("")
  }

  const handleDeleteRequest = async () => {
    if (!statusResult || !statusResult._id) return

    setIsDeleting(true)
    try {
      // Delete the document from Sanity
      await client.delete(statusResult._id)
      setDeleteSuccess("Ihre Anfrage wurde erfolgreich zurückgezogen.")
      setStatusResult(null)
      setShowConfirmDelete(false)

      // Clear the form after successful deletion
      setStatusQuery({
        supportNumber: "",
        email: "",
      })
    } catch (err) {
      console.error("Error deleting request:", err)
      setStatusError("Es gab einen Fehler beim Zurückziehen der Anfrage.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Translate status for display
  const translateStatus = (status) => {
    const statusMap = {
      offen: "Offen",
      in_bearbeitung: "In Bearbeitung",
      abgeschlossen: "Abgeschlossen",
      wartet_auf_antwort: "Wartet auf Antwort",
      Offen: "Offen",
      "In Bearbeitung": "In Bearbeitung",
      Abgeschlossen: "Abgeschlossen",
    }
    return statusMap[status] || status
  }

  return (
    <section className="py-16 px-6 lg:px-12 bg-[#747171] text-white">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Contact Form */}
        <div>
          <h3 className="text-[#E3DAC9] text-lg mb-2">Unsere Leistungen</h3>
          <h2 className="text-white text-3xl lg:text-4xl font-light leading-tight mb-8">
            Haben Sie Fragen? Wir helfen Ihnen gerne weiter.
          </h2>

          {/* Success or Error Message */}
          {error && <div className="mb-4 p-4 bg-red-500 text-white rounded-md">{error}</div>}
          {success && (
            <div className="mb-4 p-4 bg-green-500 text-white rounded-md">
              <p>{success}</p>
              <p className="mt-2 font-medium">
                Bitte speichern Sie diese Nummer, um den aktuellen Status Ihrer Anfrage zu erfragen.
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Vorname"
                className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Nachname"
                className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
                required
              />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Telefonnummer"
              className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
            />

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Betreff"
              className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Ihre Nachricht..."
              rows="5"
              className="w-full px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
              required
            ></textarea>

            {/* File Upload */}
            <div className="w-full px-4 py-4 rounded-md bg-[rgba(227,218,201,0.1)] text-white">
              <label className="block mb-3 font-medium text-lg">Datei hochladen (optional):</label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#E3DAC9] text-black rounded-md hover:bg-[#d1c3a8] transition disabled:opacity-70"
            >
              {isLoading ? "Wird gesendet..." : "Nachricht senden"}
            </button>
          </form>
        </div>

        {/* Right Side: Contact Information */}
        <div className="lg:ml-[100px] ml-0">
          <h3 className="text-xl font-bold mt-[60px] mb-4">Kontaktieren Sie uns</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-4">
              <Phone className="w-6 h-6 text-[#E3DAC9]" />
              <span>+49 020414066389</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail className="w-6 h-6 text-[#E3DAC9]" />
              <span>stb-am-rathaus@email.de</span>
            </li>
            <li className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-[#E3DAC9]" />
              <div>
                <p>Montag, 08:30–16:00</p>
                <p>Dienstag, 08:30–18:30</p>
                <p>Mittwoch, 09:00–15:00</p>
                <p>Donnerstag, 09:00–15:00</p>
                <p>Freitag, Geschlossen</p>
                <p>Samstag, Geschlossen</p>
                <p>Sonntag, Geschlossen</p>
              </div>
            </li>
          </ul>

          <div className="mt-8">
            <h4 className="text-lg font-bold mb-4">Probieren Sie unseren KI Assistenten</h4>
            <button
              onClick={toggleChat}
              className="px-6 py-2 bg-[#E3DAC9] text-black rounded-md hover:bg-[#d1c3a8] transition"
            >
              Frage stellen
            </button>
          </div>
        </div>
      </div>

      {showChat && (
        <div className="fixed inset-0 bg-[#747171] flex items-center justify-center z-50">
          <button
            onClick={toggleChat}
            className="absolute top-4 right-4 bg-[#E3DAC9] rounded-full p-2  transition"
            aria-label="Schließen"
          >
            <X className="w-5 h-5  text-black" />
          </button>
          <button
            onClick={toggleChat}
            className="absolute top-6 left-6 bg-[rgba(227,218,201,0.1)] border-2 border-[#E3DAC9] rounded-md p-2  transition hover:bg-[#E3DAC9] hover:text-black"
            aria-label="Schließen"
          >
            Zurück
          </button>
          <div className="relative bg-white rounded-lg shadow-lg w-[90%] h-[80%]">
            <iframe
              src="https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/04/08/12/20250408120830-64424DW9.json"
              title="KI Assistent"
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>
        </div>
      )}

      {/* Status Check Section */}
      <div className="container mx-auto mt-16 pt-12 border-t border-[#E3DAC9]">
        <h2 className="text-white text-2xl lg:text-3xl font-light leading-tight mb-6">
          Status Ihrer Anfrage überprüfen
        </h2>
        <p className="mb-6">
          Geben Sie Ihre Support-Nummer und die E-Mail-Adresse ein, mit der Sie die Anfrage gestellt haben.
        </p>

        {statusError && <div className="mb-4 p-4 bg-red-500 text-white rounded-md">{statusError}</div>}
        {deleteSuccess && <div className="mb-4 p-4 bg-green-500 text-white rounded-md">{deleteSuccess}</div>}

        <form onSubmit={handleStatusCheck} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            name="supportNumber"
            value={statusQuery.supportNumber}
            onChange={handleStatusChange}
            placeholder="Support-Nummer (z.B. S_1234567890)"
            className="px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
            required
          />
          <input
            type="email"
            name="email"
            value={statusQuery.email}
            onChange={handleStatusChange}
            placeholder="E-Mail-Adresse"
            className="px-4 py-2 rounded-md bg-[rgba(227,218,201,0.1)] text-white"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#E3DAC9] text-black rounded-md hover:bg-[#d1c3a8] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Search className="w-4 h-4" />
            {isLoading ? "Wird gesucht..." : "Status abfragen"}
          </button>
        </form>

        {statusResult && (
          <div className="p-6 bg-[rgba(227,218,201,0.1)] rounded-md relative">
            {/* Close button */}
            <button
              onClick={handleCloseResult}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[rgba(227,218,201,0.3)] transition"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-4">Anfrage gefunden</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[#E3DAC9] font-medium">Name:</p>
                <p>
                  {statusResult.firstName} {statusResult.lastName}
                </p>
              </div>
              <div>
                <p className="text-[#E3DAC9] font-medium">E-Mail:</p>
                <p>{statusResult.email}</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] font-medium">Betreff:</p>
                <p>{statusResult.subject}</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] font-medium">Eingereicht am:</p>
                <p>{formatDate(statusResult.timestamp)}</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] font-medium">Status:</p>
                <p className="font-bold">{translateStatus(statusResult.status)}</p>
              </div>
            </div>

            {/* Delete request button and confirmation */}
            <div className="mt-6 pt-4 border-t border-[rgba(227,218,201,0.3)]">
              {!showConfirmDelete ? (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Anfrage zurückziehen
                </button>
              ) : (
                <div className="bg-red-900/30 p-4 rounded-md">
                  <p className="mb-3 font-medium">
                    Sind Sie sicher, dass Sie diese Anfrage zurückziehen möchten? Diese Aktion kann nicht rückgängig
                    gemacht werden.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteRequest}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-70"
                    >
                      {isDeleting ? "Wird gelöscht..." : "Ja, zurückziehen"}
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
