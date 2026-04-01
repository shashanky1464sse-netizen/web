import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { User } from '../types'
import { authService } from '../services/api'
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password?: string) => Promise<void>
  register: (name: string, email: string, password?: string) => Promise<void>
  logout: () => void
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])
  const login = async (email: string, password?: string) => {
    setIsLoading(true)
    try {
      const { token, user: loggedInUser } = await authService.login(
        email,
        password,
      )
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser))
      setUser(loggedInUser)
    } finally {
      setIsLoading(false)
    }
  }
  const register = async (name: string, email: string, password?: string) => {
    setIsLoading(true)
    try {
      const { token, user: newUser } = await authService.register(
        name,
        email,
        password,
      )
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
      setUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }
  const logout = () => {
    authService.logout()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
