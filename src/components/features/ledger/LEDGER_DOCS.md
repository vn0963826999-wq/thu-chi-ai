# Sổ Giao Dịch Chi Tiết (Transaction Ledger) - Documentation

## Chức năng chính
1. **Lọc nâng cao**: Theo ngày, tài khoản, loại thu/chi.
2. **Summary Strip**: Hiển thị tổng quan các chỉ số tài chính (Số dư đầu kỳ, Thu, Chi, Cuối kỳ).
3. **Running Balance (Số dư lũy kế)**: Tính toán số dư sau mỗi phát sinh giao dịch.
4. **Export**: Xuất báo cáo Excel, PDF.
5. **AI Integration**: AI Chat phân tích dữ liệu lọc trực tiếp.

## Cách tính Số dư lũy kế
- Gốc = Số dư của tất cả các dòng *trước* ngày lọc đầu tiên.
- Lũy kế dòng N = Lũy kế dòng (N-1) + (Thu nhập - Chi tiêu) dòng N.
