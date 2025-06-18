"use client"

import { useState, useEffect } from "react"
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  assignFormTextToUser,
  removeFormTextFromUser,
  getUserAssignedForms,
  getCompletedForms,
  getUserUploadedFiles,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getContactInquiries,
  updateContactInquiryStatus,
  getAppointments,
  getCategories,
  createCategory,
  assignCustomerToCategory,
  removeCustomerFromCategory,
  generatePassword,
} from "@/sanity/lib"
import { PREDEFINED_FORMS } from "@/sanity/predefined-forms"

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("customers")
  const [customers, setCustomers] = useState([])
  const [appointments, setAppointments] = useState([])
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
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [newFormText, setNewFormText] = useState("")

  // Contact inquiry detail state
  const [selectedInquiry, setSelectedInquiry] = useState(null)

  // Notification state
  const [lastNotificationFetch, setLastNotificationFetch] = useState(0)
  const [lastMarkAsRead, setLastMarkAsRead] = useState(0)

  // Filter and category state
  const [customerFilter, setCustomerFilter] = useState("all")
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showAssignCategoryModal, setShowAssignCategoryModal] = useState(false)
  const [customerToAssignCategory, setCustomerToAssignCategory] = useState(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchNotifications, 30000) // Fetch notifications every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [customersData, appointmentsData, inquiriesData, notificationsData, categoriesData] = await Promise.all([
        getCustomers(),
        getAppointments(),
        getContactInquiries(),
        getNotifications(),
        getCategories(),
      ])

      setCustomers(customersData || [])
      setAppointments(appointmentsData || [])
      setContactInquiries(inquiriesData || [])
      setNotifications(notificationsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Fehler beim Laden der Daten")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const notificationsData = await getNotifications()
      setNotifications(notificationsData || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsCreating(true)

    try {
      // Automatisch Passwort generieren
      const generatedPassword = generatePassword()
      const customerDataWithPassword = {
        ...formData,
        passwort: generatedPassword, // WICHTIG: passwort statt password verwenden
      }

      const result = await createCustomer(customerDataWithPassword)
      setSuccess(`Kunde erfolgreich erstellt. Passwort: ${generatedPassword}`)
      setFormData({ firstName: "", lastName: "", email: "" })
      fetchData()
    } catch (error) {
      setError(`Fehler beim Erstellen des Kunden: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateCustomer = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsEditing(true)

    try {
      await updateCustomer(currentCustomer._id, formData)
      setSuccess("Kunde erfolgreich aktualisiert")
      setCurrentCustomer(null)
      setFormData({ firstName: "", lastName: "", email: "" })
      fetchData()
    } catch (error) {
      setError(`Fehler beim Aktualisieren des Kunden: ${error.message}`)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Kunden löschen möchten?")) {
      try {
        await deleteCustomer(customerId)
        setSuccess("Kunde erfolgreich gelöscht")
        fetchData()
      } catch (error) {
        setError(`Fehler beim Löschen des Kunden: ${error.message}`)
      }
    }
  }

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer)
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
    })
  }

  const handleCancelEdit = () => {
    setCurrentCustomer(null)
    setFormData({ firstName: "", lastName: "", email: "" })
  }

  const handleAssignForm = async (customerId) => {
    setSelectedCustomer(customerId)
    setShowAssignForm(true)

    try {
      const [assignedForms, completedData, uploadedFilesData] = await Promise.all([
        getUserAssignedForms(customerId),
        getCompletedForms(customerId),
        getUserUploadedFiles(customerId),
      ])

      setSelectedCustomerForms(assignedForms || [])
      setCompletedForms(completedData?.ausgefuellteformulare || [])
      setUploadedFiles(uploadedFilesData || [])
    } catch (error) {
      setError(`Fehler beim Laden der Formulardaten: ${error.message}`)
    }
  }

  const handleAssignPredefinedForm = async (formText) => {
    try {
      await assignFormTextToUser(selectedCustomer, formText)
      setSuccess("Formular erfolgreich zugewiesen")

      // Refresh the customer's forms
      const assignedForms = await getUserAssignedForms(selectedCustomer)
      setSelectedCustomerForms(assignedForms || [])
    } catch (error) {
      setError(`Fehler beim Zuweisen des Formulars: ${error.message}`)
    }
  }

  const handleAssignCustomForm = async () => {
    if (!newFormText.trim()) {
      setError("Bitte geben Sie einen Formulartext ein")
      return
    }

    try {
      await assignFormTextToUser(selectedCustomer, newFormText)
      setSuccess("Benutzerdefiniertes Formular erfolgreich zugewiesen")
      setNewFormText("")

      // Refresh the customer's forms
      const assignedForms = await getUserAssignedForms(selectedCustomer)
      setSelectedCustomerForms(assignedForms || [])
    } catch (error) {
      setError(`Fehler beim Zuweisen des benutzerdefinierten Formulars: ${error.message}`)
    }
  }

  const handleRemoveForm = async (formIndex) => {
    try {
      await removeFormTextFromUser(selectedCustomer, formIndex)
      setSuccess("Formular erfolgreich entfernt")

      // Refresh the customer's forms
      const assignedForms = await getUserAssignedForms(selectedCustomer)
      setSelectedCustomerForms(assignedForms || [])
    } catch (error) {
      setError(`Fehler beim Entfernen des Formulars: ${error.message}`)
    }
  }

  const handleCloseAssignForm = () => {
    setShowAssignForm(false)
    setSelectedCustomer(null)
    setSelectedCustomerForms([])
    setCompletedForms([])
    setUploadedFiles([])
    setNewFormText("")
  }

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry)
  }

  const handleCloseInquiry = () => {
    setSelectedInquiry(null)
  }

  const handleUpdateInquiryStatus = async (inquiryId, status) => {
    try {
      await updateContactInquiryStatus(inquiryId, status)
      setSuccess("Status erfolgreich aktualisiert")
      fetchData()
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status })
      }
    } catch (error) {
      setError(`Fehler beim Aktualisieren des Status: ${error.message}`)
    }
  }

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead()
      if (result.success) {
        setSuccess(result.message)
        fetchNotifications()
      }
    } catch (error) {
      setError(`Fehler beim Markieren der Benachrichtigungen: ${error.message}`)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Bitte geben Sie einen Kategorienamen ein")
      return
    }

    try {
      await createCategory(newCategoryName)
      setSuccess("Kategorie erfolgreich erstellt")
      setNewCategoryName("")
      setShowCategoryModal(false)
      fetchData()
    } catch (error) {
      setError(`Fehler beim Erstellen der Kategorie: ${error.message}`)
    }
  }

  const handleAssignCategory = async (categoryId) => {
    try {
      const result = await assignCustomerToCategory(customerToAssignCategory, categoryId)
      if (result.alreadyAssigned) {
        setError("Kunde ist bereits dieser Kategorie zugeordnet")
      } else {
        setSuccess("Kunde erfolgreich der Kategorie zugeordnet")
        fetchData()
      }
      setShowAssignCategoryModal(false)
      setCustomerToAssignCategory(null)
    } catch (error) {
      setError(`Fehler beim Zuordnen zur Kategorie: ${error.message}`)
    }
  }

  const handleRemoveFromCategory = async (customerId, categoryId) => {
    try {
      await removeCustomerFromCategory(customerId, categoryId)
      setSuccess("Kunde erfolgreich aus der Kategorie entfernt")
      fetchData()
    } catch (error) {
      setError(`Fehler beim Entfernen aus der Kategorie: ${error.message}`)
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    if (customerFilter === "all") return true
    if (customerFilter === "with_forms") return customer.assignedForms && customer.assignedForms.length > 0
    if (customerFilter === "without_forms") return !customer.assignedForms || customer.assignedForms.length === 0
    if (customerFilter === "completed_forms")
      return customer.ausgefuellteformulare && customer.ausgefuellteformulare.length > 0
    if (selectedCategory) {
      return customer.category && customer.category.some((cat) => cat._id === selectedCategory)
    }
    return true
  })

  const unreadNotifications = notifications.filter((n) => !n.read)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-[#E3DAC9] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setActiveTab("notifications")}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
              >
                Benachrichtigungen
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: "customers", label: "Kunden" },
              { key: "appointments", label: "Termine" },
              { key: "inquiries", label: "Kontaktanfragen" },
              { key: "notifications", label: "Benachrichtigungen" },
              { key: "categories", label: "Kategorien" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? "border-[#E3DAC9] text-[#E3DAC9]"
                    : "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.key === "notifications" && unreadNotifications.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            {/* Customer Creation Form */}
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h2 className="text-lg leading-6 font-medium text-white">
                  {currentCustomer ? "Kunde bearbeiten" : "Neuen Kunden erstellen"}
                </h2>
                <p className="mt-1 text-sm text-white">
                  {!currentCustomer && "Das Passwort wird automatisch generiert und angezeigt."}
                </p>
              </div>
              <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
                <form onSubmit={currentCustomer ? handleUpdateCustomer : handleCreateCustomer}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-white">
                        Vorname
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
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
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white">
                        E-Mail
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <button
                      type="submit"
                      disabled={isCreating || isEditing}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9] disabled:opacity-50"
                    >
                      {currentCustomer
                        ? isEditing
                          ? "Wird aktualisiert..."
                          : "Aktualisieren"
                        : isCreating
                          ? "Wird erstellt..."
                          : "Erstellen"}
                    </button>
                    {currentCustomer && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex justify-center py-2 px-4 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                      >
                        Abbrechen
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Customer Filters */}
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex flex-wrap gap-4">
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                  >
                    <option value="all">Alle Kunden</option>
                    <option value="with_forms">Mit zugewiesenen Formularen</option>
                    <option value="without_forms">Ohne zugewiesene Formulare</option>
                    <option value="completed_forms">Mit ausgefüllten Formularen</option>
                  </select>
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                  >
                    <option value="">Alle Kategorien</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customer List */}
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h2 className="text-lg leading-6 font-medium text-white">Kundenliste</h2>
                <p className="mt-1 max-w-2xl text-sm text-white">
                  {filteredCustomers.length} von {customers.length} Kunden
                </p>
              </div>
              <div className="border-t border-gray-700">
                {isLoading ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Kunden gefunden</div>
                ) : (
                  <ul className="divide-y divide-gray-700">
                    {filteredCustomers.map((customer) => (
                      <li key={customer._id} className="px-4 py-5 sm:px-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg leading-6 font-medium text-white">
                                {customer.firstName} {customer.lastName}
                              </h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditCustomer(customer)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                                >
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => handleAssignForm(customer._id)}
                                  className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                                >
                                  Formulare
                                </button>
                                <button
                                  onClick={() => {
                                    setCustomerToAssignCategory(customer._id)
                                    setShowAssignCategoryModal(true)
                                  }}
                                  className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                                >
                                  Kategorie
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(customer._id)}
                                  className="inline-flex items-center px-3 py-1 border border-red-700 text-xs font-medium rounded text-red-400 bg-red-900/20 hover:bg-red-900/40"
                                >
                                  Löschen
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-white">
                              <div>
                                <span className="font-medium">E-Mail:</span> {customer.email}
                              </div>
                              <div>
                                <span className="font-medium">Kundennummer:</span> {customer.kundennummer}
                              </div>
                              <div>
                                <span className="font-medium">Passwort:</span> {customer.passwort || "Nicht gesetzt"}
                              </div>
                              <div>
                                <span className="font-medium">Zugewiesene Formulare:</span>{" "}
                                {customer.assignedForms ? customer.assignedForms.length : 0}
                              </div>
                              <div>
                                <span className="font-medium">Ausgefüllte Formulare:</span>{" "}
                                {customer.ausgefuellteformulare ? customer.ausgefuellteformulare.length : 0}
                              </div>
                            </div>
                            {customer.category && customer.category.length > 0 && (
                              <div className="mt-2">
                                <span className="font-medium text-white">Kategorien:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {customer.category.map((category) => (
                                    <span
                                      key={category._id}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E3DAC9] text-black"
                                    >
                                      {category.name}
                                      <button
                                        onClick={() => handleRemoveFromCategory(customer._id, category._id)}
                                        className="ml-1 text-red-600 hover:text-red-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rest of the component remains the same... */}
        {/* Form Assignment Modal */}
        {showAssignForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Formulare verwalten</h3>
                  <button onClick={handleCloseAssignForm} className="text-gray-400 hover:text-white">
                    <span className="sr-only">Schließen</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Predefined Forms */}
                  <div>
                    <h4 className="text-md font-medium text-white mb-3">Vordefinierte Steuerformulare</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {PREDEFINED_FORMS.map((form, index) => (
                        <div key={index} className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700">
                          <h5 className="text-sm font-medium text-white mb-2">{form.title}</h5>
                          <button
                            onClick={() => handleAssignPredefinedForm(form.text)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                          >
                            Zuweisen
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Form */}
                  <div>
                    <h4 className="text-md font-medium text-white mb-3">Benutzerdefiniertes Formular</h4>
                    <textarea
                      value={newFormText}
                      onChange={(e) => setNewFormText(e.target.value)}
                      placeholder="Formulartext eingeben..."
                      rows={10}
                      className="w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                    />
                    <button
                      onClick={handleAssignCustomForm}
                      className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                    >
                      Benutzerdefiniertes Formular zuweisen
                    </button>
                  </div>
                </div>

                {/* Assigned Forms */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-white mb-3">Zugewiesene Formulare</h4>
                  {selectedCustomerForms.length === 0 ? (
                    <p className="text-gray-400">Keine Formulare zugewiesen</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCustomerForms.map((form, index) => (
                        <div
                          key={index}
                          className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700 flex justify-between items-center"
                        >
                          <span className="text-white">{form.title}</span>
                          <button
                            onClick={() => handleRemoveForm(index)}
                            className="inline-flex items-center px-3 py-1 border border-red-700 text-xs font-medium rounded text-red-400 bg-red-900/20 hover:bg-red-900/40"
                          >
                            Entfernen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Forms */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-white mb-3">Ausgefüllte Formulare</h4>
                  {completedForms.length === 0 ? (
                    <p className="text-gray-400">Keine ausgefüllten Formulare</p>
                  ) : (
                    <div className="space-y-2">
                      {completedForms.map((completed, index) => (
                        <div
                          key={index}
                          className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700 flex justify-between items-center"
                        >
                          <span className="text-white">Ausgefülltes Formular {index + 1}</span>
                          <a
                            href={`https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${completed.asset._ref.replace("file-", "").replace("-pdf", ".pdf")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                          >
                            PDF öffnen
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Uploaded Files */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-white mb-3">Hochgeladene Dateien</h4>
                  {uploadedFiles.length === 0 ? (
                    <p className="text-gray-400">Keine Dateien hochgeladen</p>
                  ) : (
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file._key}
                          className="bg-[rgba(227,218,201,0.1)] p-3 rounded border border-gray-700 flex justify-between items-center"
                        >
                          <div>
                            <span className="text-white">{file.fileName}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({new Date(file.uploadDate).toLocaleDateString("de-DE")})
                            </span>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                          >
                            Öffnen
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Assignment Modal */}
        {showAssignCategoryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Kategorie zuweisen</h3>
                  <button
                    onClick={() => {
                      setShowAssignCategoryModal(false)
                      setCustomerToAssignCategory(null)
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <span className="sr-only">Schließen</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleAssignCategory(category._id)}
                      className="w-full text-left px-4 py-2 bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md text-white hover:bg-[rgba(227,218,201,0.2)]"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the tabs remain the same... */}
        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
              <h2 className="text-lg leading-6 font-medium text-white">Termine</h2>
            </div>
            <div className="border-t border-gray-700">
              {isLoading ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
              ) : appointments.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Termine vorhanden</div>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {appointments.map((appointment) => (
                    <li key={appointment._id} className="px-4 py-5 sm:px-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-white">{appointment.name}</h3>
                          <p className="mt-1 text-sm text-gray-300">
                            {appointment.email} • {appointment.phone}
                          </p>
                          <p className="mt-1 text-sm text-[#E3DAC9]">
                            {new Date(appointment.uhrzeit).toLocaleString("de-DE")}
                          </p>
                        </div>
                        {appointment.link && (
                          <a
                            href={appointment.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                          >
                            Meeting beitreten
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Contact Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
              <h2 className="text-lg leading-6 font-medium text-white">Kontaktanfragen</h2>
            </div>
            <div className="border-t border-gray-700">
              {isLoading ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
              ) : contactInquiries.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Kontaktanfragen vorhanden</div>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {contactInquiries.map((inquiry) => (
                    <li key={inquiry._id} className="px-4 py-5 sm:px-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg leading-6 font-medium text-white">
                              {inquiry.firstName} {inquiry.lastName}
                            </h3>
                            <div className="flex space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  inquiry.status === "offen"
                                    ? "bg-yellow-900 text-yellow-200"
                                    : inquiry.status === "in_bearbeitung"
                                      ? "bg-blue-900 text-blue-200"
                                      : "bg-green-900 text-green-200"
                                }`}
                              >
                                {inquiry.status === "offen"
                                  ? "Offen"
                                  : inquiry.status === "in_bearbeitung"
                                    ? "In Bearbeitung"
                                    : "Abgeschlossen"}
                              </span>
                              <button
                                onClick={() => handleViewInquiry(inquiry)}
                                className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white">
                            <div>
                              <span className="font-medium">E-Mail:</span> {inquiry.email}
                            </div>
                            <div>
                              <span className="font-medium">Telefon:</span> {inquiry.phone || "Nicht angegeben"}
                            </div>
                            <div>
                              <span className="font-medium">Support-Nr:</span> {inquiry.supportNumber}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-white">Betreff:</span>
                            <p className="text-gray-300">{inquiry.subject}</p>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-white">Datum:</span>
                            <span className="text-[#E3DAC9] ml-2">
                              {new Date(inquiry.timestamp).toLocaleString("de-DE")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Inquiry Detail Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Kontaktanfrage Details</h3>
                  <button onClick={handleCloseInquiry} className="text-gray-400 hover:text-white">
                    <span className="sr-only">Schließen</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-white">Name:</span>
                      <p className="text-gray-300">
                        {selectedInquiry.firstName} {selectedInquiry.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-white">Support-Nummer:</span>
                      <p className="text-gray-300">{selectedInquiry.supportNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white">E-Mail:</span>
                      <p className="text-gray-300">{selectedInquiry.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white">Telefon:</span>
                      <p className="text-gray-300">{selectedInquiry.phone || "Nicht angegeben"}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-white">Betreff:</span>
                    <p className="text-gray-300">{selectedInquiry.subject}</p>
                  </div>

                  <div>
                    <span className="font-medium text-white">Nachricht:</span>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>

                  {selectedInquiry.fileUrl && (
                    <div>
                      <span className="font-medium text-white">Anhang:</span>
                      <a
                        href={selectedInquiry.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-[#E3DAC9] hover:underline"
                      >
                        Datei öffnen
                      </a>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-white">Datum:</span>
                    <p className="text-gray-300">{new Date(selectedInquiry.timestamp).toLocaleString("de-DE")}</p>
                  </div>

                  <div>
                    <span className="font-medium text-white">Status ändern:</span>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleUpdateInquiryStatus(selectedInquiry._id, "offen")}
                        className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded text-sm hover:bg-yellow-800"
                      >
                        Offen
                      </button>
                      <button
                        onClick={() => handleUpdateInquiryStatus(selectedInquiry._id, "in_bearbeitung")}
                        className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-sm hover:bg-blue-800"
                      >
                        In Bearbeitung
                      </button>
                      <button
                        onClick={() => handleUpdateInquiryStatus(selectedInquiry._id, "abgeschlossen")}
                        className="px-3 py-1 bg-green-900 text-green-200 rounded text-sm hover:bg-green-800"
                      >
                        Abgeschlossen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-white">Benachrichtigungen</h2>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={handleMarkAllNotificationsAsRead}
                  className="inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                >
                  Alle als gelesen markieren
                </button>
              )}
            </div>
            <div className="border-t border-gray-700">
              {isLoading ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Benachrichtigungen vorhanden</div>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={`px-4 py-5 sm:px-6 ${!notification.read ? "bg-[rgba(227,218,201,0.05)]" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg leading-6 font-medium text-white">{notification.title}</h3>
                            {!notification.read && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E3DAC9] text-black">
                                Neu
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-300">{notification.message}</p>
                          <p className="mt-1 text-xs text-[#E3DAC9]">
                            {new Date(notification.createdAt).toLocaleString("de-DE")}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkNotificationAsRead(notification._id)}
                            className="ml-4 inline-flex items-center px-3 py-1 border border-gray-700 text-xs font-medium rounded text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)]"
                          >
                            Als gelesen markieren
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Create Category */}
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h2 className="text-lg leading-6 font-medium text-white">Neue Kategorie erstellen</h2>
              </div>
              <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Kategoriename"
                    className="flex-1 bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                  />
                  <button
                    onClick={handleCreateCategory}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80"
                  >
                    Erstellen
                  </button>
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h2 className="text-lg leading-6 font-medium text-white">Kategorien</h2>
              </div>
              <div className="border-t border-gray-700">
                {isLoading ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Kategorien vorhanden</div>
                ) : (
                  <ul className="divide-y divide-gray-700">
                    {categories.map((category) => {
                      const customersInCategory = customers.filter(
                        (customer) => customer.category && customer.category.some((cat) => cat._id === category._id),
                      )
                      return (
                        <li key={category._id} className="px-4 py-5 sm:px-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg leading-6 font-medium text-white">{category.name}</h3>
                              <p className="mt-1 text-sm text-gray-300">
                                {customersInCategory.length} Kunde(n) zugeordnet
                              </p>
                            </div>
                          </div>
                          {customersInCategory.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-white mb-2">Zugeordnete Kunden:</h4>
                              <div className="flex flex-wrap gap-2">
                                {customersInCategory.map((customer) => (
                                  <span
                                    key={customer._id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E3DAC9] text-black"
                                  >
                                    {customer.firstName} {customer.lastName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
