import { GoogleGenAI } from "@google/genai";

// Khởi tạo client AI với API Key bảo mật từ biến môi trường
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Lấy mảng messages (lịch sử chat) từ Frontend gửi lên
    const { messages } = await req.json();

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Mảng lịch sử chat (messages) không hợp lệ hoặc trống." },
        { status: 400 }
      );
    }

    // 2. Ép prompt hệ thống (System Instruction) để giới hạn phạm vi tư vấn môi trường cho GreenBot
    const systemInstruction = 
      "Bạn là GreenBot 🌿 — trợ lý AI chính thức của hệ thống AI Recycle, một dự án thùng rác thông minh được phát triển bởi học sinh trường THPT. " +
      "Chỉ trả lời các câu hỏi liên quan đến kiến thức môi trường, rác thải, sinh thái, cách phân loại rác và đổi điểm thưởng trong hệ thống. " +
      "Từ chối lịch sự, khéo léo nếu người dùng hỏi các câu hỏi ngoài chủ đề hoặc yêu cầu code, làm toán, văn học.";

    // 3. Chuyển đổi mảng messages từ frontend sang cấu trúc tương thích với SDK mới của Gemini
    const geminiContents = messages.map((m: any) => ({
      role  : (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
      parts : [{ text: m.content || "" }],
    }));

    // 4. Gọi API Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiContents, // Đã sửa từ formattedContents thành geminiContents
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // 5. Trả kết quả chuẩn về cho Frontend bóc tách dữ liệu
    return Response.json({
      reply: response.text
    });

  } catch (err: any) {
    console.error("Lỗi phân hệ API Chat:", err);
    return Response.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}