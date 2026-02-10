import { Metadata } from "next";
import { PresetCreator } from "@/components/preset/preset-creator";

export const metadata: Metadata = {
  title: "新しいプリセットを作成 - Sonar",
  description: "AIとの対話で意見を集めるためのプリセットを作成します",
};

export default function CreatePresetPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            新しいプリセットを作成
          </h1>
          <p className="text-gray-600 text-sm">
            質問の目的や背景を設定し、URLを共有して回答を集めましょう
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PresetCreator />
        </div>
      </div>
    </main>
  );
}
