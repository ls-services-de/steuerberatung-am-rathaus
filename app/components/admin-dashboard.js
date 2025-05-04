"use client"

import { useState, useEffect } from "react"
import {
  client,
  generatePassword,
  generateCustomerNumber,
  getForms,
  assignFormToCustomer,
  unassignFormFromCustomer,
  getContactInquiries,
  updateContactInquiryStatus,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/sanity/lib"

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("customers")
  const [customers, setCustomers] = useState([])
  const [forms, setForms] = useState([])
  const [contactInquiries, setContactInquiries] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form assignment state
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedCustomerForms, setSelectedCustomerForms] = useState([])
  const [completedForms, setCompletedForms] = useState([])

  // Contact inquiry detail state
  const [selectedInquiry, setSelectedInquiry] = useState(null)

  // Füge diese Zustandsvariablen nach den anderen useState-Deklarationen hinzu
  const [lastNotificationFetch, setLastNotificationFetch] = useState(0)
  const [lastMarkAsRead, setLastMarkAsRead] = useState(0)

  // Fetch data from Sanity
  // Ersetze den useEffect-Hook, der die Daten abruft, mit dieser aktualisierten Version
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch customers
        const query = `*[_type == "userForm"] | order(lastName asc){
          _id,
          firstName,
          lastName,
          email,
          kundennummer,
          "assignedForms": assignedForms[]->{
            _id,
            frageeins,
            fragezwei
          },
          ausgefuellteformulare
        }`
        const customersResult = await client.fetch(query)
        setCustomers(customersResult)

        // Fetch forms
        const formsResult = await getForms()
        setForms(formsResult)

        // Fetch contact inquiries
        const contactResult = await getContactInquiries()
        setContactInquiries(contactResult)

        // Fetch notifications
        const notificationsResult = await getNotifications()

        // Füge ein Delay von 2 Minuten für neue Benachrichtigungen hinzu
        // Filtere Benachrichtigungen, die älter als 2 Minuten sind
        const twoMinutesAgo = new Date()
        twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2)

        const filteredNotifications = notificationsResult.filter((notification) => {
          const notificationDate = new Date(notification.createdAt)
          return notificationDate < twoMinutesAgo
        })

        setNotifications(filteredNotifications)
        setLastNotificationFetch(Date.now())
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Fehler beim Laden der Daten")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up polling for new notifications
    const intervalId = setInterval(async () => {
      const now = Date.now()
      // Prüfe, ob seit dem letzten "Als gelesen markieren" mindestens 2 Minuten vergangen sind
      const twoMinutesPassed = now - lastMarkAsRead > 120000

      // Nur alle 2 Minuten aktualisieren oder wenn noch nie aktualisiert wurde
      if (now - lastNotificationFetch > 120000 && (twoMinutesPassed || lastMarkAsRead === 0)) {
        try {
          const notificationsResult = await getNotifications()

          // Füge ein Delay von 2 Minuten für neue Benachrichtigungen hinzu
          const twoMinutesAgo = new Date()
          twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2)

          const filteredNotifications = notificationsResult.filter((notification) => {
            const notificationDate = new Date(notification.createdAt)
            return notificationDate < twoMinutesAgo
          })

          setNotifications(filteredNotifications)
          setLastNotificationFetch(now)

          // Also refresh contact inquiries periodically
          const contactResult = await getContactInquiries()
          setContactInquiries(contactResult)
        } catch (error) {
          console.error("Error fetching updates:", error)
        }
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(intervalId)
  }, [lastMarkAsRead])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      // Generate password and customer number
      const password = generatePassword()
      const customerNumber = generateCustomerNumber()

      // Create new customer in Sanity
      const newCustomer = {
        _type: "userForm",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        passwort: password,
        kundennummer: customerNumber,
        assignedForms: [],
        ausgefuellteformulare: [],
      }

      const result = await client.create(newCustomer)

      // Update local state
      setCustomers([...customers, { ...result, assignedForms: [], ausgefuellteformulare: [] }])
      setSuccess(`Kunde erstellt. Passwort: ${password}`)

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
      })
      setIsCreating(false)
    } catch (error) {
      console.error("Error creating customer:", error)
      setError("Fehler beim Erstellen des Kunden")
    }
  }

  const handleUpdateCustomer = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      // Update customer in Sanity
      const updatedCustomer = {
        ...currentCustomer,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      }

      await client.patch(currentCustomer._id).set(updatedCustomer).commit()

      // Update local state
      setCustomers(customers.map((c) => (c._id === currentCustomer._id ? updatedCustomer : c)))
      setSuccess("Kunde aktualisiert")

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
      })
      setIsEditing(false)
      setCurrentCustomer(null)
    } catch (error) {
      console.error("Error updating customer:", error)
      setError("Fehler beim Aktualisieren des Kunden")
    }
  }

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Sind Sie sicher, dass Sie diesen Kunden löschen möchten?")) {
      return
    }

    setError("")
    setSuccess("")

    try {
      // Delete customer from Sanity
      await client.delete(id)

      // Update local state
      setCustomers(customers.filter((c) => c._id !== id))
      setSuccess("Kunde gelöscht")
    } catch (error) {
      console.error("Error deleting customer:", error)
      setError("Fehler beim Löschen des Kunden")
    }
  }

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer)
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
    })
    setIsEditing(true)
    setIsCreating(false)
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
    })
    setIsCreating(false)
    setIsEditing(false)
    setCurrentCustomer(null)
  }

  const handleOpenAssignForm = async (customer) => {
    setSelectedCustomer(customer)
    setSelectedCustomerForms(customer.assignedForms || [])
    setCompletedForms(customer.ausgefuellteformulare || [])
    setShowAssignForm(true)
  }

  const handleAssignForm = async (formId) => {
    if (!selectedCustomer) return

    try {
      await assignFormToCustomer(selectedCustomer._id, formId)

      // Refresh the customer's assigned forms
      const updatedCustomer = await client.fetch(
        `
        *[_type == "userForm" && _id == $userId][0]{
          _id,
          firstName,
          lastName,
          email,
          kundennummer,
          "assignedForms": assignedForms[]->{
            _id,
            frageeins,
            fragezwei
          },
          ausgefuellteformulare
        }
      `,
        { userId: selectedCustomer._id },
      )

      // Update local state
      setSelectedCustomerForms(updatedCustomer.assignedForms || [])
      setCompletedForms(updatedCustomer.ausgefuellteformulare || [])
      setCustomers(customers.map((c) => (c._id === selectedCustomer._id ? updatedCustomer : c)))
      setSuccess("Formular zugewiesen")
    } catch (error) {
      console.error("Error assigning form:", error)
      setError("Fehler beim Zuweisen des Formulars")
    }
  }

  const handleUnassignForm = async (formId) => {
    if (!selectedCustomer) return

    try {
      await unassignFormFromCustomer(selectedCustomer._id, formId)

      // Refresh the customer's assigned forms
      const updatedCustomer = await client.fetch(
        `
        *[_type == "userForm" && _id == $userId][0]{
          _id,
          firstName,
          lastName,
          email,
          kundennummer,
          "assignedForms": assignedForms[]->{
            _id,
            frageeins,
            fragezwei
          },
          ausgefuellteformulare
        }
      `,
        { userId: selectedCustomer._id },
      )

      // Update local state
      setSelectedCustomerForms(updatedCustomer.assignedForms || [])
      setCompletedForms(updatedCustomer.ausgefuellteformulare || [])
      setCustomers(customers.map((c) => (c._id === selectedCustomer._id ? updatedCustomer : c)))
      setSuccess("Formular entfernt")
    } catch (error) {
      console.error("Error unassigning form:", error)
      setError("Fehler beim Entfernen des Formulars")
    }
  }

  // Funktionen für Kontaktanfragen und Benachrichtigungen

  const handleUpdateContactStatus = async (id, status) => {
    try {
      await updateContactInquiryStatus(id, status)

      // Update local state
      setContactInquiries(contactInquiries.map((inquiry) => (inquiry._id === id ? { ...inquiry, status } : inquiry)))

      setSuccess(`Status der Anfrage auf "${status}" geändert`)
    } catch (error) {
      console.error("Error updating contact status:", error)
      setError("Fehler beim Aktualisieren des Status")
    }
  }

  const handleViewInquiryDetails = (inquiry) => {
    setSelectedInquiry(inquiry)
  }

  const handleCloseInquiryDetails = () => {
    setSelectedInquiry(null)
  }

  // Aktualisiere die handleMarkNotificationAsRead-Funktion
  const handleMarkNotificationAsRead = async (id) => {
    try {
      await markNotificationAsRead(id)

      // Update local state
      setNotifications(
        notifications.map((notification) => (notification._id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Aktualisiere die handleMarkAllNotificationsAsRead-Funktion
  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsAsRead()

      // Update local state
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))

      // Setze den Zeitstempel für das letzte Markieren als gelesen
      setLastMarkAsRead(Date.now())

      setSuccess("Alle Benachrichtigungen als gelesen markiert")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      setError("Fehler beim Markieren der Benachrichtigungen")
    }
  }

  // Zähle ungelesene Benachrichtigungen
  const unreadCount = notifications.filter((n) => !n.read).length

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Unbekannt"
    const date = new Date(dateString)
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#E3DAC9] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
            {selectedCustomer && (
              <p className="text-lg text-black">
                Kunde:{" "}
                <span className="font-semibold">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </span>
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === "customers" ? "bg-white text-gray-900" : "text-gray-900 hover:bg-white/50"
              }`}
            >
              Kunden
            </button>
            <button
              onClick={() => setActiveTab("forms")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === "forms" ? "bg-white text-gray-900" : "text-gray-900 hover:bg-white/50"
              }`}
            >
              Formulare
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === "contact" ? "bg-white text-gray-900" : "text-gray-900 hover:bg-white/50"
              }`}
            >
              Kontaktanfragen
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-3 py-2 rounded-md text-sm font-medium relative ${
                activeTab === "notifications" ? "bg-white text-gray-900" : "text-gray-900 hover:bg-white/50"
              }`}
            >
              Benachrichtigungen
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={onLogout}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Kunden</h2>
              {!isCreating && !isEditing && !showAssignForm && (
                <button
                  onClick={() => {
                    setIsCreating(true)
                    setIsEditing(false)
                    setCurrentCustomer(null)
                    setShowAssignForm(false)
                  }}
                  className="px-4 py-2 bg-[#E3DAC9] text-gray-900 rounded-md hover:bg-[#E3DAC9]/80"
                >
                  Neuer Kunde
                </button>
              )}
            </div>

            {/* Customer Form */}
            {(isCreating || isEditing) && (
              <div className="bg-[rgba(227,218,201,0.1)] shadow-md rounded-md p-6 mb-6">
                <h3 className="text-lg font-medium mb-4 text-white">
                  {isCreating ? "Neuen Kunden erstellen" : "Kunden bearbeiten"}
                </h3>
                <form onSubmit={isCreating ? handleCreateCustomer : handleUpdateCustomer}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-white">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-white">
                        Vorname
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-white">
                        Nachname
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-white">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                    >
                      {isCreating ? "Erstellen" : "Aktualisieren"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                    >
                      Abbrechen
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Form Assignment */}
            {showAssignForm && selectedCustomer && (
              <div className="bg-[rgba(227,218,201,0.1)] shadow-md rounded-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">
                    <span className="text-[#E3DAC9] font-bold">Kunde:</span> {selectedCustomer.firstName}{" "}
                    {selectedCustomer.lastName}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAssignForm(false)
                      setSelectedCustomer(null)
                      setSelectedCustomerForms([])
                      setCompletedForms([])
                    }}
                    className="text-white hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2 text-white">Zugewiesene Formulare</h4>
                  {selectedCustomerForms.length === 0 ? (
                    <p className="text-gray-300">Keine Formulare zugewiesen</p>
                  ) : (
                    <ul className="divide-y divide-gray-700">
                      {selectedCustomerForms.map((form) => (
                        <li key={form._id} className="py-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-white">Frage 1: {form.frageeins}</p>
                            <p className="text-gray-300">Frage 2: {form.fragezwei}</p>
                          </div>
                          <button
                            onClick={() => handleUnassignForm(form._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Entfernen
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2 text-white">Verfügbare Formulare</h4>
                  {forms.length === 0 ? (
                    <p className="text-gray-300">Keine Formulare verfügbar</p>
                  ) : (
                    <ul className="divide-y divide-gray-700">
                      {forms
                        .filter((form) => !selectedCustomerForms.some((assigned) => assigned._id === form._id))
                        .map((form) => (
                          <li key={form._id} className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-white">Frage 1: {form.frageeins}</p>
                              <p className="text-gray-300">Frage 2: {form.fragezwei}</p>
                            </div>
                            <button
                              onClick={() => handleAssignForm(form._id)}
                              className="text-[#E3DAC9] hover:text-[#E3DAC9]/80"
                            >
                              Zuweisen
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="text-md font-medium mb-2 text-white">Ausgefüllte Formulare</h4>
                  {completedForms.length === 0 ? (
                    <p className="text-gray-300">Keine ausgefüllten Formulare</p>
                  ) : (
                    <ul className="divide-y divide-gray-700">
                      {completedForms.map((completed, index) => (
                        <li key={index} className="py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-white">Ausgefülltes Formular {index + 1}</p>
                            </div>
                            <a
                              href={`https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${completed.asset._ref.replace("file-", "").replace("-pdf", ".pdf")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
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
            )}

            {/* Customers Table */}
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h3 className="text-lg leading-6 font-medium text-white">Kundenliste</h3>
              </div>
              <div className="border-t border-gray-700">
                {isLoading ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
                ) : customers.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Kunden gefunden</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Kundennummer
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Formulare
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Ausgefüllt
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Aktionen
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[rgba(227,218,201,0.05)] divide-y divide-gray-700">
                        {customers.map((customer) => (
                          <tr key={customer._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    {customer.firstName} {customer.lastName}
                                  </div>
                                  <div className="text-sm text-[#E3DAC9]">
                                    Kunde #{customer.kundennummer?.substring(2) || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {customer.kundennummer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                                {customer.assignedForms ? customer.assignedForms.length : 0} zugewiesen
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                                {customer.ausgefuellteformulare ? customer.ausgefuellteformulare.length : 0} ausgefüllt
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <button
                                onClick={() => handleEditCustomer(customer)}
                                className="text-[#E3DAC9] hover:text-[#E3DAC9]/80 mr-3"
                              >
                                Bearbeiten
                              </button>
                              <button
                                onClick={() => handleOpenAssignForm(customer)}
                                className="text-blue-400 hover:text-blue-300 mr-3"
                              >
                                Formulare
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(customer._id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Löschen
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Forms Tab */}
        {activeTab === "forms" && (
          <section>
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h2 className="text-lg leading-6 font-medium text-white">Formulare</h2>
                <p className="mt-1 max-w-2xl text-sm text-white">Übersicht aller Formulare</p>
              </div>
              <div className="border-t border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Frage 1
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Frage 2
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Zugewiesen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[rgba(227,218,201,0.05)] divide-y divide-gray-700">
                      {forms.map((form) => (
                        <tr key={form._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{form._id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {form.frageeins}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{form.fragezwei}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {
                              customers.filter(
                                (c) => c.assignedForms && c.assignedForms.some((f) => f._id === form._id),
                              ).length
                            }{" "}
                            Kunden
                          </td>
                        </tr>
                      ))}
                      {forms.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-300">
                            Keine Formulare vorhanden
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact Inquiries Tab */}
        {activeTab === "contact" && (
          <section>
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h2 className="text-lg leading-6 font-medium text-white">Kontaktanfragen</h2>
                <p className="mt-1 max-w-2xl text-sm text-white">Übersicht aller Kontaktanfragen</p>
              </div>
              <div className="border-t border-gray-700">
                {isLoading ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
                ) : contactInquiries.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Kontaktanfragen vorhanden</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Support-Nr.
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Betreff
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Datum
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Aktionen
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[rgba(227,218,201,0.05)] divide-y divide-gray-700">
                        {contactInquiries.map((inquiry) => (
                          <tr key={inquiry._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {inquiry.supportNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {inquiry.firstName} {inquiry.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{inquiry.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{inquiry.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  inquiry.status === "Offen"
                                    ? "bg-yellow-900 text-yellow-200"
                                    : inquiry.status === "In Bearbeitung"
                                      ? "bg-blue-900 text-blue-200"
                                      : "bg-green-900 text-green-200"
                                }`}
                              >
                                {inquiry.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatDate(inquiry.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div className="flex space-x-2">
                                <select
                                  className="bg-gray-800 text-white text-sm rounded-md border border-gray-700 focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                                  value={inquiry.status}
                                  onChange={(e) => handleUpdateContactStatus(inquiry._id, e.target.value)}
                                >
                                  <option value="Offen">Offen</option>
                                  <option value="In Bearbeitung">In Bearbeitung</option>
                                  <option value="Abgeschlossen">Abgeschlossen</option>
                                </select>
                                <button
                                  onClick={() => handleViewInquiryDetails(inquiry)}
                                  className="text-[#E3DAC9] hover:text-[#E3DAC9]/80"
                                >
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Inquiry Details Modal */}
            {selectedInquiry && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-medium text-white">Kontaktanfrage Details</h3>
                    <button onClick={handleCloseInquiryDetails} className="text-gray-300 hover:text-white">
                      ✕
                    </button>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Support-Nummer</p>
                        <p className="text-white">{selectedInquiry.supportNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <div className="flex items-center mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedInquiry.status === "Offen"
                                ? "bg-yellow-900 text-yellow-200"
                                : selectedInquiry.status === "In Bearbeitung"
                                  ? "bg-blue-900 text-blue-200"
                                  : "bg-green-900 text-green-200"
                            }`}
                          >
                            {selectedInquiry.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="text-white text-lg font-semibold">
                          {selectedInquiry.firstName} {selectedInquiry.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white">{selectedInquiry.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Telefon</p>
                        <p className="text-white">{selectedInquiry.phone || "Nicht angegeben"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Datum</p>
                        <p className="text-white">{formatDate(selectedInquiry.timestamp)}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-400">Betreff</p>
                      <p className="text-white font-medium">{selectedInquiry.subject}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-400">Nachricht</p>
                      <div className="mt-1 p-3 bg-gray-800 rounded-md text-white">{selectedInquiry.message}</div>
                    </div>
                    {selectedInquiry.fileUrl && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400">Angehängte Datei</p>
                        <div className="mt-1">
                          <a
                            href={selectedInquiry.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-[#E3DAC9] text-black rounded-md hover:bg-[#E3DAC9]/80"
                          >
                            Datei öffnen
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="mt-6 border-t border-gray-700 pt-4">
                      <p className="text-sm text-gray-400 mb-2">Status ändern</p>
                      <div className="flex space-x-2">
                        <select
                          className="bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9] px-3 py-2"
                          value={selectedInquiry.status}
                          onChange={(e) => {
                            handleUpdateContactStatus(selectedInquiry._id, e.target.value)
                            setSelectedInquiry({
                              ...selectedInquiry,
                              status: e.target.value,
                            })
                          }}
                        >
                          <option value="Offen">Offen</option>
                          <option value="In Bearbeitung">In Bearbeitung</option>
                          <option value="Abgeschlossen">Abgeschlossen</option>
                        </select>
                        <button
                          onClick={handleCloseInquiryDetails}
                          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                        >
                          Schließen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <section>
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20 flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-white">Benachrichtigungen</h2>
                  <p className="mt-1 max-w-2xl text-sm text-white">Übersicht aller Benachrichtigungen</p>
                </div>
                <button
                  onClick={handleMarkAllNotificationsAsRead}
                  className="px-3 py-1 bg-[#E3DAC9] text-gray-900 rounded-md hover:bg-[#E3DAC9]/80 text-sm"
                >
                  Alle als gelesen markieren
                </button>
              </div>
              <div className="border-t border-gray-700 divide-y divide-gray-700">
                {isLoading ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Benachrichtigungen vorhanden</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-4 py-5 sm:px-6 ${notification.read ? "" : "bg-[#E3DAC9]/10"}`}
                    >
                      <div className="flex justify-between">
                        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                          {!notification.read && (
                            <span className="h-2 w-2 bg-[#E3DAC9] rounded-full mr-2" aria-hidden="true"></span>
                          )}
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-gray-300">{formatDate(notification.createdAt)}</p>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkNotificationAsRead(notification._id)}
                              className="text-[#E3DAC9] hover:text-[#E3DAC9]/80 text-sm"
                            >
                              Als gelesen markieren
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 max-w-2xl text-sm text-gray-300">{notification.message}</p>
                      {notification.relatedDocumentType && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                            {notification.relatedDocumentType === "userForm"
                              ? "Kunde"
                              : notification.relatedDocumentType === "contactForm"
                                ? "Kontaktanfrage"
                                : notification.relatedDocumentType}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
