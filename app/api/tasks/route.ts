import { neon } from "@neondatabase/serverless";
import { parseTask } from "../../../lib/tasks";

export const dynamic = "force-dynamic";

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  return neon(url);
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function withDatabase(action: (sql: ReturnType<typeof database>) => Promise<Response>) {
  try {
    return await action(database());
  } catch (cause) {
    console.error("Task database request failed", cause instanceof Error ? cause.name : "UnknownError");
    return error("Nie udało się połączyć z bazą lub zapisać zmian. Spróbuj ponownie.", 503);
  }
}

function taskId(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  return id && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id) ? id : null;
}

export async function GET() {
  return withDatabase(async sql => {
    const tasks = await sql`
      SELECT id, title, description, to_char(due_date, 'YYYY-MM-DD') AS "dueDate", status
      FROM tasks ORDER BY due_date, created_at, id
    `;
    return Response.json(tasks);
  });
}

export async function POST(request: Request) {
  const task = parseTask(await request.json().catch(() => null));
  if (!task) return error("Sprawdź tytuł, opis, status i termin.", 400);

  return withDatabase(async sql => {
    const [created] = await sql`
      INSERT INTO tasks (title, description, due_date, status)
      VALUES (${task.title}, ${task.description}, ${task.dueDate}::date, ${task.status})
      RETURNING id, title, description, to_char(due_date, 'YYYY-MM-DD') AS "dueDate", status
    `;
    return Response.json(created, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  const id = taskId(request);
  const task = parseTask(await request.json().catch(() => null));
  if (!id || !task) return error("Sprawdź dane zadania.", 400);

  return withDatabase(async sql => {
    const [updated] = await sql`
      UPDATE tasks SET title = ${task.title}, description = ${task.description},
        due_date = ${task.dueDate}::date, status = ${task.status}
      WHERE id = ${id}::uuid
      RETURNING id, title, description, to_char(due_date, 'YYYY-MM-DD') AS "dueDate", status
    `;
    return updated ? Response.json(updated) : error("Zadanie już nie istnieje.", 404);
  });
}

export async function DELETE(request: Request) {
  const id = taskId(request);
  if (!id) return error("Nieprawidłowy identyfikator zadania.", 400);

  return withDatabase(async sql => {
    const [deleted] = await sql`DELETE FROM tasks WHERE id = ${id}::uuid RETURNING id`;
    return deleted ? new Response(null, { status: 204 }) : error("Zadanie już nie istnieje.", 404);
  });
}
