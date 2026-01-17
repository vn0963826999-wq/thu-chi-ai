'use server'

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import {
    IAIService,
    InvoiceData,
    TransactionIntent,
    FinancialInsight,
} from '@/domain/services/IAIService'

const API_KEY = process.env.GOOGLE_API_KEY || ''

/**
 * Triển khai IAIService sử dụng Google Gemini.
 * Tất cả các prompts được tối ưu cho thị trường Việt Nam.
 */
class GeminiService implements IAIService {
    private genAI: GoogleGenerativeAI | null = null
    private modelName = 'gemini-2.0-flash'

    constructor() {
        if (API_KEY) {
            this.genAI = new GoogleGenerativeAI(API_KEY)
        }
    }

    /**
     * PROMPT: OCR Hóa đơn Việt Nam
     * Được port từ GeminiService.cs - InvoiceOcrPrompt
     */
    private readonly INVOICE_OCR_PROMPT = `
Bạn là một chuyên gia OCR tài chính được huấn luyện đặc biệt cho thị trường Việt Nam.

## NHIỆM VỤ
Phân tích hình ảnh hóa đơn/biên lai/chuyển khoản và trích xuất thông tin thanh toán.

## HỖ TRỢ CÁC LOẠI HÓA ĐƠN
- Biên lai chuyển khoản ngân hàng: Vietcombank (VCB), MB Bank, Techcombank, BIDV, Agribank, VPBank, TPBank, ACB...
- Ví điện tử: MoMo, ZaloPay, VNPay, ShopeePay, Moca...
- Hóa đơn bán lẻ: Siêu thị (Big C, Coopmart, Winmart), Cửa hàng tiện lợi (Circle K, 7-Eleven, GS25)...
- Hóa đơn dịch vụ: Grab, Be, Gojek, ShopeeFood, Baemin...
- Hóa đơn điện/nước/internet: EVN, VNPT, Viettel, FPT...
- Hóa đơn giấy viết tay

## QUY TẮC XỬ LÝ SỐ TIỀN
1. Loại bỏ mọi ký tự không phải số (dấu chấm, dấu phẩy, ký hiệu tiền tệ).
2. Xử lý viết tắt tiếng Việt:
   - "k" hoặc "K" = nhân 1.000 (ví dụ: 50k = 50000)
   - "lít" = nhân 100 (ví dụ: 5 lít = 500)
   - "củ" hoặc "tr" = nhân 1.000.000 (ví dụ: 2 củ = 2000000)
3. Nếu có nhiều số tiền, ưu tiên trường "Tổng cộng", "Thành tiền", "Total", "Số tiền GD".

## QUY TẮC XỬ LÝ NGÀY THÁNG
1. Chuyển về định dạng chuẩn: YYYY-MM-DD
2. Nhận dạng các format phổ biến Việt Nam: DD/MM/YYYY, DD-MM-YYYY, "ngày DD tháng MM năm YYYY"
3. Nếu chỉ thấy ngày tháng (không năm), mặc định là năm hiện tại.
4. Nếu không tìm thấy ngày, để trống.

## OUTPUT FORMAT (JSON)
{
  "date": "YYYY-MM-DD hoặc rỗng",
  "totalAmount": <số nguyên>,
  "vendor": "<Tên cửa hàng/ngân hàng đích>",
  "items": [{"name": "<tên sản phẩm>", "quantity": <số lượng>, "price": <đơn giá>}],
  "note": "<tóm tắt ngắn gọn nội dung giao dịch>",
  "rawText": "<văn bản thô đọc được từ ảnh>"
}

## LƯU Ý QUAN TRỌNG
- Chỉ trả về JSON hợp lệ, không giải thích thêm.
- Nếu không đọc được ảnh, trả về: {"totalAmount": 0, "vendor": "Không xác định", "note": "Không thể đọc hóa đơn"}
`

    /**
     * PROMPT: Phân tích ngôn ngữ tự nhiên thành giao dịch
     * Được port từ GeminiService.cs - ParseTransactionPrompt
     */
    private readonly PARSE_TRANSACTION_PROMPT = `
Bạn là trợ lý tài chính AI. Nhiệm vụ: phân tích câu nhập liệu của người dùng Việt Nam và trích xuất thông tin giao dịch.

## QUY TẮC XỬ LÝ SỐ TIỀN
1. "k" hoặc "K" = nghìn đồng (ví dụ: "30k" = 30000, "1k5" = 1500)
2. "lít" = trăm đồng (ví dụ: "5 lít" = 500)
3. "củ" hoặc "tr" hoặc "triệu" = triệu đồng (ví dụ: "2 củ" = 2000000)
4. Số không có đơn vị = đồng (ví dụ: "50000" = 50000)

## PHÂN LOẠI GIAO DỊCH
- THU NHẬP (income): Lương, thưởng, được cho, bán hàng, thu hồi nợ, nhận chuyển khoản...
- CHI TIÊU (expense): Ăn uống, mua sắm, thanh toán, trả nợ, cho vay, đi lại...

## GỢI Ý DANH MỤC
- food: ăn, uống, cà phê, trà sữa, cơm, phở, bún...
- transport: grab, taxi, xăng, gửi xe, vé xe...
- shopping: mua, sắm, quần áo, giày dép...
- entertainment: xem phim, karaoke, game, du lịch...
- bill: điện, nước, internet, điện thoại...
- health: thuốc, khám bệnh, bệnh viện...
- education: học phí, sách, khóa học...
- salary: lương, thưởng...
- gift: được cho, biếu, tặng...
- other: không rõ danh mục

## OUTPUT FORMAT (JSON)
{
  "amount": <số nguyên>,
  "type": "income" | "expense",
  "categoryHint": "<gợi ý danh mục>",
  "note": "<mô tả ngắn gọn>",
  "date": "YYYY-MM-DD nếu có đề cập, null nếu không"
}

## VÍ DỤ
Input: "Ăn sáng 30k"
Output: {"amount": 30000, "type": "expense", "categoryHint": "food", "note": "Ăn sáng", "date": null}

Input: "Lương tháng 12 được 15 triệu"
Output: {"amount": 15000000, "type": "income", "categoryHint": "salary", "note": "Lương tháng 12", "date": null}

## LƯU Ý
- Chỉ trả về JSON hợp lệ, không giải thích.
- Nếu không xác định được, đoán dựa trên ngữ cảnh Việt Nam.
`

    /**
     * PROMPT: Tư vấn tài chính cá nhân
     * Persona: "Kế toán trưởng khó tính nhưng tâm lý"
     */
    private readonly FINANCIAL_ADVISOR_PROMPT = `
Bạn là "Anh Kế" - một kế toán trưởng 15 năm kinh nghiệm, khó tính nhưng rất tâm lý và hài hước.
Phong cách: Thẳng thắn, đôi khi "mỉa mai nhẹ" nhưng luôn mang tính xây dựng. Dùng từ ngữ đời thường.

## NHIỆM VỤ
Dựa trên dữ liệu tài chính được cung cấp, đưa ra 3 lời khuyên ngắn gọn (mỗi lời dưới 25 từ).

## NGUYÊN TẮC
1. Luôn bắt đầu bằng nhận xét về tình hình chung (khen hoặc chê nhẹ).
2. Đưa ra gợi ý cụ thể, có thể hành động được.
3. Kết thúc bằng lời động viên hoặc cảnh báo tùy tình hình.
4. Dùng emoji phù hợp để tăng tính thân thiện.
5. Sử dụng các thành ngữ, tục ngữ Việt Nam khi phù hợp.

## OUTPUT FORMAT (JSON)
{
  "insights": ["<lời khuyên 1>", "<lời khuyên 2>", "<lời khuyên 3>"],
  "overallScore": <điểm sức khỏe tài chính 0-100>,
  "topCategory": "<danh mục chi tiêu nhiều nhất>"
}
`

    /**
     * PROMPT: Nhắc nợ khéo léo
     */
    private readonly DEBT_REMINDER_PROMPT = `
Bạn là chuyên gia viết tin nhắn nhắc nợ. Mục tiêu: Nhắc người ta trả tiền mà vẫn giữ được mối quan hệ tốt đẹp.

## NGUYÊN TẮC
1. Giọng điệu: Thân thiện, hài hước nhẹ nhàng, không gây áp lực.
2. Không bao giờ dùng từ "nợ" trực tiếp - thay bằng "khoản hôm trước", "số tiền lần đó"...
3. Có thể dùng meme, trend, câu nói hot nếu phù hợp.
4. Độ dài: 1-3 câu, dưới 50 từ.
5. Có thể đề xuất phương thức thanh toán (MoMo, chuyển khoản).

## VÍ DỤ STYLE
- "Ê [tên] ơi, nhớ khoản [số tiền] hôm trước không? Cuối tuần này tao cần mua đồ mà đang cháy túi quá 😂"
- "[Tên] ơi, ví của anh đang khóc đòi [số tiền] về nhà, em có sẵn không? 🥲"

## OUTPUT
Chỉ trả về nội dung tin nhắn, không thêm gì khác.
`

    async analyzeInvoice(imageBase64: string, mimeType: string): Promise<InvoiceData> {
        if (!this.genAI) {
            return this.mockInvoiceData()
        }

        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            })

            const result = await model.generateContent([
                this.INVOICE_OCR_PROMPT,
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
            ])

            const text = result.response.text()
            return JSON.parse(text) as InvoiceData
        } catch (error) {
            console.error('[GeminiService] analyzeInvoice error:', error)
            throw new Error('AI không thể đọc được hóa đơn. Vui lòng nhập tay.')
        }
    }

    async parseTransactionIntent(text: string): Promise<TransactionIntent> {
        if (!this.genAI) {
            return this.mockTransactionIntent(text)
        }

        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            })

            const result = await model.generateContent([
                this.PARSE_TRANSACTION_PROMPT,
                `Input từ người dùng: "${text}"`,
            ])

            const responseText = result.response.text()
            return JSON.parse(responseText) as TransactionIntent
        } catch (error) {
            console.error('[GeminiService] parseTransactionIntent error:', error)
            throw new Error('AI đang bận, vui lòng nhập tay.')
        }
    }

    async generateFinancialInsight(summaryData: string): Promise<FinancialInsight> {
        if (!this.genAI) {
            return this.mockFinancialInsight()
        }

        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            })

            const result = await model.generateContent([
                this.FINANCIAL_ADVISOR_PROMPT,
                `Dữ liệu tài chính của người dùng:\n${summaryData}`,
            ])

            const responseText = result.response.text()
            return JSON.parse(responseText) as FinancialInsight
        } catch (error) {
            console.error('[GeminiService] generateFinancialInsight error:', error)
            return this.mockFinancialInsight()
        }
    }

    async generateDebtReminder(debtorName: string, amount: number, reason?: string): Promise<string> {
        if (!this.genAI) {
            return this.mockDebtReminder(debtorName, amount)
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName })

            const prompt = `${this.DEBT_REMINDER_PROMPT}

Thông tin:
- Tên người cần nhắc: ${debtorName}
- Số tiền: ${amount.toLocaleString('vi-VN')} VNĐ
- Lý do: ${reason || 'giao dịch cá nhân'}

Viết tin nhắn nhắc nợ:`

            const result = await model.generateContent(prompt)
            return result.response.text().trim()
        } catch (error) {
            console.error('[GeminiService] generateDebtReminder error:', error)
            return this.mockDebtReminder(debtorName, amount)
        }
    }

    // === MOCK DATA (Fallback khi không có API Key) ===

    private mockInvoiceData(): InvoiceData {
        return {
            date: new Date().toISOString().split('T')[0],
            totalAmount: 150000,
            vendor: 'Cửa hàng Demo',
            items: [{ name: 'Sản phẩm mẫu', quantity: 1, price: 150000 }],
            note: 'Dữ liệu demo - Chưa có API Key',
        }
    }

    private mockTransactionIntent(text: string): TransactionIntent {
        const amountMatch = text.match(/(\d+)\s*k/i)
        const amount = amountMatch ? parseInt(amountMatch[1]) * 1000 : 0

        return {
            amount,
            type: 'expense',
            categoryHint: 'other',
            note: text,
        }
    }

    private mockFinancialInsight(): FinancialInsight {
        return {
            insights: [
                '📊 Chi tiêu ăn uống đang chiếm tỉ lệ lớn, cân nhắc nấu ăn tại nhà nhé!',
                '💰 Có khoản dư cuối tháng, có thể trích 10% để đầu tư hoặc tiết kiệm.',
                '📅 Đừng quên các khoản định kỳ như điện, nước sắp đến hạn!',
            ],
            overallScore: 65,
            topCategory: 'food',
        }
    }

    private mockDebtReminder(name: string, amount: number): string {
        return `${name} ơi, khoản ${amount.toLocaleString('vi-VN')}đ hôm trước đến lúc "về nhà" rồi đó! Có gì chuyển qua MoMo cho tiện nha 😄`
    }
}

// Export singleton instance
export const geminiService = new GeminiService()
