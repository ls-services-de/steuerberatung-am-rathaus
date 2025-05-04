import sanityClient from "@sanity/client"
import { jsPDF } from "jspdf"
import "jspdf-autotable" // Optional für bessere Tabellen

// Initialize Sanity client
export const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-11-21",
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
})

// Helper function to generate a unique key
export function generateUniqueKey() {
  return Math.random().toString(36).substring(2, 15)
}

// Die vorherigen Hilfsfunktionen bleiben unverändert
export function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

export function generateCustomerNumber() {
  const prefix = "KD"
  const randomNum = Math.floor(10000 + Math.random() * 90000) // 5-digit number
  return `${prefix}${randomNum}`
}

export async function getForms() {
  return client.fetch(`*[_type == "form"]`)
}

export async function getAssignedForms(userId) {
  return client.fetch(
    `
    *[_type == "userForm" && _id == $userId][0]{
      "assignedForms": assignedForms[]->{
        _id,
        frageeins,
        fragezwei
      }
    }
  `,
    { userId },
  )
}

export async function getCompletedForms(userId) {
  return client.fetch(
    `
    *[_type == "userForm" && _id == $userId][0]{
      ausgefuellteformulare
    }
  `,
    { userId },
  )
}

export async function assignFormToCustomer(userId, formId) {
  const user = await client.fetch(
    `
    *[_type == "userForm" && _id == $userId][0]{
      assignedForms
    }
  `,
    { userId },
  )

  if (!user.assignedForms) {
    return client
      .patch(userId)
      .set({ assignedForms: [{ _type: "reference", _ref: formId, _key: generateUniqueKey() }] })
      .commit()
  }

  const isAlreadyAssigned = user.assignedForms.some((form) => form._ref === formId)
  if (isAlreadyAssigned) {
    return { alreadyAssigned: true }
  }

  return client
    .patch(userId)
    .setIfMissing({ assignedForms: [] })
    .append("assignedForms", [{ _type: "reference", _ref: formId, _key: generateUniqueKey() }])
    .commit()
}

export async function unassignFormFromCustomer(userId, formId) {
  const user = await client.fetch(
    `
    *[_type == "userForm" && _id == $userId][0]{
      assignedForms
    }
  `,
    { userId },
  )

  if (!user.assignedForms) {
    return { notAssigned: true }
  }

  const updatedForms = user.assignedForms.filter((form) => form._ref !== formId)

  return client.patch(userId).set({ assignedForms: updatedForms }).commit()
}

// Überarbeitete PDF-Generierungsfunktion mit jsPDF
export async function generatePDF(form, answers) {
  // Erstelle ein neues PDF-Dokument
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Füge Titel hinzu
  doc.setFontSize(16)
  doc.text(`Formular: ${form.frageeins} / ${form.fragezwei}`, 20, 20)

  // Füge Formularinhalte hinzu
  doc.setFontSize(12)
  doc.text(`Frage 1: ${form.frageeins}`, 20, 40)
  doc.text(`Antwort 1: ${answers.frageeins}`, 20, 46)

  doc.text(`Frage 2: ${form.fragezwei}`, 20, 60)
  doc.text(`Antwort 2: ${answers.fragezwei}`, 20, 66)

  doc.text(`Ausgefüllt am: ${new Date().toLocaleString()}`, 20, 80)

  // Konvertiere das PDF in einen Blob
  const pdfBlob = doc.output("blob")

  // Erstelle eine Datei aus dem Blob
  const file = new File([pdfBlob], `formular_${form._id}_${Date.now()}.pdf`, { type: "application/pdf" })

  // Lade die Datei zu Sanity hoch
  const uploadedAsset = await client.assets.upload("file", file, {
    filename: file.name,
    contentType: file.type,
  })

  return {
    assetId: uploadedAsset._id,
  }
}

// Aktualisiere die submitCompletedForm Funktion, um den Kundennamen in der Benachrichtigung zu inkludieren
export async function submitCompletedForm(userId, form, answers) {
  // Generiere und lade das PDF hoch
  const pdfFile = await generatePDF(form, answers)

  // Füge das PDF zum "ausgefuellteformulare" Array des Benutzers hinzu
  const result = await client
    .patch(userId)
    .setIfMissing({ ausgefuellteformulare: [] })
    .append("ausgefuellteformulare", [
      {
        _type: "file",
        _key: generateUniqueKey(),
        asset: {
          _type: "reference",
          _ref: pdfFile.assetId,
        },
      },
    ])
    .commit()

  // Hole den Kundennamen für die Benachrichtigung
  const user = await client.fetch(
    `*[_type == "userForm" && _id == $userId][0]{
      firstName,
      lastName
    }`,
    { userId },
  )

  // Erstelle eine Benachrichtigung mit Kundenname
  await createNotification({
    title: "Formular ausgefüllt",
    message: `Ein Formular wurde von ${user.firstName} ${user.lastName} ausgefüllt: ${form.frageeins}`,
    type: "form_completed",
    relatedDocumentId: userId,
    relatedDocumentType: "userForm",
  })

  return result
}

export async function removeFormAfterCompletion(userId, formId) {
  return unassignFormFromCustomer(userId, formId)
}

// Funktionen für Kontaktanfragen und Benachrichtigungen

// Kontaktanfragen abrufen
export async function getContactInquiries() {
  return client.fetch(`
    *[_type == "contactForm"] | order(timestamp desc) {
      _id,
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      supportNumber,
      status,
      timestamp,
      "fileUrl": file.asset->url
    }
  `)
}

// Kontaktanfrage nach ID abrufen
export async function getContactInquiryById(id) {
  return client.fetch(
    `
    *[_type == "contactForm" && _id == $id][0] {
      _id,
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      supportNumber,
      status,
      timestamp,
      "fileUrl": file.asset->url
    }
  `,
    { id },
  )
}

// Status einer Kontaktanfrage aktualisieren
export async function updateContactInquiryStatus(id, status) {
  // Aktualisiere den Status
  const result = await client.patch(id).set({ status }).commit()

  // Erstelle eine Benachrichtigung über die Statusänderung
  const inquiry = await getContactInquiryById(id)

  if (inquiry) {
    await createNotification({
      title: `Kontaktanfrage Status: ${status}`,
      message: `Status der Anfrage ${inquiry.supportNumber} wurde auf "${status}" geändert.`,
      type: "contact_inquiry",
      relatedDocumentId: id,
      relatedDocumentType: "contactForm",
    })
  }

  return result
}

// Benachrichtigung erstellen
export async function createNotification({ title, message, type, relatedDocumentId, relatedDocumentType }) {
  return client.create({
    _type: "notification",
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
    relatedDocumentId,
    relatedDocumentType,
  })
}

// Benachrichtigungen abrufen
export async function getNotifications() {
  return client.fetch(`
    *[_type == "notification"] | order(createdAt desc) {
      _id,
      title,
      message,
      type,
      read,
      createdAt,
      relatedDocumentId,
      relatedDocumentType
    }
  `)
}

// Benachrichtigung als gelesen markieren
export async function markNotificationAsRead(id) {
  return client.patch(id).set({ read: true }).commit()
}

// Alle Benachrichtigungen als gelesen markieren
export async function markAllNotificationsAsRead() {
  // Hole alle ungelesenen Benachrichtigungen
  const unreadNotifications = await client.fetch(`
    *[_type == "notification" && read == false]._id
  `)

  // Wenn keine ungelesenen Benachrichtigungen vorhanden sind, beende die Funktion
  if (unreadNotifications.length === 0) {
    return { success: true, message: "Keine ungelesenen Benachrichtigungen vorhanden" }
  }

  // Erstelle ein Array von Transaktionen, um alle Benachrichtigungen zu aktualisieren
  const transactions = unreadNotifications.map((id) => client.patch(id).set({ read: true }))

  // Führe alle Transaktionen aus
  await Promise.all(transactions.map((tx) => tx.commit()))

  return {
    success: true,
    message: `${unreadNotifications.length} Benachrichtigungen als gelesen markiert`,
  }
}

// Füge eine Funktion hinzu, um Benachrichtigungen für neue Kontaktanfragen zu erstellen
export async function createContactInquiryNotification(inquiry) {
  return createNotification({
    title: "Neue Kontaktanfrage",
    message: `Neue Kontaktanfrage von ${inquiry.firstName} ${inquiry.lastName}: ${inquiry.subject}`,
    type: "contact_inquiry",
    relatedDocumentId: inquiry._id,
    relatedDocumentType: "contactForm",
  })
}
