"use client"

import Image from "next/image"
import AppointmentButton from "./button"
import Link from "next/link"
import { HelpCircle } from "lucide-react"

export default function AppointmentBooking() {
  return (
    <div className="bg-[#747171] text-white py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[#E3DAC9] text-lg">Terminbuchung</h3>
          <Link href="/terminbuchung-anleitung" className="text-[#E3DAC9] text-sm flex items-center hover:underline">
            <HelpCircle className="h-4 w-4 mr-1" />
            Anleitung zur Terminbuchung
          </Link>
        </div>

        <h2 className="text-white text-3xl lg:text-4xl font-light leading-tight mb-4">
          In 3 einfachen Schritten zu Ihrem Termin
        </h2>

        <p className="text-[#E4E4E4] mb-10 max-w-3xl">
          Vereinbaren Sie jetzt ein kostenloses Erstgespräch, in dem wir gemeinsam besprechen, wie wir Ihnen bei Ihrer
          steuerlichen Situation helfen können. Ob Einnahmenüberschussrechnung, Existenzgründerberatung oder Fragen zu
          Steuererklärungen für Rentner – wir stehen Ihnen mit fachkundigem Rat zur Seite.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Step 1 */}
          <div className="bg-[rgba(227,218,201,0.1)] rounded-lg p-6 flex flex-col items-center text-center">
            <div className="mb-4 h-16 w-16 relative flex items-center justify-center">
              <Image src="/terminart.png" alt="Terminart" width={60} height={60} className="object-contain" />
            </div>
            <h3 className="text-xl font-medium mb-3">Terminart</h3>
            <p className="text-sm text-[#E4E4E4] max-w-[300px]">
              Wählen Sie aus, welche Art von Beratung Sie benötigen – z. B. Kleinunternehmerregelung oder
              Existenzgründerberatung.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[rgba(227,218,201,0.1)] rounded-lg p-6 flex flex-col items-center text-center">
            <div className="mb-4 h-16 w-16 relative flex items-center justify-center">
              <Image src="/uhrzeit.png" alt="Datum und Uhrzeit" width={60} height={60} className="object-contain" />
            </div>
            <h3 className="text-xl font-medium mb-3">Datum und Uhrzeit</h3>
            <p className="text-sm text-[#E4E4E4] max-w-[300px]">
              Suchen Sie sich einen passenden Termin in unserem Kalender aus.
            </p>
            <p className="text-xs text-[#E3DAC9] mt-2">Alle Termine finden online via Google Meet statt</p>
          </div>

          {/* Step 3 */}
          <div className="bg-[rgba(227,218,201,0.1)] rounded-lg p-6 flex flex-col items-center text-center">
            <div className="mb-4 h-16 w-16 relative flex items-center justify-center">
              <Image
                src="/kontaktinformationen.png"
                alt="Kontaktinformationen"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-medium mb-3">Kontaktinformationen</h3>
            <p className="text-sm text-[#E4E4E4] max-w-[300px]">
              Geben Sie Ihre Kontaktdaten ein, damit wir Sie bei Rückfragen erreichen können. <br></br>
              Sie erhalten die Einladung per Email.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <AppointmentButton href="https://cal.meetergo.com/stb-am-rathaus/termin" className="w-full max-w-[300px]" />
          <p className="text-sm text-[#E4E4E4] mt-4 max-w-[500px] text-center md:text-left">
            Unsicher bei der Terminbuchung?{" "}
            <Link href="/terminbuchung-anleitung" className="text-[#E3DAC9] underline">
              Hier finden Sie eine detaillierte Anleitung
            </Link>{" "}
            zum Online-Buchungsprozess.
          </p>
        </div>
      </div>
    </div>
  )
}
