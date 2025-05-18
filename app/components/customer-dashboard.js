"use client"

import { useState, useEffect } from "react"
import {
  getAssignedForms,
  getCompletedForms,
  submitCompletedForm,
  removeFormAfterCompletion,
  uploadFileAndAssignToUser,
  getUserUploadedFiles,
} from "@/sanity/lib"

export default function CustomerDashboard({ user, onLogout }) {
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

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch assigned forms
        const assigned = await getAssignedForms(user._id)
        setAssignedForms(assigned.assignedForms || [])

        // Fetch completed forms
        const completed = await getCompletedForms(user._id)
        setCompletedForms(completed.ausgefuellteformulare || [])

        // Fetch uploaded files
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

  const handleInputChange = (e, index, type = "text") => {
    const { name, value, checked, files } = e.target

    if (type === "checkbox") {
      // Handle checkbox inputs
      setFormAnswers((prev) => {
        const currentValues = prev[`question_${index}`] || []
        if (checked) {
          return { ...prev, [`question_${index}`]: [...currentValues, value] }
        } else {
          return { ...prev, [`question_${index}`]: currentValues.filter((v) => v !== value) }
        }
      })
    } else if (type === "file") {
      // Handle file uploads
      if (files && files.length > 0) {
        const file = files[0]
        setFileUploads((prev) => ({ ...prev, [`file_${index}`]: file }))
        setUploadProgress((prev) => ({ ...prev, [`file_${index}`]: 0 }))
      }
    } else {
      // Handle text and other inputs
      setFormAnswers((prev) => ({ ...prev, [`question_${index}`]: value }))
    }
  }

  const handleStartForm = (form) => {
    setCurrentForm(form)
    setFormAnswers({})
    setFileUploads({})
    setUploadProgress({})
    setError("")
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
      // Sammle alle Antworten, einschließlich Dateien
      const answersWithFiles = { ...formAnswers }

      // Wenn Dateien hochgeladen wurden, verarbeite sie
      if (Object.keys(fileUploads).length > 0) {
        for (const [key, file] of Object.entries(fileUploads)) {
          try {
            // Extrahiere den Index aus dem Schlüssel (z.B. "file_0" -> 0)
            const questionIndex = Number.parseInt(key.split("_")[1])

            // Aktualisiere den Upload-Fortschritt
            setUploadProgress((prev) => ({ ...prev, [key]: 10 }))

            // Lade die Datei hoch und ordne sie dem Benutzer zu
            // Die Datei wird jetzt automatisch auch zu ausgefuellteformulare hinzugefügt
            const uploadResult = await uploadFileAndAssignToUser(user._id, file, questionIndex, currentForm._id)

            // Aktualisiere den Upload-Fortschritt
            setUploadProgress((prev) => ({ ...prev, [key]: 100 }))

            // Füge die Dateiinformationen zu den Antworten hinzu
            answersWithFiles[key] = {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              fileId: uploadResult.fileId,
              fileUrl: uploadResult.url,
              fileKey: uploadResult.key,
            }

            // Aktualisiere die Liste der hochgeladenen Dateien
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

      // Submit completed form to Sanity
      await submitCompletedForm(user._id, currentForm, answersWithFiles)

      // Remove the form from assigned forms
      await removeFormAfterCompletion(user._id, currentForm._id)

      // Update local state - remove from assigned forms
      setAssignedForms(assignedForms.filter((form) => form._id !== currentForm._id))

      // Refresh completed forms
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

  // Hilfsfunktion zum Rendern der Formularfelder basierend auf dem Fragetyp
  const renderFormField = (question, index) => {
    if (!question) return null

    // Fallback für alte Formularstruktur
    if (typeof question === "string") {
      return (
        <div key={index} className="space-y-2">
          <label htmlFor={`question_${index}`} className="block text-sm font-medium text-white">
            {question}
          </label>
          <input
            type="text"
            name={`question_${index}`}
            id={`question_${index}`}
            value={formAnswers[`question_${index}`] || ""}
            onChange={(e) => handleInputChange(e, index)}
            required
            className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border  rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
          />
        </div>
      )
    }

    // Neue Formularstruktur
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
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)] border  rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )

      case "checkbox":
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
                        className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9]  rounded bg-[rgba(227,218,201,0.1)]"
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
                        name={`question_${index}`}
                        type="radio"
                        value={option}
                        checked={formAnswers[`question_${index}`] === option}
                        onChange={(e) => handleInputChange(e, index)}
                        required={question.required}
                        className="h-4 w-4 text-[#E3DAC9] focus:ring-[#E3DAC9]  bg-[rgba(227,218,201,0.1)]"
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

      case "fileUpload":
        const fileKey = `file_${index}`
        const progress = uploadProgress[fileKey] || 0
        const fileUpload = fileUploads[fileKey]

        // Finde bereits hochgeladene Dateien für diese Frage
        const existingFiles = uploadedFiles.filter(
          (file) => file.formId === currentForm._id && file.questionIndex === index,
        )

        return (
          <div key={index} className="space-y-2">
            <label htmlFor={fileKey} className="block text-sm font-medium text-white">
              {question.questionText}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              id={fileKey}
              name={fileKey}
              onChange={(e) => handleInputChange(e, index, "file")}
              required={question.required && existingFiles.length === 0}
              className="mt-1 block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#E3DAC9] file:text-black hover:file:bg-[#E3DAC9]/80"
            />

            {/* Zeige bereits hochgeladene Dateien an */}
            {existingFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium text-white">Bereits hochgeladene Dateien:</p>
                <ul className="space-y-1">
                  {existingFiles.map((file) => (
                    <li key={file._key} className="flex items-center space-x-2">
                      <span className="text-sm text-[#E3DAC9]">{file.fileName}</span>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white "
                      >
                        Öffnen
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fileUpload && (
              <div className="mt-2">
                <p className="text-sm text-[#E3DAC9]">Datei ausgewählt: {fileUpload.name}</p>

                {isSubmitting && (
                  <div className="w-full bg-[rgba(227,218,201,0.1)] rounded-full h-2.5 mt-1">
                    <div className="bg-[#E3DAC9] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                )}
              </div>
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
              className="mt-1 block w-full bg-[rgba(227,218,201,0.1)]  rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
            />
          </div>
        )
    }
  }

  // Hilfsfunktion zum Anzeigen des Formularinhalts
  const getFormDisplayContent = (form) => {
    if (form.questions && form.questions.length > 0) {
      return (
        <div>
          <h3 className="text-lg leading-6 font-medium text-white">{form.title || "Formular"}</h3>
          <p className="mt-1 max-w-2xl text-sm text-white">{form.questions.length} Fragen</p>
        </div>
      )
    } else if (form.frageeins || form.fragezwei) {
      // Fallback für alte Formularstruktur
      return (
        <div>
          <h3 className="text-lg leading-6 font-medium text-white">Formular</h3>
          <p className="mt-1 max-w-2xl text-sm text-white">Frage 1: {form.frageeins}</p>
          <p className="mt-1 max-w-2xl text-sm text-white">Frage 2: {form.fragezwei}</p>
        </div>
      )
    }
    return <h3 className="text-lg leading-6 font-medium text-white">Leeres Formular</h3>
  }

  return (
    <div className="min-h-screen">
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
            <p className="mt-1 max-w-2xl text-xl text-[#E3DAC9] ">
              Hallo, {user.firstName} {user.lastName}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
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
          <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]/20">
              <h2 className="text-lg leading-6 font-medium text-white">Formular ausfüllen</h2>
              {currentForm.title && <p className="text-white mt-1">{currentForm.title}</p>}
            </div>
            <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmitForm}>
                <div className="space-y-6">
                  {currentForm.questions && currentForm.questions.length > 0 ? (
                    // Neue Formularstruktur
                    currentForm.questions.map((question, index) => renderFormField(question, index))
                  ) : (
                    // Fallback für alte Formularstruktur
                    <>
                      <div className="space-y-2">
                        <label htmlFor="frageeins" className="block text-sm font-medium text-white">
                          {currentForm.frageeins}
                        </label>
                        <input
                          type="text"
                          name="frageeins"
                          id="frageeins"
                          value={formAnswers.frageeins || ""}
                          onChange={(e) => setFormAnswers({ ...formAnswers, frageeins: e.target.value })}
                          required
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="fragezwei" className="block text-sm font-medium text-white">
                          {currentForm.fragezwei}
                        </label>
                        <input
                          type="text"
                          name="fragezwei"
                          id="fragezwei"
                          value={formAnswers.fragezwei || ""}
                          onChange={(e) => setFormAnswers({ ...formAnswers, fragezwei: e.target.value })}
                          required
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#E3DAC9] focus:border-[#E3DAC9]"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-[#E3DAC9] hover:bg-[#E3DAC9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9] disabled:opacity-50"
                  >
                    {isSubmitting ? "Wird gesendet..." : "Absenden"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="inline-flex justify-center py-2 px-4 border  shadow-sm text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)]  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
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
                        className="inline-flex items-center px-4 py-2 border  shadow-sm text-sm font-medium rounded-md text-white bg-[rgba(227,218,201,0.1)]  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
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
