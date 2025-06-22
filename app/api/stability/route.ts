import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 翻訳関数を直接組み込み
async function translateRecipeName(recipeName: string): Promise<string> {
  try {
    const prompt = `
以下の日本語の料理名を英語に翻訳してください。
料理の内容が分かりやすく、食べ物の画像生成AIに適した英語の料理名にしてください。

例：
- 鶏胸肉と大根のヘルシーおろし煮 → Healthy chicken breast and grated daikon stew
- 大根とわかめの具だくさんのお味噌汁 → Hearty miso soup with daikon and wakame seaweed
- カレーライス → Japanese curry rice
- 親子丼 → Chicken and egg rice bowl (oyakodon)
- 鶏肉とじゃがいものレモン蒸し → Lemon steamed chicken and potatoes
- にんじんシリシリ風サラダ → Carrot julienne salad (Okinawan style)

翻訳する料理名: ${recipeName}

英語の料理名のみを回答してください。説明は不要です。
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedName = response.text().trim();

    console.log(`翻訳成功: "${recipeName}" → "${translatedName}"`);
    return translatedName;
  } catch (error) {
    console.error("翻訳エラー:", error);
    // 翻訳失敗時は日本語から推測できる英語名を返す
    return getDefaultTranslation(recipeName);
  }
}

// 翻訳失敗時のフォールバック
function getDefaultTranslation(recipeName: string): string {
  const translations: { [key: string]: string } = {
    "鶏肉とじゃがいものレモン蒸し": "Lemon steamed chicken and potatoes",
    "にんじんシリシリ風サラダ": "Carrot julienne salad",
    "親子丼": "Chicken and egg rice bowl",
    "カレーライス": "Japanese curry rice",
    "味噌汁": "Miso soup",
    "唐揚げ": "Japanese fried chicken",
    "焼き魚": "Grilled fish",
    "野菜炒め": "Stir-fried vegetables"
  };

  // 完全一致
  if (translations[recipeName]) {
    return translations[recipeName];
  }

  // 部分一致で推測
  for (const [japanese, english] of Object.entries(translations)) {
    if (recipeName.includes(japanese)) {
      return english;
    }
  }

  // 一般的な料理名に変換
  if (recipeName.includes("鶏")) return "Japanese chicken dish";
  if (recipeName.includes("魚")) return "Japanese fish dish";
  if (recipeName.includes("野菜")) return "Japanese vegetable dish";
  if (recipeName.includes("サラダ")) return "Japanese salad";
  if (recipeName.includes("スープ")) return "Japanese soup";
  if (recipeName.includes("ご飯") || recipeName.includes("丼")) return "Japanese rice bowl";

  return "Japanese dish";
}

export async function POST(req: Request) {
  try {
    const { recipeName } = await req.json();

    if (!recipeName) {
      return NextResponse.json(
        { error: "レシピ名が必要です" },
        { status: 400 }
      );
    }

    console.log("=== Stability AI API Debug ===");
    console.log("Original Recipe Name:", recipeName);

    // レシピ名を英語に翻訳
    const translatedName = await translateRecipeName(recipeName);
    console.log("Translated Name:", translatedName);

    // 画像生成用のプロンプトを作成
    const prompt = `A beautifully plated ${translatedName}, professional food photography, appetizing, well-lit, delicious looking, high resolution, detailed food styling`;
    
    console.log("Generated Prompt:", prompt);
    console.log("============================");

    // Stability AI APIに送信
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
            {
              text: "blurry, low quality, distorted, ugly food, unappetizing, text, watermark",
              weight: -1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
          style_preset: "photographic",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Stability AI API Error:", errorData);
      return NextResponse.json(
        { error: "画像生成に失敗しました" },
        { status: response.status }
      );
    }

    const result = await response.json();
    const imageBase64 = result.artifacts[0].base64;

    return NextResponse.json({
      image: `data:image/png;base64,${imageBase64}`,
      translatedName: translatedName // 翻訳された名前も返す
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
