"use client";

import { useEffect, useMemo, useState } from "react";
import { setEmailIfValid } from "@/lib/session";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Fonts
import { Playfair_Display, Great_Vibes, DM_Sans, Alatsi, Style_Script } from "next/font/google";

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
        "h-[100svh] min-h-[100svh] w-full overflow-hidden",
        "bg-[#97cee5]",
        "flex flex-col items-center",
        "pt-[2.5em] pb-[2.25em] px-3",
        "max-[720px]:pt-[2em] max-[720px]:pb-[1.75em]",
      ].join(" ")}
    >
      <section
        className={[
          "w-full",
          "max-w-[46rem] md:max-w-[52rem] lg:max-w-[58rem]",
          "flex flex-col items-stretch",
          "grow",
        ].join(" ")}
      >
        {/* TOP GROUP ------------------------------------------------------- */}
        <div
          className={[
            "grid gap-3 sm:gap-4",
            "max-[700px]:gap-2",
          ].join(" ")}
        >
          {/* Title */}
          <h1
            className={[
              playfair.className,
              "text-center font-extrabold tracking-tight text-[#0e2a3d]",
              "drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]",
              "leading-tight",
              "text-[clamp(28px,6.2vw,64px)]",
            ].join(" ")}
          >
            Ameen vs Amen
          </h1>

          {/* Logos banner */}
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
              className="object-contain p-2 sm:p-3"
              sizes="(max-width: 768px) 92vw, 900px"
            />
          </div>

          {/* Tagline */}
          <p
            className={[
              alatsi.className,
              "text-center text-[#0e2a3d]",
              "leading-none",
              "text-[clamp(14px,4.2vw,32px)]",
              "pb-20"
            ].join(" ")}
          >
            Ask your questions with{" "}
            <span
              className={[
                styleScript.className,
                "text-[0.9em] sm:text-[0.95em] tracking-wide align-[-0.08em]",
              ].join(" ")}
            >
              Sawaali
            </span>
          </p>
        </div>

        {/* MIDDLE: Email card --------------------------------------------- */}
        <div
          className={[
            "mt-3 sm:mt-4",
            "rounded-2xl backdrop-blur-xl shadow-2xl",
            "px-4 sm:px-6 py-10",
            "mx-auto w-full",
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
              "text-sm font-semibold text-white shadow-lg shadow-slate-900/25",
              "bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950",
              "hover:from-slate-700 hover:via-slate-800 hover:to-indigo-900",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "transition active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-800/60",
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

        {/* BOTTOM: Powered by (few ems from bottom) ----------------------- */}
        <div className="mt-auto flex justify-center pt-3">
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