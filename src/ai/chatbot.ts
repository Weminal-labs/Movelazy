import OpenAI from "openai";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const chatbot_prompt = "D:/Source/node/Movelazy/src/ai/chatbot_prompt.txt";
const systemPrompt = fs.readFileSync(chatbot_prompt, "utf-8");

const openai = new OpenAI({
    apiKey: "", // Lấy API key từ biến môi trường
});

export async function AiResponse(usrInput: string): Promise<string> {
    console.log("🤖 Chatbot GPT - Handling command");

    let botResponse = "";
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Dùng model mới nhất
            temperature: 0.0, // Không áp dụng randomness
            max_tokens: 200, // Số tokens tối đa
            messages: [
                { role: "user", content: usrInput },
                { role: "system", content: systemPrompt },
            ],
        });

        botResponse =
            response.choices[0]?.message?.content?.trim() || "OpenAI not response!";

    } catch (error) {
        throw new Error("❌ Error when calling OpenAI API: " + error);
    }
    return botResponse;
}

