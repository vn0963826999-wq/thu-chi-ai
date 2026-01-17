import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Hàm hỗ trợ cập nhật session của người dùng trong Middleware.
 * Việc này rất quan trọng để đảm bảo session luôn được làm mới (refresh token).
 */
export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Kiểm tra user status
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Logic chuyển hướng:
    // Nếu chưa đăng nhập mà truy cập các trang riêng tư -> Về /login
    if (!user && !request.nextUrl.pathname.startsWith('/login') && request.nextUrl.pathname !== '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Nếu đã đăng nhập mà cố vào /login -> Về trang chủ
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return response
}
