"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import CookieConsent from "react-cookie-consent"

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false)

  // Only render on client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <CookieConsent
    expires={7}
      location="bottom"
      buttonText="Alle akzeptieren"
      declineButtonText="Ablehnen"
      enableDeclineButton
      cookieName="cookie-consent"
      style={{
        background: "#5F5F5F",
        color: "white",
        maxWidth: "500px",
        margin: "0 auto 20px",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
      buttonStyle={{
        background: "#E3DAC9",
        color: "black",
        fontSize: "14px",
        padding: "8px 16px",
        borderRadius: "4px",
        cursor: "pointer",
      }}
      declineButtonStyle={{
        background: "transparent",
        color: "white",
        fontSize: "14px",
        padding: "8px 16px",
        borderRadius: "4px",
        cursor: "pointer",
        textDecoration: "none",
        border: "none",
      }}
      contentStyle={{
        flex: "1 0 100%",
        margin: "15px 0",
      }}
      buttonWrapperClasses="flex justify-end gap-2 mt-4"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-lg font-medium">Wir benutzen Cookies</h3>
          <Image src="/cookie.png" alt="Cookie" width={24} height={24} className="inline-block" />
        </div>
        <p className="text-sm mt-2">
          Wir setzen Cookies ein, um unsere Buchungsfunktionen kontinuierlich zu optimieren und die Leistungsfähigkeit
          unserer KI-basierten Supportsysteme zu verbessern.
        </p>
        <div className="flex justify-between mt-4">
          <Link href="/datenschutz" className="text-white underline text-sm">
            Datenschutz
          </Link>
        </div>
      </div>
    </CookieConsent>
  )
}
