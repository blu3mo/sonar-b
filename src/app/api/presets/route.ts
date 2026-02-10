import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { randomBytes } from "crypto";

const createPresetSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(200),
  purpose: z.string().min(1, "目的を入力してください").max(5000),
  backgroundText: z.string().max(50000).optional(),
  reportInstructions: z.string().max(10000).optional(),
  ogTitle: z.string().max(200).optional(),
  ogDescription: z.string().max(500).optional(),
});

function generateSlug(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPresetSchema.parse(body);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("presets")
      .insert({
        slug: generateSlug(),
        title: validated.title,
        purpose: validated.purpose,
        background_text: validated.backgroundText || null,
        report_instructions: validated.reportInstructions || null,
        og_title: validated.ogTitle || null,
        og_description: validated.ogDescription || null,
      })
      .select("slug, admin_token")
      .single();

    if (error) {
      console.error("Preset creation error:", error);
      return NextResponse.json(
        { error: "プリセットの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      preset: {
        slug: data.slug,
        adminToken: data.admin_token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}
