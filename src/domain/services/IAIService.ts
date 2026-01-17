import { z } from 'zod'

/**
 * Schema Zod cho kết quả OCR hóa đơn.
 */
export const InvoiceDataSchema = z.object({
    date: z.string().describe('Ngày giao dịch, định dạng YYYY-MM-DD'),
    totalAmount: z.number().describe('Tổng số tiền thanh toán'),
    vendor: z.string().describe('Tên cửa hàng/người bán'),
    items: z.array(z.object({
        name: z.string(),
        quantity: z.number().optional(),
        price: z.number().optional(),
    })).optional().describe('Danh sách các mục hàng hóa nếu có'),
    note: z.string().optional().describe('Ghi chú tóm tắt'),
    rawText: z.string().optional().describe('Văn bản thô trích xuất từ ảnh'),
})

export type InvoiceData = z.infer<typeof InvoiceDataSchema>

/**
 * Schema cho kết quả phân tích ý định giao dịch từ ngôn ngữ tự nhiên.
 */
export const TransactionIntentSchema = z.object({
    amount: z.number().describe('Số tiền giao dịch'),
    type: z.enum(['income', 'expense']).describe('Loại giao dịch: thu nhập hoặc chi tiêu'),
    categoryHint: z.string().optional().describe('Gợi ý danh mục dựa trên nội dung'),
    note: z.string().optional().describe('Ghi chú mô tả giao dịch'),
    date: z.string().optional().describe('Ngày nếu được đề cập, định dạng YYYY-MM-DD'),
})

export type TransactionIntent = z.infer<typeof TransactionIntentSchema>

/**
 * Schema cho lời khuyên tài chính.
 */
export const FinancialInsightSchema = z.object({
    insights: z.array(z.string()).describe('Mảng các lời khuyên tài chính'),
    overallScore: z.number().min(0).max(100).optional().describe('Điểm sức khỏe tài chính 0-100'),
    topCategory: z.string().optional().describe('Danh mục chi tiêu nhiều nhất'),
})

export type FinancialInsight = z.infer<typeof FinancialInsightSchema>

/**
 * Schema cho tin nhắn nhắc nợ.
 */
export const DebtReminderSchema = z.object({
    message: z.string().describe('Nội dung tin nhắn nhắc nợ'),
})

export type DebtReminder = z.infer<typeof DebtReminderSchema>

/**
 * Interface định nghĩa các chức năng AI.
 * Tách biệt Domain khỏi Infrastructure (Supabase, Gemini, OpenAI...).
 */
export interface IAIService {
    /**
     * OCR hóa đơn: Đọc ảnh và trích xuất thông tin thanh toán.
     * Hỗ trợ hóa đơn Việt Nam: VCB, MB Bank, MoMo, VNPay, hóa đơn giấy...
     */
    analyzeInvoice(imageBase64: string, mimeType: string): Promise<InvoiceData>

    /**
     * Phân tích ý định từ văn bản tự nhiên.
     * Ví dụ: "Ăn sáng 30k" -> { amount: 30000, type: 'expense', categoryHint: 'food' }
     */
    parseTransactionIntent(text: string): Promise<TransactionIntent>

    /**
     * Tạo lời khuyên tài chính dựa trên tóm tắt dữ liệu.
     */
    generateFinancialInsight(summaryData: string): Promise<FinancialInsight>

    /**
     * Tạo tin nhắn nhắc nợ khéo léo và hài hước.
     */
    generateDebtReminder(debtorName: string, amount: number, reason?: string): Promise<string>
}
