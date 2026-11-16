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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || busy) return;
    void mutate(draft.id ? "PATCH" : "POST", draft.id, draft, true);
  }

  const visibleColumns = filter === "all" ? columns : [filter];

  return (
    <>
      <header className="border-b border-white/10 bg-[#151923]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 sm:px-8">
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-violet-300 text-lg font-bold text-[#22173b]">✓</span>
          <span className="text-sm font-semibold tracking-wide">AltF4 Masters</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm text-violet-300">Tablica zespołu</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Task Manager</h1>
          </div>
          <button className={primary} disabled={!loaded || busy || loading} onClick={() => open(emptyTask)}>＋ Dodaj zadanie</button>
        </div>
        <div className="my-6 flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-4">
          <span className="text-sm text-slate-300">{loaded ? `Ukończone: ${tasks.filter(task => task.status === "done").length} / ${tasks.length}` : "Zadania zespołu"}</span>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            Status
            <select className={field} value={filter} onChange={event => setFilter(event.target.value as Status | "all")}>
              <option value="all">Wszystkie</option>
              {columns.map(status => <option key={status} value={status}>{statuses[status]}</option>)}
            </select>
          </label>
        </div>
        {error && <div role="alert" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
          {error}
          <button className={secondary} disabled={loading || busy} onClick={load}>Odśwież listę</button>
        </div>}
        {loading && <p role="status" className="text-sm text-slate-300">Ładowanie zadań…</p>}
        {loaded && <div className={filter === "all" ? "grid gap-4 lg:grid-cols-3" : "grid max-w-xl gap-4"}>
          {visibleColumns.map(status => {
            const group = tasks.filter(task => task.status === status);
            return <section key={status} className="min-w-0 rounded-2xl border border-white/10 bg-[#171b25] p-4">
              <div className="mb-4 flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${dots[status]}`} />
                <h2 className="text-sm font-semibold">{statuses[status]}</h2>
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{group.length}</span>
              </div>
              {group.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-slate-400">Brak zadań w tej kolumnie.</p>}
              <ul className="space-y-3">
                {group.map(task => <li key={task.id} className="rounded-xl border border-white/10 bg-[#202534] p-4">
                  <h3 className="break-words font-semibold">{task.title}</h3>
                  {task.description && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-300">{task.description}</p>}
                  <p className="my-3 text-xs text-slate-300">Termin <time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></p>
                  <select aria-label={`Status zadania: ${task.title}`} className={field} disabled={busy || loading || !!draft}
                    value={task.status} onChange={event => void mutate("PATCH", task.id, { ...task, status: event.target.value as Status })}>
                    {columns.map(option => <option key={option} value={option}>{statuses[option]}</option>)}
                  </select>
                  <div className="mt-3 flex gap-2">
                    <button className={secondary} disabled={busy || loading} onClick={() => open(task)}>Edytuj</button>
                    <button className={secondary + " text-rose-300"} disabled={busy || loading} onClick={() => {
                      if (window.confirm(`Usunąć zadanie „${task.title}”?`)) void mutate("DELETE", task.id);
                    }}>Usuń</button>
                  </div>
                </li>)}
              </ul>
            </section>;
          })}
        </div>}
      </main>
      {draft && <dialog ref={element => { if (element && !element.open) element.showModal(); }}
        aria-labelledby="form-title" onCancel={event => { event.preventDefault(); if (!busy) setDraft(null); }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-[#353b4c] bg-[#202534] p-5 text-slate-100 backdrop:bg-black/65 sm:p-7">
        <form onSubmit={submit} className="space-y-4">
          <h2 id="form-title" className="text-xl font-semibold">{draft.id ? "Edytuj zadanie" : "Nowe zadanie"}</h2>
          <label className="block space-y-1 text-sm">Tytuł
            <input className={field} required maxLength={120} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} />
          </label>
          <label className="block space-y-1 text-sm">Opis
            <textarea className={field} rows={4} maxLength={2000} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">Termin
              <input className={field} type="date" required max="9999-12-31" value={draft.dueDate} onChange={event => setDraft({ ...draft, dueDate: event.target.value })} />
            </label>
            <label className="block space-y-1 text-sm">Status
              <select className={field} value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as Status })}>
                {columns.map(status => <option key={status} value={status}>{statuses[status]}</option>)}
              </select>
            </label>
          </div>
          {formError && <p role="alert" className="text-sm text-rose-300">{formError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className={secondary} disabled={busy} onClick={() => setDraft(null)}>Anuluj</button>
            <button className={primary} disabled={busy}>{busy ? "Zapisywanie…" : "Zapisz zadanie"}</button>
          </div>
        </form>
      </dialog>}
    </>
  );
}
