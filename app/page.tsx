"use client";

import { useEffect, useMemo, useState } from "react";
import { setEmailIfValid } from "@/lib/session";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Fonts
import { Playfair_Display, Great_Vibes, DM_Sans, Alatsi } from "next/font/google";
import { Style_Script } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800"] });
const vibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const dmsans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });
const alatsi = Alatsi({ subsets: ["latin"], weight: "400" });
const styleScript = Style_Script({ subsets: ["latin"], weight: "400" });



export default function Gate() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const domainHint = useMemo(() => {
    if (!email) return "";
    const ok =
      /@(?:uni\.)?canberra\.edu\.au$/i.test(email) || /@canberra\.edu\.au$/i.test(email);
    return ok ? "" : "Please use your UC email address.";
  }, [email]);

  async function go() {
    setErr("");
    setLoading(true);
    try {
      setEmailIfValid(email.trim());
      router.push("/qna");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid email";
      setErr(msg);
      setLoading(false);
    }
  }

  useEffect(() => {
    const onEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && email && !loading) {
        e.preventDefault();
        void go();
      }
    };
    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, [email, loading]);

  const showInlineHint = domainHint && !err;

  return (
    <main
      className={[
        // full viewport, no scroll
        "h-[100svh] min-h-[100svh] w-full overflow-hidden",
        // solid blue background
        "bg-[#97cee5]",
        // center content
        "flex items-center justify-center",
        "px-3",
      ].join(" ")}
    >
      {/* Content column — scales to phone & desktop */}
      <section
        className={[
          "w-[min(92vw,980px)]",
          "grid gap-4 sm:gap-5",
          // if screen is short, tighten gaps further
          "max-[700px]:gap-3",
        ].join(" ")}
      >
        {/* Title */}
        <h1
          className={[
            playfair.className,
            "text-center font-extrabold tracking-tight text-[#0e2a3d]",
            "drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]",
            // clamp keeps it huge on desktop, compact on phones
            "text-[clamp(28px,6.2vw,68px)]",
            "leading-tight",
          ].join(" ")}
        >
          Ameen vs Amen
        </h1>

        {/* Logos banner — wide, edge-to-edge inside card */}
        <div
          className={[
            "relative w-full rounded-2xl shadow-xl backdrop-blur",
            "aspect-[16/6] sm:aspect-[16/5]",
          ].join(" ")}
          style={{ backgroundColor: "#7bb6d1" }}
        >
          <Image
            src="/img/MSAvsUCF.png"
            alt="Islamic Society & FOCUS logos"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 92vw, 980px"
          />
        </div>



        {/* Tagline */}
        <p
          className={[
            alatsi.className,
            "text-center text-[#0e2a3d]",
            // overall tagline font scales a bit smaller
            "text-[clamp(14px,4.2vw,34px)]",
            // tighter vertical space so it doesn’t push content down
            "leading-none",
            "mt-1",
          ].join(" ")}
        >
          Ask your questions with{" "}
          <span
            className={[
              styleScript.className,
              // make just “Sawaali” smaller than the sentence
              "text-[0.85em] sm:text-[0.9em]",
              "tracking-wide align-[-0.08em]",
            ].join(" ")}
          >
            Sawaali
          </span>
        </p>



        {/* Email card — compact so we always fit in 1 screen */}
        <div
          className={[
            "rounded-2xl backdrop-blur-xl shadow-2xl",
            "px-4 sm:px-6 py-4",
          ].join(" ")}
          style={{ backgroundColor: "#7bb6d1" }}
        >
          <label
            htmlFor="email"
            className={`${dmsans.className} block text-[13px] sm:text-sm font-medium text-slate-800`}
          >
            Please enter your UC email
          </label>

          <div
            className={[
              "mt-2 flex items-center gap-2 rounded-xl border bg-white",
              err
                ? "border-red-400 focus-within:ring-2 focus-within:ring-red-400/60"
                : "border-slate-200 focus-within:ring-2 focus-within:ring-indigo-400/60",
              "transition shadow-inner",
            ].join(" ")}
          >
            <div className="pl-3">
              <svg
                className="h-5 w-5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7.5 11.2 12.3a2 2 0 0 0 1.6 0L21 7.5" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="userID@uni.canberra.edu.au"
              className={`${dmsans.className} w-full bg-transparent pr-4 py-3 text-[15px] sm:text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!(err || showInlineHint)}
              aria-describedby={(err || showInlineHint) ? "email-help" : undefined}
            />
          </div>

          {(err || showInlineHint) && (
            <p
              id="email-help"
              className={`${dmsans.className} mt-2 text-[11px] sm:text-xs ${
                err ? "text-red-600" : "text-slate-700"
              }`}
            >
              {err ? err : domainHint}
            </p>
          )}

          <button
            onClick={go}
            disabled={!email || loading}
            className={[
              "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
              "text-sm font-semibold text-white shadow-lg shadow-indigo-500/25",
              "bg-gradient-to-r from-sky-500 via-indigo-600 to-fuchsia-600",
              "hover:from-sky-500/90 hover:via-indigo-600/90 hover:to-fuchsia-600/90",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "transition active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60",
            ].join(" ")}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                </svg>
                Joining…
              </>
            ) : (
              <>
                Ask Questions
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          <p className={`${dmsans.className} mt-2 text-center text-[10px] sm:text-[11px] text-slate-700`}>
            UC-only access. We never post without your consent.
          </p>
        </div>

        {/* Powered by — smaller */}
        <div className="flex justify-center">
          <Image
            src="/img/PoweredBySudoTech.png"
            alt="Powered by SudoQui Tech"
            width={160}
            height={70}
            className="h-auto w-20 sm:w-24 opacity-85"
            priority={false}
          />
        </div>
      </section>
    </main>
  );
}