"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Instagram, FileText, Shield, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[rgba(227,218,201,0.1)]  text-white py-8 mt-[100px] border-t-2 border-[#E3DAC9]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-8 items-start">
          {/* Logo Section */}
          <div className="flex justify-center md:justify-start">
            <div className="w-[300px] h-[300px] relative">
              <img src="/logo-top-nobottom-black.png" alt="Logo" className="object-contain " />
            </div>
          </div>

          {/* Links Section */}
          <div className="text-center md:text-left">
            <h3 className="font-medium mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/impressum" className="flex items-center justify-center md:justify-start gap-2 hover:text-gray-300 transition-colors">
                  <FileText size={16} className="text-[#E3DAC9]"/>
                  <span>Impressum</span>
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="flex items-center justify-center md:justify-start gap-2 hover:text-gray-300 transition-colors">
                  <Shield size={16} className="text-[#E3DAC9]"/>
                  <span>Datenschutz</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-center md:text-left">
            <h3 className="font-medium mb-4">Kontakt</h3>
            <ul className="space-y-2">
              <li>
                <Link href="tel:+4902041406389" className="flex items-center justify-center md:justify-start gap-2 hover:text-gray-300 transition-colors">
                  <Phone size={16} className="text-[#E3DAC9]"/>
                  <span>+49 02041406389</span>
                </Link>
              </li>
              <li>
                <Link href="mailto:stb-am-rathaus@email.de" className="flex items-center justify-center md:justify-start gap-2 hover:text-gray-300 transition-colors">
                  <Mail size={16} className="text-[#E3DAC9] "/>
                  <span>stb-am-rathaus@email.de</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="text-center md:text-left col-span-1 md:col-span-3 lg:col-span-1">
            <h3 className="font-medium mb-4">Social Media</h3>
            <Link href="https://instagram.com" className="flex items-center justify-center md:justify-start gap-2 hover:text-gray-300 transition-colors">
              <Instagram size={16} className="text-[#E3DAC9]"/>
              <span>Instagram</span>
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4  text-center text-sm">
          <p>2025 Liam Schneider - Steuerberatung am Rathaus | all rights reserved</p>
        </div>
      </div>
    </footer>
  )
}
