import InputForm from "./components/InputForm";
import Image from 'next/image';

export default function Home() {
  return (
    <main>
      <div className="mb-6 flex justify-center">
        <Image src="/ロゴ.svg" alt="ラクレピ！ロゴ" width={200} height={60} />
      </div>
      <p className="mb-6 text-center text-gray-600">条件を入力して気分に合ったレシピを生成しましょう</p>
      <InputForm />
    </main>
  );
}
