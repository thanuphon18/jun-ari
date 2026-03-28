"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: "customer" | "distributor" | "admin"
  phone: string | null
  avatar_url: string | null
}

export interface DistributorProfileData {
  id: string
  company_name: string
  tier: string
  credit_limit: number
  wallet_balance: number
  total_points: number
  tax_id: string | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  distributorProfile: DistributorProfileData | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [distributorProfile, setDistributorProfile] = useState<DistributorProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // One client per provider mount; @supabase/ssr also singletons in browser, but this avoids extra work each render
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (prof) {
      setProfile(prof as Profile)

      if (prof.role === "distributor") {
        const { data: dist } = await supabase
          .from("distributor_profiles")
          .select("*")
          .eq("id", userId)
          .single()
        setDistributorProfile(dist as DistributorProfileData | null)
      } else {
        setDistributorProfile(null)
      }
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.id)
      }
      setIsLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await fetchProfile(u.id)
      } else {
        setProfile(null)
        setDistributorProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const login = useCallback(async (email: string, password: string) => {
    // Shortcut: if user types "123" / "123", map to admin credentials
    let actualEmail = email
    let actualPassword = password
    if (email === "123" && password === "123") {
      actualEmail = "admin@greenleaf.com"
      actualPassword = "123123"
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: actualEmail,
      password: actualPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  }, [supabase])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setDistributorProfile(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      distributorProfile,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
