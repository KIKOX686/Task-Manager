export const statuses = {
  todo: "Do zrobienia",
  doing: "W trakcie",
  done: "Zakończone",
} as const;

export type Status = keyof typeof statuses;
export type TaskInput = {
  title: string;
  description: string;
  dueDate: string;
  status: Status;
};
export type Task = TaskInput & { id: string };

export function parseTask(value: unknown): TaskInput | null {
  if (!value || typeof value !== "object") return null;
  const { title, description, dueDate, status } = value as Record<string, unknown>;
  if (typeof title !== "string" || !title.trim() || title.trim().length > 120 ||
      typeof description !== "string" || description.length > 2000 ||
      typeof status !== "string" || !Object.hasOwn(statuses, status) ||
      typeof dueDate !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dueDate) ||
      dueDate.startsWith("0000-")) return null;

  const date = new Date(dueDate + "T00:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dueDate) return null;

  return { title: title.trim(), description: description.trim(), dueDate, status: status as Status };
}
