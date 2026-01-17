/**
 * Thực thể người dùng sau khi xác thực.
 * Theo Clean Architecture, thực thể này chỉ chứa dữ liệu, không chứa logic của framework/db.
 */
export interface AuthUser {
    id: string
    email: string
    fullName?: string
    avatarUrl?: string
    lastSignInAt?: string
}
