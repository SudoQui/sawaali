export async function hideQuestion(id: string, password: string, deletedBy?: string) {
  const r = await fetch("/api/moderate/hide", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionId: id, password, deletedBy }),
  });
  const data = await r.json();
  if (!data.ok) throw new Error(data.error || "Failed");
}