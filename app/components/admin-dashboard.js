"use client"

import { useState, useEffect } from "react"
import {
  client,
  generatePassword,
  generateCustomerNumber,
  getForms,
  getAppointments,
  assignFormToCustomer,
  unassignFormFromCustomer,
  getContactInquiries,
  updateContactInquiryStatus,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserUploadedFiles,
  getCategories,
  createCategory,
  assignCustomerToCategory,
  removeCustomerFromCategory,
} from "@/sanity/lib"

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("customers")
  const [customers, setCustomers] = useState([])
  const [forms, setForms] = useState([])
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

  // Fetch data from Sanity
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
            title,
            questions,
            frageeins,
            fragezwei
          },
          ausgefuellteformulare,
          "categories": categories[]->{ _id, name }
        }`
        const customersResult = await client.fetch(query)
        setCustomers(customersResult)

        // Fetch categories
        const categoriesResult = await getCategories()
        setCategories(categoriesResult)

        // Fetch forms
        const formsResult = await getForms()
        setForms(formsResult)

        // Fetch appointments
        const appointmentsResult = await getAppointments()
        setAppointments(appointmentsResult)

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

          // Refresh appointments periodically
          const appointmentsResult = await getAppointments()
          setAppointments(appointmentsResult)
        } catch (error) {
          console.error("Error fetching updates:", error)
        }
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(intervalId)
  }, [lastMarkAsRead])

  // Filter customers based on selected filter
  const filteredCustomers = customers.filter((customer) => {
    if (customerFilter === "all") return true
    if (customerFilter === "completed" && customer.ausgefuellteformulare?.length > 0) return true
    if (
      customerFilter === "incomplete" &&
      customer.assignedForms?.length > 0 &&
      (!customer.ausgefuellteformulare || customer.ausgefuellteformulare.length === 0)
    )
      return true
    if (
      customerFilter === "noforms" &&
      (!customer.assignedForms || customer.assignedForms.length === 0) &&
      (!customer.ausgefuellteformulare || customer.ausgefuellteformulare.length === 0)
    )
      return true
    if (customerFilter === "category" && selectedCategory) {
      return customer.categories?.some((cat) => cat._id === selectedCategory._id)
    }
    return false
  })

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
        uploadedFiles: [],
        categories: [],
      }

      const result = await client.create(newCustomer)

      // Update local state
      setCustomers([
        ...customers,
        { ...result, assignedForms: [], ausgefuellteformulare: [], uploadedFiles: [], categories: [] },
      ])
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

    // Lade die hochgeladenen Dateien des Kunden
    try {
      const files = await getUserUploadedFiles(customer._id)
      setUploadedFiles(files)
    } catch (error) {
      console.error("Error fetching uploaded files:", error)
      setError("Fehler beim Laden der hochgeladenen Dateien")
    }

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
            title,
            questions,
            frageeins,
            fragezwei
          },
          ausgefuellteformulare,
          "categories": categories[]->{ _id, name }
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
            title,
            questions,
            frageeins,
            fragezwei
          },
          ausgefuellteformulare,
          "categories": categories[]->{ _id, name }
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

  // Category functions
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Bitte geben Sie einen Kategorienamen ein")
      return
    }

    try {
      const newCategory = await createCategory(newCategoryName)
      setCategories([...categories, newCategory])
      setNewCategoryName("")
      setShowCategoryModal(false)
      setSuccess("Kategorie erstellt")
    } catch (error) {
      console.error("Error creating category:", error)
      setError("Fehler beim Erstellen der Kategorie")
    }
  }

  const handleOpenAssignCategoryModal = (customer) => {
    setCustomerToAssignCategory(customer)
    setShowAssignCategoryModal(true)
  }

  const handleAssignCategory = async (categoryId) => {
    if (!customerToAssignCategory) return

    try {
      await assignCustomerToCategory(customerToAssignCategory._id, categoryId)

      // Refresh customer data
      const updatedCustomer = await client.fetch(
        `*[_type == "userForm" && _id == $customerId][0]{
          _id,
          firstName,
          lastName,
          email,
          kundennummer,
          "assignedForms": assignedForms[]->{
            _id,
            title,
            questions,
            frageeins,
            fragezwei
          },
          ausgefuellteformulare,
          "categories": categories[]->{ _id, name }
        }`,
        { customerId: customerToAssignCategory._id },
      )

      // Update local state
      setCustomers(customers.map((c) => (c._id === customerToAssignCategory._id ? updatedCustomer : c)))
      setShowAssignCategoryModal(false)
      setCustomerToAssignCategory(null)
      setSuccess("Kunde zur Kategorie hinzugefügt")
    } catch (error) {
      console.error("Error assigning category:", error)
      setError("Fehler beim Zuweisen der Kategorie")
    }
  }

  const handleRemoveFromCategory = async (customerId, categoryId) => {
    try {
      await removeCustomerFromCategory(customerId, categoryId)

      // Refresh customer data
      const updatedCustomer = await client.fetch(
        `*[_type == "userForm" && _id == $customerId][0]{
          _id,
          firstName,
          lastName,
          email,
          kundennummer,
          "assignedForms": assignedForms[]->{
            _id,
            title,
            questions,
            frageeins,
            fragezwei
          },
          ausgefuellteformulare,
          "categories": categories[]->{ _id, name }
        }`,
        { customerId },
      )

      // Update local state
      setCustomers(customers.map((c) => (c._id === customerId ? updatedCustomer : c)))
      setSuccess("Kunde aus Kategorie entfernt")
    } catch (error) {
      console.error("Error removing from category:", error)
      setError("Fehler beim Entfernen aus der Kategorie")
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

  // Hilfsfunktion zum Anzeigen des Formularinhalts
  const getFormDisplayContent = (form) => {
    if (form.questions && form.questions.length > 0) {
      return (
        <div>
          <p className="font-medium text-white">{form.title || "Formular ohne Titel"}</p>
          <p className="text-gray-300">{form.questions.length} Fragen</p>
        </div>
      )
    } else if (form.frageeins || form.fragezwei) {
      // Fallback für alte Formularstruktur
      return (
        <div>
          <p className="font-medium text-white">Frage 1: {form.frageeins}</p>
          <p className="text-gray-300">Frage 2: {form.fragezwei}</p>
        </div>
      )
    }
    return <p className="text-gray-300">Leeres Formular</p>
  }

  // Hilfsfunktion zum Formatieren der Dateigröße
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
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
              onClick={() => setActiveTab("appointments")}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === "appointments" ? "bg-white text-gray-900" : "text-gray-900 hover:bg-white/50"
              }`}
            >
              Termine
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
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Neue Kategorie
                </button>
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
            </div>

            {/* Filter Controls */}
            <div className="mb-6 bg-[rgba(227,218,201,0.1)] p-4 rounded-md">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label htmlFor="customerFilter" className="block text-sm font-medium text-white mb-1">
                    Kunden filtern:
                  </label>
                  <select
                    id="customerFilter"
                    value={customerFilter}
                    onChange={(e) => {
                      setCustomerFilter(e.target.value)
                      if (e.target.value !== "category") {
                        setSelectedCategory(null)
                      }
                    }}
                    className="bg-gray-800 text-white rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                  >
                    <option value="all">Alle Kunden</option>
                    <option value="completed">Mit ausgefüllten Formularen</option>
                    <option value="incomplete">Mit offenen Formularen</option>
                    <option value="noforms">Ohne Formulare</option>
                    <option value="category">Nach Kategorie</option>
                  </select>
                </div>

                {customerFilter === "category" && (
                  <div>
                    <label htmlFor="categorySelect" className="block text-sm font-medium text-white mb-1">
                      Kategorie auswählen:
                    </label>
                    <select
                      id="categorySelect"
                      value={selectedCategory?._id || ""}
                      onChange={(e) => {
                        const category = categories.find((c) => c._id === e.target.value)
                        setSelectedCategory(category || null)
                      }}
                      className="bg-gray-800 text-white rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                    >
                      <option value="">Kategorie wählen</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
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
                      setUploadedFiles([])
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
                          {getFormDisplayContent(form)}
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
                            {getFormDisplayContent(form)}
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

                <div className="mb-6">
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

                              {/* Zeige zugehörige Dateien an */}
                              {uploadedFiles.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-400">Zugehörige Dateien:</p>
                                  <div className="ml-2 mt-1">
                                    {uploadedFiles.map((file, fileIndex) => (
                                      <div key={fileIndex} className="flex items-center space-x-2 text-sm">
                                        <a
                                          href={file.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-400 hover:text-blue-300"
                                        >
                                          {file.fileName || `Datei ${fileIndex + 1}`}
                                        </a>
                                        <span className="text-gray-400">
                                          {file.fileType && `(${file.fileType})`}
                                          {file.fileSize && ` - ${formatFileSize(file.fileSize)}`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
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
                <p className="text-sm text-white mt-1">
                  {customerFilter === "all"
                    ? "Alle Kunden"
                    : customerFilter === "completed"
                      ? "Kunden mit ausgefüllten Formularen"
                      : customerFilter === "incomplete"
                        ? "Kunden mit offenen Formularen"
                        : customerFilter === "noforms"
                          ? "Kunden ohne Formulare"
                          : `Kunden in Kategorie: ${selectedCategory?.name || ""}`}
                </p>
              </div>
              <div className="border-t border-gray-700">
                {isLoading ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
                ) : filteredCustomers.length === 0 ? (
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
                            Kategorien
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
                        {filteredCustomers.map((customer) => (
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
                              <div className="flex flex-col space-y-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                                  {customer.assignedForms ? customer.assignedForms.length : 0} zugewiesen
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                                  {customer.ausgefuellteformulare ? customer.ausgefuellteformulare.length : 0}{" "}
                                  ausgefüllt
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {customer.categories && customer.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {customer.categories.map((category) => (
                                    <div key={category._id} className="flex items-center">
                                      <span className="bg-purple-900 text-purple-200 text-xs rounded-l px-2 py-0.5">
                                        {category.name}
                                      </span>
                                      <button
                                        onClick={() => handleRemoveFromCategory(customer._id, category._id)}
                                        className="bg-purple-800 text-purple-200 text-xs rounded-r px-1 py-0.5 hover:bg-purple-700"
                                        title="Aus Kategorie entfernen"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500">Keine Kategorien</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditCustomer(customer)}
                                  className="text-[#E3DAC9] hover:text-[#E3DAC9]/80"
                                >
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => handleOpenAssignForm(customer)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  Formulare
                                </button>
                                <button
                                  onClick={() => handleOpenAssignCategoryModal(customer)}
                                  className="text-purple-400 hover:text-purple-300"
                                >
                                  Kategorie
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(customer._id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Löschen
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
                          Titel
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Fragen
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
                            {form.title || (form.frageeins ? "Frage: " + form.frageeins : "Ohne Titel")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {form.questions ? form.questions.length : form.frageeins && form.fragezwei ? 2 : 0}
                          </td>
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

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <section>
            <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
                <h2 className="text-lg leading-6 font-medium text-white">Terminbuchungen</h2>
                <p className="mt-1 max-w-2xl text-sm text-white">Übersicht aller gebuchten Termine</p>
              </div>
              <div className="border-t border-gray-700">
                {isLoading ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
                ) : appointments.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Termine vorhanden</div>
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
                            Telefon
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Termin
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Link
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[rgba(227,218,201,0.05)] divide-y divide-gray-700">
                        {appointments.map((appointment) => (
                          <tr key={appointment._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {appointment.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{appointment.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{appointment.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{appointment.uhrzeit}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {appointment.link ? (
                                <a
                                  href={appointment.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  Meeting öffnen
                                </a>
                              ) : (
                                "Kein Link"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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

        {/* Create Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-medium text-white">Neue Kategorie erstellen</h3>
                <button onClick={() => setShowCategoryModal(false)} className="text-gray-300 hover:text-white">
                  ✕
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label htmlFor="categoryName" className="block text-sm font-medium text-white mb-2">
                    Kategoriename
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                    placeholder="z.B. VIP-Kunden, Neukunden, etc."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleCreateCategory}
                    className="px-4 py-2 bg-[#E3DAC9] text-black rounded-md hover:bg-[#E3DAC9]/80"
                  >
                    Erstellen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Category Modal */}
        {showAssignCategoryModal && customerToAssignCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-medium text-white">Kategorie zuweisen</h3>
                <button
                  onClick={() => {
                    setShowAssignCategoryModal(false)
                    setCustomerToAssignCategory(null)
                  }}
                  className="text-gray-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="px-6 py-4">
                <p className="text-white mb-4">
                  Wählen Sie eine Kategorie für{" "}
                  <span className="font-semibold">
                    {customerToAssignCategory.firstName} {customerToAssignCategory.lastName}
                  </span>
                  :
                </p>

                {categories.length === 0 ? (
                  <p className="text-gray-300 mb-4">
                    Keine Kategorien vorhanden. Bitte erstellen Sie zuerst eine Kategorie.
                  </p>
                ) : (
                  <div className="mb-4 space-y-2">
                    {categories.map((category) => {
                      // Prüfen, ob der Kunde bereits in dieser Kategorie ist
                      const isAlreadyAssigned = customerToAssignCategory.categories?.some((c) => c._id === category._id)

                      return (
                        <div
                          key={category._id}
                          className="flex items-center justify-between p-2 bg-gray-800 rounded-md"
                        >
                          <span className="text-white">{category.name}</span>
                          {isAlreadyAssigned ? (
                            <span className="text-green-400 text-sm">Bereits zugewiesen</span>
                          ) : (
                            <button
                              onClick={() => handleAssignCategory(category._id)}
                              className="px-3 py-1 bg-[#E3DAC9] text-black rounded-md hover:bg-[#E3DAC9]/80 text-sm"
                            >
                              Zuweisen
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowAssignCategoryModal(false)
                      setCustomerToAssignCategory(null)
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
