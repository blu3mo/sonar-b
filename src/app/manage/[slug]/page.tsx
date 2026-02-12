import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "管理画面 - 倍速アンケート",
  robots: { index: false, follow: false },
};

interface ManagePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ManagePage({ params }: ManagePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get admin token for this preset owner
  const { data, error } = await supabase.rpc("get_admin_token_for_owner", {
    p_slug: slug,
    p_user_id: user.id,
  });

  if (error || !data || data.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            このアンケートの管理者ではないか、アンケートが存在しません。
          </p>
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            トップに戻る
          </a>
        </div>
      </main>
    );
  }

  const adminToken = data[0].admin_token;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <AdminDashboard token={adminToken} />
      </div>
    </main>
  );
}
