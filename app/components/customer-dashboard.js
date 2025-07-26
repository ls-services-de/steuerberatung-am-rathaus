"use client"

import { useState, useEffect, useRef } from "react"
import {
  getUserAssignedForms,
  getCompletedForms,
  removeFormAfterCompletion,
  uploadFileAndAssignToUser,
  getUserUploadedFiles,
} from "@/sanity/lib"

import { jsPDF } from "jspdf"
import "jspdf-autotable"

import { client } from "@/sanity/lib"
import { generateUniqueKey } from "@/sanity/lib"

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} kundennummer
 */

/**
 * @typedef {Object} CustomerDashboardProps
 * @property {User} user
 * @property {() => void} onLogout
 */

export default function ImprovedCustomerDashboard({ user, onLogout }) {
  const [assignedForms, setAssignedForms] = useState([])
  const [completedForms, setCompletedForms] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentForm, setCurrentForm] = useState(null)
  const [formAnswers, setFormAnswers] = useState({})
  const [fileUploads, setFileUploads] = useState({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [showPartnerFields, setShowPartnerFields] = useState(false)
  const [numberOfChildren, setNumberOfChildren] = useState(0)
  const formTopRef = useRef(null)

  const baseChildQuestions = [
    { questionText: "Name des Kindes", questionType: "text", required: true },
    { questionText: "Geburtsdatum des Kindes", questionType: "date", required: true },
    { questionText: "Steuer-ID des Kindes", questionType: "text", required: true },
    { questionText: "Abweichender Elternteil (Name, Geburtsdatum, Anschrift)", questionType: "text", required: false },
    { questionText: "Kindergeldbezug", questionType: "multipleChoice", options: ["Ja", "Nein"], required: false },
    {
      questionText: "Schwerbehinderung / Pflegegrad beim Kind?",
      questionType: "multipleChoice",
      options: ["Ja", "Nein"],
      required: false,
    },
    { questionText: "Alleinerziehend", questionType: "multipleChoice", options: ["Ja", "Nein"], required: false },
    {
      questionText: "Volljähriges Kind in Ausbildung / Studium",
      questionType: "multipleChoice",
      options: ["Ja", "Nein"],
      required: false,
    },
    {
      questionText: "Angabe zur Wohnsituation",
      questionType: "multipleChoice",
      options: ["bei den Eltern", "auswärtig"],
      required: false,
    },
  ]

  // Enhanced dynamic question mapping system
  const createDynamicQuestionLabel = (key) => {
    const cleanKey = key.startsWith("question_") ? key.replace("question_", "") : key

    const questionTemplates = {
      // Arbeitsverhältnisse (job)
      job: {
        base: [
          "Name des Arbeitgebers",
          "Ausgeübte Tätigkeit",
          "Anschrift der Arbeitsstätte (Straße, PLZ, Ort)",
          "Beginn des Arbeitsverhältnisses",
          "Ende des Arbeitsverhältnisses (optional)",
          "Lohnsteuerbescheinigung vorhanden?",
          "Gab es Unterbrechungen (z. B. Krankengeld, KUG)?",
          "Falls Ja: Art und Zeitraum",
        ],
        werbung: [
          "Werbungskosten-Pauschale von 1.230 € nutzen?",
          "Hat der Arbeitgeber eine erste Tätigkeitsstätte bestimmt?",
          "Arbeitstage pro Woche (durchschnittlich)",
          "Sonstiges (Arbeitstage)",
          "Tatsächliche Arbeitstage im Jahr",
          "Einfache Entfernung zur Arbeitsstätte (in km)",
          "Beförderungsmittel",
        ],
        fort: [
          "Bezeichnung der Fortbildung",
          "Zeitraum",
          "Teilnahmegebühren (€)",
          "Fahrtkosten: Entfernung (km)",
          "Beförderungsmittel",
          "Verpflegungsmehraufwand",
          "Übernachtungskosten (€)",
          "Arbeitgebererstattung erfolgt?",
          "Falls Ja, Details",
          "Upload: Teilnahme, Belege etc.",
        ],
        reise: [
          "Zweck der Reise",
          "Abreise",
          "Rückreise",
          "Ziel / Einsatzort",
          "Fahrtkosten",
          "Verpflegungsmehraufwand",
          "Übernachtungskosten (€)",
          "Mahlzeiten gestellt?",
          "Anzahl gestellter Mahlzeiten",
          "Arbeitgebererstattung erfolgt?",
          "Falls Ja, Details",
          "Upload: Belege, Abrechnungen",
        ],
        zusatz: [
          "Arbeitsmittel (Bezeichnung, Kaufpreis, Jahr)",
          "Arbeitszimmer / Homeoffice",
          "Homeoffice (Tage)",
          "Arbeitszimmer vorhanden",
          "Telefon / Internet beruflich genutzt (Anteil oder Betrag)",
          "Gewerkschafts-/Verbandsbeiträge",
          "Steuerberatungskosten für Vorjahr",
          "Berufskleidung / Reinigungskosten",
        ],
        upload: [
          "Upload – Lohnsteuerbescheinigung(en)",
          "Upload – Fortbildungsnachweise",
          "Upload – Reisekostenbelege",
          "Upload – Nachweise für Werbungskosten",
        ],
        freitext: ["Besondere Konstellationen, berufliche Wechsel, Auslandstätigkeit o. Ä."],
      },

      // Kinder
      child: [
        "Name des Kindes",
        "Geburtsdatum des Kindes",
        "Steuer-ID des Kindes",
        "Abweichender Elternteil (Name, Geburtsdatum, Anschrift)",
        "Kindergeldbezug",
        "Schwerbehinderung / Pflegegrad beim Kind?",
        "Upload: Schwerbehinderung / Pflegegrad Nachweis",
        "Alleinerziehend",
        "Angabe zur Beantragung des Entlastungsbetrags",
        "Volljähriges Kind in Ausbildung / Studium",
        "Angabe zur Wohnsituation",
      ],

      // Partner
      partner: [
        "Anrede des Ehepartners",
        "Vorname des Ehepartners",
        "Nachname des Ehepartners",
        "Geburtsdatum des Ehepartners",
        "Beruf / Tätigkeit des Ehepartners",
        "Steuer-ID des Ehepartners",
        "Telefon des Ehepartners",
        "Nationalität des Ehepartners",
        "Religion des Ehepartners",
        "E-Mail-Adresse des Ehepartners",
        "Schwerbehinderung / Pflegegrad beim Ehepartner?",
      ],

      // Kapitalerträge
      kapital: {
        base: [
          "Name des Kreditinstituts / der Plattform",
          "Art der Erträge",
          "Wurden Kapitalerträge nach §43a EStG einbehalten?",
          "Liegt eine Jahressteuerbescheinigung vor?",
          "Wurde ein Freistellungsauftrag gestellt?",
          "Höhe des Freistellungsauftrags (in €)",
          "Wurden Verluste bescheinigt / verrechnet?",
          "Upload: Jahressteuerbescheinigung",
        ],
        weitere: [
          "Handelt es sich um Kapitalerträge aus dem Ausland?",
          "Falls Ja: Land, Art der Erträge und Höhe",
          "Upload: Steuerbescheinigung / Ertragsnachweis",
          "Zinsen aus privat vergebenen Darlehen erhalten?",
          "Darlehensnehmer",
          "Höhe der Zinserträge (in €)",
          "Besteht ein schriftlicher Darlehensvertrag?",
          "Upload: Darlehensvertrag / Zinsnachweis",
        ],
      },

      // Veräußerungsgeschäfte
      veraeusserung: {
        base: [
          "Art des Wirtschaftsguts",
          "Sonstiges (Art des Wirtschaftsguts)",
          "Datum Anschaffung",
          "Datum Veräußerung",
          "Veräußerungserlös (€)",
          "Anschaffungskosten + Nebenkosten (€)",
          "Wertsteigerungsmaßnahmen / Renovierungen durchgeführt?",
          "Vermittlungsgebühren / Notarkosten gezahlt?",
          "Wurde das Objekt selbst genutzt?",
          "Zeitraum Eigennutzung",
          "Upload: Kaufvertrag, Verkaufsunterlagen, Kostenbelege",
        ],
      },

      // Krypto
      krypto: {
        base: ["Name der Plattform / Wallet", "Upload: vollständige Transaktionslisten, Reports"],
      },

      // Immobilien/Miete
      miete: {
        grunddaten: [
          "Handelt es sich um eine erstmalige Vermietung / Neuanschaffung?",
          "Kaufpreis (€)",
          "Notarkosten (€)",
          "Grundbuchkosten (€)",
          "Maklerprovision (€)",
          "Weitere Erwerbsnebenkosten (€)",
          "Anschaffungsnahe Herstellungskosten (€)",
          "Baujahr des Gebäudes",
          "Gesamtfläche des Objekts (m²)",
          "Wohnfläche der Einheit (m²)",
          "Anzahl / Art Stellplätze",
          "Anzahl Stellplätze",
          "Aktuelle AfA-Bemessungsgrundlage (€)",
          "Bisherige Abschreibungen insgesamt (€)",
          "Einheitswert-Aktenzeichen (Grundsteuer)",
          "Anschaffungs- oder Fertigstellungszeitpunkt",
          "Wurde die Immobilie im VZ veräußert?",
        ],
        objekt: [
          "Objektbezeichnung",
          "Objektart",
          "Eigentumsverhältnis",
          "Miteigentumsanteil (%)",
          "Straße",
          "PLZ / Ort",
        ],
        nutzung: [
          "Anzahl vermieteter Einheiten",
          "Nutzung durch",
          "Miete entspricht ortsüblicher Miete?",
          "Leerstand im VZ?",
          "Dauer & Grund des Leerstands",
        ],
        einnahmen: [
          "Bezeichnung der Einheit / Lage",
          "Wohnfläche (m²)",
          "Mieteinnahmen ohne Umlagen (€)",
          "Umlagen (Nebenkosten) (€)",
          "Wurden Kautionen mit Forderungen verrechnet?",
          "Einnahmen aus Garagen / Stellplätzen (€)",
          "Einnahmen aus Werbeflächen (€)",
          "Kurzzeitvermietung (z. B. Airbnb)?",
          "Upload: Mietverträge, Einnahmenübersicht, Kontoauszüge",
        ],
        werbungskosten: [
          "AfA-Bemessungsgrundlage (€)",
          "Abschreibungssatz (%)",
          "Individueller Satz (%)",
          "Zeitraum der Abschreibung – von",
          "Zeitraum der Abschreibung – bis",
          "Anzahl Finanzierungsverträge",
          "Upload: Darlehensverträge, Zinsnachweise",
          "Erhaltungsaufwand Beschreibung",
          "Erhaltungsaufwand Betrag (€)",
          "Sofort abzugsfähig?",
          "Upload: Handwerkerrechnung / Zahlungsnachweis",
          "Hausgeldzahlungen (€)",
          "Instandhaltungsrücklage (€)",
          "Upload: Hausgeldabrechnung aktuelles Jahr & Vorjahr",
          "Fahrtkosten zur Immobilie (€)",
          "Verwaltungskosten / Hausmeister / Sonstiges",
          "Upload: Nachweise für Werbungskosten",
        ],
      },

      // Unterhalt gezahlt
      unterhalt: ["Empfänger", "Verwandtschaftsverhältnis", "Betrag (€)", "Besteht Anspruch auf Anlage U?"],

      // Unterhalt bezogen
      bezogen: ["Betrag (€)"],

      // Betreuungskosten
      betreuung: [
        "Anzahl Kinder mit Betreuungskosten",
        "Gesamtkosten (€)",
        "Arbeitgeberzuschuss enthalten?",
        "Anteil privat gezahlt (€)",
        "Upload: Rechnungen, Nachweise, Bescheinigungen",
      ],

      // Gesundheitskosten
      gesund: [
        "Art der Aufwendung",
        "Betrag gesamt (€)",
        "Wurden Zuschüsse (z. B. durch Krankenkasse, Pflegeversicherung) gezahlt?",
        "Upload: Arztrechnungen, Zuzahlungsübersichten, Bescheide",
      ],

      // Spenden, Riester, etc.
      spende: [
        "Gesamtbetrag",
        "Spendenempfänger / Organisation(en)",
        "Wurden Zuwendungsbestätigungen eingereicht?",
        "Upload Spendenbescheinigung",
      ],

      riester: ["Versicherungsnummer / Zulagenstelle", "Anbieter / Vertragsart", "Jahresbeitrag"],

      zrente: ["Anbieter / Vertragsart", "Jahresbeitrag"],

      // Renten und Pensionen
      rente: {
        base: [
          "Art der Leistung",
          "Rentenzahlende Stelle / Versicherungsträger",
          "Beginn der Rentenzahlung",
          "Rentenbetrag im Veranlagungszeitraum",
          "Steuerbescheinigung der Rentenstelle vorhanden?",
          "Upload: Rentenbezugsmitteilung / Leistungsnachweis / Steuerbescheinigung",
        ],
        weitere: [
          "Wurde im laufenden Jahr eine Einmalzahlung oder Nachzahlung geleistet?",
          "Betrag und Anlass",
          "Wurde eine Rückzahlung oder Kürzung vorgenommen?",
          "Betrag und Grund",
          "Besteht Anspruch auf Versorgungsfreibetrag / Werbungskosten-Pauschale?",
          "Besteht eine ausländische Besteuerung?",
          "Falls ja: In welchem Land?",
          "Besteht ein Doppelbesteuerungsabkommen (DBA)?",
          "Upload: ausländische Rentenbescheide, Steuerbescheinigungen",
        ],
        sonstiges: ["Sonstiges / Hinweise", "Weitere Hinweise zur Rentenversteuerung"],
      },

      // Selbstständige/Freiberufliche Tätigkeit
      selbststaendig: {
        allgemein: [
          "Art der Tätigkeit",
          "Sonstiges (Art der Tätigkeit)",
          "Bezeichnung des Unternehmens / der Praxis",
          "Beginn der Tätigkeit",
          "Wurde die Tätigkeit im VZ beendet?",
          "Firmenanschrift (Straße, PLZ, Ort)",
          "Telefonnummer / geschäftliche E-Mail",
          "Geschäftliche Bankverbindung",
          "Betriebsstättenfinanzamt",
          "Steuernummer",
          "Besteht eine Eintragung im Handelsregister?",
          "Besteht Bilanzierungspflicht?",
          "Betriebsstätte vorhanden?",
          "USt-IdNr. (falls vorhanden)",
          "Umsatzbesteuerung",
          "Wurde ISt-Versteuerung beantragt?",
          "Genehmigung des Finanzamts vorhanden?",
          "Abgabefrist für USt-Voranmeldungen",
          "Werden Mitarbeiter beschäftigt?",
          "Weitere Infos zu Mitarbeitern",
          "Unternehmernummer der Berufsgenossenschaft",
          "Wurden Betriebsprüfungen durchgeführt (Finanzamt / Rentenversicherung)?",
          "Weitere steuerliche Regelungen / Genehmigungen",
          "§13b UStG (Reverse Charge) anwendbar?",
          "Freistellungsbescheinigung vorhanden?",
          "Weitere behördliche Genehmigungen / Sonderregelungen",
        ],
        gesellschaft: [
          "Gesellschaftsform",
          "Gesellschaftsvertrag vorhanden?",
          "Name und Steuernummer der Gesellschaft",
        ],
        ergaenzend: [
          "Wurde ein oder mehrere Firmenfahrzeuge genutzt?",
          "Art der Nutzung",
          "Wurde ein Homeoffice genutzt?",
          "Bestand die Tätigkeit bereits in Vorjahren?",
          "Letzte Gewinnermittlung bzw. Bilanz",
          "Aufstellung des Anlagevermögens",
          "Kontenblätter der Finanzbuchhaltung",
          "Gab es Corona-Hilfen oder sonstige Fördermittel im Veranlagungszeitraum?",
          "Art und Betrag",
          "Sonstige relevante Hinweise",
        ],
      },

      stellungnahme: ["Beschreibung des konkreten Falls"],
    }

    // Parse the key to extract components
    const keyParts = cleanKey.split("_")

    if (keyParts.length < 2) {
      return cleanKey.replace(/_/g, " ")
    }

    const [category, instanceOrSubcategory, subcategoryOrIndex, ...rest] = keyParts

    // Handle different key patterns
    if (questionTemplates[category]) {
      const template = questionTemplates[category]

      // Simple array template (like child, partner, spende, etc.)
      if (Array.isArray(template)) {
        const index = Number.parseInt(instanceOrSubcategory)
        if (!isNaN(index) && template[index]) {
          return template[index]
        }
      }

      // Complex object template (like job, kapital, etc.)
      else if (typeof template === "object") {
        const instance = Number.parseInt(instanceOrSubcategory)
        const subcategory = subcategoryOrIndex
        const index = Number.parseInt(rest[0])

        if (!isNaN(instance) && template[subcategory] && Array.isArray(template[subcategory])) {
          const questionIndex = !isNaN(index) ? index : 0
          if (template[subcategory][questionIndex]) {
            return `${template[subcategory][questionIndex]} (${category.toUpperCase()} ${instance + 1})`
          }
        }
      }
    }

    // Special cases
    if (cleanKey.includes("_sonstiges")) {
      return cleanKey.replace(/_sonstiges$/, " (Sonstiges)").replace(/_/g, " ")
    }

    if (cleanKey.includes("_zeitraum")) {
      return cleanKey.replace(/_zeitraum$/, " (Zeitraum)").replace(/_/g, " ")
    }

    // Fallback: convert underscores to spaces and capitalize
    return cleanKey.replace(/_/g, " ")
  }

  const generateCustomerPDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    let y = 20

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("Formular Übersicht", 105, y, { align: "center" })
    y += 10

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`Kunde: ${user.firstName} ${user.lastName}`, 20, y)
    y += 6
    doc.text(`E-Mail: ${user.email}`, 20, y)
    y += 6
    doc.text(`Formular: ${currentForm?.title || "Ohne Titel"}`, 20, y)
    y += 10

    doc.setFont("helvetica", "bold")
    doc.text("Antworten:", 20, y)
    y += 7

    // 1. Statische Fragen aus dem Formular
    const questions = currentForm?.questions || []
    for (let idx = 0; idx < questions.length; idx++) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      const question = questions[idx]
      const key = `question_${idx}`
      const answer = formAnswers[key]

      doc.setFont("helvetica", "bold")
      doc.text(`Frage: ${question.questionText}`, 20, y)
      y += 6
      doc.setFont("helvetica", "normal")

      if (question.questionType === "fileUpload") {
        const fileUploaded =
          !!formAnswers[`file_${idx}`] ||
          uploadedFiles.some((file) => file.formId === currentForm._id && file.questionIndex === idx)
        doc.text(fileUploaded ? "Antwort: Datei hochgeladen" : "Antwort: Keine Datei hochgeladen", 25, y)
        y += 8
      } else if (typeof answer === "object" && answer?.fileUrl) {
        doc.text("Antwort: Datei hochgeladen", 25, y)
        y += 8
      } else {
        const valText = Array.isArray(answer)
          ? answer.length > 0
            ? answer.join(", ")
            : "Keine Auswahl"
          : answer?.toString() || "Keine Antwort"
        doc.text(`Antwort: ${valText}`, 25, y)
        y += 8
      }
      doc.setDrawColor(200, 200, 200)
      doc.line(20, y, 190, y)
      y += 5
    }

    // 2. Dynamische Felder mit verbessertem Mapping
    const staticKeys = questions.map((_, idx) => `question_${idx}`)
    const dynamicKeys = Object.keys(formAnswers).filter((key) => !staticKeys.includes(key) && !key.startsWith("file_"))

    // Group dynamic keys by category and instance for better organization
    const groupedKeys = {}
    dynamicKeys.forEach((key) => {
      const cleanKey = key.startsWith("question_") ? key.replace("question_", "") : key
      const parts = cleanKey.split("_")
      const category = parts[0]
      const instance = parts[1]

      if (!groupedKeys[category]) {
        groupedKeys[category] = {}
      }
      if (!groupedKeys[category][instance]) {
        groupedKeys[category][instance] = []
      }
      groupedKeys[category][instance].push(key)
    })

    // Render grouped dynamic fields
    Object.entries(groupedKeys).forEach(([category, instances]) => {
      if (y > 260) {
        doc.addPage()
        y = 20
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text(`${category.toUpperCase()}`, 20, y)
      y += 8

      Object.entries(instances).forEach(([instance, keys]) => {
        if (y > 250) {
          doc.addPage()
          y = 20
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text(`${category} ${Number.parseInt(instance) + 1}:`, 25, y)
        y += 6

        keys.forEach((key) => {
          if (y > 270) {
            doc.addPage()
            y = 20
          }

          const label = createDynamicQuestionLabel(key)
          const answer = formAnswers[key]

          doc.setFont("helvetica", "bold")
          doc.setFontSize(9)
          doc.text(`${label}:`, 30, y)
          y += 4

          doc.setFont("helvetica", "normal")
          if (typeof answer === "object" && answer?.fileUrl) {
            doc.setTextColor(0, 0, 255)
            doc.text("📎 Datei hochgeladen", 35, y)
            doc.setTextColor(0, 0, 0)
          } else {
            const valText = Array.isArray(answer)
              ? answer.length > 0
                ? answer.join(", ")
                : "Keine Auswahl"
              : answer?.toString() || "Keine Antwort"
            doc.text(valText, 35, y)
          }
          y += 6
        })
        y += 3
      })
      y += 5
    })

    const blob = doc.output("blob")
    const file = new File([blob], `Formular_${Date.now()}.pdf`, { type: "application/pdf" })
    return file
  }

  const handleGenerateAndUploadPDF = async () => {
    try {
      const pdfFile = await generateCustomerPDF()
      const uploaded = await client.assets.upload("file", pdfFile, {
        filename: pdfFile.name,
        contentType: pdfFile.type,
      })

      console.log("PDF erfolgreich hochgeladen:", uploaded)
    } catch (error) {
      console.error("Fehler beim Generieren/Hochladen:", error)
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const assigned = await getUserAssignedForms(user._id)
        setAssignedForms(assigned || [])

        const completed = await getCompletedForms(user._id)
        setCompletedForms(completed.ausgefuellteformulare || [])

        const files = await getUserUploadedFiles(user._id)
        setUploadedFiles(files || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Fehler beim Laden der Daten")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user._id])

  const handleInputChange = (e, index, type = "text", question = null) => {
    const { name, value, checked, files } = e.target

    if (type === "checkbox") {
      setFormAnswers((prev) => {
        const currentValues = prev[`question_${index}`] || []
        if (checked) {
          return { ...prev, [`question_${index}`]: [...currentValues, value] }
        } else {
          return { ...prev, [`question_${index}`]: currentValues.filter((v) => v !== value) }
        }
      })
    } else if (type === "file") {
      if (files && files.length > 0) {
        const file = files[0]
        setFileUploads((prev) => ({ ...prev, [`file_${index}`]: file }))
        setUploadProgress((prev) => ({ ...prev, [`file_${index}`]: 0 }))
      }
    } else {
      setFormAnswers((prev) => ({ ...prev, [`question_${index}`]: value }))
    }

    // Dynamik auslösen
    if (question && question.questionText === "Familienstand") {
      setShowPartnerFields(value === "verheiratet")
    }

    if (question && question.questionText === "Anzahl Kinder") {
      const count = Number.parseInt(value) || 0
      setNumberOfChildren(count)
    }
  }

  const handleStartForm = (form) => {
    setCurrentForm(form)
    setFormAnswers({})
    setFileUploads({})
    setUploadProgress({})
    setError("")
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }

  const handleCancelForm = () => {
    setCurrentForm(null)
    setFormAnswers({})
    setFileUploads({})
    setUploadProgress({})
    setError("")
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const answersWithFiles = { ...formAnswers }

      if (Object.keys(fileUploads).length > 0) {
        for (const [key, file] of Object.entries(fileUploads)) {
          try {
            const questionIndex = Number.parseInt(key.split("_")[1])
            setUploadProgress((prev) => ({ ...prev, [key]: 10 }))

            const uploadResult = await uploadFileAndAssignToUser(user._id, file, questionIndex, currentForm._id)

            setUploadProgress((prev) => ({ ...prev, [key]: 100 }))

            answersWithFiles[key] = {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              fileId: uploadResult.fileId,
              fileUrl: uploadResult.url,
              fileKey: uploadResult.key,
            }

            setUploadedFiles((prev) => [
              ...prev,
              {
                _key: uploadResult.key,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                formId: currentForm._id,
                questionIndex: questionIndex,
                uploadDate: new Date().toISOString(),
                url: uploadResult.url,
              },
            ])
          } catch (uploadError) {
            console.error("Fehler beim Datei-Upload:", uploadError)
            throw new Error(`Fehler beim Hochladen der Datei: ${file.name}. ${uploadError.message}`)
          }
        }
      }

      // PDF generieren und hochladen
      const pdfFile = await generateCustomerPDF()
      const uploaded = await client.assets.upload("file", pdfFile, {
        filename: pdfFile.name,
        contentType: pdfFile.type,
      })

      // PDF in "ausgefuellteformulare" speichern
      await client
        .patch(user._id)
        .setIfMissing({ ausgefuellteformulare: [] })
        .append("ausgefuellteformulare", [
          {
            _type: "file",
            _key: generateUniqueKey(),
            asset: {
              _type: "reference",
              _ref: uploaded._id,
            },
          },
        ])
        .commit()

      // Formular aus Liste entfernen
      const formIndex = assignedForms.findIndex((form) => form._id === currentForm._id)
      if (formIndex !== -1) {
        await removeFormAfterCompletion(user._id, formIndex)
      }

      setAssignedForms(assignedForms.filter((form) => form._id !== currentForm._id))

      const completed = await getCompletedForms(user._id)
      setCompletedForms(completed.ausgefuellteformulare || [])

      setSuccess("Formular erfolgreich ausgefüllt")
      setCurrentForm(null)
      setFormAnswers({})
      setFileUploads({})
      setUploadProgress({})
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(`Fehler beim Absenden des Formulars: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const familienstandKey = Object.keys(formAnswers).find((key) =>
      currentForm?.questions?.some((q, i) => `question_${i}` === key && q.questionText === "Familienstand"),
    )

    if (familienstandKey) {
      const selected = formAnswers[familienstandKey]
      setShowPartnerFields(selected === "verheiratet")
    }

    const kinderKey = Object.keys(formAnswers).find((key) =>
      currentForm?.questions?.some((q, i) => `question_${i}` === key && q.questionText.includes("Anzahl Kinder")),
    )

    if (kinderKey) {
      const selected = Number.parseInt(formAnswers[kinderKey])
      setNumberOfChildren(isNaN(selected) ? 0 : selected)
    }
  }, [formAnswers, currentForm])

  const renderFormField = (question, index) => {
    if (!question) return null

    switch (question.questionType) {
      case "text":
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
            {/* SEPA-Zustimmung unter Kontoinhaber */}
            {question.questionText === "Kontoinhaber" && (
              <div className="mt-4 space-y-2">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="sepa_zustimmung"
                    name="sepa_zustimmung"
                    checked={formAnswers.sepa_zustimmung || false}
                    onChange={(e) =>
                      setFormAnswers((prev) => ({
                        ...prev,
                        sepa_zustimmung: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-[#E3DAC9] border-gray-700 bg-[rgba(227,218,201,0.1)]"
                  />
                  <label htmlFor="sepa_zustimmung" className="ml-3 text-sm text-white">
                    Ich erteile ein SEPA-Lastschriftmandat.
                  </label>
                </div>
                <a
                  href="/pdfs/sepa-mandat.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E3DAC9] underline text-sm"
                >
                  SEPA-Mandat herunterladen (PDF)
                </a>
              </div>
            )}
          </div>
        )

      case "email":
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="email"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "date":
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "number":
        // Handle dynamic number fields with improved logic
        if (
          question.questionText === "Anzahl der Arbeitsverhältnisse" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numJobs = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              {/* Anzahl-Eingabe */}
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {/* Dynamisch pro Arbeitgeber */}
              {Array.from({ length: numJobs }).map((_, jobIdx) => {
                const prefix = `job_${jobIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={jobIdx} className="space-y-6 border-t border-gray-700 pt-6 pb-8">
                    <h3 className="text-white text-lg font-bold">Arbeitsverhältnis {jobIdx + 1}</h3>

                    {/* Basisdaten Arbeitgeber */}
                    {[
                      { questionText: "Name des Arbeitgebers", questionType: "text" },
                      { questionText: "Ausgeübte Tätigkeit", questionType: "text" },
                      { questionText: "Anschrift der Arbeitsstätte (Straße, PLZ, Ort)", questionType: "text" },
                      { questionText: "Beginn des Arbeitsverhältnisses", questionType: "date" },
                      {
                        questionText: "Ende des Arbeitsverhältnisses (optional)",
                        questionType: "date",
                        required: false,
                      },
                      {
                        questionText: "Lohnsteuerbescheinigung vorhanden?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Gab es Unterbrechungen (z. B. Krankengeld, KUG)?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                    ].map((q, i) => renderFormField({ ...q, required: q.required !== false }, `${prefix}_base_${i}`))}

                    {getAnswer("base_6") === "Ja" &&
                      renderFormField(
                        { questionText: "Falls Ja: Art und Zeitraum", questionType: "text", required: true },
                        `${prefix}_base_7`,
                      )}

                    {/* Werbungskosten-Pauschale Frage */}
                    {renderFormField(
                      {
                        questionText: "Werbungskosten-Pauschale von 1.230 € nutzen?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: true,
                      },
                      `${prefix}_werbung_pauschale`,
                    )}

                    {/* Nur bei "Nein" weitere Werbungskosten abfragen */}
                    {getAnswer("werbung_pauschale") === "Nein" && (
                      <div className="space-y-4 border-t border-gray-600 pt-4">
                        <h4 className="text-white font-semibold">Werbungskosten</h4>
                        {[
                          {
                            questionText: "Hat der Arbeitgeber eine erste Tätigkeitsstätte bestimmt?",
                            questionType: "multipleChoice",
                            options: ["Ja", "Nein", "Unbekannt"],
                          },
                          {
                            questionText: "Arbeitstage pro Woche (durchschnittlich)",
                            questionType: "multipleChoice",
                            options: ["5", "6", "Sonstiges"],
                          },
                          {
                            questionText: "Tatsächliche Arbeitstage im Jahr",
                            questionType: "number",
                          },
                          {
                            questionText: "Einfache Entfernung zur Arbeitsstätte (in km)",
                            questionType: "number",
                          },
                          {
                            questionText: "Beförderungsmittel",
                            questionType: "checkbox",
                            options: [
                              "Eigener PKW",
                              "Dienstwagen (Privatnutzung?)",
                              "ÖPNV",
                              "Fahrrad / zu Fuß",
                              "gemischt",
                            ],
                          },
                        ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_werbung_${i}`))}

                        {/* Sonstiges Feld bei Arbeitstage */}
                        {getAnswer("werbung_1") === "Sonstiges" &&
                          renderFormField(
                            { questionText: "Bitte angeben (Sonstiges)", questionType: "text", required: true },
                            `${prefix}_werbung_sonstiges`,
                          )}
                      </div>
                    )}

                    {/* Reisen */}
                    {renderFormField(
                      {
                        questionText: "Gab es Reisen?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: true,
                      },
                      `${prefix}_reise_flag`,
                    )}
                    {getAnswer("reise_flag") === "Ja" && (
                      <>
                        {renderFormField(
                          { questionText: "Anzahl der Reisen", questionType: "number", required: true },
                          `${prefix}_reise_count`,
                        )}
                        {Array.from({ length: Number.parseInt(getAnswer("reise_count") || 0) }).map((_, i) => (
                          <div key={i} className="space-y-4 border-t border-gray-600 pt-4">
                            <h4 className="text-white font-semibold">Reise {i + 1}</h4>
                            {[
                              { questionText: "Zweck der Reise", questionType: "text" },
                              { questionText: "Abreise", questionType: "date" },
                              { questionText: "Rückreise", questionType: "date" },
                              { questionText: "Ziel / Einsatzort", questionType: "text" },
                              {
                                questionText: "Fahrtkosten",
                                questionType: "checkbox",
                                options: ["PKW", "Dienstwagen", "ÖPNV"],
                              },
                              {
                                questionText: "Verpflegungsmehraufwand",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              { questionText: "Übernachtungskosten", questionType: "number" },
                              {
                                questionText: "Mahlzeiten gestellt?",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              {
                                questionText: "Arbeitgebererstattung erfolgt?",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              {
                                questionText: "Upload: Belege, Abrechnungen",
                                questionType: "fileUpload",
                                required: false,
                              },
                            ].map((q, j) =>
                              renderFormField(
                                { ...q, required: q.questionType !== "fileUpload" },
                                `${prefix}_reise_${i}_${j}`,
                              ),
                            )}

                            {/* Anzahl Mahlzeiten bei "Ja" */}
                            {getAnswer(`reise_${i}_7`) === "Ja" &&
                              renderFormField(
                                {
                                  questionText: "Anzahl gestellter Mahlzeiten",
                                  questionType: "number",
                                  required: true,
                                },
                                `${prefix}_reise_${i}_mahlzeiten_anzahl`,
                              )}

                            {/* Details bei Arbeitgebererstattung */}
                            {getAnswer(`reise_${i}_8`) === "Ja" &&
                              renderFormField(
                                { questionText: "Falls Ja, Details", questionType: "text", required: true },
                                `${prefix}_reise_${i}_erstattung_details`,
                              )}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Fortbildungen */}
                    {renderFormField(
                      {
                        questionText: "Gab es Fortbildungen?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: true,
                      },
                      `${prefix}_fort_flag`,
                    )}
                    {getAnswer("fort_flag") === "Ja" && (
                      <>
                        {renderFormField(
                          { questionText: "Anzahl der Fortbildungen", questionType: "number", required: true },
                          `${prefix}_fort_count`,
                        )}
                        {Array.from({ length: Number.parseInt(getAnswer("fort_count") || 0) }).map((_, i) => (
                          <div key={i} className="space-y-4 border-t border-gray-600 pt-4">
                            <h4 className="text-white font-semibold">Fortbildung {i + 1}</h4>
                            {[
                              { questionText: "Bezeichnung der Fortbildung", questionType: "text" },
                              { questionText: "Zeitraum", questionType: "text" },
                              { questionText: "Teilnahmegebühren (€)", questionType: "number" },
                              { questionText: "Fahrtkosten: Entfernung (km)", questionType: "number" },
                              {
                                questionText: "Beförderungsmittel",
                                questionType: "checkbox",
                                options: ["PKW", "ÖPNV"],
                              },
                              {
                                questionText: "Verpflegungsmehraufwand",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              { questionText: "Übernachtungskosten (€)", questionType: "number" },
                              {
                                questionText: "Arbeitgebererstattung erfolgt?",
                                questionType: "multipleChoice",
                                options: ["Ja", "Nein"],
                              },
                              {
                                questionText: "Upload: Teilnahme, Belege etc.",
                                questionType: "fileUpload",
                                required: false,
                              },
                            ].map((q, j) =>
                              renderFormField(
                                { ...q, required: q.questionType !== "fileUpload" },
                                `${prefix}_fort_${i}_${j}`,
                              ),
                            )}

                            {/* Details bei Arbeitgebererstattung */}
                            {getAnswer(`fort_${i}_7`) === "Ja" &&
                              renderFormField(
                                { questionText: "Falls Ja, Details", questionType: "text", required: true },
                                `${prefix}_fort_${i}_details`,
                              )}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Weitere Werbungskosten - IMMER anzeigen, unabhängig von Pauschale */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h4 className="text-white font-semibold">Weitere Werbungskosten</h4>
                      {[
                        { questionText: "Arbeitsmittel (Bezeichnung, Kaufpreis, Jahr)", questionType: "text" },
                        {
                          questionText: "Arbeitszimmer / Homeoffice",
                          questionType: "multipleChoice",
                          options: ["Homeoffice", "Arbeitszimmer vorhanden"],
                        },
                        {
                          questionText: "Telefon / Internet beruflich genutzt (Anteil oder Betrag)",
                          questionType: "text",
                        },
                        { questionText: "Gewerkschafts-/Verbandsbeiträge", questionType: "number" },
                        { questionText: "Steuerberatungskosten für Vorjahr", questionType: "number" },
                        { questionText: "Berufskleidung / Reinigungskosten", questionType: "number" },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_zusatz_${i}`))}

                      {/* Homeoffice Tage bei entsprechender Auswahl */}
                      {getAnswer("zusatz_1") === "Homeoffice" &&
                        renderFormField(
                          { questionText: "Homeoffice (Tage)", questionType: "number", required: true },
                          `${prefix}_zusatz_homeoffice_tage`,
                        )}
                    </div>

                    {/* Freitext / Besonderheiten */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h4 className="text-white font-semibold">Freitext / Besonderheiten</h4>
                      {renderFormField(
                        {
                          questionText: "Besondere Konstellationen, berufliche Wechsel, Auslandstätigkeit o. Ä.",
                          questionType: "textarea",
                          required: false,
                        },
                        `${prefix}_freitext_0`,
                      )}
                    </div>

                    {/* Uploads */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h4 className="text-white font-semibold">Uploads (optional)</h4>
                      {[
                        { questionText: "Upload – Lohnsteuerbescheinigung(en)", questionType: "fileUpload" },
                        { questionText: "Upload – Fortbildungsnachweise", questionType: "fileUpload" },
                        { questionText: "Upload – Reisekostenbelege", questionType: "fileUpload" },
                        { questionText: "Upload – Nachweise für Werbungskosten", questionType: "fileUpload" },
                      ].map((q, i) => renderFormField({ ...q, required: false }, `${prefix}_upload_${i}`))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Kapitalvermögen (Formular 4)
        if (
          question.questionText === "Anzahl der Institute / Depots mit Kapitalerträgen" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numKapital = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numKapital }).map((_, kapitalIdx) => {
                const prefix = `kapital_${kapitalIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={kapitalIdx} className="space-y-4 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Institut/Depot {kapitalIdx + 1}</h4>

                    {[
                      { questionText: "Name des Kreditinstituts / der Plattform", questionType: "text" },
                      {
                        questionText: "Art der Erträge",
                        questionType: "multipleChoice",
                        options: ["Zinsen", "Dividenden", "Ausschüttungen", "Sonstige"],
                      },
                      {
                        questionText: "Wurden Kapitalerträge nach §43a EStG einbehalten?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Liegt eine Jahressteuerbescheinigung vor?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Wurde ein Freistellungsauftrag gestellt?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Wurden Verluste bescheinigt / verrechnet?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Upload: Jahressteuerbescheinigung",
                        questionType: "fileUpload",
                        required: false,
                      },
                    ].map((q, i) =>
                      renderFormField({ ...q, required: q.questionType !== "fileUpload" }, `${prefix}_base_${i}`),
                    )}

                    {/* Höhe des Freistellungsauftrags bei "Ja" */}
                    {getAnswer("base_4") === "Ja" &&
                      renderFormField(
                        {
                          questionText: "Höhe des Freistellungsauftrags (in €)",
                          questionType: "number",
                          required: true,
                        },
                        `${prefix}_freistellung_hoehe`,
                      )}

                    {/* Weitere Angaben */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h5 className="text-white font-semibold">Weitere Angaben</h5>
                      {[
                        {
                          questionText: "Handelt es sich um Kapitalerträge aus dem Ausland?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                        {
                          questionText: "Zinsen aus privat vergebenen Darlehen erhalten?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_weitere_${i}`))}

                      {/* Ausland Details */}
                      {getAnswer("weitere_0") === "Ja" && (
                        <>
                          {renderFormField(
                            {
                              questionText: "Falls Ja: Land, Art der Erträge und Höhe",
                              questionType: "text",
                              required: true,
                            },
                            `${prefix}_ausland_details`,
                          )}
                          {renderFormField(
                            {
                              questionText: "Upload: Steuerbescheinigung / Ertragsnachweis",
                              questionType: "fileUpload",
                              required: false,
                            },
                            `${prefix}_ausland_upload`,
                          )}
                        </>
                      )}

                      {/* Darlehen Details */}
                      {getAnswer("weitere_1") === "Ja" && (
                        <>
                          {renderFormField(
                            { questionText: "Darlehensnehmer", questionType: "text", required: true },
                            `${prefix}_darlehen_nehmer`,
                          )}
                          {renderFormField(
                            { questionText: "Höhe der Zinserträge (in €)", questionType: "number", required: true },
                            `${prefix}_darlehen_hoehe`,
                          )}
                          {renderFormField(
                            {
                              questionText: "Besteht ein schriftlicher Darlehensvertrag?",
                              questionType: "multipleChoice",
                              options: ["Ja", "Nein"],
                              required: true,
                            },
                            `${prefix}_darlehen_vertrag`,
                          )}
                          {renderFormField(
                            {
                              questionText: "Upload: Darlehensvertrag / Zinsnachweis",
                              questionType: "fileUpload",
                              required: false,
                            },
                            `${prefix}_darlehen_upload`,
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Veräußerungsgeschäfte (Formular 4)
        if (
          question.questionText === "Anzahl der privaten Veräußerungsgeschäfte (§23 EStG)" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numVeraeusserung = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numVeraeusserung }).map((_, verIdx) => {
                const prefix = `veraeusserung_${verIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={verIdx} className="space-y-4 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Veräußerungsgeschäft {verIdx + 1}</h4>

                    {[
                      {
                        questionText: "Art des Wirtschaftsguts",
                        questionType: "multipleChoice",
                        options: ["Immobilie", "Wertpapiere", "Sonstiges"],
                      },
                      { questionText: "Datum Anschaffung", questionType: "date" },
                      { questionText: "Datum Veräußerung", questionType: "date" },
                      { questionText: "Veräußerungserlös (€)", questionType: "number" },
                      { questionText: "Anschaffungskosten + Nebenkosten (€)", questionType: "number" },
                      {
                        questionText: "Wurden Wertsteigerungsmaßnahmen / Renovierungen durchgeführt?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Wurden Vermittlungsgebühren / Notarkosten gezahlt?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Wurde das Objekt selbst genutzt?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Upload: Kaufvertrag, Verkaufsunterlagen, Kostenbelege",
                        questionType: "fileUpload",
                        required: false,
                      },
                    ].map((q, i) =>
                      renderFormField({ ...q, required: q.questionType !== "fileUpload" }, `${prefix}_base_${i}`),
                    )}

                    {/* Sonstiges Feld bei Art des Wirtschaftsguts */}
                    {getAnswer("base_0") === "Sonstiges" &&
                      renderFormField(
                        { questionText: "Sonstiges (Art des Wirtschaftsguts)", questionType: "text", required: true },
                        `${prefix}_sonstiges`,
                      )}

                    {/* Zeitraum bei Eigennutzung */}
                    {getAnswer("base_7") === "Ja" &&
                      renderFormField(
                        { questionText: "Zeitraum der Eigennutzung", questionType: "text", required: true },
                        `${prefix}_eigennutzung_zeitraum`,
                      )}
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Krypto-Plattformen (Formular 4)
        if (
          question.questionText === "Anzahl Krypto-Plattformen / Wallets mit Transaktionen" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numKrypto = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numKrypto }).map((_, kryptoIdx) => {
                const prefix = `krypto_${kryptoIdx}`

                return (
                  <div key={kryptoIdx} className="space-y-4 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Krypto-Plattform/Wallet {kryptoIdx + 1}</h4>

                    {[
                      { questionText: "Name der Plattform / Wallet", questionType: "text" },
                      {
                        questionText: "Upload: vollständige Transaktionslisten, Reports",
                        questionType: "fileUpload",
                        required: false,
                      },
                    ].map((q, i) =>
                      renderFormField({ ...q, required: q.questionType !== "fileUpload" }, `${prefix}_base_${i}`),
                    )}
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Vermietung (Formular 5)
        if (
          question.questionText === "Anzahl wirtschaftlicher Einheiten (Wohnungen / Häuser / Einheiten)" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numMiete = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numMiete }).map((_, mieteIdx) => {
                const prefix = `miete_${mieteIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={mieteIdx} className="space-y-6 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Immobilie {mieteIdx + 1}</h4>

                    {/* 1. Grunddaten zum Objekt */}
                    <div className="space-y-4">
                      <h5 className="text-white font-semibold">1. Grunddaten zum Objekt</h5>
                      {[
                        {
                          questionText: "Handelt es sich um eine erstmalige Vermietung / Neuanschaffung?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_grunddaten_${i}`))}

                      {/* Bei erstmaliger Vermietung weitere Felder */}
                      {getAnswer("grunddaten_0") === "Ja" && (
                        <>
                          {[
                            { questionText: "Kaufpreis (€)", questionType: "number" },
                            { questionText: "Notarkosten (€)", questionType: "number" },
                            { questionText: "Grundbuchkosten (€)", questionType: "number" },
                            { questionText: "Maklerprovision (€)", questionType: "number" },
                            { questionText: "Weitere Erwerbsnebenkosten (€)", questionType: "number" },
                            { questionText: "Anschaffungsnahe Herstellungskosten (€)", questionType: "number" },
                            { questionText: "Baujahr des Gebäudes", questionType: "number" },
                            { questionText: "Gesamtfläche des Objekts (m²)", questionType: "number" },
                            { questionText: "Wohnfläche der Einheit (m²)", questionType: "number" },
                            {
                              questionText: "Anzahl / Art Stellplätze",
                              questionType: "checkbox",
                              options: ["Garage", "Tiefgarage", "Außenstellplatz"],
                            },
                          ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_grunddaten_neu_${i}`))}

                          {/* Anzahl Stellplätze */}
                          {(getAnswer("grunddaten_neu_9") || []).length > 0 &&
                            renderFormField(
                              { questionText: "Anzahl Stellplätze", questionType: "number", required: true },
                              `${prefix}_stellplaetze_anzahl`,
                            )}
                        </>
                      )}

                      {/* Bei Bestandsimmobilie */}
                      {getAnswer("grunddaten_0") === "Nein" && (
                        <>
                          {[
                            { questionText: "Aktuelle AfA-Bemessungsgrundlage (€)", questionType: "number" },
                            { questionText: "Bisherige Abschreibungen insgesamt (€)", questionType: "number" },
                            { questionText: "Einheitswert-Aktenzeichen (Grundsteuer)", questionType: "text" },
                            { questionText: "Anschaffungs- oder Fertigstellungszeitpunkt", questionType: "date" },
                            {
                              questionText: "Wurde die Immobilie im VZ veräußert?",
                              questionType: "multipleChoice",
                              options: ["Ja", "Nein"],
                            },
                          ].map((q, i) =>
                            renderFormField({ ...q, required: true }, `${prefix}_grunddaten_bestand_${i}`),
                          )}
                        </>
                      )}

                      {/* Allgemeine Objektdaten */}
                      {[
                        { questionText: "Objektbezeichnung", questionType: "text" },
                        {
                          questionText: "Objektart",
                          questionType: "multipleChoice",
                          options: ["Einfamilienhaus", "Eigentumswohnung", "Mehrfamilienhaus", "Sonstiges"],
                        },
                        {
                          questionText: "Eigentumsverhältnis",
                          questionType: "multipleChoice",
                          options: ["Alleineigentum", "Miteigentum"],
                        },
                        { questionText: "Straße", questionType: "text" },
                        { questionText: "PLZ/Ort", questionType: "text" },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_objekt_${i}`))}

                      {/* Sonstiges bei Objektart */}
                      {getAnswer("objekt_1") === "Sonstiges" &&
                        renderFormField(
                          { questionText: "Sonstiges (Objektart)", questionType: "text", required: true },
                          `${prefix}_objekt_sonstiges`,
                        )}

                      {/* Miteigentumsanteil */}
                      {getAnswer("objekt_2") === "Miteigentum" &&
                        renderFormField(
                          { questionText: "Miteigentumsanteil (%)", questionType: "number", required: true },
                          `${prefix}_miteigentum_anteil`,
                        )}
                    </div>

                    {/* 2. Nutzung & Mieterstruktur */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h5 className="text-white font-semibold">2. Nutzung & Mieterstruktur</h5>
                      {[
                        { questionText: "Anzahl vermieteter Einheiten", questionType: "number" },
                        {
                          questionText: "Nutzung durch",
                          questionType: "checkbox",
                          options: ["fremde Mieter", "Angehörige", "zeitweise selbst genutzt"],
                        },
                        {
                          questionText: "Leerstand im VZ?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                      ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_nutzung_${i}`))}

                      {/* Bei Angehörigen */}
                      {(getAnswer("nutzung_1") || []).includes("Angehörige") &&
                        renderFormField(
                          {
                            questionText: "Miete entspricht ortsüblicher Miete?",
                            questionType: "multipleChoice",
                            options: ["Ja", "Nein"],
                            required: true,
                          },
                          `${prefix}_angehoerige_miete`,
                        )}

                      {/* Bei Leerstand */}
                      {getAnswer("nutzung_2") === "Ja" &&
                        renderFormField(
                          { questionText: "Dauer & Grund des Leerstands", questionType: "text", required: true },
                          `${prefix}_leerstand_details`,
                        )}
                    </div>

                    {/* 3. Einnahmen */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h5 className="text-white font-semibold">3. Einnahmen</h5>
                      <p className="text-sm text-gray-300">Pro Einheit bitte folgende Angaben:</p>
                      {[
                        { questionText: "Bezeichnung der Einheit / Lage im Objekt", questionType: "text" },
                        { questionText: "Wohnfläche (in m²)", questionType: "number" },
                        { questionText: "Mieteinnahmen ohne Umlagen (Zufluss im VZ) (€)", questionType: "number" },
                        { questionText: "Umlagen (Nebenkosten) (€)", questionType: "number" },
                        {
                          questionText: "Wurden Kautionen mit offenen Forderungen verrechnet?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                        { questionText: "Einnahmen aus Garagen / Stellplätzen (€)", questionType: "number" },
                        { questionText: "Einnahmen aus Werbeflächen (€)", questionType: "number" },
                        {
                          questionText:
                            "Wird die Einheit ganz oder teilweise kurzfristig (z. B. über Airbnb) vermietet?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                        },
                        {
                          questionText: "Upload: Mietverträge, Einnahmenübersicht, Kontoauszüge",
                          questionType: "fileUpload",
                          required: false,
                        },
                      ].map((q, i) =>
                        renderFormField(
                          { ...q, required: q.questionType !== "fileUpload" },
                          `${prefix}_einnahmen_${i}`,
                        ),
                      )}
                    </div>

                    {/* 4. Werbungskosten */}
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                      <h5 className="text-white font-semibold">4. Werbungskosten</h5>

                      {/* a) Abschreibungen (AfA) */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">a) Abschreibungen (AfA)</h6>
                        {[
                          { questionText: "AfA-Bemessungsgrundlage (€)", questionType: "number" },
                          {
                            questionText: "Abschreibungssatz",
                            questionType: "multipleChoice",
                            options: ["2%", "2,5%", "3%", "individuell"],
                          },
                          { questionText: "Zeitraum der Abschreibung im VZ: von", questionType: "date" },
                          { questionText: "Zeitraum der Abschreibung im VZ: bis", questionType: "date" },
                        ].map((q, i) => renderFormField({ ...q, required: true }, `${prefix}_afa_${i}`))}

                        {/* Individueller Satz */}
                        {getAnswer("afa_1") === "individuell" &&
                          renderFormField(
                            { questionText: "Individueller Satz (%)", questionType: "number", required: true },
                            `${prefix}_afa_individuell`,
                          )}
                      </div>

                      {/* b) Schuldzinsen & Geldbeschaffungskosten */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">b) Schuldzinsen & Geldbeschaffungskosten</h6>
                        {renderFormField(
                          { questionText: "Anzahl Finanzierungsverträge", questionType: "number", required: true },
                          `${prefix}_finanzierung_anzahl`,
                        )}
                        {renderFormField(
                          {
                            questionText: "Upload: Darlehensverträge, Zinsnachweise",
                            questionType: "fileUpload",
                            required: false,
                          },
                          `${prefix}_finanzierung_upload`,
                        )}
                      </div>

                      {/* c) Erhaltungsaufwendungen */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">c) Erhaltungsaufwendungen</h6>
                        {[
                          { questionText: "Beschreibung", questionType: "text" },
                          { questionText: "Betrag (€)", questionType: "number" },
                          {
                            questionText: "Sofort abzugsfähig?",
                            questionType: "multipleChoice",
                            options: ["Ja", "Nein (Verteilung über Jahre)"],
                          },
                          {
                            questionText: "Upload: Handwerkerrechnung, Zahlungsnachweis",
                            questionType: "fileUpload",
                            required: false,
                          },
                        ].map((q, i) =>
                          renderFormField(
                            { ...q, required: q.questionType !== "fileUpload" },
                            `${prefix}_erhaltung_${i}`,
                          ),
                        )}
                      </div>

                      {/* d) Laufende Betriebskosten */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">d) Laufende Betriebskosten</h6>
                        <p className="text-sm text-gray-300">
                          Grundsteuer, Straßenreinigung / Müll / Wasser / Abwasser, Gebäudeversicherung /
                          Haftpflichtversicherung, Schornsteinfeger / Heizung / Warmwasser / Wartung
                        </p>
                        {renderFormField(
                          { questionText: "Weitere Werbungskosten", questionType: "text", required: false },
                          `${prefix}_betriebskosten`,
                        )}
                      </div>

                      {/* e) Bei Eigentümergemeinschaften */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">e) Bei Eigentümergemeinschaften</h6>
                        {[
                          { questionText: "Hausgeldzahlungen (€)", questionType: "number" },
                          { questionText: "Instandhaltungsrücklage (€)", questionType: "number" },
                          {
                            questionText: "Upload: vollständige Hausgeldabrechnung aktuelles Jahr & Vorjahr",
                            questionType: "fileUpload",
                            required: false,
                          },
                        ].map((q, i) =>
                          renderFormField(
                            { ...q, required: q.questionType !== "fileUpload" },
                            `${prefix}_hausgeld_${i}`,
                          ),
                        )}
                      </div>

                      {/* f) Weitere Werbungskosten */}
                      <div className="space-y-2">
                        <h6 className="text-white font-medium">f) Weitere Werbungskosten</h6>
                        {[
                          { questionText: "Fahrtkosten zur Immobilie (€)", questionType: "number" },
                          { questionText: "Verwaltungskosten / Hausmeister / Sonstiges", questionType: "text" },
                          {
                            questionText: "Upload: Nachweise für alle geltend gemachten Ausgaben",
                            questionType: "fileUpload",
                            required: false,
                          },
                        ].map((q, i) =>
                          renderFormField(
                            { ...q, required: q.questionType !== "fileUpload" },
                            `${prefix}_weitere_werbung_${i}`,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle other number fields
        if (question.questionText === "Anzahl Kinder" && Number(formAnswers[`question_${index}`]) > 0) {
          const numberOfChildren = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              {/* Original Frage */}
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  name={`question_${index}`}
                  id={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  required={question.required}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                />
              </div>

              {/* Dynamische Kinderfelder */}
              {Array.from({ length: numberOfChildren }).map((_, i) => {
                const prefix = `child_${i}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={i} className="space-y-4 border-t border-b border-gray-700 pt-4 pb-4">
                    <h4 className="text-white font-semibold">Kind {i + 1}</h4>
                    {[
                      { questionText: "Name des Kindes", questionType: "text", required: true },
                      { questionText: "Geburtsdatum des Kindes", questionType: "date", required: true },
                      { questionText: "Steuer-ID des Kindes", questionType: "text", required: true },
                      {
                        questionText: "Abweichender Elternteil (Name, Geburtsdatum, Anschrift)",
                        questionType: "text",
                        required: false,
                      },
                      {
                        questionText: "Kindergeldbezug",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: false,
                      },
                      {
                        questionText: "Schwerbehinderung / Pflegegrad beim Kind?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: false,
                      },
                      {
                        questionText: "Alleinerziehend",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: false,
                      },
                      {
                        questionText: "Volljähriges Kind in Ausbildung / Studium",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                        required: false,
                      },
                    ].map((q, idx) => renderFormField(q, `${prefix}_${idx}`))}

                    {/* Upload bei Schwerbehinderung */}
                    {getAnswer("5") === "Ja" &&
                      renderFormField(
                        {
                          questionText: "Upload: Schwerbehinderung / Pflegegrad Nachweis",
                          questionType: "fileUpload",
                          required: false,
                        },
                        `${prefix}_schwerbehinderung_upload`,
                      )}

                    {/* Entlastungsbetrag bei Alleinerziehend */}
                    {getAnswer("6") === "Ja" &&
                      renderFormField(
                        {
                          questionText: "Angabe zur Beantragung des Entlastungsbetrags",
                          questionType: "text",
                          required: false,
                        },
                        `${prefix}_entlastungsbetrag`,
                      )}

                    {/* Wohnsituation bei volljährigem Kind */}
                    {getAnswer("7") === "Ja" &&
                      renderFormField(
                        {
                          questionText: "Angabe zur Wohnsituation",
                          questionType: "multipleChoice",
                          options: ["bei den Eltern", "auswärtig"],
                          required: false,
                        },
                        `${prefix}_wohnsituation`,
                      )}
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Renten/Pensionen (Formular 6) - ENHANCED VERSION
        if (
          question.questionText === "Anzahl der empfangenen Renten/Pensionen" &&
          Number(formAnswers[`question_${index}`]) > 0
        ) {
          const numRenten = Number.parseInt(formAnswers[`question_${index}`]) || 0

          return (
            <div key={index} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
                  {question.questionText}
                </label>
                <input
                  type="number"
                  id={`question_${index}`}
                  name={`question_${index}`}
                  value={formAnswers[`question_${index}`] || ""}
                  onChange={(e) => handleInputChange(e, index, "number", question)}
                  className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 text-white rounded-md py-2 px-3"
                />
              </div>

              {Array.from({ length: numRenten }).map((_, renteIdx) => {
                const prefix = `rente_${renteIdx}`
                const getAnswer = (key) => formAnswers[`question_${prefix}_${key}`] || formAnswers[`${prefix}_${key}`]

                return (
                  <div key={renteIdx} className="space-y-4 border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold">Rente/Pension {renteIdx + 1}</h4>

                    {/* Basis-Rentenangaben */}
                    {[
                      {
                        questionText: "Art der Leistung",
                        questionType: "multipleChoice",
                        options: [
                          "Gesetzliche Altersrente",
                          "Rente wegen Erwerbsminderung",
                          "Hinterbliebenenrente (Witwen-/Waisenrente)",
                          "Betriebsrente / Werksrente",
                          "Pension (z. B. öffentlicher Dienst)",
                          "Rente aus berufsständischer Versorgung",
                          "Ausländische Rente",
                          "Sonstiges",
                        ],
                        required: true,
                      },
                      { questionText: "Rentenzahlende Stelle / Versicherungsträger", questionType: "text" },
                      { questionText: "Beginn der Rentenzahlung", questionType: "date" },
                      { questionText: "Rentenbetrag im Veranlagungszeitraum (€)", questionType: "number" },
                      {
                        questionText: "Steuerbescheinigung der Rentenstelle vorhanden?",
                        questionType: "multipleChoice",
                        options: ["Ja", "Nein"],
                      },
                      {
                        questionText: "Upload: Rentenbezugsmitteilung / Leistungsnachweis",
                        questionType: "fileUpload",
                        required: false,
                      },
                    ].map((q, i) =>
                      renderFormField({ ...q, required: q.questionType !== "fileUpload" }, `${prefix}_base_${i}`),
                    )}

                    {/* Weitere Rentenangaben */}
                    <div className="space-y-4 pt-4 border-t border-gray-600">
                      <h5 className="text-white font-semibold">Weitere Angaben</h5>

                      {/* Einmalzahlung/Nachzahlung */}
                      {renderFormField(
                        {
                          questionText: "Wurde im laufenden Jahr eine Einmalzahlung oder Nachzahlung geleistet?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                          required: true,
                        },
                        `${prefix}_einmalzahlung`,
                      )}

                      {getAnswer("einmalzahlung") === "Ja" && (
                        <>
                          {renderFormField(
                            { questionText: "Betrag und Anlass", questionType: "text", required: true },
                            `${prefix}_einmalzahlung_details`,
                          )}
                        </>
                      )}

                      {/* Rückzahlung/Kürzung */}
                      {renderFormField(
                        {
                          questionText: "Wurde eine Rückzahlung oder Kürzung vorgenommen?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                          required: true,
                        },
                        `${prefix}_rueckzahlung`,
                      )}

                      {getAnswer("rueckzahlung") === "Ja" && (
                        <>
                          {renderFormField(
                            { questionText: "Betrag und Grund", questionType: "text", required: true },
                            `${prefix}_rueckzahlung_details`,
                          )}
                        </>
                      )}

                      {/* Versorgungsfreibetrag */}
                      {renderFormField(
                        {
                          questionText: "Besteht Anspruch auf Versorgungsfreibetrag / Werbungskosten-Pauschale?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein", "Unklar"],
                          required: true,
                        },
                        `${prefix}_versorgungsfreibetrag`,
                      )}

                      {/* Ausländische Besteuerung */}
                      {renderFormField(
                        {
                          questionText: "Besteht eine ausländische Besteuerung?",
                          questionType: "multipleChoice",
                          options: ["Ja", "Nein"],
                          required: true,
                        },
                        `${prefix}_ausland_besteuerung`,
                      )}

                      {getAnswer("ausland_besteuerung") === "Ja" && (
                        <>
                          {renderFormField(
                            { questionText: "Falls ja: In welchem Land?", questionType: "text", required: true },
                            `${prefix}_ausland_land`,
                          )}

                          {renderFormField(
                            {
                              questionText: "Besteht ein Doppelbesteuerungsabkommen (DBA)?",
                              questionType: "multipleChoice",
                              options: ["Ja", "Nein", "Unklar"],
                              required: true,
                            },
                            `${prefix}_dba`,
                          )}
                        </>
                      )}

                      {/* Sonstiges/Hinweise */}
                      <div className="space-y-4 border-t border-gray-600 pt-4">
                        <h6 className="text-white font-semibold">Sonstiges / Hinweise</h6>
                        {renderFormField(
                          {
                            questionText: "Weitere Hinweise zur Rentenversteuerung",
                            questionType: "textarea",
                            required: false,
                          },
                          `${prefix}_hinweise`,
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // Handle Selbstständige/Freiberufliche Tätigkeit (Formular 7) - ENHANCED
        if (question.questionText === "Selbstständige/Freiberufliche Tätigkeit vorhanden?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-6">
              {/* Basis Multiple Choice */}
              {renderBaseMultipleChoice()}

              {/* Allgemeine Angaben */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Allgemeine Angaben</h4>

                {/* Art der Tätigkeit */}
                {renderFormField(
                  {
                    questionText: "Art der Tätigkeit",
                    questionType: "multipleChoice",
                    options: ["Freiberuflich", "Gewerbebetrieb", "Sonstige"],
                    required: true,
                  },
                  `selbststaendig_allgemein_0`,
                )}

                {/* Sonstiges Feld bei Art der Tätigkeit */}
                {(formAnswers[`question_selbststaendig_allgemein_0`] || formAnswers[`selbststaendig_allgemein_0`]) ===
                  "Sonstige" &&
                  renderFormField(
                    { questionText: "Sonstiges (Art der Tätigkeit)", questionType: "text", required: true },
                    `selbststaendig_allgemein_sonstiges`,
                  )}

                {/* Weitere allgemeine Felder */}
                {[
                  { questionText: "Bezeichnung des Unternehmens / der Praxis", questionType: "text" },
                  { questionText: "Beginn der Tätigkeit", questionType: "date" },
                  {
                    questionText: "Wurde die Tätigkeit im VZ beendet?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Firmenanschrift (Straße, PLZ, Ort)", questionType: "text" },
                  { questionText: "Telefonnummer / geschäftliche E-Mail", questionType: "text" },
                  { questionText: "Geschäftliche Bankverbindung", questionType: "text" },
                  { questionText: "Betriebsstättenfinanzamt", questionType: "text" },
                  { questionText: "Steuernummer", questionType: "text" },
                  {
                    questionText: "Besteht eine Eintragung im Handelsregister?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Besteht Bilanzierungspflicht?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Betriebsstätte vorhanden?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "USt-IdNr. (falls vorhanden)", questionType: "text", required: false },
                  {
                    questionText: "Umsatzbesteuerung",
                    questionType: "multipleChoice",
                    options: ["Kleinunternehmerregelung (§19 UStG)", "Regelbesteuerung"],
                  },
                  {
                    questionText: "Wurde ISt-Versteuerung beantragt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Abgabefrist für USt-Voranmeldungen",
                    questionType: "multipleChoice",
                    options: ["monatlich", "vierteljährlich", "jährlich"],
                  },
                  {
                    questionText: "Werden Mitarbeiter beschäftigt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                ].map((q, i) =>
                  renderFormField({ ...q, required: q.required !== false }, `selbststaendig_allgemein_${i + 1}`),
                )}

                {/* ISt-Versteuerung Genehmigung */}
                {(formAnswers[`question_selbststaendig_allgemein_14`] || formAnswers[`selbststaendig_allgemein_14`]) ===
                  "Ja" &&
                  renderFormField(
                    {
                      questionText: "Genehmigung des Finanzamts vorhanden?",
                      questionType: "multipleChoice",
                      options: ["Ja", "Nein"],
                      required: true,
                    },
                    `selbststaendig_ist_genehmigung`,
                  )}

                {/* Mitarbeiter Details */}
                {(formAnswers[`question_selbststaendig_allgemein_16`] || formAnswers[`selbststaendig_allgemein_16`]) ===
                  "Ja" &&
                  renderFormField(
                    { questionText: "Weitere Infos zu Mitarbeitern", questionType: "text", required: true },
                    `selbststaendig_mitarbeiter_details`,
                  )}

                {/* Weitere Felder */}
                {[
                  { questionText: "Unternehmernummer der Berufsgenossenschaft", questionType: "text" },
                  {
                    questionText: "Wurden Betriebsprüfungen durchgeführt (Finanzamt / Rentenversicherung)?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Weitere steuerliche Regelungen / Genehmigungen", questionType: "text" },
                  {
                    questionText: "§13b UStG (Reverse Charge) anwendbar?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Freistellungsbescheinigung vorhanden?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Weitere behördliche Genehmigungen / Sonderregelungen", questionType: "text" },
                ].map((q, i) =>
                  renderFormField({ ...q, required: q.required !== false }, `selbststaendig_weitere_${i}`),
                )}
              </div>

              {/* Bei Personengesellschaften */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Bei Personengesellschaften</h4>
                {[
                  { questionText: "Gesellschaftsform", questionType: "text" },
                  {
                    questionText: "Gesellschaftsvertrag vorhanden?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Name und Steuernummer der Gesellschaft", questionType: "text" },
                ].map((q, i) => renderFormField({ ...q, required: false }, `selbststaendig_gesellschaft_${i}`))}
              </div>

              {/* Ergänzende Angaben */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Ergänzende Angaben</h4>

                {/* Firmenfahrzeuge */}
                {renderFormField(
                  {
                    questionText: "Wurde ein oder mehrere Firmenfahrzeuge genutzt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                    required: true,
                  },
                  `selbststaendig_fahrzeuge`,
                )}

                {(formAnswers[`question_selbststaendig_fahrzeuge`] || formAnswers[`selbststaendig_fahrzeuge`]) ===
                  "Ja" &&
                  renderFormField(
                    {
                      questionText: "Art der Nutzung",
                      questionType: "multipleChoice",
                      options: ["1%-Regelung", "Fahrtenbuch"],
                      required: true,
                    },
                    `selbststaendig_fahrzeuge_art`,
                  )}

                {/* Weitere ergänzende Felder */}
                {[
                  {
                    questionText: "Bestand die Tätigkeit bereits in Vorjahren?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Gab es Corona-Hilfen oder sonstige Fördermittel im Veranlagungszeitraum?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                ].map((q, i) => renderFormField({ ...q, required: true }, `selbststaendig_ergaenzend_${i}`))}

                {/* Bei Vorjahren */}
                {(formAnswers[`question_selbststaendig_ergaenzend_0`] || formAnswers[`selbststaendig_ergaenzend_0`]) ===
                  "Ja" && (
                  <div className="space-y-2 border-l-4 border-blue-500 pl-4">
                    <p className="text-white text-sm">Falls ja, bitte folgende Unterlagen bereitstellen:</p>
                    {[
                      "Letzte Gewinnermittlung bzw. Bilanz",
                      "Aufstellung des Anlagevermögens",
                      "Kontenblätter der Finanzbuchhaltung",
                    ].map((label, i) => (
                      <p key={i} className="text-gray-300 text-sm">
                        • {label}
                      </p>
                    ))}
                  </div>
                )}

                {/* Bei Corona-Hilfen */}
                {(formAnswers[`question_selbststaendig_ergaenzend_1`] || formAnswers[`selbststaendig_ergaenzend_1`]) ===
                  "Ja" &&
                  renderFormField(
                    { questionText: "Art und Betrag", questionType: "text", required: true },
                    `selbststaendig_corona_details`,
                  )}

                {/* Sonstige Hinweise */}
                {renderFormField(
                  { questionText: "Sonstige relevante Hinweise", questionType: "textarea", required: false },
                  `selbststaendig_hinweise`,
                )}
              </div>
            </div>
          )
        }

        // Default number input
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index, "number", question)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "textarea":
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              name={`question_${index}`}
              id={`question_${index}`}
              rows={4}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "checkbox":
        // Handle Einkunftsarten as multiple selection
        if (question.questionText === "Einkunftsarten") {
          return (
            <div key={index} className="space-y-2">
              <fieldset>
                <legend className="block text-sm font-medium text-white mb-2">
                  {question.questionText}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </legend>
                <div className="space-y-2">
                  {question.options &&
                    question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          id={`question_${index}_option_${optionIndex}`}
                          name={`question_${index}_option_${optionIndex}`}
                          type="checkbox"
                          value={option}
                          checked={(formAnswers[`question_${index}`] || []).includes(option)}
                          onChange={(e) => handleInputChange(e, index, "checkbox")}
                          className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9] border-gray-700 rounded bg-[rgba(227,218,201,0.1)]"
                        />
                        <label
                          htmlFor={`question_${index}_option_${optionIndex}`}
                          className="ml-3 block text-sm text-white"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                </div>
              </fieldset>
            </div>
          )
        }

        return (
          <div key={index} className="space-y-2">
            <fieldset>
              <legend className="block text-sm font-medium text-white mb-2">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </legend>
              <div className="space-y-2">
                {question.options &&
                  question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        id={`question_${index}_option_${optionIndex}`}
                        name={`question_${index}_option_${optionIndex}`}
                        type="checkbox"
                        value={option}
                        checked={(formAnswers[`question_${index}`] || []).includes(option)}
                        onChange={(e) => handleInputChange(e, index, "checkbox")}
                        className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9] border-gray-700 rounded bg-[rgba(227,218,201,0.1)]"
                      />
                      <label
                        htmlFor={`question_${index}_option_${optionIndex}`}
                        className="ml-3 block text-sm text-white"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
              </div>
            </fieldset>
          </div>
        )

      case "multipleChoice":
        const selectedOption = formAnswers[`question_${index}`]
        const isFamilyStatus = question.questionText === "Familienstand"
        const requiresUpload =
          question.questionText.toLowerCase().includes("schwerbehinderung") ||
          question.questionText.toLowerCase().includes("kirchenaustritt")

        const partnerQuestions = [
          {
            questionText: "Anrede des Ehepartners",
            questionType: "multipleChoice",
            options: ["Herr", "Frau", "Divers"],
            required: true,
          },
          { questionText: "Vorname des Ehepartners", questionType: "text", required: true },
          { questionText: "Nachname des Ehepartners", questionType: "text", required: true },
          { questionText: "Geburtsdatum des Ehepartners", questionType: "date", required: true },
          { questionText: "Beruf / Tätigkeit des Ehepartners", questionType: "text", required: true },
          { questionText: "Steuer-ID des Ehepartners", questionType: "text", required: true },
          { questionText: "Telefon des Ehepartners", questionType: "text", required: true },
          { questionText: "Nationalität des Ehepartners", questionType: "text", required: true },
          { questionText: "Religion des Ehepartners", questionType: "text", required: false },
          { questionText: "E-Mail-Adresse des Ehepartners", questionType: "text", required: false },
          {
            questionText: "Schwerbehinderung / Pflegegrad beim Ehepartner?",
            questionType: "multipleChoice",
            options: ["Ja", "Nein"],
            required: true,
          },
        ]

        const renderBaseMultipleChoice = () => (
          <fieldset>
            <legend className="block text-sm font-medium text-white mb-2">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </legend>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center">
                  <input
                    id={`question_${index}_option_${optionIndex}`}
                    name={`question_${index}`}
                    type="radio"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => handleInputChange(e, index, "multipleChoice", question)}
                    required={question.required}
                    className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9] border-gray-700 bg-[rgba(227,218,201,0.1)]"
                  />
                  <label htmlFor={`question_${index}_option_${optionIndex}`} className="ml-3 block text-sm text-white">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        )

        // Handle conditional fields for various question types
        if (question.questionText === "Riestervertrag vorhanden?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Versicherungsnummer / Zulagenstelle", questionType: "text", required: true },
                `riester_0`,
              )}
              {renderFormField(
                { questionText: "Anbieter / Vertragsart", questionType: "text", required: true },
                `riester_1`,
              )}
              {renderFormField({ questionText: "Jahresbeitrag", questionType: "number", required: true }, `riester_2`)}
            </div>
          )
        }

        if (
          question.questionText === 'Sonstige Altersvorsorge (z. B. Basisrente / "Rürup")' &&
          selectedOption === "Ja"
        ) {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Anbieter / Vertragsart", questionType: "text", required: true },
                `zrente_0`,
              )}
              {renderFormField({ questionText: "Jahresbeitrag", questionType: "number", required: true }, `zrente_1`)}
            </div>
          )
        }

        if (question.questionText === "Haben Sie im betreffenden Jahr Spenden gezahlt?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField({ questionText: "Gesamtbetrag", questionType: "number", required: true }, `spende_0`)}
              {renderFormField(
                { questionText: "Spendenempfänger / Organisation(en)", questionType: "text", required: true },
                `spende_1`,
              )}
              {renderFormField(
                {
                  questionText: "Wurden Zuwendungsbestätigungen eingereicht?",
                  questionType: "multipleChoice",
                  options: ["Ja", "Nein"],
                  required: true,
                },
                `spende_2`,
              )}
              {renderFormField(
                { questionText: "Upload Spendenbescheinigung", questionType: "fileUpload", required: true },
                `spende_3`,
              )}
            </div>
          )
        }

        // Handle Unterhalt gezahlt
        if (question.questionText === "Haben Sie Unterhalt gezahlt?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField({ questionText: "Empfänger", questionType: "text", required: true }, `unterhalt_0`)}
              {renderFormField(
                { questionText: "Verwandtschaftsverhältnis", questionType: "text", required: true },
                `unterhalt_1`,
              )}
              {renderFormField({ questionText: "Betrag (€)", questionType: "number", required: true }, `unterhalt_2`)}
              {renderFormField(
                {
                  questionText: "Besteht Anspruch auf Anlage U?",
                  questionType: "multipleChoice",
                  options: ["Ja", "Nein"],
                  required: true,
                },
                `unterhalt_3`,
              )}
            </div>
          )
        }

        // Handle Unterhalt bezogen
        if (question.questionText === "Haben Sie Unterhalt bezogen?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField({ questionText: "Betrag (€)", questionType: "number", required: true }, `bezogen_0`)}
            </div>
          )
        }

        // Handle Betreuungskosten
        if (question.questionText === "Betreuungskosten (Kindergarten, Tagesmutter, Hort)" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Anzahl Kinder mit Betreuungskosten", questionType: "number", required: true },
                `betreuung_0`,
              )}
              {renderFormField(
                { questionText: "Gesamtkosten (€)", questionType: "number", required: true },
                `betreuung_1`,
              )}
              {renderFormField(
                {
                  questionText: "Arbeitgeberzuschuss enthalten?",
                  questionType: "multipleChoice",
                  options: ["Ja", "Nein"],
                  required: true,
                },
                `betreuung_2`,
              )}
              {renderFormField(
                { questionText: "Anteil privat gezahlt (€)", questionType: "number", required: true },
                `betreuung_3`,
              )}
              {renderFormField(
                {
                  questionText: "Upload: Rechnungen, Nachweise, Bescheinigungen",
                  questionType: "fileUpload",
                  required: false,
                },
                `betreuung_4`,
              )}
            </div>
          )
        }

        // Handle Gesundheitskosten
        if (
          question.questionText ===
            "Haben Sie im Veranlagungszeitraum Krankheits-, Pflege-, Pflegeheim-, Kurkosten oder andere hohe Belastungen getragen?" &&
          selectedOption === "Ja"
        ) {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Art der Aufwendung", questionType: "text", required: true },
                `gesund_0`,
              )}
              {renderFormField(
                { questionText: "Betrag gesamt (€)", questionType: "number", required: true },
                `gesund_1`,
              )}
              {renderFormField(
                {
                  questionText: "Wurden Zuschüsse (z. B. durch Krankenkasse, Pflegeversicherung) gezahlt?",
                  questionType: "multipleChoice",
                  options: ["Ja", "Nein"],
                  required: true,
                },
                `gesund_2`,
              )}
              {renderFormField(
                {
                  questionText: "Upload: Arztrechnungen, Zuzahlungsübersichten, Bescheide",
                  questionType: "fileUpload",
                  required: false,
                },
                `gesund_3`,
              )}
            </div>
          )
        }

        // Handle Stellungnahme
        if (
          question.questionText === "Möchten Sie zu einem konkreten Fall eine Stellungnahme abgeben?" &&
          selectedOption === "Ja"
        ) {
          return (
            <div key={index} className="space-y-2">
              {renderBaseMultipleChoice()}
              {renderFormField(
                { questionText: "Beschreibung des konkreten Falls", questionType: "textarea", required: true },
                `stellungnahme_0`,
              )}
            </div>
          )
        }

        // Handle Selbstständige/Freiberufliche Tätigkeit (Formular 7)
        if (question.questionText === "Selbstständige/Freiberufliche Tätigkeit vorhanden?" && selectedOption === "Ja") {
          return (
            <div key={index} className="space-y-6">
              {/* Basis Multiple Choice */}
              {renderBaseMultipleChoice()}

              {/* Allgemeine Angaben */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Allgemeine Angaben</h4>

                {/* Art der Tätigkeit */}
                {renderFormField(
                  {
                    questionText: "Art der Tätigkeit",
                    questionType: "multipleChoice",
                    options: ["Freiberuflich", "Gewerbebetrieb", "Sonstige"],
                    required: true,
                  },
                  `selbststaendig_allgemein_0`,
                )}

                {/* Weitere allgemeine Felder */}
                {[
                  { questionText: "Bezeichnung des Unternehmens / der Praxis", questionType: "text" },
                  { questionText: "Beginn der Tätigkeit", questionType: "date" },
                  {
                    questionText: "Wurde die Tätigkeit im VZ beendet?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Firmenanschrift (Straße, PLZ, Ort)", questionType: "text" },
                  { questionText: "Telefonnummer / geschäftliche E-Mail", questionType: "text" },
                  { questionText: "Geschäftliche Bankverbindung", questionType: "text" },
                  { questionText: "Betriebsstättenfinanzamt", questionType: "text" },
                  { questionText: "Steuernummer", questionType: "text" },
                  {
                    questionText: "Besteht eine Eintragung im Handelsregister?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Besteht Bilanzierungspflicht?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Betriebsstätte vorhanden?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "USt-IdNr. (falls vorhanden)", questionType: "text", required: false },
                  {
                    questionText: "Umsatzbesteuerung",
                    questionType: "multipleChoice",
                    options: ["Kleinunternehmerregelung (§19 UStG)", "Regelbesteuerung"],
                  },
                  {
                    questionText: "Wurde ISt-Versteuerung beantragt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Abgabefrist für USt-Voranmeldungen",
                    questionType: "multipleChoice",
                    options: ["monatlich", "vierteljährlich", "jährlich"],
                  },
                  {
                    questionText: "Werden Mitarbeiter beschäftigt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                ].map((q, i) =>
                  renderFormField({ ...q, required: q.required !== false }, `selbststaendig_allgemein_${i + 1}`),
                )}
              </div>

              {/* Ergänzende Angaben */}
              <div className="space-y-4 border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold">Ergänzende Angaben zur steuerlichen Erfassung</h4>
                {[
                  {
                    questionText: "Wurde ein oder mehrere Firmenfahrzeuge genutzt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Wurde ein Homeoffice genutzt?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Bestand die Tätigkeit bereits in Vorjahren?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  {
                    questionText: "Gab es Corona-Hilfen oder sonstige Fördermittel im Veranlagungszeitraum?",
                    questionType: "multipleChoice",
                    options: ["Ja", "Nein"],
                  },
                  { questionText: "Sonstige relevante Hinweise", questionType: "textarea", required: false },
                ].map((q, i) =>
                  renderFormField({ ...q, required: q.required !== false }, `selbststaendig_ergaenzend_${i}`),
                )}
              </div>
            </div>
          )
        }

        // Standard MultipleChoice-Rendering
        return (
          <div key={index} className="space-y-2">
            <fieldset>
              <legend className="block text-sm font-medium text-white mb-2">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </legend>
              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center">
                    <input
                      id={`question_${index}_option_${optionIndex}`}
                      name={`question_${index}`}
                      type="radio"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => handleInputChange(e, index, "multipleChoice", question)}
                      required={question.required}
                      className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9] border-gray-700 bg-[rgba(227,218,201,0.1)]"
                    />
                    <label
                      htmlFor={`question_${index}_option_${optionIndex}`}
                      className="ml-3 block text-sm text-white"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Dynamischer Datei-Upload falls "Ja" */}
            {requiresUpload &&
              selectedOption === "Ja" &&
              renderFormField(
                {
                  questionText: "Bitte Nachweis hochladen",
                  questionType: "fileUpload",
                  required: true,
                },
                `${index}_upload`,
              )}

            {/* Ehepartnerfelder direkt bei Familienstand */}
            {isFamilyStatus && selectedOption === "verheiratet" && (
              <div className="space-y-4 border-t border-b border-gray-700 pt-4 pb-4">
                <h4 className="text-white font-semibold">Angaben zum Ehepartner</h4>
                {partnerQuestions.map((q, idx) => renderFormField(q, `partner_${idx}`))}
              </div>
            )}
          </div>
        )

      case "fileUpload":
        return (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <label
              htmlFor={`file_${index}`}
              className="inline-block cursor-pointer px-4 py-2 bg-[#E3DAC9] text-black rounded-md font-medium hover:bg-[#E3DAC9]/80 transition"
            >
              Datei auswählen
              <input
                type="file"
                name={`file_${index}`}
                id={`file_${index}`}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleInputChange(e, index, "file")}
                className="hidden"
              />
            </label>
            {fileUploads[`file_${index}`] && (
              <p className="text-xs text-[#E3DAC9] mt-1">Datei ausgewählt: {fileUploads[`file_${index}`].name}</p>
            )}
          </div>
        )

      default:
        return (
          <div key={index} className="space-y-2">
            <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              name={`question_${index}`}
              id={`question_${index}`}
              value={formAnswers[`question_${index}`] || ""}
              onChange={(e) => handleInputChange(e, index)}
              required={question.required}
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )
    }
  }

  const getFormDisplayContent = (form) => {
    if (form.questions && form.questions.length > 0) {
      return (
        <div>
          <h3 className="text-lg leading-6 font-medium text-white">{form.title || "Formular"}</h3>
          <p className="mt-1 max-w-2xl text-sm text-white">{form.questions.length} Fragen</p>
        </div>
      )
    }
    return <h3 className="text-lg leading-6 font-medium text-white">Leeres Formular</h3>
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-[#E3DAC9] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Kundenportal</h1>
          <button
            onClick={onLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Card */}
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-white">Willkommen</h2>
            <p className="mt-1 max-w-2xl text-xl text-[#E3DAC9]">
              Hallo, {user.firstName} {user.lastName}
            </p>
          </div>
          <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
            <p className="text-white">
              Ihre Kundennummer: <span className="font-medium text-[#E3DAC9]">{user.kundennummer}</span>
            </p>
            <p className="text-white mt-2">
              Ihre E-Mail-Adresse: <span className="font-medium text-[#E3DAC9]">{user.email}</span>
            </p>
          </div>
        </div>

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

        {/* Current Form */}
        {currentForm && (
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-6" ref={formTopRef}>
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
              <h2 className="text-lg leading-6 font-medium text-white">Formular ausfüllen</h2>
              {currentForm.title && <p className="text-white mt-1">{currentForm.title}</p>}
            </div>
            <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmitForm}>
                <div className="space-y-6">
                  {currentForm.questions && currentForm.questions.length > 0 ? (
                    currentForm.questions.map((question, index) => renderFormField(question, index))
                  ) : (
                    <div className="text-white">Keine Fragen in diesem Formular</div>
                  )}
                </div>

                {/* DSGVO-Hinweise & Einwilligungen */}
                <div className="mt-8 space-y-6 border-t border-gray-700 pt-6">
                  <h3 className="text-white font-bold text-lg">Datenschutz & Einwilligungen</h3>

                  <div className="text-white text-sm space-y-2">
                    <p>
                      <strong>Art. 13 DSGVO:</strong> Ihre Daten werden ausschließlich zur Durchführung der
                      Steuerberatung verarbeitet. Details siehe Datenschutzerklärung.
                    </p>
                    <p>
                      <strong>§ 87d AO:</strong> Ich willige ein, dass meine Identität anhand eines Ausweisdokuments
                      geprüft wird.
                    </p>
                    <p>
                      <strong>Digitale Verarbeitung:</strong> Ich bin mit der digitalen Verarbeitung meiner Daten
                      einverstanden.
                    </p>
                  </div>

                  {/* Upload Ausweis */}
                  {renderFormField(
                    {
                      questionText: "Bitte Ausweisdokument hochladen (PDF, JPG)",
                      questionType: "fileUpload",
                      required: false,
                    },
                    "ausweisdokument_upload",
                  )}

                  {/* Checkbox zur Kenntnisnahme */}
                  {renderFormField(
                    {
                      questionText: "Ich habe die Hinweise gelesen und stimme zu.",
                      questionType: "checkbox",
                      options: ["Einverstanden"],
                      required: true,
                    },
                    "einwilligung_checkbox",
                  )}
                </div>

                {/* Abschließende Bestätigungen */}
                <div className="mt-8 space-y-2 border-t border-gray-700 pt-6">
                  <h3 className="text-white font-bold text-lg">Abschließende Bestätigungen</h3>
                  {renderFormField(
                    {
                      questionText: "Ich versichere, dass alle Angaben nach bestem Wissen gemacht wurden.",
                      questionType: "checkbox",
                      options: ["Zustimmen"],
                      required: true,
                    },
                    "bestaetigung_wissen",
                  )}
                  {renderFormField(
                    {
                      questionText: "Ich bin mit der digitalen Verarbeitung meiner Daten einverstanden.",
                      questionType: "checkbox",
                      options: ["Zustimmen"],
                      required: true,
                    },
                    "bestaetigung_verarbeitung",
                  )}
                  {renderFormField(
                    {
                      questionText: "Ich werde fehlende Nachweise zeitnah nachreichen.",
                      questionType: "checkbox",
                      options: ["Zustimmen"],
                      required: true,
                    },
                    "bestaetigung_nachweise",
                  )}
                </div>

                {/* Add this after the existing file upload handling */}
                {renderFormField(
                  {
                    questionText: "Letzte Steuerbescheide",
                    questionType: "fileUpload",
                    required: false,
                  },
                  `letzte_bescheide_upload`,
                )}

                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleGenerateAndUploadPDF}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9] disabled:opacity-50"
                  >
                    {isSubmitting ? "Wird gesendet..." : "Absenden"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="inline-flex justify-center py-2 px-4 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assigned Forms */}
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
            <h2 className="text-lg leading-6 font-medium text-white">Zugewiesene Formulare</h2>
            <p className="mt-1 max-w-2xl text-sm text-white">Bitte füllen Sie diese Formulare aus</p>
          </div>
          <div className="border-t border-gray-700">
            {isLoading ? (
              <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
            ) : assignedForms.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center text-white">Keine Formulare zugewiesen</div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {assignedForms.map((form) => (
                  <li key={form._id} className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      {getFormDisplayContent(form)}
                      <button
                        onClick={() => handleStartForm(form)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
                        ref={formTopRef}
                      >
                        Ausfüllen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Completed Forms */}
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
            <h2 className="text-lg leading-6 font-medium text-white">Ausgefüllte Formulare</h2>
            <p className="mt-1 max-w-2xl text-sm text-white">Ihre bereits ausgefüllten Formulare</p>
          </div>
          <div className="border-t border-gray-700">
            {isLoading ? (
              <div className="px-4 py-5 sm:px-6 text-center text-white">Laden...</div>
            ) : completedForms.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center text-white">Keine ausgefüllten Formulare</div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {completedForms.map((completed, index) => (
                  <li key={index} className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-white">Ausgefülltes Formular</h3>
                        <p className="mt-1 max-w-2xl text-sm text-white">Formular {index + 1}</p>
                      </div>
                      <a
                        href={`https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${completed.asset._ref.replace("file-", "").replace("-pdf", ".pdf")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)] hover:bg-[rgba(227,218,201,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
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
      </main>
    </div>
  )
}
