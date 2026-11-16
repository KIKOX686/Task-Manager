"use client";

import { useEffect, useState, type FormEvent } from "react";
import { statuses, type Status, type Task, type TaskInput } from "../lib/tasks";

const columns = Object.keys(statuses) as Status[];
const dots = { todo: "bg-violet-400", doing: "bg-amber-400", done: "bg-emerald-400" };
const emptyTask: TaskInput = { title: "", description: "", dueDate: "", status: "todo" };
const field = "w-full rounded-lg border border-[#353b4c] bg-[#131721] px-3 py-2.5 text-sm text-slate-100";
const secondary = "rounded-lg border border-[#353b4c] px-3 py-2 text-sm hover:bg-white/5";
const primary = "rounded-lg bg-violet-300 px-4 py-2.5 text-sm font-semibold text-[#22173b] hover:bg-violet-200";

async function request(method = "GET", id?: string, task?: TaskInput): Promise<unknown> {
  const response = await fetch(id ? "/api/tasks?id=" + encodeURIComponent(id) : "/api/tasks", {
    method,
    ...(task && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(task) }),
  });
  const data = response.status === 204 ? undefined : await response.json();
  if (!response.ok) throw new Error(data?.error || "Operacja nie powiodła się.");
  return data;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    try {
      localStorage.setItem("task-manager-theme", theme);
    } catch {
      // The current page can still change theme when storage is blocked.
    }
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      <span className="theme-to-dark"><span aria-hidden="true">☾</span> Ciemny motyw</span>
      <span className="theme-to-light"><span aria-hidden="true">☀</span> Jasny motyw</span>
    </button>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState<(TaskInput & { id?: string }) | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setTasks(await request() as Task[]);
      setLoaded(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się pobrać zadań.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function open(task: TaskInput & { id?: string }) {
    setDraft(task);
    setFormError("");
  }

  async function mutate(method: string, id?: string, data?: TaskInput, isForm = false) {
    setBusy(true);
    (isForm ? setFormError : setError)("");
    try {
      const saved = await request(method, id, data) as Task | undefined;
      setTasks(previous => [
        ...previous.filter(task => task.id !== id),
        ...(saved ? [saved] : []),
      ].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
      if (isForm) setDraft(null);
    } catch (cause) {
      (isForm ? setFormError : setError)(
        cause instanceof Error ? cause.message : "Nie udało się zapisać zmian.",
      );
    } finally {
      setBusy(false);
    }
  }
