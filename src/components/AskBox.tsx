"use client";

import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getSavedEmail } from "@/lib/session";
import { getDeviceId } from "@/lib/device";

export default function AskBox() {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(true);
  const deviceId = useMemo(getDeviceId, []);

  useEffect(() => {
    // optional: submission toggle support (safe if table not present)
    supabase.from("settings").select("value").eq("key", "submissions_open").single()
      .then(({ data, error }) => {
        if (!error && data?.value) setOpen(Boolean(data.value.open));
      });
  }, []);

  async function submit() {
    const email = getSavedEmail();
    if (!email) { alert("Enter your UC email first"); return; }

    const text = body.trim();
    if (!open) { alert("Submissions are closed"); return; }
    if (text.length < 5) { alert("Question must be at least 5 characters"); return; }

    setBusy(true);
    const { error } = await supabase.from("questions").insert([{
      body: text,
      author_email: email,
      device_id: deviceId
    }]);
    setBusy(false);

    if (error) {
      alert(error.message.toLowerCase().includes("row-level security")
        ? "Your email must be a UC email"
        : "Could not post your question");
      return;
    }
    setBody("");
  }

  return (
    <div className="rounded-xl border p-3 space-y-2">
      <textarea
        rows={3}
        maxLength={300}
        className="w-full border rounded-lg p-2"
        placeholder="Type your question..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={!open || busy || body.trim().length < 5}
        className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-50"
      >
        {!open ? "Submissions closed" : busy ? "Posting..." : "Submit"}
      </button>
    </div>
  );
}
