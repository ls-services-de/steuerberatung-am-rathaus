import { client } from "@/sanity/lib"
import formidable from "formidable"
import fs from "fs"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const form = new formidable.IncomingForm()

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err)
          res.status(500).json({ error: "Error parsing form" })
          return resolve(true)
        }

        const file = files.file

        if (!file) {
          res.status(400).json({ error: "No file uploaded" })
          return resolve(true)
        }

        try {
          // Read the file
          const fileData = fs.readFileSync(file.filepath)

          // Upload to Sanity
          const uploadedAsset = await client.assets.upload("file", fileData, {
            filename: file.originalFilename,
            contentType: file.mimetype,
          })

          res.status(200).json({
            fileId: uploadedAsset._id,
            url: uploadedAsset.url,
            fileName: file.originalFilename,
          })
          return resolve(true)
        } catch (error) {
          console.error("Error uploading file to Sanity:", error)
          res.status(500).json({ error: "Error uploading file" })
          return resolve(true)
        }
      })
    })
  } catch (error) {
    console.error("Error handling file upload:", error)
    return res.status(500).json({ error: "Error handling file upload" })
  }
}
