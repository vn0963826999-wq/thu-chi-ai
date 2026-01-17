// Thư viện Icon & Màu sắc cho ứng dụng Thu Chi

import * as LucideIcons from "lucide-react";

// ===== BỘ MÀU (30 màu) =====
// ===== BỘ MÀU (Tinh chỉnh cho App Tài Chính - Fintech Premium) =====
// ===== BỘ MÀU CHUẨN TAILWIND (MODERN UI) =====
export const COLOR_PALETTE = [
    // Neutral & Monochrome
    { id: "slate-500", hex: "#64748b", name: "Slate (Đá)" },
    { id: "zinc-500", hex: "#71717a", name: "Zinc (Kẽm)" },
    { id: "stone-500", hex: "#78716c", name: "Stone (Đất)" },

    // Warm (Nóng)
    { id: "red-500", hex: "#ef4444", name: "Red (Đỏ)" },
    { id: "orange-500", hex: "#f97316", name: "Orange (Cam)" },
    { id: "amber-500", hex: "#f59e0b", name: "Amber (Hổ phách)" },
    { id: "yellow-500", hex: "#eab308", name: "Yellow (Vàng)" },

    // Nature (Tự nhiên)
    { id: "lime-500", hex: "#84cc16", name: "Lime (Chanh)" },
    { id: "green-500", hex: "#22c55e", name: "Green (Lá)" },
    { id: "emerald-500", hex: "#10b981", name: "Emerald (Ngọc)" },
    { id: "teal-500", hex: "#14b8a6", name: "Teal (Cổ vịt)" },

    // Cool (Lạnh & Công nghệ)
    { id: "cyan-500", hex: "#06b6d4", name: "Cyan (Lơ)" },
    { id: "sky-500", hex: "#0ea5e9", name: "Sky (Trời)" },
    { id: "blue-500", hex: "#3b82f6", name: "Blue (Biển)" },
    { id: "indigo-500", hex: "#6366f1", name: "Indigo (Chàm)" },

    // Playful (Sáng tạo)
    { id: "violet-500", hex: "#8b5cf6", name: "Violet (Tím)" },
    { id: "purple-500", hex: "#a855f7", name: "Purple (Huế)" },
    { id: "fuchsia-500", hex: "#d946ef", name: "Fuchsia (Hồng tím)" },
    { id: "pink-500", hex: "#ec4899", name: "Pink (Hồng)" },
    { id: "rose-500", hex: "#f43f5e", name: "Rose (Hồng đỏ)" },
];

// ===== BỘ ICON (200+ icons từ Lucide) =====
// Nhóm theo danh mục để dễ tìm

export const ICON_CATEGORIES = {
    // === TIỀN TỆ & TÀI CHÍNH (Money & Finance) ===
    finance: [
        "Wallet", "Banknote", "CreditCard", "DollarSign", "Euro", "Bitcoin",
        "PiggyBank", "Coins", "Receipt", "TrendingUp", "TrendingDown",
        "LineChart", "BarChart", "PieChart", "BadgeDollarSign", "Calculator",
        "HandCoins", "Landmark", "Building2", "CircleDollarSign",
        "Scale", "ReceiptText", "BadgePercent", "SquareDollarSign",
    ],

    // === TIỆN ÍCH & HÓA ĐƠN (Utilities & Bills) ===
    utilities: [
        "Zap", "Lightbulb", "Plug", "Power", "BatteryCharging",
        "Wifi", "Globe", "Network", "Radio", "Signal",
        "Droplets", "FlaskConical", "Flame", "Wind", "Gauge",
        "Receipt", "FileText", "FileCheck", "FileClock", "FileStack",
        "Newspaper", "ScrollText", "FileSpreadsheet", "FileBarChart",
    ],

    // === BẢO HIỂM & THUẾ (Insurance & Tax) ===
    insurance: [
        "ShieldCheck", "Shield", "ShieldAlert", "BadgeCheck", "Award",
        "FileCheck", "FileBadge", "Landmark", "Building2", "Stamp",
        "ScrollText", "FileSignature", "FileClock", "CircleDollarSign",
        "BadgePercent", "Receipt", "Calculator", "SquareStack",
    ],

    // === VĂN PHÒNG & CHỨNG TỪ (Office & Documents) ===
    office: [
        "Briefcase", "FileText", "File", "Folder", "FolderOpen",
        "ClipboardList", "Clipboard", "ClipboardCheck", "ClipboardCopy",
        "FileSpreadsheet", "FileBadge", "FileSignature", "FileStack",
        "Stamp", "Printer", "FileOutput", "FileInput", "Files",
        "FolderClosed", "FolderArchive", "Archive", "PackageCheck",
    ],

    // === MUA SẮM & TIÊU DÙNG (Shopping & Consumer) ===
    shopping: [
        "ShoppingCart", "ShoppingBag", "Store", "Shirt", "Watch",
        "Glasses", "Footprints", "Gem", "Diamond", "Crown",
        "Gift", "Package", "Box", "Boxes", "Archive",
        "Tag", "Tags", "Ticket", "Sparkles", "Star",
        "Barcode", "ScanLine", "Search", "ShoppingBasket",
    ],

    // === ĂN UỐNG (Food & Dining) ===
    food: [
        "Utensils", "UtensilsCrossed", "ChefHat", "CookingPot", "Coffee",
        "Beer", "Wine", "Pizza", "IceCream", "Cake",
        "Apple", "Salad", "Soup", "Croissant", "EggFried",
        "Fish", "Drumstick", "Sandwich", "Cookie", "Candy",
        "CupSoda", "Milk", "GlassWater", "Dessert",
    ],

    // === DI CHUYỂN & XE CỘ (Transportation) ===
    transportation: [
        "Car", "Bus", "Train", "Plane", "Ship",
        "Bike", "Motorcycle", "Fuel", "ParkingCircle", "Navigation",
        "Map", "MapPin", "Compass", "Route", "TrafficCone",
        "Sailboat", "Rocket", "CarTaxiFront", "Ambulance", "TramFront",
        "Truck", "CarFront", "PlaneTakeoff", "PlaneLanding",
    ],

    // === NHÀ Ở & GIA ĐÌNH (Home & Family) ===
    home: [
        "Home", "House", "Building", "School", "Hospital",
        "Church", "Hotel", "Warehouse", "Castle", "TreePine",
        "Bed", "BedDouble", "Sofa", "Armchair", "Lamp",
        "Key", "DoorOpen", "DoorClosed", "Fence", "TreeDeciduous",
        "Bath", "Refrigerator", "WashingMachine", "Microwave",
    ],

    // === SỨC KHỎE & THỂ THAO (Health & Sports) ===
    health: [
        "Heart", "HeartPulse", "Activity", "Pill", "Syringe",
        "Stethoscope", "Dumbbell", "Trophy", "Medal", "Flag",
        "Bike", "Football", "Basketball", "Volleyball", "Tennis",
        "Golf", "Gamepad2", "Dice1", "Target", "Award",
        "Thermometer", "Glasses", "Cross", "Ambulance",
    ],

    // === GIÁO DỤC & VĂN PHÒNG (Education & Office) ===
    education: [
        "GraduationCap", "BookOpen", "Book", "Library", "Notebook",
        "Pencil", "PenTool", "Highlighter", "Eraser", "Ruler",
        "Briefcase", "FileText", "File", "Folder", "FolderOpen",
        "ClipboardList", "Calendar", "CalendarDays", "Clock", "Timer",
        "School", "Users", "UserCheck", "BookMarked", "Backpack",
    ],

    // === GIẢI TRÍ & SỞ THÍCH (Entertainment & Hobbies) ===
    entertainment: [
        "Music", "Headphones", "Radio", "Mic", "Volume2",
        "Camera", "Video", "Film", "Palette", "Brush",
        "Paintbrush", "Image", "Images", "Frame", "Monitor",
        "Tv", "Gamepad", "Joystick", "Puzzle", "Drama",
        "PartyPopper", "Clapperboard", "Guitar", "Piano",
    ],

    // === CÔNG NGHỆ & ĐIỆN TỬ (Technology & Electronics) ===
    technology: [
        "Smartphone", "Laptop", "Tablet", "Monitor", "Keyboard",
        "Mouse", "Cpu", "HardDrive", "Usb", "Wifi",
        "Bluetooth", "Battery", "BatteryCharging", "Plug", "Power",
        "Zap", "CloudUpload", "CloudDownload", "Database", "Server",
        "Router", "Cable", "Webcam", "Printer", "ScanLine",
    ],

    // === THIÊN NHIÊN & MÔI TRƯỜNG (Nature & Environment) ===
    nature: [
        "Sun", "Moon", "Cloud", "CloudRain", "Snowflake",
        "Droplet", "Waves", "Wind", "Flame", "Flower",
        "Leaf", "Sprout", "Bug", "Bird", "Fish",
        "Squirrel", "Cat", "Dog", "Rabbit", "Turtle",
        "Trees", "Mountain", "Sunrise", "Sunset",
    ],

    // === CÔNG CỤ & SỬA CHỮA (Tools & Repair) ===
    tools: [
        "Wrench", "Hammer", "Screwdriver", "Drill", "Gauge",
        "Settings", "Tool", "Cog", "Construction", "HardHat",
        "ShoppingBasket", "Scissors", "Paperclip", "Pin", "Lock",
        "Ruler", "PaintBucket", "PaintRoller", "Paintbrush2",
    ],

    // === GIAO TIẾP & MẠNG XÃ HỘI (Communication & Social) ===
    communication: [
        "Phone", "PhoneCall", "MessageCircle", "MessageSquare", "Mail",
        "Send", "Share2", "ThumbsUp", "ThumbsDown", "Heart",
        "Users", "User", "UserPlus", "UserCheck", "AtSign",
        "Bell", "BellRing", "Megaphone", "Radio", "Rss",
        "Video", "Voicemail", "Contact", "ContactRound",
    ],

    // === BIỂU TƯỢNG & KÝ HIỆU (Symbols & Icons) ===
    symbols: [
        "Check", "X", "Plus", "Minus", "Equal",
        "Info", "AlertCircle", "AlertTriangle", "HelpCircle", "Ban",
        "Slash", "Percent", "Hash", "Asterisk", "CircleDot",
        "Square", "Circle", "Triangle", "Hexagon", "Diamond",
        "CheckCircle", "XCircle", "PlayCircle", "PauseCircle",
    ],
};

// Tạo danh sách phẳng tất cả icons (UNIQUE - không trùng lặp)
export const ALL_ICONS = Array.from(new Set(Object.values(ICON_CATEGORIES).flat()));

// Tạo IconMap cho việc render
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {};
ALL_ICONS.forEach((iconName) => {
    const Icon = (LucideIcons as any)[iconName];
    if (Icon) {
        ICON_MAP[iconName] = Icon;
    }
});

// Hàm helper để search icon (Unique results)
export function searchIcons(keyword: string): string[] {
    const results = ALL_ICONS.filter((name) =>
        name.toLowerCase().includes(keyword.toLowerCase())
    );
    // Remove duplicates using Set
    return Array.from(new Set(results));
}

// Hàm helper để lấy icon theo category
export function getIconsByCategory(category: keyof typeof ICON_CATEGORIES): string[] {
    return ICON_CATEGORIES[category] || [];
}

// ===== TÊN TIẾNG VIỆT CHO ICONS =====
export const ICON_NAMES_VI: Record<string, string> = {
    // Tài chính
    Wallet: "Ví tiền",
    Banknote: "Tiền mặt",
    CreditCard: "Thẻ tín dụng",
    DollarSign: "Đô la",
    Euro: "Euro",
    Bitcoin: "Bitcoin",
    PiggyBank: "Heo đất",
    Coins: "Đồng xu",
    Receipt: "Hóa đơn",
    TrendingUp: "Tăng trưởng",
    TrendingDown: "Giảm sút",
    LineChart: "Biểu đồ đường",
    BarChart: "Biểu đồ cột",
    PieChart: "Biểu đồ tròn",
    Calculator: "Máy tính",
    Landmark: "Ngân hàng",
    Building2: "Tòa nhà",
    Scale: "Cân bằng",

    // Mua sắm
    ShoppingCart: "Giỏ hàng",
    ShoppingBag: "Túi mua sắm",
    Store: "Cửa hàng",
    Gift: "Quà tặng",
    Package: "Gói hàng",
    Box: "Hộp",
    Tag: "Thẻ giá",
    Ticket: "Vé",

    // Ăn uống
    Utensils: "Đồ ăn",
    Coffee: "Cà phê",
    Pizza: "Pizza",
    Cake: "Bánh ngọt",
    Apple: "Trái cây",
    Beer: "Bia",
    Wine: "Rượu",

    // Di chuyển
    Car: "Ô tô",
    Bus: "Xe buýt",
    Train: "Tàu hỏa",
    Plane: "Máy bay",
    Bike: "Xe đạp",
    Fuel: "Xăng dầu",
    Map: "Bản đồ",
    Navigation: "Điều hướng",

    // Nhà ở
    Home: "Nhà",
    Bed: "Giường",
    Sofa: "Sofa",
    Lamp: "Đèn",
    Key: "Chìa khóa",

    // Sức khỏe
    Heart: "Tim",
    HeartPulse: "Nhịp tim",
    Activity: "Hoạt động",
    Pill: "Thuốc",
    Stethoscope: "Ống nghe",
    Dumbbell: "Tạ",
    Trophy: "Cúp",

    // Giáo dục
    GraduationCap: "Tốt nghiệp",
    BookOpen: "Sách",
    Pencil: "Bút chì",
    School: "Trường học",

    // Giải trí
    Music: "Âm nhạc",
    Headphones: "Tai nghe",
    Camera: "Máy ảnh",
    Video: "Video",
    Gamepad2: "Game",
    Film: "Phim",

    // Công nghệ
    Smartphone: "Điện thoại",
    Laptop: "Laptop",
    Monitor: "Màn hình",
    Wifi: "Wifi",
    Globe: "Internet",

    // Tiện ích
    Zap: "Điện",
    Lightbulb: "Bóng đèn",
    Droplets: "Nước",
    Flame: "Gas",
    FileText: "Tài liệu",

    // Khác
    Star: "Ngôi sao",
    Sun: "Mặt trời",
    Moon: "Mặt trăng",
    Cloud: "Mây",
    Phone: "Điện thoại",
    Mail: "Email",
    Bell: "Chuông",
    Calendar: "Lịch",
    Clock: "Đồng hồ",
    Settings: "Cài đặt",
    User: "Người dùng",
    Users: "Nhóm",
};

// Hàm lấy tên tiếng Việt, fallback về tên gốc
export function getIconNameVI(iconName: string): string {
    return ICON_NAMES_VI[iconName] || iconName;
}
