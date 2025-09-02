"use client";
import { useState } from "react";
import { setEmailIfValid } from "@/lib/session";
import { useRouter } from "next/navigation";

export default function Gate() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function go() {
    try {
      setEmailIfValid(email);
      router.push("/qna");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid email";
      setErr(msg);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-center">Sawaali</h1>
      <p className="text-sm text-neutral-600 text-center">
        Ask with Salaam. Enter your UC email to join.
      </p>

      <input
        className="w-full border rounded-lg p-3"
        placeholder="name@uni.canberra.edu.au"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={go} className="w-full rounded-lg bg-black text-white py-3">
        Continue
      </button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </main>
  );
}