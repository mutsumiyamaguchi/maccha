"use client";

import { useState, useEffect, useRef } from "react";

export interface Recipe {
  name: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  time: string;
  cost: string;
  calories: string;
  key_points_for_cooking: string;
}

export interface RecipeList {
  recipes: Recipe[];
}

interface RecipeItemProps {
  recipe: Recipe;
}

function RecipeItem({ recipe }: RecipeItemProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 再試行用の関数（エラー時のみ使用）
  const retryImageGeneration = async () => {
    // 既に生成中の場合は中断
    if (isGeneratingRef.current && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    isGeneratingRef.current = false;
    setImageLoading(true);
    setImageError(false);
    setImageUrl(null);
    
    await generateImage();
  };

  const generateImage = async () => {
    // 既に生成中の場合は実行しない
    if (isGeneratingRef.current) {
      console.log("Already generating image, skipping...");
      return;
    }

    isGeneratingRef.current = true;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    console.log("Starting image generation for:", recipe.name);
    
    try {
      const response = await fetch("/api/stability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          recipeName: recipe.name,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error("画像生成に失敗しました");
      }

      const text = await response.text();
      console.log("API Response for", recipe.name, ":", text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("レスポンスの形式が正しくありません");
      }
      
      // 中断されていない場合のみ画像をセット
      if (!abortController.signal.aborted) {
        setImageUrl(data.image);
        console.log("Image set successfully for:", recipe.name);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Image generation aborted for:", recipe.name);
        return;
      }
      console.error("Image generation error:", error);
      setImageError(true);
    } finally {
      if (!abortController.signal.aborted) {
        setImageLoading(false);
        isGeneratingRef.current = false;
      }
    }
  };

  // コンポーネントがマウントされた時に自動的に画像生成を開始
  useEffect(() => {
    generateImage();
    
    // クリーンアップ関数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isGeneratingRef.current = false;
    };
  }, [recipe.name]); // generateImageは関数なので依存配列に含めない（ESLintルールを無効化）
  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 画像部分 */}
        <div className="lg:w-1/3">
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                {imageLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mb-2"></div>
                    <p className="text-sm text-gray-600">料理中...</p>
                  </div>
                ) : imageError ? (
                  <div className="text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <p className="text-red-500 text-xs mb-2">完成画像を表示できませんでした</p>
                    <button
                      onClick={retryImageGeneration}
                      className="bg-orange-400 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-500 transition-colors"
                    >
                      再試行
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🍽️</div>
                    <button
                      onClick={retryImageGeneration}
                      className="bg-orange-400 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-500 transition-colors"
                    >
                      完成画像を見る
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* レシピ情報部分 */}
        <div className="lg:w-2/3">
          <h3 className="text-xl font-bold mb-4 text-gray-800">{recipe.name}</h3>
          
          {/* 基本情報 */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-orange-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">調理時間</div>
              <div className="font-semibold text-orange-600">{recipe.time}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">予算</div>
              <div className="font-semibold text-orange-600">{recipe.cost}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">カロリー</div>
              <div className="font-semibold text-orange-600">{recipe.calories}</div>
            </div>
          </div>

          {/* ポイント */}
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <div className="text-sm font-medium text-yellow-800 mb-1">🌟 調理のポイント</div>
            <div className="text-sm text-yellow-700">{recipe.key_points_for_cooking}</div>
          </div>

          {/* 材料 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-700">📋 材料</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex justify-between text-sm py-1 px-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">{ingredient.name}</span>
                  <span className="text-gray-600">{ingredient.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 手順 */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-700">👩‍🍳 作り方</h4>
            <ol className="space-y-2">
              {recipe.steps.map((step, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed">
                  <span className="inline-block w-6 h-6 bg-orange-400 text-white text-xs rounded-full text-center leading-6 mr-2 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="inline">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MenuOverviewProps {
  recipes: Recipe[];
  selectedRecipes: number[];
  onRecipeClick: (index: number) => void;
}

function MenuOverview({ recipes, selectedRecipes, onRecipeClick }: MenuOverviewProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        📝 本日の献立一覧
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe, index) => {
          const isSelected = selectedRecipes.includes(index);
          return (
            <div
              key={index}
              onClick={() => onRecipeClick(index)}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-105 ${
                isSelected 
                  ? 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-300 shadow-md' 
                  : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">
                  {isSelected ? '✅' : '🍽️'}
                </span>
                <h4 className="font-semibold text-gray-800 text-sm">{recipe.name}</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-orange-600 font-medium">⏰ {recipe.time}</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-600 font-medium">💰 {recipe.cost}</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-600 font-medium">🔥 {recipe.calories}</div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-600 text-center">
                {isSelected ? '詳細表示中 (クリックで非表示)' : 'クリックで詳細を見る ↓'}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 献立サマリー */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📊 献立サマリー</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-blue-600 font-medium">総品数</div>
            <div className="text-lg font-bold text-blue-800">{recipes.length}品</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-medium">合計調理時間目安</div>
            <div className="text-lg font-bold text-blue-800">
              {recipes.reduce((total, recipe) => {
                const time = parseInt(recipe.time.replace(/[^\d]/g, '')) || 0;
                return total + time;
              }, 0)}分
            </div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-medium">総カロリー目安</div>
            <div className="text-lg font-bold text-blue-800">
              {recipes.reduce((total, recipe) => {
                const calories = parseInt(recipe.calories.replace(/[^\d]/g, '')) || 0;
                return total + calories;
              }, 0)}kcal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecipeContainerProps {
  recipes: Recipe[];
}

export function RecipeContainer({ recipes }: RecipeContainerProps) {
  const [selectedRecipeIndexes, setSelectedRecipeIndexes] = useState<number[]>([]);

  const handleRecipeClick = (index: number) => {
    setSelectedRecipeIndexes(prev => {
      if (prev.includes(index)) {
        // 既に選択されている場合は削除
        return prev.filter(i => i !== index);
      } else {
        // 選択されていない場合は追加
        return [...prev, index];
      }
    });
  };

  const handleCloseRecipe = (index: number) => {
    setSelectedRecipeIndexes(prev => prev.filter(i => i !== index));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🍳 ラクレピが提案するレシピ</h2>
        <p className="text-gray-600">あなたの条件にぴったりの献立です！</p>
      </div>
      
      {/* 献立一覧 */}
      <MenuOverview 
        recipes={recipes} 
        selectedRecipes={selectedRecipeIndexes}
        onRecipeClick={handleRecipeClick} 
      />
      
      {/* レシピ詳細 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            📖 レシピ詳細
            {selectedRecipeIndexes.length > 0 && (
              <span className="text-sm font-normal text-orange-600 ml-2">
                ({selectedRecipeIndexes.length}件表示中)
              </span>
            )}
          </h3>
          
          {selectedRecipeIndexes.length > 0 && (
            <button
              onClick={() => setSelectedRecipeIndexes([])}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              すべて閉じる
            </button>
          )}
        </div>
        
        {selectedRecipeIndexes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👆</div>
            <p>上の献立一覧から見たいレシピをクリックしてください</p>
          </div>
        ) : (
          selectedRecipeIndexes.map((selectedIndex) => (
            <div key={selectedIndex} id={`recipe-${selectedIndex}`}>
              <div className="relative">
                <div className="absolute -top-2 right-4 z-10">
                  <button
                    onClick={() => handleCloseRecipe(selectedIndex)}
                    className="bg-gray-500 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors"
                    title="このレシピを閉じる"
                  >
                    ×
                  </button>
                </div>
                <RecipeItem recipe={recipes[selectedIndex]} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}