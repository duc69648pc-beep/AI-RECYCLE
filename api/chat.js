import { GoogleGenAI } from "@google/genai";

// Khởi tạo client AI với API Key bảo mật từ biến môi trường
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Lấy mảng messages (lịch sử chat) từ Frontend gửi lên
    // Lưu ý: Vercel Serverless tự động dịch JSON, nên ta dùng req.body
    const { messages } = req.body;

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Mảng lịch sử chat (messages) không hợp lệ hoặc trống." });
    }

    // 2. Ép prompt hệ thống (System Instruction)
    const systemInstruction = 
      "Bạn là GreenBot 🌿 — trợ lý AI chính thức của hệ thống AI Recycle, một dự án thùng rác thông minh được phát triển bởi học sinh trường THPT. " +
      "Chỉ trả lời các câu hỏi liên quan đến kiến thức môi trường, rác thải, sinh thái, cách phân loại rác và đổi điểm thưởng trong hệ thống. " +
      "Từ chối lịch sự, khéo léo nếu người dùng hỏi các câu hỏi ngoài chủ đề hoặc yêu cầu code, làm toán, văn học.";

    // 3. Chuyển đổi mảng messages
    const geminiContents = messages.map(m => ({
      role  : (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
      parts : [{ text: m.content || "" }],
    }));

    // 4. Gọi API Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // 5. Trả kết quả chuẩn về cho Frontend
    return res.status(200).json({ reply: response.text });

  } catch (err) {
    console.error("Lỗi phân hệ API Chat:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}