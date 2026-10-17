import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { Client, GatewayIntentBits, Partials } from "discord.js";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

import { loadCommands, loadEvents } from "./loader";

if (!process.env.DISCORD_TOKEN) {
  console.error("DISCORD_TOKEN saknas i .env");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.GuildMember],
});

await loadCommands();
await loadEvents(client);
await client.login(process.env.DISCORD_TOKEN);
