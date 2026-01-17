import { z } from 'zod'
import { IAuthRepository } from '@/domain/repositories/auth-repository.interface'
import { AuthUser } from '@/domain/entities/auth-user'

/**
 * Định nghĩa schema cho dữ liệu đăng nhập.
 */
export const LoginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

export type LoginCredentials = z.infer<typeof LoginSchema>

/**
 * Use Case xử lý logic đăng nhập.
 */
export class LoginUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: Error | null }> {
        // Validate dữ liệu đầu vào
        const validation = LoginSchema.safeParse(credentials)
        if (!validation.success) {
            return { user: null, error: new Error(validation.error.issues[0].message) }
        }

        // Gọi repository để đăng nhập
        return await this.authRepository.login(credentials)
    }
}
