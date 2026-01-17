'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { useAuth } from '@/components/providers/AuthProvider'

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { loading } = useAuth()
    const isLoginPage = pathname === '/login'

    // Nếu đang ở trang login, không hiển thị Sidebar và Nav
    if (isLoginPage) {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-fintech bg-grid">
            {/* Sidebar - Desktop only */}
            <Sidebar />

            {/* Main content - responsive padding */}
            <main className="min-h-screen w-full lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-4">
                <div className="max-w-6xl mx-auto px-4 lg:px-8 lg:py-6">
                    {children}
                </div>
            </main>

            {/* Bottom Nav - Mobile only */}
            <BottomNav />
        </div>
    )
}
