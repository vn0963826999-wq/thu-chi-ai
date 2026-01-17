import { IAuthRepository } from '@/domain/repositories/auth-repository.interface'
import { createClient } from '@/lib/supabase/client'
import { AuthUser } from '@/domain/entities/auth-user'
import { LoginCredentials } from '@/domain/use-cases/auth/login-use-case'

/**
 * Triển khai interface IAuthRepository sử dụng Supabase.
 */
export class SupabaseAuthRepository implements IAuthRepository {
    private supabase = createClient()

    async login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: Error | null }> {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        })

        if (error) {
            // Chuyển đổi error hệ thống sang thông báo tiếng Việt thân thiện
            let errorMessage = 'Đã có lỗi xảy ra khi đăng nhập.'
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Sai email hoặc mật khẩu.'
            }
            return { user: null, error: new Error(errorMessage) }
        }

        if (!data.user) return { user: null, error: null }

        const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email!,
            fullName: data.user.user_metadata?.full_name,
            avatarUrl: data.user.user_metadata?.avatar_url,
            lastSignInAt: data.user.last_sign_in_at,
        }

        return { user: authUser, error: null }
    }

    async logout(): Promise<{ error: Error | null }> {
        const { error } = await this.supabase.auth.signOut()
        return { error }
    }

    async getCurrentUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
        const { data: { user }, error } = await this.supabase.auth.getUser()

        if (error || !user) return { user: null, error }

        const authUser: AuthUser = {
            id: user.id,
            email: user.email!,
            fullName: user.user_metadata?.full_name,
            avatarUrl: user.user_metadata?.avatar_url,
            lastSignInAt: user.last_sign_in_at,
        }

        return { user: authUser, error: null }
    }

    async getSession(): Promise<any> {
        const { data: { session } } = await this.supabase.auth.getSession()
        return session
    }
}
