'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser } from '@/domain/entities/auth-user'
import { SupabaseAuthRepository } from '@/data/repositories/supabase-auth-repository'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: AuthUser | null
    loading: boolean
    login: (credentials: any) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const repository = new SupabaseAuthRepository()
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { user } = await repository.getCurrentUser()
            setUser(user)
            setLoading(false)
        }

        checkUser()

        // Lắng nghe thay đổi trạng thái auth từ Supabase
        const { data: { subscription } } = repository['supabase'].auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const authUser: AuthUser = {
                        id: session.user.id,
                        email: session.user.email!,
                        fullName: session.user.user_metadata?.full_name,
                    }
                    setUser(authUser)
                } else {
                    setUser(null)
                }
                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const login = async (credentials: any) => {
        const { user, error } = await repository.login(credentials)
        if (error) throw error
        setUser(user)
        router.push('/')
    }

    const logout = async () => {
        await repository.logout()
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth phải được sử dụng trong AuthProvider')
    }
    return context
}
