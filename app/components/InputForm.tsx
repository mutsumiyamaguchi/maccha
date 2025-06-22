"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { RecipeContainer, RecipeList } from './recipe'

interface FormData {
  note: string;
  ingredients: { name: string }[];
}

type PreparedData = {
  time: string;
  note: string;
  ingredients: string;
};

export default function InputForm() {
  const {
    register,
    handleSubmit,
    watch,
    control,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      note: "",
      ingredients: [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const [recipe, setRecipe] = useState<RecipeList | null>(null);
  const [healthiness, setHealthiness] = useState<"lowCalorie" | "highProtein" | "hearty" | null>(null);
  const [time, setTime] = useState<"fast" | "medium" | "slow" | null>(null);
  const [genre, setGenre] = useState<"plain" | "rich" | "exotic" | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // データの準備
      const timeMap = {
        fast: "15分",
        medium: "30分", 
        slow: "60分"
      };
      
      const healthinessMap = {
        lowCalorie: "低カロリー",
        highProtein: "高たんぱく",
        hearty: "ボリューム重視"
      };
      
      const genreMap = {
        plain: "さっぱり系",
        rich: "こってり系", 
        exotic: "異国風"
      };

      let noteText = data.note.trim();
      if (healthiness) {
        noteText += (noteText ? "、" : "") + healthinessMap[healthiness];
      }
      if (genre) {
        noteText += (noteText ? "、" : "") + genreMap[genre];
      }

      const preparedData: PreparedData = {
        time: time ? timeMap[time] : "指定なし",
        note: noteText || "指定なし",
        ingredients: data.ingredients
          .map((item) => item.name.trim())
          .filter((name) => name !== "")
          .join("、"),
      };

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedData),
      });

      if (!res.ok) {
        throw new Error(`エラーが発生しました: ${res.statusText}`);
      }

      const result = await res.json();
      const obj = JSON.parse(result.message.split('\n').slice(1, -1).join('\n'))
      setRecipe(obj);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("通信エラーが発生しました");
      }
    }
    setLoading(false);
  };

  const note = watch("note");
  const ingredientList = watch("ingredients");

  const isDisabled =
    !note &&
    ingredientList.every((i) => i.name.trim() === "") &&
    !healthiness &&
    !time &&
    !genre;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
      >
        {/* 🥦 食材 */}
        <div>
          <label className="block mb-1 font-bold">1. 使いたい食材は？</label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  {...register(`ingredients.${index}.name`)}
                  placeholder="例：にんじん"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-3 focus:ring-orange-400"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ name: "" })}
              className="bg-orange-300 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-400"
            >
              ＋ 食材を追加
            </button>
          </div>
        </div>
      
        {/* ヘルシーさ */}
        <div>
          <label className="block mb-1 font-bold">2. ヘルシーさは？</label>
          <div className="flex gap-2">
            {[
              { type: "lowCalorie", label: "🥗 カロリー控えめ" },
              { type: "highProtein", label: "💪 高たんぱく" },
              { type: "hearty", label: "🍛 ガッツリ" },
            ].map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => setHealthiness(type as typeof healthiness)}
                className={`group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full border px-4 text-sm font-medium 
                  ${healthiness === type
                    ? "bg-orange-400 text-white border-orange-400"
                    : "bg-transparent text-neutral-600 border-neutral-300"}
                  active:translate-y-[2px] active:shadow-none`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 時間 */}
        <div>
          <label className="block mb-1 font-bold">3. 調理時間は？</label>
          <div className="flex gap-2">
            {[
              { type: "fast", label: "⏳ できるだけ早く" },
              { type: "medium", label: "🍳 そこそこ" },
              { type: "slow", label: "🕰 じっくり" },
            ].map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => setTime(type as typeof time)}
                className={`group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full border px-4 text-sm font-medium 
                  ${time === type
                    ? "bg-orange-400 text-white border-orange-400"
                    : "bg-transparent text-neutral-600 border-neutral-300"}
                  active:translate-y-[2px] active:shadow-none`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ジャンル */}
        <div>
          <label className="block mb-1 font-bold">4. 食べたい料理のジャンルは？</label>
          <div className="flex gap-2">
            {[
              { type: "plain", label: "🌿 さっぱり系" },
              { type: "rich", label: "🍖 こってり系" },
              { type: "exotic", label: "🌶 異国風" },
            ].map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => setGenre(type as typeof genre)}
                className={`group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full border px-4 text-sm font-medium 
                  ${genre === type
                    ? "bg-orange-400 text-white border-orange-400"
                    : "bg-transparent text-neutral-600 border-neutral-300"}
                  active:translate-y-[2px] active:shadow-none`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ✏ 備考 */}
        <div>
          <label className="block mb-1 font-bold">備考</label>
          <textarea
            {...register("note")}
            placeholder="アレルギー情報、好みの味付け、その他のリクエストを入力してください"
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-3 focus:ring-orange-400 resize-none"
          />
        </div>

        {/* 📤 ボタン */}
        <button
          type="submit"
          disabled={isDisabled || loading}
          className="bg-orange-300 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50 hover:bg-orange-400 transition"
        >
          {loading ? "提案中..." : "レシピを生成する！"}
        </button>
      </form>

      {recipe && (
          <RecipeContainer recipes={recipe.recipes} />
      )}

    </div>
  );
}
