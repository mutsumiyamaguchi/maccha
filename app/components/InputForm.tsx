"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

interface FormData {
  time: number | "";
  budget: number | "";
  calorie: number | "";
  note: string;
  ingredients: { name: string }[];
}

interface Recipe {
  title: string;
  instructions: string;
  ingredients: string[];
  imageUrl: string;
}

type PreparedData = {
  time: number | string;
  budget: number | string;
  calorie: number | string;
  note: string;
  ingredients: string[];
};

export default function InputForm() {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
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

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const preparedData: PreparedData = {
        time: data.time === "" ? "指定なし" : data.time,
        budget: data.budget === "" ? "指定なし" : data.budget,
        calorie: data.calorie === "" ? "指定なし" : data.calorie,
        note: data.note.trim() === "" ? "指定なし" : data.note.trim(),
        ingredients: data.ingredients
          .map((item) => item.name.trim())
          .filter((name) => name !== ""),
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
      setRecipe(result);
    } catch (error: any) {
      alert(error.message || "通信エラーが発生しました");
    }
    setLoading(false);
  };

  const time = watch("time");
  const budget = watch("budget");
  const calorie = watch("calorie");
  const note = watch("note");
  const ingredientList = watch("ingredients");

  const isDisabled =
    !time && !budget && !calorie && !note && ingredientList.every((i) => i.name.trim() === "");

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
      >
        {/* 🥦 食材 */}
        <div>
          <label className="block mb-1 text-sm font-medium">食材</label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  {...register(`ingredients.${index}.name`)}
                  placeholder={`食材${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="text-blue-500 text-sm mt-1 hover:underline"
            >
              ＋ 食材を追加
            </button>
          </div>
        </div>

        {/* 💴 予算 */}
        <div>
          <label className="block mb-1 text-sm font-medium">予算（円）</label>
          <input
            type="number"
            {...register("budget", {
              min: { value: 0, message: "0以上の数字を入力してください" },
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.budget && (
            <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>
          )}
        </div>

        {/* 🕒 時間 */}
        <div>
          <label className="block mb-1 text-sm font-medium">時間（分）</label>
          <input
            type="number"
            {...register("time", {
              min: { value: 0, message: "0以上の数字を入力してください" },
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.time && (
            <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
          )}
        </div>

        {/* 🔥 カロリー */}
        <div>
          <label className="block mb-1 text-sm font-medium">カロリー</label>
          <input
            type="number"
            {...register("calorie", {
              min: { value: 0, message: "0以上の数字を入力してください" },
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.calorie && (
            <p className="text-red-500 text-xs mt-1">{errors.calorie.message}</p>
          )}
        </div>

        {/* ✏ 備考 */}
        <div>
          <label className="block mb-1 text-sm font-medium">備考</label>
          <textarea
            {...register("note")}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* 📤 ボタン */}
        <button
          type="submit"
          disabled={isDisabled || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50 hover:bg-blue-600 transition"
        >
          {loading ? "提案中..." : "AIに聞く！"}
        </button>
      </form>

      {/* 📝 レシピ結果表示 */}
      {recipe && (
        <div className="bg-white p-6 mt-4 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>
          {recipe.imageUrl && (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-auto mb-3 rounded-md"
            />
          )}
          <p className="mb-2">
            <strong>作り方：</strong>
            {recipe.instructions}
          </p>
          <p>
            <strong>材料：</strong>
            {recipe.ingredients.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
