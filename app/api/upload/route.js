import { NextResponse } from "next/server"
import { client, generateUniqueKey } from "@/sanity/lib"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const userId = formData.get("userId")
    const questionIndex = formData.get("questionIndex")
    const formId = formData.get("formId")

    if (!file || !userId || !questionIndex || !formId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload file to Sanity
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadedAsset = await client.assets.upload("file", buffer, {
      filename: file.name,
      contentType: file.type,
    })

    // Create file object
    const fileObject = {
      _key: generateUniqueKey(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      formId: formId,
      questionIndex: Number.parseInt(questionIndex),
      uploadDate: new Date().toISOString(),
      asset: {
        _type: "reference",
        _ref: uploadedAsset._id,
      },
    }

    // Add to user's uploaded files
    await client.patch(userId).setIfMissing({ uploadedFiles: [] }).append("uploadedFiles", [fileObject]).commit()

    return NextResponse.json({
      success: true,
      fileId: uploadedAsset._id,
      url: uploadedAsset.url,
      fileName: file.name,
      key: fileObject._key,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
