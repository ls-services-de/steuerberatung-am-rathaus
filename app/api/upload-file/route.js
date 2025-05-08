import { uploadFileToSanity } from "@/sanity/lib"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 })
    }

    // Verwende die Funktion aus der lib.js
    const result = await uploadFileToSanity(file)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Fehler beim Hochladen der Datei:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
