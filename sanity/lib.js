import sanityClient from "@sanity/client"
import { jsPDF } from "jspdf"
import "jspdf-autotable" // Für bessere Tabellen

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
  return client.fetch(`*[_type == "form"]{
    _id,
    title,
    questions
  }`)
}

export async function getAppointments() {
  return client.fetch(`*[_type == "appointment"] | order(uhrzeit desc) {
    _id,
    name,
    phone,
    email,
    uhrzeit,
    link
  }`)
}

export async function getAssignedForms(userId) {
  return client.fetch(
    `
    *[_type == "userForm" && _id == $userId][0]{
      "assignedForms": assignedForms[]->{
        _id,
        title,
        questions
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
      ausgefuellteformulare,
      uploadedFiles
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

// Neue Funktion zum Hochladen von Dateien zu Sanity
export async function uploadFileToSanity(file) {
  try {
    if (!file) {
      throw new Error("Keine Datei zum Hochladen bereitgestellt")
    }

    // Konvertiere die Datei in einen Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Lade die Datei zu Sanity hoch
    const uploadedAsset = await client.assets.upload("file", buffer, {
      filename: file.name,
      contentType: file.type,
    })

    return {
      fileId: uploadedAsset._id,
      url: uploadedAsset.url,
      fileName: file.name,
    }
  } catch (error) {
    console.error("Fehler beim Hochladen der Datei zu Sanity:", error)
    throw new Error(`Fehler beim Hochladen der Datei: ${error.message}`)
  }
}

// Neue Funktion zum Hochladen einer Datei und Zuordnen zum Benutzer
export async function uploadFileAndAssignToUser(userId, file, questionIndex, formId) {
  try {
    // Datei zu Sanity hochladen
    const uploadResult = await uploadFileToSanity(file)

    // Erstelle ein Datei-Objekt für den Benutzer
    const fileObject = {
      _key: generateUniqueKey(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      formId: formId,
      questionIndex: questionIndex,
      uploadDate: new Date().toISOString(),
      asset: {
        _type: "reference",
        _ref: uploadResult.fileId,
      },
    }

    // Füge die Datei zum Benutzer hinzu (uploadedFiles für Tracking)
    await client.patch(userId).setIfMissing({ uploadedFiles: [] }).append("uploadedFiles", [fileObject]).commit()

    // Füge die Datei auch direkt zu ausgefuellteformulare hinzu
    await client
      .patch(userId)
      .setIfMissing({ ausgefuellteformulare: [] })
      .append("ausgefuellteformulare", [
        {
          _type: "file",
          _key: generateUniqueKey(),
          asset: {
            _type: "reference",
            _ref: uploadResult.fileId,
          },
        },
      ])
      .commit()

    return {
      ...uploadResult,
      key: fileObject._key,
    }
  } catch (error) {
    console.error("Fehler beim Hochladen und Zuordnen der Datei:", error)
    throw new Error(`Fehler beim Hochladen und Zuordnen der Datei: ${error.message}`)
  }
}

// Funktion zum Abrufen der hochgeladenen Dateien eines Benutzers
export async function getUserUploadedFiles(userId) {
  try {
    const result = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        uploadedFiles[] {
          _key,
          fileName,
          fileType,
          fileSize,
          formId,
          questionIndex,
          uploadDate,
          "url": asset->url
        }
      }`,
      { userId },
    )

    return result?.uploadedFiles || []
  } catch (error) {
    console.error("Fehler beim Abrufen der hochgeladenen Dateien:", error)
    return []
  }
}

// Kategorie-Funktionen
export async function getCategories() {
  try {
    return client.fetch(`*[_type == "category"] | order(name asc) {
      _id,
      name
    }`)
  } catch (error) {
    console.error("Fehler beim Abrufen der Kategorien:", error)
    return []
  }
}

export async function createCategory(name) {
  try {
    const newCategory = {
      _type: "category",
      name: name,
    }

    return client.create(newCategory)
  } catch (error) {
    console.error("Fehler beim Erstellen der Kategorie:", error)
    throw new Error(`Fehler beim Erstellen der Kategorie: ${error.message}`)
  }
}

export async function assignCustomerToCategory(customerId, categoryId) {
  try {
    const customer = await client.fetch(
      `*[_type == "userForm" && _id == $customerId][0]{
        categories
      }`,
      { customerId },
    )

    // Prüfen, ob der Kunde bereits in dieser Kategorie ist
    if (customer.categories && customer.categories.some((cat) => cat._ref === categoryId)) {
      return { alreadyAssigned: true }
    }

    return client
      .patch(customerId)
      .setIfMissing({ categories: [] })
      .append("categories", [{ _type: "reference", _ref: categoryId, _key: generateUniqueKey() }])
      .commit()
  } catch (error) {
    console.error("Fehler beim Zuweisen der Kategorie:", error)
    throw new Error(`Fehler beim Zuweisen der Kategorie: ${error.message}`)
  }
}

export async function removeCustomerFromCategory(customerId, categoryId) {
  try {
    const customer = await client.fetch(
      `*[_type == "userForm" && _id == $customerId][0]{
        categories
      }`,
      { customerId },
    )

    if (!customer.categories) {
      return { notAssigned: true }
    }

    const updatedCategories = customer.categories.filter((cat) => cat._ref !== categoryId)

    return client.patch(customerId).set({ categories: updatedCategories }).commit()
  } catch (error) {
    console.error("Fehler beim Entfernen aus der Kategorie:", error)
    throw new Error(`Fehler beim Entfernen aus der Kategorie: ${error.message}`)
  }
}

// Verbesserte PDF-Generierungsfunktion mit jsPDF für die neue Formularstruktur
export async function generatePDF(form, answers, user, uploadedFileRefs = []) {
  // Erstelle ein neues PDF-Dokument
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Definiere Farben
  const primaryColor = [227 / 255, 218 / 255, 201 / 255] // #E3DAC9
  const textColor = [50 / 255, 50 / 255, 50 / 255] // Dunkelgrau
  const accentColor = [180 / 255, 170 / 255, 150 / 255] // Etwas dunklere Variante von primaryColor

  // Füge Header hinzu
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 30, "F")

  // Füge Titel im Header hinzu
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("Formular-Dokumentation", 105, 15, { align: "center" })

  // Füge Datum und Formular-ID hinzu
  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Datum: ${new Date().toLocaleDateString("de-DE")}`, 20, 40)
  doc.text(`Formular-ID: ${form._id}`, 20, 45)

  // Füge Benutzerinformationen hinzu
  doc.setFillColor(...accentColor)
  doc.rect(0, 50, 210, 20, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Kundeninformationen", 105, 62, { align: "center" })

  doc.setTextColor(...textColor)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 80)
  doc.text(`Kundennummer: ${user.kundennummer || "Nicht angegeben"}`, 20, 87)
  doc.text(`E-Mail: ${user.email || "Nicht angegeben"}`, 20, 94)

  // Füge Formularüberschrift hinzu
  doc.setFillColor(...primaryColor)
  doc.rect(0, 105, 210, 15, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(`Formular: ${form.title || "Ohne Titel"}`, 105, 114, { align: "center" })

  // Füge Formularantworten hinzu
  doc.setTextColor(...textColor)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Antworten:", 20, 130)

  let yPosition = 140

  // Iteriere durch alle Fragen und Antworten
  if (form.questions && form.questions.length > 0) {
    for (let index = 0; index < form.questions.length; index++) {
      const question = form.questions[index]

      // Prüfe, ob genug Platz auf der Seite ist, sonst neue Seite
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20

        // Füge Header auf der neuen Seite hinzu
        doc.setFillColor(...primaryColor)
        doc.rect(0, 0, 210, 15, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Formular-Dokumentation (Fortsetzung)", 105, 10, { align: "center" })

        doc.setTextColor(...textColor)
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Antworten (Fortsetzung):", 20, yPosition)
        yPosition += 10
      }

      // Frage
      doc.setFont("helvetica", "bold")
      doc.text(`Frage ${index + 1}: ${question.questionText}`, 20, yPosition)
      yPosition += 7

      // Antwort
      doc.setFont("helvetica", "normal")
      const answerKey = `question_${index}`
      const fileKey = `file_${index}`
      let answerText = "Keine Antwort"

      if (question.questionType === "fileUpload" && answers[fileKey]) {
        // Für Datei-Uploads
        const fileInfo = answers[fileKey]
        answerText = `Datei hochgeladen: ${fileInfo.fileName || "Datei"}`
        doc.text(`Antwort: ${answerText}`, 25, yPosition)
        yPosition += 7

        // Füge Link zur Datei hinzu, wenn verfügbar
        const fileRef = uploadedFileRefs.find((ref) => ref.questionIndex === index)
        if (fileRef && fileRef.url) {
          doc.setTextColor(0, 0, 255)
          doc.text(`Link zur Datei: ${fileRef.url}`, 25, yPosition)
          doc.setTextColor(...textColor)
        } else {
          doc.text("(Datei wurde separat hochgeladen)", 25, yPosition)
        }
        yPosition += 10
      } else if (answers[answerKey] !== undefined) {
        if (Array.isArray(answers[answerKey])) {
          // Für Checkbox-Antworten
          if (answers[answerKey].length === 0) {
            answerText = "Keine Option ausgewählt"
          } else {
            answerText = answers[answerKey].join(", ")
          }
        } else {
          answerText = answers[answerKey].toString()
        }
        doc.text(`Antwort: ${answerText}`, 25, yPosition)
        yPosition += 10
      } else {
        doc.text(`Antwort: ${answerText}`, 25, yPosition)
        yPosition += 10
      }

      // Füge eine Trennlinie hinzu
      doc.setDrawColor(...accentColor)
      doc.line(20, yPosition, 190, yPosition)
      yPosition += 7
    }
  } else if (form.frageeins && form.fragezwei) {
    // Fallback für alte Formularstruktur
    doc.setFont("helvetica", "bold")
    doc.text(`Frage 1: ${form.frageeins}`, 20, yPosition)
    yPosition += 7

    doc.setFont("helvetica", "normal")
    doc.text(`Antwort 1: ${answers.frageeins || "Keine Antwort"}`, 25, yPosition)
    yPosition += 10

    // Trennlinie
    doc.setDrawColor(...accentColor)
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 7

    doc.setFont("helvetica", "bold")
    doc.text(`Frage 2: ${form.fragezwei}`, 20, yPosition)
    yPosition += 7

    doc.setFont("helvetica", "normal")
    doc.text(`Antwort 2: ${answers.fragezwei || "Keine Antwort"}`, 25, yPosition)
    yPosition += 10
  }

  // Füge Abschnitt für hochgeladene Dateien hinzu
  if (uploadedFileRefs && uploadedFileRefs.length > 0) {
    // Prüfe, ob genug Platz auf der Seite ist, sonst neue Seite
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20

      // Füge Header auf der neuen Seite hinzu
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 210, 15, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Formular-Dokumentation (Fortsetzung)", 105, 10, { align: "center" })
      yPosition += 15
    }

    doc.setTextColor(...textColor)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Hochgeladene Dateien:", 20, yPosition)
    yPosition += 10

    // Liste aller hochgeladenen Dateien
    doc.setFont("helvetica", "normal")
    for (const file of uploadedFileRefs) {
      const fileInfo = `${file.fileName || "Datei"} (${file.fileType || "Unbekannter Typ"})`
      doc.text(`• ${fileInfo}`, 25, yPosition)
      yPosition += 7

      if (file.url) {
        doc.setTextColor(0, 0, 255)
        doc.text(`  Link: ${file.url}`, 25, yPosition)
        doc.setTextColor(...textColor)
        yPosition += 10
      } else {
        yPosition += 3
      }
    }
  }

  // Füge Fußzeile hinzu
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Fußzeile mit Seitenzahl
    doc.setFillColor(...primaryColor)
    doc.rect(0, 280, 210, 17, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Seite ${i} von ${pageCount}`, 105, 290, { align: "center" })
    doc.text(`Erstellt am: ${new Date().toLocaleString("de-DE")}`, 20, 290)
  }

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

// Aktualisiere die submitCompletedForm Funktion für die neue Formularstruktur
export async function submitCompletedForm(userId, form, answers, fileUploads = {}) {
  try {
    // Hole Benutzerinformationen und hochgeladene Dateien
    const user = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        firstName,
        lastName,
        email,
        kundennummer,
        uploadedFiles[] {
          _key,
          fileName,
          fileType,
          fileSize,
          formId,
          questionIndex,
          "url": asset->url
        }
      }`,
      { userId },
    )

    // Sammle Informationen über hochgeladene Dateien für das PDF
    // Filtere nur die Dateien, die zu diesem Formular gehören
    const uploadedFileRefs = (user.uploadedFiles || []).filter((file) => file.formId === form._id)

    // Generiere und lade das PDF hoch
    const pdfFile = await generatePDF(form, answers, user, uploadedFileRefs)

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

    // Erstelle eine Benachrichtigung mit Kundenname
    await createNotification({
      title: "Formular ausgefüllt",
      message: `Ein Formular wurde von ${user.firstName} ${user.lastName} ausgefüllt: ${form.title || form.frageeins || "Formular"}`,
      type: "form_completed",
      relatedDocumentId: userId,
      relatedDocumentType: "userForm",
    })

    return result
  } catch (error) {
    console.error("Fehler beim Einreichen des Formulars:", error)
    throw new Error(`Fehler beim Einreichen des Formulars: ${error.message}`)
  }
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
