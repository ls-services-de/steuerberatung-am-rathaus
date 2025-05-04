"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Mail,
  LogIn,
  FileText,
  Send,
  Download,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from "lucide-react"

export default function KundenkontoAnleitung() {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 6

  // Auto-advance through steps with a pause
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1)
      }
    }, 8000) // 8 seconds per step

    return () => clearTimeout(timer)
  }, [currentStep])

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    {
      title: "E-Mail mit Zugangsdaten erhalten",
      description:
        "Nach der Erstellung Ihres Kundenkontos durch unseren Administrator erhalten Sie eine E-Mail mit Ihren persönlichen Zugangsdaten (E-Mail und Passwort).",
      icon: <Mail className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
            <div className="bg-[#E3DAC9] rounded-full p-2 mr-3">
              <Mail className="h-6 w-6 text-black" />
            </div>
            <div>
              <div className="font-bold text-black">Steuerberatung am Rathaus</div>
              <div className="text-sm text-black">stb-am-rathaus@email.de</div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-black mb-2">Ihr Kundenkonto</h3>
          <p className="text-black mb-4">Sehr geehrte/r Kunde/in, Ihr Kundenkonto wurde eingerichtet.</p>
          <motion.div
            className="bg-gray-100 p-3 rounded-md mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <p className="text-sm text-black">
              <span className="font-bold">E-Mail:</span> kunde@example.com
            </p>
            <p className="text-sm text-black">
              <span className="font-bold">Passwort:</span> Kd7!xP9#rT
            </p>
          </motion.div>
          <motion.div
            className="bg-[#E3DAC9] text-center py-2 px-4 rounded-md text-black font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            Login
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: "Im Kundenkonto anmelden",
      description:
        "Besuchen Sie unsere Website und melden Sie sich mit Ihren Zugangsdaten an.",
      icon: <LogIn className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <a href="/login" className="text-xl font-bold text-white mb-6 text-center">Login</a>
          <motion.div
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div>
              <label className="block text-[#E3DAC9] text-sm font-medium mb-2">E-Mail</label>
              <motion.input
                type="email"
                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                placeholder="kunde@example.com"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              />
            </div>
            <div>
              <label className="block text-[#E3DAC9] text-sm font-medium mb-2">Passwort</label>
              <motion.input
                type="password"
                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                value="••••••••••"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              />
            </div>
          </motion.div>
          <motion.button
            className="w-full mt-6 bg-[#E3DAC9] text-black font-bold py-3 px-4 rounded-md"
            whileHover={{ scale: 1.03, backgroundColor: "#d1c3a8" }}
            whileTap={{ scale: 0.97 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
          >
            Anmelden
          </motion.button>
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.1 }}
          >
            <a href="#" className="text-sm text-[#E3DAC9] hover:underline">
              Passwort vergessen?
            </a>
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: "Formulare einsehen und ausfüllen",
      description:
        "In Ihrem Dashboard finden Sie alle Formulare, die für Sie bereitgestellt wurden. Klicken Sie auf 'Ausfüllen', um ein Formular zu bearbeiten.",
      icon: <FileText className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Zugewiesene Formulare</h3>
          <div className="space-y-4">
            <motion.div
              className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white">Formular 1</h4>
                  <p className="text-sm text-gray-300 mt-1">31.07.2025</p>
                </div>
                <motion.button
                  className="bg-[#E3DAC9] text-black px-4 py-2 rounded-md font-medium text-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "#d1c3a8" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ausfüllen
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white">Formular 2</h4>
                  <p className="text-sm text-gray-300 mt-1">15.06.2025</p>
                </div>
                <motion.button
                  className="bg-[#E3DAC9] text-black px-4 py-2 rounded-md font-medium text-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "#d1c3a8" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ausfüllen
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white">Formular 3</h4>
                  <p className="text-sm text-gray-300 mt-1">30.06.2025</p>
                </div>
                <motion.button
                  className="bg-[#E3DAC9] text-black px-4 py-2 rounded-md font-medium text-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "#d1c3a8" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ausfüllen
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ),
    },
    {
      title: "Formular absenden",
      description:
        "Nachdem Sie alle erforderlichen Felder ausgefüllt haben, können Sie das Formular mit einem Klick auf 'Absenden' an uns übermitteln.",
      icon: <Send className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Einkommensteuererklärung 2025</h3>
          <div className="space-y-4">
            <motion.div
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <label className="block text-[#E3DAC9] text-sm font-medium">
                Einkünfte aus nichtselbständiger Arbeit
              </label>
              <input
                type="text"
                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                value="45.750,00 €"
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <label className="block text-[#E3DAC9] text-sm font-medium">Werbungskosten</label>
              <input
                type="text"
                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                value="2.340,00 €"
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <label className="block text-[#E3DAC9] text-sm font-medium">Sonderausgaben</label>
              <input
                type="text"
                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                value="1.250,00 €"
              />
            </motion.div>
          </div>

          <div className="mt-8 flex justify-between">
            <motion.button
              className="bg-[rgba(227,218,201,0.1)] text-white px-4 py-2 rounded-md font-medium"
              whileHover={{ scale: 1.05, backgroundColor: "#4b5563" }}
              whileTap={{ scale: 0.95 }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              Speichern
            </motion.button>

            <motion.button
              className="bg-[#E3DAC9] text-black px-6 py-2 rounded-md font-medium flex items-center"
              whileHover={{ scale: 1.05, backgroundColor: "#d1c3a8" }}
              whileTap={{ scale: 0.95 }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <Send className="h-4 w-4 mr-2" /> Absenden
            </motion.button>
          </div>

          <motion.div
            className="mt-6 text-center text-sm text-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.1 }}
          >
            Alle Felder mit * sind Pflichtfelder
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: "Ausgefüllte Formulare einsehen",
      description:
        "Nach dem Absenden finden Sie Ihre ausgefüllten Formulare im Bereich 'Ausgefüllte Formulare'. Von dort können Sie die Dokumente als PDF herunterladen.",
      icon: <Download className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Ausgefüllte Formulare</h3>
          <div className="space-y-4">
            <motion.div
              className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white">Formular 1</h4>
                  <p className="text-sm text-gray-300 mt-1">Eingereicht am: 15.05.2024</p>
                </div>
                <motion.button
                  className="bg-[#E3DAC9] text-black px-4 py-2 rounded-md font-medium text-sm flex items-center"
                  whileHover={{ scale: 1.05, backgroundColor: "#d1c3a8" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4 mr-1" /> PDF
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white">Formular 2</h4>
                  <p className="text-sm text-gray-300 mt-1">Eingereicht am: 10.05.2024</p>
                </div>
                <motion.button
                  className="bg-[#E3DAC9] text-black px-4 py-2 rounded-md font-medium text-sm flex items-center"
                  whileHover={{ scale: 1.05, backgroundColor: "#d1c3a8" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4 mr-1" /> PDF
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20 opacity-50"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.5 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white">Formular 3</h4>
                  <p className="text-sm text-gray-300 mt-1">Noch nicht eingereicht</p>
                </div>
                <span className="text-sm text-gray-400">Ausstehend</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-6 p-3 bg-[rgba(227,218,201,0.1)] rounded-md border border-[#E3DAC9]/30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <p className="text-sm text-[#E3DAC9]">
              <span className="font-bold">Hinweis:</span> Ihre eingereichten Formulare werden von unserem Team geprüft.
              Bei Rückfragen werden wir Sie per E-Mail kontaktieren.
            </p>
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: "Weitere Kommunikation",
      description:
        "Unser Team bearbeitet Ihre Formulare und kontaktiert Sie bei Bedarf per E-Mail. Bei Fragen können Sie jederzeit unser Kontaktformular nutzen.",
      icon: <MessageSquare className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="bg-[#E3DAC9] rounded-full p-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CheckCircle className="h-12 w-12 text-black" />
            </motion.div>
          </div>

          <motion.h3
            className="text-xl font-bold text-white mb-4 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            Wir kümmern uns um Ihr Anliegen
          </motion.h3>

          <motion.p
            className="text-[#E4E4E4] text-center mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            Ihre Formulare werden von unserem Team bearbeitet. Bei Rückfragen oder Updates kontaktieren wir Sie per
            E-Mail.
          </motion.p>

          <motion.div
            className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <h4 className="font-medium text-white mb-2">Haben Sie Fragen?</h4>
            <p className="text-sm text-gray-300 mb-4">Nutzen Sie unser Kontaktformular oder rufen Sie uns direkt an.</p>
            <div className="flex space-x-3">
                <a href="/#kontakt">
              <motion.button
                className="bg-[#E3DAC9] text-black px-4 py-2 rounded-md font-medium text-sm flex-1 flex items-center justify-center"
                whileHover={{ scale: 1.05, backgroundColor: "#d1c3a8" }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />  Kontaktformular
              </motion.button>
              </a>
              <motion.button
                className="bg-transparent border border-[#E3DAC9] text-white px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(227,218,201,0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                +49 020414066389
              </motion.button>
            </div>
          </motion.div>

         
        </motion.div>
      ),
    },
  ]

  return (
    <div className="min-h-[100vh]">
      {/* Header */}
      <header className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Steuerberatung am Rathaus</h1>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:text-black bg-[rgba(227,218,201,0.1)] hover:bg-[#E3DAC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
          >
            Zurück zur Startseite
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]">
            <h2 className="text-2xl font-semibold text-black">Anleitung zum Kundenkonto</h2>
            <p className="mt-1 max-w-2xl text-sm text-black">
              Schritt für Schritt Erklärung zur Nutzung Ihres Kundenkontos
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#E3DAC9]">Fortschritt</span>
                <span className="text-sm text-[#E3DAC9]">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-black rounded-full h-2.5">
                <motion.div
                  className="bg-[#E3DAC9] h-2.5 rounded-full"
                  initial={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>

            {/* Step content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <motion.div
                  key={`step-text-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="flex items-center mb-4">
                    {steps[currentStep].icon}
                    <h3 className="text-xl font-bold text-white ml-4">{steps[currentStep].title}</h3>
                  </div>
                  <p className="text-[#E4E4E4] text-lg">{steps[currentStep].description}</p>
                </motion.div>

                {/* Navigation buttons */}
                <div className="flex justify-between mt-8">
                  <motion.button
                    onClick={prevStep}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      currentStep === 0
                        ? "bg-[rgba(227,218,201,0.1)] text-white cursor-not-allowed"
                        : "bg-[#E3DAC9] text-black "
                    }`}
                    whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
                    whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" /> Zurück
                  </motion.button>

                  <motion.button
                    onClick={nextStep}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      currentStep === totalSteps - 1
                        ? "bg-[rgba(227,218,201,0.1)] text-white cursor-not-allowed"
                        : "bg-[#E3DAC9] text-black "
                    }`}
                    whileHover={currentStep < totalSteps - 1 ? { scale: 1.05 } : {}}
                    whileTap={currentStep < totalSteps - 1 ? { scale: 0.95 } : {}}
                    disabled={currentStep === totalSteps - 1}
                  >
                    Weiter <ChevronRight className="h-5 w-5 ml-2" />
                  </motion.button>
                </div>
              </div>

              <div className="flex justify-center">
                <motion.div
                  key={`step-animation-${currentStep}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  {steps[currentStep].animation}
                </motion.div>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center mt-12">
              {steps.map((step, index) => (
                <motion.button
                  key={index}
                  className={`h-3 w-3 rounded-full mx-1 ${currentStep === index ? "bg-[#E3DAC9]" : "bg-black"}`}
                  onClick={() => setCurrentStep(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={currentStep === index ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="bg-[#747171] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2025 Steuerberatung am Rathaus und Liam Schneider. Alle Rechte vorbehalten.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/datenschutz" className="text-sm text-[#E3DAC9] hover:text-white">
                Datenschutz
              </a>
              <a href="/impressum" className="text-sm text-[#E3DAC9] hover:text-white">
                Impressum
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
