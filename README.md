# Task Manager · AltF4 Masters

Tablica zespołu z trzema statusami: Do zrobienia, W trakcie i Zakończone. Zadania mają tytuł, opis i termin. Można je dodawać, edytować, usuwać i filtrować według statusu. Frontend i API działają w Next.js z TypeScriptem, interfejs używa Tailwind CSS, a zadania są przechowywane w Neon PostgreSQL.

## Baza Neon

1. W [Neon Console](https://console.neon.tech/) utwórz projekt.
2. W **SQL Editor** wybierz jego bazę, wklej zawartość `schema.sql` i kliknij **Run**.
3. W panelu projektu wybierz **Connect** i skopiuj ciąg połączenia PostgreSQL dla tej samej bazy. Użyj go jako wartości `DATABASE_URL`. Nie dodawaj go do repozytorium.

## GitHub i Vercel bez terminala

1. Rozpakuj ZIP. Utwórz repozytorium na [GitHubie](https://github.com/new). W GitHub Desktop wybierz **File → Clone repository** i wybierz swoje repozytorium. Skopiuj do niego **zawartość** rozpakowanego folderu `task-manager`, łącznie z `.gitignore` i `.env.example`. W GitHub Desktop zrób **Commit** i **Push origin**.
2. W [Vercel](https://vercel.com/new) wybierz **Add New → Project** z panelu lub od razu **Import** przy repozytorium. Jeśli repozytorium się nie wyświetla, połącz konto GitHub i nadaj integracji dostęp do repozytorium.
3. Ustaw preset **Next.js**. W **Environment Variables** dodaj `DATABASE_URL` z Neon do środowiska **Production** i kliknij **Deploy**.
4. Otwórz adres wdrożenia. Dodaj zadanie testowe, odśwież stronę, zmień status, edytuj zadanie i je usuń. Sprawdź też widok na telefonie. Do oddania wyślij link wdrożenia i link do repozytorium. Jeśli repozytorium jest prywatne, nadaj prowadzącemu dostęp.
5. To wspólna tablica demonstracyjna bez logowania w aplikacji. Każdy użytkownik z dostępem do wdrożenia może edytować zadania.

## Uruchomienie lokalne

Wymagany Node.js 24. W folderze z `package.json` utwórz plik `.env.local` według `.env.example` i uzupełnij `DATABASE_URL`.

```sh
npm ci
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000). Kompilację produkcyjną sprawdzisz przez `npm run build`.

## Kod

- `app/page.tsx` – tablica, formularz i filtrowanie.
- `app/api/tasks/route.ts` – pobieranie, dodawanie, edycja i usuwanie zadań.
- `lib/tasks.ts` – typy, statusy i walidacja.
- `schema.sql` – tabela zadań.
