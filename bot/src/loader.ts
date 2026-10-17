import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Client } from "discord.js";
import type { Command } from "./commands/types";
import type { BotEvent } from "./events/types";

const here = dirname(fileURLToPath(import.meta.url));
export const commands = new Map<string, Command>();

const files = (dir: string) =>
  readdirSync(join(here, dir)).filter((f) => /\.(ts|js)$/.test(f) && f !== "types.ts" && f !== "types.js");

export async function loadCommands() {
  for (const f of files("commands")) {
    const mod = await import(pathToFileURL(join(here, "commands", f)).href);
    const cmd: Command = mod.default;
    commands.set(cmd.data.name, cmd);
  }
}

export const commandJson = () => [...commands.values()].map((c) => c.data.toJSON());

export async function loadEvents(client: Client) {
  for (const f of files("events")) {
    const mod = await import(pathToFileURL(join(here, "events", f)).href);
    const list: BotEvent[] = Array.isArray(mod.default) ? mod.default : [mod.default];
    for (const e of list) {
      const run = (...args: unknown[]) =>
        Promise.resolve(e.execute(...args)).catch((err) => console.error(`Fel i event ${e.name}:`, err));
      if (e.once) client.once(e.name, run);
      else client.on(e.name, run);
    }
  }
}
