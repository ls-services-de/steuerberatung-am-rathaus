"use client"

import { useState, useEffect } from "react"
import LoginPage from "../components/login-page"
import AdminDashboard from "../components/admin-dashboard"
import CustomerDashboard from "../components/customer-dashboard"
import sanityClient from "@sanity/client"

// Initialize Sanity client
const client = sanityClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2023-11-21",
    useCdn: true,
    token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  })

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState(null) // "admin" or "customer"
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth")
    if (storedAuth) {
      const authData = JSON.parse(storedAuth)
      setIsAuthenticated(true)
      setUserType(authData.userType)
      setCurrentUser(authData.user)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (username, password) => {
    // Check if admin login
    if (username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      const authData = {
        userType: "admin",
        user: { username: process.env.NEXT_PUBLIC_ADMIN_USERNAME },
      }
      localStorage.setItem("auth", JSON.stringify(authData))
      setIsAuthenticated(true)
      setUserType("admin")
      setCurrentUser({ username: process.env.NEXT_PUBLIC_ADMIN_USERNAME })
      return { success: true }
    }

    // Check if customer login
    try {
      // Query Sanity for a user with matching email and password
      const query = `*[_type == "userForm" && email == $email && passwort == $password][0]`
      const user = await client.fetch(query, { email: username, password })

      if (user) {
        const authData = {
          userType: "customer",
          user,
        }
        localStorage.setItem("auth", JSON.stringify(authData))
        setIsAuthenticated(true)
        setUserType("customer")
        setCurrentUser(user)
        return { success: true }
      }
    } catch (error) {
      console.error("Login error:", error)
    }

    return { success: false, error: "Ungültige Anmeldedaten" }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth")
    setIsAuthenticated(false)
    setUserType(null)
    setCurrentUser(null)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (userType === "admin") {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return <CustomerDashboard user={currentUser} onLogout={handleLogout} />
}
