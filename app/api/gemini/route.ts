import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const prompt_post = `
      調理時間: ${data.time}
      予算: ${data.budget}
      カロリー制限: ${data.calorie}
      その他の条件: ${data.note}
      食材: ${Array.isArray(data.ingredients) ? data.ingredients.join(", ") : ""}
      この条件を満たすレシピを提案してください
    `;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
  const result = await model.generateContentStream(prompt_post);
  const response = await result.response

  return NextResponse.json({
    message: response.text()
  })
}
