# Vakt

Discord-bot med dashboard. Byt namn med `NEXT_PUBLIC_BOT_NAME` i `.env`.

## Kom igång
1. Skapa en applikation på https://discord.com/developers/applications
   - Bot: aktivera **Server Members Intent** och **Message Content Intent**
   - OAuth2: lägg till redirect `http://localhost:3000/api/auth/callback/discord`
2. `cp .env.example .env` och fyll i `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
   och en `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
3. `npm install`
4. `npm run db:push`
5. I två terminaler: `npm run dev:bot` och `npm run dev:dashboard`
6. Öppna http://localhost:3000, logga in och lägg till boten på din server

## Struktur
- `prisma/schema.prisma` – delad databas (SQLite, byt till Postgres vid behov)
- `bot/` – discord.js. Ny funktion = ny fil i `src/commands` eller `src/events`, laddas automatiskt
- `dashboard/` – Next.js. En sida per modul under `app/dashboard/[guildId]`
