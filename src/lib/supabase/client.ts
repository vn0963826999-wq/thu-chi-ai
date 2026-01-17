import { createBrowserClient } from '@supabase/ssr'

/**
 * Khởi tạo Supabase client cho môi trường Client-side (Trình duyệt).
 * Sử dụng Singleton pattern để đảm bảo chỉ có một instance duy nhất.
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Thiếu cấu hình Supabase trong biến môi trường (.env.local)')
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
