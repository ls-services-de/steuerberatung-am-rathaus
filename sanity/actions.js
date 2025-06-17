"use server"

import { client, generateUniqueKey, generatePassword, generateCustomerNumber, parseFormText } from "./lib"
import { revalidatePath } from "next/cache"

// Authentication
export async function loginUser(email, password) {
  try {
    const query = `*[_type == "userForm" && email == $email][0]`
    const userData = await client.fetch(query, { email })

    if (userData && userData.password === password) {
      return { success: true, user: userData }
    } else {
      return { success: false, error: "Ungültige Anmeldeinformationen" }
    }
  } catch (error) {
    console.error("Login failed:", error)
    return { success: false, error: "Anmeldung fehlgeschlagen" }
  }
}

// Customer Management
export async function getCustomers() {
  try {
    return await client.fetch(`
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
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function createCustomer(formData) {
  try {
    const firstName = formData.get("firstName")
    const lastName = formData.get("lastName")
    const email = formData.get("email")

    const newCustomer = {
      _type: "userForm",
      firstName,
      lastName,
      email,
      password: generatePassword(),
      kundennummer: generateCustomerNumber(),
      isAdmin: false,
      assignedForms: [],
      ausgefuellteformulare: [],
      uploadedFiles: [],
      categories: [],
    }

    const result = await client.create(newCustomer)
    revalidatePath("/admin")
    return { success: true, customer: result }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { success: false, error: error.message }
  }
}

export async function updateCustomer(customerId, formData) {
  try {
    const firstName = formData.get("firstName")
    const lastName = formData.get("lastName")
    const email = formData.get("email")

    const result = await client
      .patch(customerId)
      .set({
        firstName,
        lastName,
        email,
      })
      .commit()

    revalidatePath("/admin")
    return { success: true, customer: result }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteCustomer(customerId) {
  try {
    await client.delete(customerId)
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { success: false, error: error.message }
  }
}

// Form Management
export async function getUserAssignedForms(userId) {
  try {
    const user = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        assignedForms
      }`,
      { userId },
    )

    if (!user?.assignedForms || !Array.isArray(user.assignedForms)) {
      return []
    }

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
  } catch (error) {
    console.error("Error fetching user forms:", error)
    return []
  }
}

export async function assignFormTextToUser(userId, formText) {
  try {
    const result = await client
      .patch(userId)
      .setIfMissing({ assignedForms: [] })
      .append("assignedForms", [formText])
      .commit()

    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error assigning form:", error)
    return { success: false, error: error.message }
  }
}

export async function removeFormTextFromUser(userId, formIndex) {
  try {
    const user = await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        assignedForms
      }`,
      { userId },
    )

    if (!user?.assignedForms) return { success: false, error: "No forms found" }

    const updatedForms = user.assignedForms.filter((_, index) => index !== formIndex)

    const result = await client.patch(userId).set({ assignedForms: updatedForms }).commit()
    revalidatePath("/admin")
    revalidatePath("/customer")
    return { success: true, result }
  } catch (error) {
    console.error("Error removing form:", error)
    return { success: false, error: error.message }
  }
}

export async function getCompletedForms(userId) {
  try {
    return await client.fetch(
      `*[_type == "userForm" && _id == $userId][0]{
        ausgefuellteformulare,
        uploadedFiles
      }`,
      { userId },
    )
  } catch (error) {
    console.error("Error fetching completed forms:", error)
    return { ausgefuellteformulare: [], uploadedFiles: [] }
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
    console.error("Error fetching uploaded files:", error)
    return []
  }
}

// Notifications
export async function getNotifications() {
  try {
    return await client.fetch(`
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
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

export async function createNotification(data) {
  try {
    const result = await client.create({
      _type: "notification",
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      createdAt: new Date().toISOString(),
      relatedDocumentId: data.relatedDocumentId,
      relatedDocumentType: data.relatedDocumentType,
    })

    revalidatePath("/admin")
    return { success: true, notification: result }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: error.message }
  }
}

export async function markNotificationAsRead(id) {
  try {
    const result = await client.patch(id).set({ read: true }).commit()
    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: error.message }
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const unreadNotifications = await client.fetch(`
      *[_type == "notification" && read == false]._id
    `)

    if (unreadNotifications.length === 0) {
      return { success: true, message: "Keine ungelesenen Benachrichtigungen vorhanden" }
    }

    const transactions = unreadNotifications.map((id) => client.patch(id).set({ read: true }))
    await Promise.all(transactions.map((tx) => tx.commit()))

    revalidatePath("/admin")
    return {
      success: true,
      message: `${unreadNotifications.length} Benachrichtigungen als gelesen markiert`,
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error: error.message }
  }
}

// Contact Inquiries
export async function getContactInquiries() {
  try {
    return await client.fetch(`
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
  } catch (error) {
    console.error("Error fetching contact inquiries:", error)
    return []
  }
}

export async function updateContactInquiryStatus(id, status) {
  try {
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

    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error updating inquiry status:", error)
    return { success: false, error: error.message }
  }
}

// Appointments
export async function getAppointments() {
  try {
    return await client.fetch(`*[_type == "appointment"] | order(uhrzeit desc) {
      _id,
      name,
      phone,
      email,
      uhrzeit,
      link
    }`)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return []
  }
}

// Categories
export async function getCategories() {
  try {
    return await client.fetch(`*[_type == "category"] | order(name asc) {
      _id,
      name
    }`)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createCategory(name) {
  try {
    const newCategory = {
      _type: "category",
      name: name,
    }

    const result = await client.create(newCategory)
    revalidatePath("/admin")
    return { success: true, category: result }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: error.message }
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
      return { success: false, error: "Kunde ist bereits dieser Kategorie zugeordnet" }
    }

    const result = await client
      .patch(customerId)
      .setIfMissing({ categories: [] })
      .append("categories", [{ _type: "reference", _ref: categoryId, _key: generateUniqueKey() }])
      .commit()

    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error assigning category:", error)
    return { success: false, error: error.message }
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
      return { success: false, error: "Kunde ist keiner Kategorie zugeordnet" }
    }

    const updatedCategories = customer.categories.filter((cat) => cat._ref !== categoryId)

    const result = await client.patch(customerId).set({ categories: updatedCategories }).commit()
    revalidatePath("/admin")
    return { success: true, result }
  } catch (error) {
    console.error("Error removing from category:", error)
    return { success: false, error: error.message }
  }
}