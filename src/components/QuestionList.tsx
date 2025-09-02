"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/device";
import { hideQuestion } from "@/lib/mod";

type Row = {
  id: string;
  body: string;
  created_at: string;
  score: number;
  hidden: boolean;
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function QuestionRow({
  q,
  onToggle,
  onDeleted,
  isVoted,
}: {
  q: Row;
  onToggle: (id: string, isVoted: boolean) => void;
  onDeleted: () => void;
  isVoted: boolean;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const taps = useRef(0);
  const timer = useRef<number | null>(null);

  function secretTap() {
    taps.current += 1;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      taps.current = 0;
      timer.current = null;
    }, 2000);
    if (taps.current >= 4) {
      setShowDelete(true);
      taps.current = 0;
      if (timer.current) { window.clearTimeout(timer.current); timer.current = null; }
    }
  }

  async function onDelete(e: React.MouseEvent) {
    e.stopPropagation();
    const pwd = prompt("Moderator password");
    if (!pwd) return;
    try {
      await hideQuestion(q.id, pwd, "admin");
      onDeleted();
      setShowDelete(false);
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  }

  return (
    <li className="rounded-xl border p-3" onClick={secretTap}>
      <div className="text-base">{q.body}</div>
      <div className="mt-2 flex items-center justify-between">
        {/* 👍 button unchanged */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(q.id, isVoted); }}
          aria-pressed={isVoted}
          className={`rounded-lg border px-3 py-1 ${isVoted ? "bg-white/10" : ""}`}
          title={isVoted ? "Unlike" : "Like"}
        >
          👍 {q.score}
        </button>
        <time className="text-xs text-neutral-400">{timeAgo(q.created_at)}</time>
      </div>
      {showDelete && (
        <div className="mt-2">
          <button onClick={onDelete} className="text-red-600 text-sm underline">
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export default function QuestionList() {
  const [list, setList] = useState<Row[]>([]);
  const [sort, setSort] = useState<"top" | "new">("top");
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0); // 👈 trigger-only state for timeAgo updates

  const deviceId = useMemo(getDeviceId, []);

  // Track vote row IDs created/deleted by THIS tab only
  const pendingInsertIds = useRef<Set<string>>(new Set());
  const pendingDeleteIds = useRef<Set<string>>(new Set());

  // keep current sort in a ref for realtime handlers
  const sortRef = useRef(sort);
  useEffect(() => { sortRef.current = sort; }, [sort]);

  function sortRows(rows: Row[], mode: "top" | "new") {
    const copy = [...rows];
    if (mode === "top") {
      copy.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score; // upvotes desc
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // older first for ties
      });
    } else {
      copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // newest first
    }
    return copy;
  }

  function applyDeltaAndResort(qid: string, delta: number) {
    setList(prev => {
      const updated = prev.map(it =>
        it.id === qid ? { ...it, score: Math.max(0, it.score + delta) } : it
      );
      return sortRows(updated, sortRef.current);
    });
  }

  // tiny debounce to coalesce multiple realtime events
  const refreshTimer = useRef<number | null>(null);
  function refreshSoon() {
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => {
      refreshTimer.current = null;
      void refresh();
    }, 120);
  }

  async function refresh() {
    let q = supabase.from("question_with_score").select("*").eq("hidden", false);
    if (sortRef.current === "top") {
      q = q.order("score", { ascending: false }).order("created_at", { ascending: true });
    } else {
      q = q.order("created_at", { ascending: false });
    }
    const { data } = await q;
    const rows = sortRows((data || []) as Row[], sortRef.current);
    setList(rows);

    // Which ones THIS device has liked
    if (rows.length) {
      const { data: myVotes } = await supabase
        .from("votes")
        .select("question_id")
        .in("question_id", rows.map((r) => r.id))
        .eq("device_id", deviceId);
      setVoted(new Set((myVotes || []).map((v) => v.question_id as string)));
    } else {
      setVoted(new Set());
    }
  }

  // Initial load + realtime subscriptions
  useEffect(() => {
    void refresh();

    const ch = supabase
      .channel("sawaali_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => {
        void refresh();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, (payload) => {
        const v = payload.new as any;
        const voteId = v?.id as string | undefined;
        const qid = v?.question_id as string | undefined;

        if (voteId && pendingInsertIds.current.has(voteId)) {
          pendingInsertIds.current.delete(voteId);
          return;
        }
        if (qid) applyDeltaAndResort(qid, +1);
        else void refresh();
        refreshSoon();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "votes" }, (payload) => {
        const v = payload.old as any;
        const voteId = v?.id as string | undefined;
        const qid = v?.question_id as string | undefined;

        if (voteId && pendingDeleteIds.current.has(voteId)) {
          pendingDeleteIds.current.delete(voteId);
          return;
        }
        if (qid) applyDeltaAndResort(qid, -1);
        else void refresh();
        refreshSoon();
      })
      .subscribe();

    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      void supabase.removeChannel(ch);
    };
  }, [deviceId]);

  // Resort immediately + refetch when the user toggles Top/Newest
  useEffect(() => {
    setList(prev => sortRows(prev, sort)); // instant UI update
    void refresh();                        // canonical order from DB
  }, [sort]);

  // 🔁 Every 15s: re-render (updates timeAgo) + pull fresh data
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);         // trigger re-render only
      void refresh();              // fetch fresh rows
    }, 15_000);
    return () => clearInterval(id);
  }, []);

  // Toggle like or unlike with optimistic UI and per-tab echo suppression
  async function toggleVote(id: string, isVotedNow: boolean) {
    if (!isVotedNow) {
      setVoted((prev) => new Set(prev).add(id));
      applyDeltaAndResort(id, +1);

      const { data, error } = await supabase
        .from("votes")
        .insert([{ question_id: id, device_id: deviceId }])
        .select("id")
        .single();

      if (error && !String(error.message).toLowerCase().includes("duplicate")) {
        setVoted((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
        applyDeltaAndResort(id, -1);
        alert("Could not like the question");
      } else if (data?.id) {
        pendingInsertIds.current.add(data.id as string);
      }
    } else {
      setVoted((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      applyDeltaAndResort(id, -1);

      const { data: rows, error: qErr } = await supabase
        .from("votes")
        .select("id")
        .eq("question_id", id)
        .eq("device_id", deviceId)
        .limit(1);

      if (qErr || !rows?.length) {
        setVoted((prev) => new Set(prev).add(id));
        applyDeltaAndResort(id, +1);
        alert("Could not find your like to remove");
        return;
      }

      const voteId = rows[0].id as string;
      const { error } = await supabase.from("votes").delete().eq("id", voteId);
      if (error) {
        setVoted((prev) => new Set(prev).add(id));
        applyDeltaAndResort(id, +1);
        alert("Could not remove your like");
      } else {
        pendingDeleteIds.current.add(voteId);
      }
    }
  }

  return (
    <section className="space-y-3">
      {/* Top / Newest segmented control */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-neutral-700 p-1">
          <button
            onClick={() => setSort("top")}
            aria-pressed={sort === "top"}
            className={`px-3 py-1 rounded-full text-sm font-medium transition
              ${sort === "top" ? "bg-white text-black" : "text-neutral-300 hover:bg-neutral-800"}`}
          >
            Top
          </button>
          <button
            onClick={() => setSort("new")}
            aria-pressed={sort === "new"}
            className={`px-3 py-1 rounded-full text-sm font-medium transition
              ${sort === "new" ? "bg-white text-black" : "text-neutral-300 hover:bg-neutral-800"}`}
          >
            Newest
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {list.map((q) => (
          <QuestionRow
            key={q.id}
            q={q}
            onToggle={toggleVote}
            onDeleted={refresh}
            isVoted={voted.has(q.id)}
          />
        ))}
      </ul>
    </section>
  );
}