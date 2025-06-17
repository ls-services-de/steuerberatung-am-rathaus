import { NextResponse } from "next/server"
import { client, generateUniqueKey } from "@/sanity/lib"
import { createNotification } from "@/sanity/actions"

export async function POST(request) {
  try {
    const { userId, form, answers, fileUploads } = await request.json()

    // Get user data
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

    // Generate PDF
    const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        form,
        answers,
        user,
        uploadedFileRefs,
      }),
    })

    const pdfResult = await pdfResponse.json()

    if (!pdfResult.success) {
      throw new Error("PDF generation failed")
    }

    // Add completed form to user
    const result = await client
      .patch(userId)
      .setIfMissing({ ausgefuellteformulare: [] })
      .append("ausgefuellteformulare", [
        {
          _type: "file",
          _key: generateUniqueKey(),
          asset: {
            _type: "reference",
            _ref: pdfResult.assetId,
          },
        },
      ])
      .commit()

    // Create notification
    await createNotification({
      title: "Formular ausgefüllt",
      message: `Ein Formular wurde von ${user.firstName} ${user.lastName} ausgefüllt: ${form.title || "Formular"}`,
      type: "form_completed",
      relatedDocumentId: userId,
      relatedDocumentType: "userForm",
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Form submission error:", error)
    return NextResponse.json({ error: "Form submission failed" }, { status: 500 })
  }
}