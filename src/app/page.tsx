import Image from "next/image";
import Link from "next/link";
import { PresetCreator } from "@/components/preset/preset-creator";
import { FormHistory } from "@/components/preset/form-history";
import { createClient } from "@/lib/supabase/server";
import { AuthHeader } from "@/components/auth/auth-header";
import { PresetList } from "@/components/dashboard/preset-list";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's presets if logged in
  let userPresets: Array<{
    id: string;
    slug: string;
    title: string;
    purpose: string;
    created_at: string;
    session_count: number;
  }> = [];

  if (user) {
    const { data: presets } = await supabase
      .from("presets")
      .select("id, slug, title, purpose, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (presets && presets.length > 0) {
      // Get session counts for each preset
      const { data: sessions } = await supabase
        .from("sessions")
        .select("preset_id")
        .in(
          "preset_id",
          presets.map((p) => p.id)
        );

      const countMap: Record<string, number> = {};
      sessions?.forEach((s) => {
        countMap[s.preset_id] = (countMap[s.preset_id] || 0) + 1;
      });

      userPresets = presets.map((p) => ({
        ...p,
        session_count: countMap[p.id] || 0,
      }));
    }
  }

  const showDashboard = user && userPresets.length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Auth header */}
        <div className="flex justify-end mb-4">
          {user ? (
            <AuthHeader email={user.email ?? ""} />
          ) : (
            <a
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ログイン
            </a>
          )}
        </div>

        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="倍速アンケート"
            width={200}
            height={40}
            className="mx-auto mb-2"
            priority
          />
          <p className="text-gray-600 text-sm">
            AIとの対話で、深い意見を素早く集める
          </p>
        </div>

        {showDashboard ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                あなたのアンケート
              </h2>
              <Link
                href="/create"
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                新規作成
              </Link>
            </div>
            <PresetList presets={userPresets} />
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <PresetCreator />
            </div>
            <div className="mt-6">
              <FormHistory />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
