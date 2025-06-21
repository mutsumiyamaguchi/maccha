"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
// import Image from "next/image";
import { RecipeContainer, RecipeList } from './recipe'

interface FormData {
  time: number | "";
  budget: number | "";
  calorie: number | "";
  note: string;
  ingredients: { name: string }[];
}

// interface Recipe {
//   title: string;
//   instructions: string;
//   ingredients: string[];
//   imageUrl: string;
// }

type PreparedData = {
  // time: number | string;
  // budget: number | string;
  // calorie: number | string;
  note: string;
  ingredients: string[];
  healthiness?: "lowCalorie" | "highProtein" | "hearty" | "指定なし";
  time?: "fast" | "medium" | "slow" | "指定なし";
  genre?: "plain" | "rich" | "exotic" | "指定なし";
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
      time: "",
      budget: "",
      calorie: "",
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
      const preparedData: PreparedData = {
        // time: data.time === "" ? "指定なし" : data.time,
        // budget: data.budget === "" ? "指定なし" : data.budget,
        // calorie: data.calorie === "" ? "指定なし" : data.calorie,
        note: data.note.trim() === "" ? "指定なし" : data.note.trim(),
        ingredients: data.ingredients
          .map((item) => item.name.trim())
          .filter((name) => name !== ""),
        healthiness: healthiness ?? "指定なし",
        time: time ?? "指定なし",
        genre: genre ?? "指定なし",
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
      //setRecipe(result);
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

  // const time = watch("time");
  // const budget = watch("budget");
  // const calorie = watch("calorie");
  const note = watch("note");
  const ingredientList = watch("ingredients");

  const isDisabled =
    // !time &&
    // !budget &&
    // !calorie &&
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

        {/* 💴 予算 */}
        {/* <div>
          <label className="block mb-1 text-sm font-medium">予算</label>
          <div className="flex gap-2 items-center">
            <input
              type="number" step="100"
              {...register("budget", {
                min: { value: 0, message: "0以上の数字を入力してください" },
              })}
              placeholder="例：1000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-3 focus:ring-orange-400"
            />
            <span className="text-sm">円</span>
          </div>
          {errors.budget && (
            <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>
          )}
        </div> */}

        {/* 🕒 時間 */}
        {/* <div>
          <label className="block mb-1 text-sm font-medium">時間</label>
          <div className="flex gap-2 items-center">
            <input
              type="number" step="5"
              {...register("time", {
                min: { value: 0, message: "0以上の数字を入力してください" },
              })}
              placeholder="例：30"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-3 focus:ring-orange-400"
            />
            <span className="text-sm">分</span>
          </div>
          {errors.time && (
            <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
          )}
        </div> */}

        {/* 🔥 カロリー */}
        {/* <div>
          <label className="block mb-1 text-sm font-medium">カロリー</label>
          <div className="flex gap-2 items-center">
            <input
              type="number" step="100"
              {...register("calorie", {
                min: { value: 0, message: "0以上の数字を入力してください" },
              })}
              placeholder="例：500"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-3 focus:ring-orange-400"
            />
            <span className="text-sm">kcal</span>
          </div>
          {errors.calorie && (
            <p className="text-red-500 text-xs mt-1">{errors.calorie.message}</p>
          )}
        </div> */}

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
          {loading ? "提案中..." : "AIに聞く！"}
        </button>
      </form>

      {/* 📝 レシピ結果表示 */}
      {/*{recipe && (*/}
      {/*  <div className="bg-white p-6 mt-4 rounded-xl shadow">*/}
      {/*    <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>*/}
      {/*    {recipe.imageUrl && (*/}
      {/*      <div className="relative w-full h-64 mb-3 rounded-md overflow-hidden">*/}
      {/*        <Image*/}
      {/*          src={recipe.imageUrl}*/}
      {/*          alt={recipe.title}*/}
      {/*          fill*/}
      {/*          style={{ objectFit: "cover" }}*/}
      {/*          sizes="(max-width: 768px) 100vw, 50vw"*/}
      {/*          priority={true}*/}
      {/*        />*/}
      {/*      </div>*/}
      {/*    )}*/}
      {/*    <p className="mb-2">*/}
      {/*      <strong>作り方：</strong>*/}
      {/*      {recipe.instructions}*/}
      {/*    </p>*/}
      {/*    <p>*/}
      {/*      <strong>材料：</strong>*/}
      {/*      {recipe.ingredients.join(", ")}*/}
      {/*    </p>*/}
      {/*  </div>*/}
      {/*)}*/}
      {recipe && (
          // <div className="bg-white p-6 mt-4 rounded-xl shadow whitespace-pre-wrap">
          //   {
          //     recipe.map(r => r.name).join(',')
          //   }
          // </div>

          <RecipeContainer recipes={recipe.recipes} />
      )}

    </div>
  );
}
