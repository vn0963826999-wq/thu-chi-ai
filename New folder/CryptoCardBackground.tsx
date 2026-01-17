import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// CRYPTO CARD BACKGROUND COMPONENT
// Tạo họa tiết biểu đồ crypto chìm phía sau các Card
// ═══════════════════════════════════════════════════════════════════════════

interface CryptoCardBackgroundProps {
    className?: string;
    variant?: "uptrend" | "downtrend" | "neutral";
    showVolume?: boolean;
    showArrow?: boolean;
}

export function CryptoCardBackground({
    className,
    variant = "uptrend",
    showVolume = true,
    showArrow = true,
}: CryptoCardBackgroundProps) {
    // Path direction based on variant
    const trendPath = variant === "uptrend"
        ? "M5 75 L20 65 L35 70 L50 55 L65 60 L80 40 L95 35 L110 25 L125 30 L140 20 L155 15"
        : variant === "downtrend"
            ? "M5 20 L20 25 L35 22 L50 35 L65 30 L80 45 L95 50 L110 55 L125 60 L140 65 L155 70"
            : "M5 45 L20 50 L35 42 L50 48 L65 40 L80 52 L95 45 L110 48 L125 42 L140 50 L155 45";

    // Arrow path (small triangle at end of line)
    const arrowPath = variant === "uptrend"
        ? "M150 20 L160 12 L155 25 Z"
        : variant === "downtrend"
            ? "M150 65 L160 72 L155 58 Z"
            : "M150 42 L160 45 L155 52 Z";

    // Volume bars (varying heights)
    const volumeBars = [
        { x: 10, height: 25 },
        { x: 25, height: 35 },
        { x: 40, height: 20 },
        { x: 55, height: 45 },
        { x: 70, height: 30 },
        { x: 85, height: 50 },
        { x: 100, height: 35 },
        { x: 115, height: 55 },
        { x: 130, height: 40 },
        { x: 145, height: 60 },
    ];

    return (
        <div
            className={cn(
                "absolute inset-0 z-0 pointer-events-none overflow-hidden",
                className
            )}
            style={{
                maskImage: "linear-gradient(to top, transparent 0%, black 30%, black 100%)",
                WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 30%, black 100%)",
            }}
        >
            <svg
                viewBox="0 0 160 80"
                preserveAspectRatio="none"
                className="h-full w-full"
            >
                {/* Layer 1: Volume Bars */}
                {showVolume && (
                    <g className="opacity-30">
                        {volumeBars.map((bar, index) => (
                            <rect
                                key={index}
                                x={bar.x}
                                y={80 - bar.height}
                                width="8"
                                height={bar.height}
                                rx="1"
                                fill="currentColor"
                            />
                        ))}
                    </g>
                )}

                {/* Layer 2: Gradient Area Fill under the line */}
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                    d={`${trendPath} L155 80 L5 80 Z`}
                    fill="url(#areaGradient)"
                    className="opacity-50"
                />

                {/* Layer 3: Trend Line */}
                <path
                    d={trendPath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                />

                {/* Layer 4: Arrow Head */}
                {showArrow && (
                    <path
                        d={arrowPath}
                        fill="currentColor"
                        className="opacity-70"
                    />
                )}

                {/* Layer 5: Glow dots at key points */}
                <g className="opacity-40">
                    <circle cx="50" cy="55" r="2" fill="currentColor" />
                    <circle cx="95" cy="35" r="2" fill="currentColor" />
                    <circle cx="140" cy="20" r="2.5" fill="currentColor" />
                </g>
            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE VERSION - For quick use
// ═══════════════════════════════════════════════════════════════════════════

export function CryptoCardBgSimple({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-10",
                className
            )}
        >
            <svg viewBox="0 0 160 80" preserveAspectRatio="none" className="h-full w-full text-cyan-400">
                {/* Volume bars */}
                <g className="opacity-40">
                    <rect x="10" y="55" width="8" height="25" rx="1" fill="currentColor" />
                    <rect x="25" y="45" width="8" height="35" rx="1" fill="currentColor" />
                    <rect x="40" y="60" width="8" height="20" rx="1" fill="currentColor" />
                    <rect x="55" y="35" width="8" height="45" rx="1" fill="currentColor" />
                    <rect x="70" y="50" width="8" height="30" rx="1" fill="currentColor" />
                    <rect x="85" y="30" width="8" height="50" rx="1" fill="currentColor" />
                    <rect x="100" y="45" width="8" height="35" rx="1" fill="currentColor" />
                    <rect x="115" y="25" width="8" height="55" rx="1" fill="currentColor" />
                    <rect x="130" y="40" width="8" height="40" rx="1" fill="currentColor" />
                    <rect x="145" y="20" width="8" height="60" rx="1" fill="currentColor" />
                </g>

                {/* Area fill */}
                <defs>
                    <linearGradient id="simpleAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d="M5 75 L20 65 L35 70 L50 55 L65 60 L80 40 L95 35 L110 25 L125 30 L140 20 L155 15 L155 80 L5 80 Z"
                    fill="url(#simpleAreaGradient)"
                />

                {/* Trend line */}
                <path
                    d="M5 75 L20 65 L35 70 L50 55 L65 60 L80 40 L95 35 L110 25 L125 30 L140 20 L155 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* Arrow head */}
                <path d="M150 20 L160 10 L155 28 Z" fill="currentColor" />
            </svg>
        </div>
    );
}
