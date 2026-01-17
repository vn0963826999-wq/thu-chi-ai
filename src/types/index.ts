// Types - Single Source of Truth cho toàn bộ ứng dụng Thu Chi

export type DanhMuc = {
    id: string;
    ten: string;
    icon: string;
    mau: string;
};

export type TaiKhoan = DanhMuc & {
    soDu: number;
};

export type GiaoDich = {
    id: string;
    loai: "thu" | "chi";
    soTien: number;
    danhMucId: string;
    taiKhoanId: string;
    ghiChu?: string;
    ngay: Date;
    anhHoaDon?: string;
};

export type CongNo = {
    id: string;
    loai: "phai-thu" | "phai-tra";
    nguoi: string;
    soTien: number;
    ghiChu?: string;
    ngayTao: Date;
    hanTra?: Date;
    daTra: boolean;
};
