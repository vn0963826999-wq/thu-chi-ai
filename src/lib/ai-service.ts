import { GoogleGenerativeAI } from "@google/generative-ai";
import { type Transaction, type Debt } from "./store";

// Helper để lấy Key động (Ưu tiên Key người dùng nhập -> Sau đó mới đến Key mặc định của App)
const getGenAI = () => {
    // Chỉ chạy trên Client
    if (typeof window === 'undefined') return null;

    const userKey = localStorage.getItem("USER_GEMINI_API_KEY");
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const finalKey = userKey || envKey;
    const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.0-flash-exp";

    if (!finalKey || finalKey.includes("your-google-gemini")) return null;

    const genAI = new GoogleGenerativeAI(finalKey);
    return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Helper: Chuyển đổi file sang định dạng Gemini Image
 */
async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type
        },
    };
}

export const aiService = {
    /**
     * OCR hóa đơn/biên lai bằng Gemini Vision
     */
    async scanReceipt(file: File) {
        const model = getGenAI();
        if (!model) {
            console.warn("Gemini API Key missing");
            throw new Error("Vui lòng nhập API Key trong phần Cài đặt để sử dụng tính năng này.");
        }

        try {
            const imagePart = await fileToGenerativePart(file);

            const prompt = `
                Bạn là một trợ lý kế toán AI chuyên nghiệp. Hãy đọc ảnh hóa đơn/biên lai này và trích xuất thông tin:
                1. Số tiền (amount): chỉ lấy con số.
                2. Ngày (date): định dạng YYYY-MM-DD.
                3. Danh mục (category): Chọn 1 trong (food, transport, shopping, bill, or other).
                4. Tên cửa hàng (merchant).
                5. Ghi chú tóm tắt (note).
                Trả về kết quả dưới dạng JSON duy nhất.
            `;

            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Không thể đọc được dữ liệu JSON từ AI");

            return JSON.parse(jsonMatch[0]);
        } catch (error: any) {
            console.error("AI Scan Error:", error);
            throw new Error(`Lỗi quét AI: ${error.message || "Không thể đọc ảnh"}`);
        }
    },

    /**
     * Phân tích sức khỏe tài chính dựa trên lịch sử giao dịch
     */
    async analyzeFinancialHealth(transactions: Transaction[]) {
        const model = getGenAI();
        if (!model || transactions.length < 3) {
            return [
                "Hãy nhập thêm giao dịch để AI có thể phân tích chính xác hơn.",
                "Cập nhật API Key trong cài đặt để kích hoạt trí tuệ nhân tạo.",
                "Ghi chép chi tiêu hàng ngày là thói quen tốt."
            ];
        }

        try {
            const dataStr = JSON.stringify(transactions.slice(-20));

            const prompt = `
                Đây là danh sách giao dịch tài chính của tôi: ${dataStr}.
                Hãy đóng vai một chuyên gia tư vấn tài chính cá nhân.
                Hãy đưa ra đúng 3 lời khuyên ngắn gọn (mỗi lời khuyên dưới 20 từ) bằng Tiếng Việt 
                để giúp tôi tối ưu hóa chi tiêu hoặc tiết kiệm.
                Trả về mảng JSON ["lời khuyên 1", "lời khuyên 2", "lời khuyên 3"].
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : ["Hãy tiếp tục theo dõi chi tiêu!", "Tiết kiệm là quốc sách.", "Chúc bạn một ngày tài chính tốt lành."];
        } catch (error) {
            console.error("AI Analysis Error:", error);
            return ["AI đang bận hoặc Key hết hạn mức.", "Vui lòng kiểm tra lại Key trong cài đặt.", "Thử lại sau ít phút."];
        }
    },

    /**
     * Tạo tin nhắn nhắc nợ khéo léo
     */
    async generateDebtReminder(debt: Debt) {
        const model = getGenAI();
        if (!model) {
            return `Chào ${debt.name}, mình nhắc nhẹ khoản ${debt.amount.toLocaleString('vi-VN')}đ hôm trước nhé. Khi nào tiện thì gửi mình nha! (Nhập API Key để AI viết hay hơn)`;
        }

        try {
            const prompt = `
                Hãy viết một tin nhắn nhắc nợ cực kỳ khéo léo và một chút hài hước.
                Tên chủ nợ (hoặc người nợ): ${debt.name}.
                Số tiền: ${debt.amount.toLocaleString('vi-VN')} VNĐ.
                Lý do: ${debt.note || 'giao dịch cá nhân'}.
                Mục tiêu: Nhắc để người ta trả tiền mà không cảm thấy khó chịu.
                Chỉ trả về nội dung tin nhắn, không thêm gì khác.
            `;

            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            return `Người anh em ${debt.name} ơi, khoản ${debt.amount.toLocaleString('vi-VN')}đ hôm trước đến hạn rồi kìa. Check giúp mình nhé!`;
        }
    },

    /**
     * Quét lịch sử để tìm các khoản chi lặp lại
     */
    async detectRecurring(transactions: Transaction[]) {
        const model = getGenAI();
        if (!model || transactions.length < 5) {
            return [];
        }

        try {
            const dataStr = JSON.stringify(transactions.map(t => ({ name: t.note, amount: t.amount, categoryId: t.categoryId })));

            const prompt = `
                Dựa trên lịch sử chi tiêu sau: ${dataStr}.
                Hãy tìm các giao dịch có vẻ như là định kỳ (ví dụ: tiền mạng, tiền nhà, phí dịch vụ lặp lại hàng tháng).
                Trả về mảng JSON các đối tượng [{name, amount, frequency: 'monthly' | 'weekly', categoryId}].
                Nếu không thấy giao dịch nào rõ ràng, trả về [].
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch (error) {
            return [];
        }
    }
};
