import { createClient } from "@sanity/client"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Initialize Sanity client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-11-21",
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
})

// Helper function to generate a unique key
export function generateUniqueKey() {
  return Math.random().toString(36).substring(2, 15)
}

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
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}${randomNum}`
}

// Parse form text into structured form object
export function parseFormText(formText) {
  if (!formText) return null

  try {
    // Try to parse as JSON first
    return JSON.parse(formText)
  } catch {
    // If not JSON, parse as structured text
    const lines = formText.split("\n").filter((line) => line.trim())
    const form = {
      title: lines[0] || "Formular",
      questions: [],
    }

    let currentQuestion = null

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith("FRAGE:")) {
        if (currentQuestion) {
          form.questions.push(currentQuestion)
        }
        currentQuestion = {
          questionText: line.replace("FRAGE:", "").trim(),
          questionType: "text",
          required: false,
          options: [],
        }
      } else if (line.startsWith("TYP:")) {
        if (currentQuestion) {
          currentQuestion.questionType = line.replace("TYP:", "").trim()
        }
      } else if (line.startsWith("PFLICHT:")) {
        if (currentQuestion) {
          currentQuestion.required = line.replace("PFLICHT:", "").trim().toLowerCase() === "ja"
        }
      } else if (line.startsWith("OPTIONEN:")) {
        if (currentQuestion) {
          const options = line
            .replace("OPTIONEN:", "")
            .trim()
            .split(",")
            .map((opt) => opt.trim())
          currentQuestion.options = options
        }
      }
    }

    if (currentQuestion) {
      form.questions.push(currentQuestion)
    }

    return form
  }
}

// Get user's assigned forms (now stored as text)
export async function getUserAssignedForms(userId) {
  const user = await client.fetch(
    `*[_type == "userForm" && _id == $userId][0]{
      assignedForms
    }`,
    { userId },
  )

  if (!user?.assignedForms || !Array.isArray(user.assignedForms)) {
    return []
  }

  // Parse each form text into structured form
  return user.assignedForms
    .map((formText, index) => {
      const parsedForm = parseFormText(formText)
      if (parsedForm) {
        return {
          _id: `form_${index}`,
          ...parsedForm,
        }
      }
      return null
    })
    .filter(Boolean)
}

export async function getCompletedForms(userId) {
  return client.fetch(
    `*[_type == "userForm" && _id == $userId][0]{
      ausgefuellteformulare,
      uploadedFiles
    }`,
    { userId },
  )
}

// Add form text to user
export async function assignFormTextToUser(userId, formText) {
  return client.patch(userId).setIfMissing({ assignedForms: [] }).append("assignedForms", [formText]).commit()
}

// Remove form text from user
export async function removeFormTextFromUser(userId, formIndex) {
  const user = await client.fetch(
    `*[_type == "userForm" && _id == $userId][0]{
      assignedForms
    }`,
    { userId },
  )

  if (!user?.assignedForms) return

  const updatedForms = user.assignedForms.filter((_, index) => index !== formIndex)

  return client.patch(userId).set({ assignedForms: updatedForms }).commit()
}

// File upload functions
export async function uploadFileToSanity(file) {
  try {
    if (!file) {
      throw new Error("Keine Datei zum Hochladen bereitgestellt")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

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

export async function uploadFileAndAssignToUser(userId, file, questionIndex, formId) {
  try {
    const uploadResult = await uploadFileToSanity(file)

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

    await client.patch(userId).setIfMissing({ uploadedFiles: [] }).append("uploadedFiles", [fileObject]).commit()

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

// PDF generation function
export async function generatePDF(form, answers, user, uploadedFileRefs = []) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const primaryColor = [227 / 255, 218 / 255, 201 / 255]
  const textColor = [50 / 255, 50 / 255, 50 / 255]
  const accentColor = [180 / 255, 170 / 255, 150 / 255]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 30, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("Formular-Dokumentation", 105, 15, { align: "center" })

  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Datum: ${new Date().toLocaleDateString("de-DE")}`, 20, 40)
  doc.text(`Formular-ID: ${form._id}`, 20, 45)

  // User information
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

  // Form title
  doc.setFillColor(...primaryColor)
  doc.rect(0, 105, 210, 15, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(`Formular: ${form.title || "Ohne Titel"}`, 105, 114, { align: "center" })

  // Form answers
  doc.setTextColor(...textColor)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Antworten:", 20, 130)

  let yPosition = 140

  if (form.questions && form.questions.length > 0) {
    for (let index = 0; index < form.questions.length; index++) {
      const question = form.questions[index]

      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20

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

      doc.setFont("helvetica", "bold")
      doc.text(`Frage ${index + 1}: ${question.questionText}`, 20, yPosition)
      yPosition += 7

      doc.setFont("helvetica", "normal")
      const answerKey = `question_${index}`
      const fileKey = `file_${index}`
      let answerText = "Keine Antwort"

      if (question.questionType === "fileUpload" && answers[fileKey]) {
        const fileInfo = answers[fileKey]
        answerText = `Datei hochgeladen: ${fileInfo.fileName || "Datei"}`
        doc.text(`Antwort: ${answerText}`, 25, yPosition)
        yPosition += 7

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

      doc.setDrawColor(...accentColor)
      doc.line(20, yPosition, 190, yPosition)
      yPosition += 7
    }
  }

  // Uploaded files section
  if (uploadedFileRefs && uploadedFileRefs.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20

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

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    doc.setFillColor(...primaryColor)
    doc.rect(0, 280, 210, 17, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Seite ${i} von ${pageCount}`, 105, 290, { align: "center" })
    doc.text(`Erstellt am: ${new Date().toLocaleString("de-DE")}`, 20, 290)
  }

  const pdfBlob = doc.output("blob")
  const file = new File([pdfBlob], `formular_${form._id}_${Date.now()}.pdf`, { type: "application/pdf" })

  const uploadedAsset = await client.assets.upload("file", file, {
    filename: file.name,
    contentType: file.type,
  })

  return {
    assetId: uploadedAsset._id,
  }
}

export async function submitCompletedForm(userId, form, answers, fileUploads = {}) {
  try {
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

    const uploadedFileRefs = (user.uploadedFiles || []).filter((file) => file.formId === form._id)

    const pdfFile = await generatePDF(form, answers, user, uploadedFileRefs)

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

    await createNotification({
      title: "Formular ausgefüllt",
      message: `Ein Formular wurde von ${user.firstName} ${user.lastName} ausgefüllt: ${form.title || "Formular"}`,
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

export async function removeFormAfterCompletion(userId, formIndex) {
  return removeFormTextFromUser(userId, formIndex)
}

// Notification functions
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

export async function markNotificationAsRead(id) {
  return client.patch(id).set({ read: true }).commit()
}

export async function markAllNotificationsAsRead() {
  const unreadNotifications = await client.fetch(`
    *[_type == "notification" && read == false]._id
  `)

  if (unreadNotifications.length === 0) {
    return { success: true, message: "Keine ungelesenen Benachrichtigungen vorhanden" }
  }

  const transactions = unreadNotifications.map((id) => client.patch(id).set({ read: true }))
  await Promise.all(transactions.map((tx) => tx.commit()))

  return {
    success: true,
    message: `${unreadNotifications.length} Benachrichtigungen als gelesen markiert`,
  }
}

// Contact inquiry functions
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

export async function updateContactInquiryStatus(id, status) {
  const result = await client.patch(id).set({ status }).commit()

  const inquiry = await client.fetch(
    `*[_type == "contactForm" && _id == $id][0] {
      _id,
      firstName,
      lastName,
      supportNumber
    }`,
    { id },
  )

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

// Categories
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

// Customer management functions
export async function getCustomers() {
  return client.fetch(`
    *[_type == "userForm"] | order(firstName asc) {
      _id,
      firstName,
      lastName,
      email,
      kundennummer,
      password,
      isAdmin,
      assignedForms,
      ausgefuellteformulare,
      uploadedFiles,
      categories[]-> {
        _id,
        name
      }
    }
  `)
}

export async function createCustomer(customerData) {
  const newCustomer = {
    _type: "userForm",
    firstName: customerData.firstName,
    lastName: customerData.lastName,
    email: customerData.email,
    password: customerData.password || generatePassword(),
    kundennummer: generateCustomerNumber(),
    isAdmin: false,
    assignedForms: [],
    ausgefuellteformulare: [],
    uploadedFiles: [],
    categories: [],
  }

  return client.create(newCustomer)
}

export async function updateCustomer(customerId, customerData) {
  return client.patch(customerId).set(customerData).commit()
}

export async function deleteCustomer(customerId) {
  return client.delete(customerId)
}