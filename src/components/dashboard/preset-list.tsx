import Link from "next/link";

interface PresetItem {
  id: string;
  slug: string;
  title: string;
  purpose: string;
  created_at: string;
  session_count: number;
}

export function PresetList({ presets }: { presets: PresetItem[] }) {
  return (
    <div className="space-y-3">
      {presets.map((preset) => (
        <div
          key={preset.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">
                {preset.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {preset.purpose}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>
                  {new Date(preset.created_at).toLocaleDateString("ja-JP")}
                </span>
                <span>{preset.session_count}件の回答</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <Link
                href={`/manage/${preset.slug}`}
                className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
              >
                管理
              </Link>
              <Link
                href={`/preset/${preset.slug}`}
                className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                回答ページ
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
