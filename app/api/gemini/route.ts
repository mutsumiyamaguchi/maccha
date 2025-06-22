import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const prompt_post = `
      調理時間・予算・カロリー・その他の条件・食材を入力に、１食分の献立を提案してください。
      献立の全ての品目で入力された食材を使う必要はなく、少なくともどれか１つの品目で使えば良いです。
      料理名では、（何人前）というふうに材料が何人前かを書いてください。
      
      以下は入力と出力の例です。あなたの回答はjson形式の出力のみで良いです。
      ＜入力例＞
      調理時間: 30分
      その他の条件: ダイエット食
      食材: 鶏胸肉、大根をいずれかの料理で必ず使う。（１つの料理で全て使わなくても良い。）他の食材は自由に使って良い。
      
      ＜出力例＞
      {
  "recipes": [
    {
      "name": "鶏胸肉と大根のヘルシーおろし煮",
      "ingredients": [
        {
          "name": "鶏むね肉",
          "amount": "200g"
        },
        {
          "name": "大根",
          "amount": "1/3本"
        },
        {
          "name": "醤油",
          "amount": "大さじ1"
        },
        {
          "name": "ごま油",
          "amount": "適量"
        },
        {
          "name": "しめじ",
          "amount": "適量"
        },
        {
          "name": "だし",
          "amount": "適量"
        },
        {
          "name": "酒",
          "amount": "適量"
        },
        {
          "name": "みりん",
          "amount": "適量"
        },
        {
          "name": "小松菜",
          "amount": "適量"
        },
        {
          "name": "すりおろし生姜",
          "amount": "適量"
        }
      ],
      "steps": [
        "鶏胸肉は皮を除き、そぎ切りにして軽く塩をふる。大根はすりおろし、水気を軽く切る。小松菜は3cmにカットし、しめじは石づきを落としてほぐす。",
        "フライパンにごま油を熱し、鶏胸肉を中火でさっと焼く（中まで火が通らなくてOK）。",
        "鶏肉に火が通ってきたら、しめじ・大根おろし・だし・酒・みりん・醤油を加えて煮る。沸騰したらアクを取り、5〜6分ほど弱火で煮る。",
        "小松菜を加えてさらに2分ほど煮たら、最後にすりおろし生姜を加える。"
      ],
      "time": "30分",
      "cost": "850円",
      "calories": "470kcal",
      "key_points_for_cooking": "低脂質・高たんぱく、大根で満腹感アップ、味付けも薄味でヘルシー！"
    },
    {
      "name": "大根とわかめの具だくさんのお味噌汁",
      "ingredients": [
        {
          "name": "豆腐",
          "amount": "1/4丁"
        },
        {
          "name": "大根",
          "amount": "5cm"
        },
        {
          "name": "味噌",
          "amount": "大さじ1"
        },
        {
          "name": "乾燥わかめ",
          "amount": "適量"
        },
        {
          "name": "ねぎ",
          "amount": "適量"
        },
        {
          "name": "だし汁",
          "amount": "適量"
        }
      ],
      "steps": [
        "大根は薄いいちょう切りにする。乾燥わかめは水で戻し、豆腐は1.5cm角に切る。ねぎは小口切りにする。",
        "鍋にだし汁と大根を入れ火にかける。大根が透き通ってやわらかくなったら、豆腐・わかめを加えて1分煮る。",
        "火を弱めて味噌を溶き入れる（沸騰させないよう注意）。ねぎを散らして完成。"
      ],
      "time": "15分",
      "cost": "150円",
      "calories": "70kcal",
      "key_points_for_cooking": "大根で満腹感、塩分控えめでも出汁で旨味たっぷり！"
    }
  ]
}
      
      
      ＜今回の入力＞
      調理時間: ${data.time}
      その他の条件: ${data.note}
      食材: ${data.ingredients + "をいずれかの料理で必ず使う。（１つの料理で全て使わなくても良い。）他の食材は自由に使って良い。"}
      
      ＜今回の出力＞
    `;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
  const result = await model.generateContentStream(prompt_post);
  const response = await result.response

  return NextResponse.json({
    message: response.text()
  })
}
