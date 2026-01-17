'use server'

import { geminiService } from '@/infrastructure/ai/GeminiService'
import { InvoiceData, TransactionIntent, FinancialInsight } from '@/domain/services/IAIService'

/**
 * Server Action: Quét và phân tích hóa đơn.
 * Được gọi từ UI khi người dùng upload ảnh.
 */
export async function analyzeInvoiceAction(
    imageBase64: string,
    mimeType: string
): Promise<{ data: InvoiceData | null; error: string | null }> {
    try {
        const data = await geminiService.analyzeInvoice(imageBase64, mimeType)
        return { data, error: null }
    } catch (error: any) {
        return { data: null, error: error.message || 'Lỗi không xác định' }
    }
}

/**
 * Server Action: Phân tích văn bản tự nhiên thành giao dịch.
 * Ví dụ: "Ăn sáng 30k" -> { amount: 30000, type: 'expense', ... }
 */
export async function parseTransactionAction(
    text: string
): Promise<{ data: TransactionIntent | null; error: string | null }> {
    try {
        const data = await geminiService.parseTransactionIntent(text)
        return { data, error: null }
    } catch (error: any) {
        return { data: null, error: error.message || 'Lỗi không xác định' }
    }
}

/**
 * Server Action: Tạo lời khuyên tài chính.
 * @param summaryData - Chuỗi JSON hoặc văn bản mô tả tình hình tài chính
 */
export async function generateInsightAction(
    summaryData: string
): Promise<{ data: FinancialInsight | null; error: string | null }> {
    try {
        const data = await geminiService.generateFinancialInsight(summaryData)
        return { data, error: null }
    } catch (error: any) {
        return { data: null, error: error.message || 'Lỗi không xác định' }
    }
}

/**
 * Server Action: Tạo tin nhắn nhắc nợ.
 */
export async function generateDebtReminderAction(
    debtorName: string,
    amount: number,
    reason?: string
): Promise<{ data: string | null; error: string | null }> {
    try {
        const message = await geminiService.generateDebtReminder(debtorName, amount, reason)
        return { data: message, error: null }
    } catch (error: any) {
        return { data: null, error: error.message || 'Lỗi không xác định' }
    }
}
