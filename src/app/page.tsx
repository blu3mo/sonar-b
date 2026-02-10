import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Sonar</h1>
          <p className="text-gray-600">
            AIとの対話を通じて、考えを言語化する
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* アンケートを作る */}
          <Link
            href="/create"
            className="group block rounded-xl p-6 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              アンケートを作る
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              テーマを設定してURLを共有。複数人の意見をAI対話で集めて、管理画面でまとめて確認できます。
            </p>
          </Link>

          {/* 1人で壁打ち */}
          <Link
            href="/solo"
            className="group block rounded-xl p-6 bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              1人で壁打ちする
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              自分の考えをAIとの対話で掘り下げます。モヤモヤしていることを言語化し、思考を整理できます。
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
