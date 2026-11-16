# Task Manager · AltF4 Masters

Responsywna aplikacja zespołowa do zarządzania zadaniami. Umożliwia ich dodawanie, edycję, usuwanie i filtrowanie. Każde zadanie ma tytuł, opis, termin oraz jeden z trzech statusów: **Do zrobienia**, **W trakcie** lub **Zakończone**. Interfejs ma jasny i ciemny motyw.

**Technologie:** Next.js, TypeScript, Tailwind CSS i Neon PostgreSQL.

## Uruchomienie lokalne

1. Sklonuj lub pobierz repozytorium. Zainstaluj **Node.js 24 LTS**.
2. Utwórz bazę w Neon i uruchom zawartość pliku `schema.sql` w **SQL Editor**.
3. W folderze z `package.json` utwórz plik `.env.local`. Wpisz `DATABASE_URL=`, a po znaku `=` wklej adres połączenia z bazy Neon. Zachowaj ten plik lokalnie.
4. Otwórz terminal w folderze projektu i uruchom:

   ```bash
   npm ci
   npm run dev
   ```

   Jeśli Windows PowerShell blokuje `npm.ps1`, użyj `npm.cmd ci` i `npm.cmd run dev`.

5. Otwórz adres z wiersza **Local** w terminalu, zwykle [http://localhost:3000](http://localhost:3000).
