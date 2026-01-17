import { AuthUser } from '../entities/auth-user'
import { LoginCredentials } from '../use-cases/auth/login-use-case'

/**
 * Interface cho kho lưu trữ dữ liệu xác thực.
 * Lớp này cho phép logic nghiệp vụ tương tác với dữ liệu mà không cần biết dữ liệu đến từ đâu (Supabase, Firebase, v.v.).
 */
export interface IAuthRepository {
    /**
     * Đăng nhập bằng Email và Mật khẩu.
     */
    login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: Error | null }>

    /**
     * Đăng xuất người dùng hiện tại.
     */
    logout(): Promise<{ error: Error | null }>

    /**
     * Lấy thông tin người dùng hiện tại đang đăng nhập.
     */
    getCurrentUser(): Promise<{ user: AuthUser | null; error: Error | null }>

    /**
     * Lấy session hiện tại.
     */
    getSession(): Promise<any>
}
