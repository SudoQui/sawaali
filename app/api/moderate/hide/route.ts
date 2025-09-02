import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE!;
const adminPassword = process.env.ADMIN_PASSWORD!;

function bad(msg: string, status = 500) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(req: Request) {
  if (!url) return bad("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) return bad("Missing SUPABASE_SERVICE_ROLE");
  if (!adminPassword) return bad("Missing ADMIN_PASSWORD");

  const { questionId, password, deletedBy } = await req.json();
  if (!password || password !== adminPassword) return bad("unauthorized", 401);
  if (!questionId) return bad("missing questionId", 400);

  const sb = createClient(url, serviceKey);

  const { data, error: getErr } = await sb
    .from("questions")
    .select("id, body, author_email, device_id")
    .eq("id", questionId)
    .limit(1);

  if (getErr) return bad("Supabase get error: " + getErr.message);
  if (!data?.length) return bad("not found", 404);
  const q = data[0];

  const { error: insErr } = await sb.from("question_deletions").insert([{
    question_id: q.id,
    body: q.body,
    author_email: q.author_email,
    device_id: q.device_id,
    deleted_by: deletedBy || "admin"
  }]);
  if (insErr) return bad("Supabase insert error: " + insErr.message);

  const { error: updErr } = await sb
    .from("questions")
    .update({ hidden: true })
    .eq("id", q.id);

  if (updErr) return bad("Supabase update error: " + updErr.message);

  return NextResponse.json({ ok: true });
}