"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, LogIn } from "lucide-react"

const navItems = [
  { name: "Start", href: "#", id: "start" },
  { name: "Leistungen", href: "#leistungen", id: "leistungen" },
  { name: "Terminbuchung", href: "#terminbuchung", id: "terminbuchung" },
  { name: "Über Uns", href: "#ueber-uns", id: "ueber-uns" },
  { name: "Standort", href: "#standort", id: "standort" },
  { name: "Kontakt", href: "#kontakt", id: "kontakt" },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeItem, setActiveItem] = useState("start") // Default active item is "Start"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Set up intersection observer to detect which section is in view
  useEffect(() => {
    const observerOptions = {
      root: null, // viewport
      rootMargin: "-80px 0px -20% 0px", // offset from the top to account for header height
      threshold: 0.1, // 10% of the element must be visible
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Get the id of the section that's in view
          const sectionId = entry.target.id

          // Find the matching nav item
          const matchingNavItem = navItems.find((item) => item.id === sectionId)

          if (matchingNavItem) {
            setActiveItem(matchingNavItem.id)
          } else if (sectionId === "") {
            // If no id, assume it's the top section (start)
            setActiveItem("start")
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections that correspond to nav items
    navItems.forEach((item) => {
      const section = document.getElementById(item.id)
      if (section) {
        observer.observe(section)
      }
    })

    // Also observe the top section if it doesn't have an ID
    const topSection = document.querySelector("main") || document.querySelector(".bg-\\[\\#747171\\]")
    if (topSection) {
      observer.observe(topSection)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleNavClick = (itemId) => {
    setActiveItem(itemId)
    setIsOpen(false) // Close mobile menu when an item is clicked
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? " backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Image
            src="/logo-nbg-bone.png"
            alt="Steuerberatung am Rathaus Logo"
            width={200}
            height={200}
            className="mr-4"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`text-white relative py-2 font-normal group`}
                  style={{ fontFamily: "Arial, sans-serif" }}
                  onClick={() => handleNavClick(item.id)}
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-left transition-transform duration-300 bg-[#E3DAC9] ${
                      activeItem === item.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Login button styled separately and positioned to the right */}
          <Link
            href="/login"
            className="ml-12 flex items-center px-4 py-2 rounded-md bg-[#E3DAC9] text-[#747171] font-medium transition-colors hover:bg-opacity-90"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <LogIn size={18} className="mr-2" />
            Login
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-[#747171]">
          <nav className="container mx-auto px-4 py-4">
            <ul className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`text-white block py-2 font-normal ${
                      activeItem === item.id ? "border-l-4 border-[#E3DAC9] pl-2" : ""
                    }`}
                    style={{ fontFamily: "Arial, sans-serif" }}
                    onClick={() => handleNavClick(item.id)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              
              {/* Login item for mobile */}
              <li>
                <Link
                  href="/login"
                  className="flex items-center py-2 px-3 rounded-md bg-[#E3DAC9] text-black font-medium"
                  style={{ fontFamily: "Arial, sans-serif" }}
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn size={18} className="mr-2" />
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}