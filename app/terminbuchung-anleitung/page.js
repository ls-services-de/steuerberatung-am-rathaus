"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, FileText, Send, Mail, Bell, Video, ChevronRight, ChevronLeft } from "lucide-react"

export default function TerminbuchungAnleitung() {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 7

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
      title: "Termin buchen",
      description: "Klicken Sie auf unserer Website auf den Link 'Termin buchen', um den Buchungsprozess zu starten.",
      icon: <Calendar className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <div className="bg-[#E3DAC9] rounded-full p-2 mr-3">
              <Calendar className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white">Steuerberatung am Rathaus</h3>
          </div>

          <div className="space-y-4">
            

            <motion.div
              className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-[#E3DAC9] mr-3" />
                <span className="text-white">Kostenloses Erstgespräch</span>
                <Video className="h-5 w-5 text-[#E3DAC9] ml-3" />
                <span className="text-white text-xs ml-1">Online via Google Meet</span>
              </div>
            </motion.div>
          </div>

          <motion.button
            className="w-full mt-6 bg-[#E3DAC9] text-black font-bold py-3 px-4 rounded-md"
            whileHover={{ scale: 1.03, backgroundColor: "#d1c3a8" }}
            whileTap={{ scale: 0.97 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
          >
            Termin buchen
          </motion.button>
        </motion.div>
      ),
    },
    {
      title: "Datum und Uhrzeit auswählen",
      description:
        "Wählen Sie ein passendes Datum und eine Uhrzeit für Ihren Online-Termin aus den verfügbaren Optionen.",
      icon: <Clock className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Terminauswahl</h3>

          <motion.div
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <label className="block text-[#E3DAC9] text-sm font-medium mb-2">Datum auswählen</label>
            <div className="bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md p-4">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                <span className="text-xs text-gray-400">Mo</span>
                <span className="text-xs text-gray-400">Di</span>
                <span className="text-xs text-gray-400">Mi</span>
                <span className="text-xs text-gray-400">Do</span>
                <span className="text-xs text-gray-400">Fr</span>
                <span className="text-xs text-gray-400">Sa</span>
                <span className="text-xs text-gray-400">So</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[...Array(31)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-8 w-8 flex items-center justify-center rounded-full text-sm 
                      ${i === 14 ? "bg-[#E3DAC9] text-black" : "text-white hover:bg-[rgba(227,218,201,0.2)]"}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: i < 28 ? 1 : 0.5 }}
                    transition={{ duration: 0.2, delay: 0.1 + i * 0.01 }}
                  >
                    {i + 1}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <label className="block text-[#E3DAC9] text-sm font-medium mb-2">Uhrzeit auswählen</label>
            <div className="grid grid-cols-3 gap-2">
              {["09:00", "10:30", "11:45", "13:15", "14:30", "16:00"].map((time, i) => (
                <motion.div
                  key={time}
                  className={`p-2 text-center rounded-md text-sm cursor-pointer
                    ${i === 2 ? "bg-[#E3DAC9] text-black" : "bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(227,218,201,0.2)]"}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                >
                  {time}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="mt-4 p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
          >
            <div className="flex items-center">
              <Video className="h-5 w-5 text-[#E3DAC9] mr-2" />
              <p className="text-sm text-white">Online-Termin via Google Meet</p>
            </div>
          </motion.div>

          <motion.button
            className="w-full mt-6 bg-[#E3DAC9] text-black font-bold py-3 px-4 rounded-md"
            whileHover={{ scale: 1.03, backgroundColor: "#d1c3a8" }}
            whileTap={{ scale: 0.97 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.3 }}
          >
            Weiter
          </motion.button>
        </motion.div>
      ),
    },
    {
      title: "Formular ausfüllen",
      description:
        "Geben Sie Ihre persönlichen Daten und den Grund Ihres Termins an, damit wir uns optimal auf Ihr Anliegen vorbereiten können.",
      icon: <FileText className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Persönliche Daten</h3>

          <div className="space-y-4">
            <motion.div
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <label className="block text-[#E3DAC9] text-sm font-medium">Name</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="w-1/2 p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                  placeholder="Vorname"
                  value="Max"
                />
                <input
                  type="text"
                  className="w-1/2 p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                  placeholder="Nachname"
                  value="Mustermann"
                />
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <label className="block text-[#E3DAC9] text-sm font-medium">Kontakt</label>
              <input
                type="email"
                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                placeholder="E-Mail"
                value="max.mustermann@example.com"
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <input
                type="tel"
                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                placeholder="Telefonnummer"
                value="+49 123 456789"
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <label className="block text-[#E3DAC9] text-sm font-medium">Grund des Termins</label>
              <select className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white">
                <option>Kostenloses Erstgespräch</option>
                
              </select>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.1 }}
            >
              <label className="block text-[#E3DAC9] text-sm font-medium">Anmerkungen</label>
              <textarea
                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md text-white"
                rows="3"
                placeholder="Weitere Informationen zu Ihrem Anliegen..."
                value="Ich benötige Hilfe bei meiner Steuererklärung für das Jahr 2023."
              ></textarea>
            </motion.div>
          </div>

          <motion.div
            className="mt-4 p-3 bg-[rgba(255,255,255,0.05)] border border-[#E3DAC9]/30 rounded-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.3 }}
          >
            <div className="flex items-center">
              <Video className="h-5 w-5 text-[#E3DAC9] mr-2" />
              <p className="text-sm text-white">
                Der Termin findet online via Google Meet statt. Sie erhalten den Link in Ihrer Bestätigungsmail.
              </p>
            </div>
          </motion.div>

          <motion.button
            className="w-full mt-6 bg-[#E3DAC9] text-black font-bold py-3 px-4 rounded-md"
            whileHover={{ scale: 1.03, backgroundColor: "#d1c3a8" }}
            whileTap={{ scale: 0.97 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.5 }}
          >
            Termin buchen
          </motion.button>
        </motion.div>
      ),
    },
    {
      title: "Buchung abschließen",
      description:
        "Überprüfen Sie Ihre Angaben und bestätigen Sie die Buchung. Sie erhalten anschließend eine Bestätigungsseite mit allen Details.",
      icon: <Send className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-[rgba(227,218,201,0.1)] rounded-lg shadow-lg p-6 max-w-md mx-auto border border-[#E3DAC9]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Terminübersicht</h3>

          <motion.div
            className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#E3DAC9] text-sm">Datum</p>
                <p className="text-white font-medium">15. Juni 2024</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] text-sm">Uhrzeit</p>
                <p className="text-white font-medium">11:45 Uhr</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] text-sm">Termin</p>
                <p className="text-white font-medium">Kostenloses Erstgespräch</p>
              </div>
              <div>
                <p className="text-[#E3DAC9] text-sm">Dauer</p>
                <p className="text-white font-medium">60 Minuten</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E3DAC9]/20">
              <div className="flex items-center">
                <Video className="h-5 w-5 text-[#E3DAC9] mr-2" />
                <p className="text-white text-sm">Online-Termin via Google Meet</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h4 className="text-[#E3DAC9] text-sm mb-2">Persönliche Daten</h4>
            <p className="text-white">Max Mustermann</p>
            <p className="text-white">max.mustermann@example.com</p>
            <p className="text-white">+49 123 456789</p>
          </motion.div>

          <motion.div
            className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <h4 className="text-[#E3DAC9] text-sm mb-2">Anmerkungen</h4>
            <p className="text-white">Ich benötige Hilfe bei meiner Steuererklärung für das Jahr 2023.</p>
          </motion.div>

          <motion.div
            className="flex items-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <input type="checkbox" id="terms" className="mr-2" checked />
            <label htmlFor="terms" className="text-sm text-white">
              Ich akzeptiere die <span className="text-[#E3DAC9]">Datenschutzbestimmungen</span>
            </label>
          </motion.div>

          <motion.button
            className="w-full bg-[#E3DAC9] text-black font-bold py-3 px-4 rounded-md"
            whileHover={{ scale: 1.03, backgroundColor: "#d1c3a8" }}
            whileTap={{ scale: 0.97 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.1 }}
          >
            Buchung bestätigen
          </motion.button>
        </motion.div>
      ),
    },
    {
      title: "Bestätigungsemail erhalten",
      description:
        "Nach erfolgreicher Buchung erhalten Sie eine Bestätigungsemail mit allen Details zu Ihrem Termin und dem Google Meet Link.",
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
              <Mail className="h-6 w-6 text-gray-800" />
            </div>
            <div>
              <div className="font-bold text-gray-800">Steuerberatung am Rathaus</div>
              <div className="text-sm text-gray-600">stb-am-rathaus@email.de</div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-2">Terminbestätigung</h3>

          <p className="text-gray-700 mb-4">
            Sehr geehrter Herr Mustermann,
            <br />
            <br />
            vielen Dank für Ihre Terminbuchung. Wir bestätigen hiermit Ihren Online-Termin:
          </p>

          <motion.div
            className="bg-gray-100 p-3 rounded-md mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <p className="text-sm text-gray-800">
              <span className="font-bold">Datum:</span> 15. Juni 2024
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-bold">Uhrzeit:</span> 11:45 Uhr
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-bold">Termin:</span> Kostenloses Erstgespräch
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-bold">Format:</span> Online via Google Meet
            </p>
          </motion.div>

          <motion.div
            className="bg-blue-50 p-3 rounded-md mb-4 border border-blue-200"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <div className="flex items-center mb-2">
              <Video className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm font-bold text-blue-800">Google Meet Link:</p>
            </div>
            <a href="#" className="text-sm text-blue-600 underline break-all">
              https://meet.google.com/abc-defg-hij
            </a>
            <p className="text-xs text-gray-600 mt-2">
              Klicken Sie zum Zeitpunkt des Termins auf den Link, um dem Meeting beizutreten.
            </p>
          </motion.div>

          <p className="text-gray-700 mb-4">
            Bitte halten Sie alle relevanten Unterlagen bereit. Eine Stunde vor Ihrem Termin erhalten Sie eine
            Erinnerung per E-Mail mit dem Meeting-Link.
          </p>

          <p className="text-gray-700 mb-4">
            Bei Fragen oder wenn Sie den Termin verschieben möchten, kontaktieren Sie uns bitte unter +49 020414066389.
          </p>

          <p className="text-gray-700">
            Mit freundlichen Grüßen,
            <br />
            Ihr Team der Steuerberatung am Rathaus
          </p>
        </motion.div>
      ),
    },
    {
      title: "Terminerinnerung erhalten",
      description:
        "Eine Stunde vor Ihrem Termin erhalten Sie eine Erinnerung per E-Mail mit dem Google Meet Link, damit Sie pünktlich teilnehmen können.",
      icon: <Bell className="h-12 w-12 text-[#E3DAC9]" />,
      animation: (
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
            <div className="bg-[#E3DAC9] rounded-full p-2 mr-3">
              <Bell className="h-6 w-6 text-gray-800" />
            </div>
            <div>
              <div className="font-bold text-gray-800">Steuerberatung am Rathaus</div>
              <div className="text-sm text-gray-600">stb-am-rathaus@email.de</div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-2">Terminerinnerung</h3>

          <p className="text-gray-700 mb-4">
            Sehr geehrter Herr Mustermann,
            <br />
            <br />
            wir möchten Sie an Ihren heutigen Online-Termin erinnern:
          </p>

          <motion.div
            className="bg-gray-100 p-3 rounded-md mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <p className="text-sm text-gray-800">
              <span className="font-bold">Datum:</span> Heute, 15. Juni 2024
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-bold">Uhrzeit:</span> 11:45 Uhr (in 1 Stunde)
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-bold">Termin:</span> Kostenloses Erstgespräch
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-bold">Format:</span> Online via Google Meet
            </p>
          </motion.div>

          <motion.div
            className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <div className="flex items-center mb-2">
              <Video className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm font-bold text-blue-800">Google Meet Link:</p>
            </div>
            <a href="#" className="text-sm text-blue-600 underline break-all">
              https://meet.google.com/abc-defg-hij
            </a>
            <p className="text-xs text-gray-600 mt-2">
              Klicken Sie zum Zeitpunkt des Termins auf den Link, um dem Meeting beizutreten.
            </p>
          </motion.div>

          <p className="text-gray-700 mb-4">
            Bitte halten Sie alle relevanten Unterlagen bereit und stellen Sie sicher, dass Ihre Kamera und Ihr Mikrofon
            funktionieren.
          </p>

          <motion.button
            className="w-full bg-[#E3DAC9] text-center py-2 px-4 rounded-md text-gray-800 font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            Jetzt am Meeting teilnehmen
          </motion.button>
        </motion.div>
      ),
    },
    {
      title: "Am Online-Termin teilnehmen",
      description:
        "Zum Zeitpunkt des Termins klicken Sie einfach auf den Google Meet Link in Ihrer E-Mail, um am Online-Meeting teilzunehmen.",
      icon: <Video className="h-12 w-12 text-[#E3DAC9]" />,
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
              <Video className="h-12 w-12 text-black" />
            </motion.div>
          </div>

          <motion.h3
            className="text-xl font-bold text-white mb-4 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            Google Meet Besprechung
          </motion.h3>

          <motion.div
            className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold mr-2">
                  S
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Steuerberatung am Rathaus</p>
                  <p className="text-white text-xs">Gastgeber</p>
                </div>
              </div>
              <div className="text-white text-sm">11:45 Uhr</div>
            </div>

            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold mr-2">
                  M
                </div>
                <p className="text-white text-sm">Max Mustermann</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <motion.div
                className="bg-red-500 rounded-full h-10 w-10 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
              <motion.div
                className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
              <motion.div
                className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="bg-[rgba(255,255,255,0.05)] p-4 rounded-md border border-[#E3DAC9]/20 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <h4 className="font-medium text-white mb-2">Tipps für Ihren Online-Termin:</h4>
            <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
              <li>Stellen Sie sicher, dass Ihre Internetverbindung stabil ist</li>
              <li>Testen Sie Kamera und Mikrofon vor dem Meeting</li>
              <li>Wählen Sie einen ruhigen Ort ohne Hintergrundgeräusche</li>
              <li>Halten Sie alle relevanten Unterlagen bereit</li>
            </ul>
          </motion.div>

          <motion.div
            className="text-center text-sm text-[#E3DAC9]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
          >
            Bei technischen Problemen können Sie uns jederzeit unter +49 020414066389 erreichen.
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
            <h2 className="text-2xl font-semibold text-black">Anleitung zur Terminbuchung</h2>
            <p className="mt-1 max-w-2xl text-sm text-black">
              Schritt für Schritt Erklärung zum Buchen eines Online-Termins via Google Meet
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
