"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Wallet, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: email.split("@")[0],
                            avatar_url: "",
                        },
                    },
                });
                if (error) throw error;
                toast.success("Đăng ký thành công! Hãy kiểm tra email để xác nhận.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Đăng nhập thành công!");
                router.push("/");
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0B0E23] px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-[20%] -top-[20%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute -bottom-[20%] -right-[20%] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                        <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Thu Chi AI</h2>
                    <p className="mt-2 text-gray-400">Quản lý tài chính thông minh</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Email</Label>
                        <Input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Mật khẩu</Label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-base font-bold text-white shadow-lg hover:opacity-90 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "Đăng Ký Tài Khoản" : "Đăng Nhập Ngay")}
                    </Button>
                </form>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-gray-400 hover:text-white transition-colors hover:underline"
                    >
                        {isSignUp ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký ngay"}
                    </button>
                </div>
            </div>
        </div>
    );
}
