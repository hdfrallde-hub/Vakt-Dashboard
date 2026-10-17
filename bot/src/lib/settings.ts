import type { GuildSettings } from "@prisma/client";
import { prisma } from "./prisma";

// Dashboarden skriver direkt till databasen, så vi läser om var 15:e sekund.
const TTL = 15_000;
const cache = new Map<string, { at: number; data: GuildSettings }>();

export async function getSettings(guildId: string): Promise<GuildSettings> {
  const hit = cache.get(guildId);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const data = await prisma.guildSettings.upsert({
    where: { guildId },
    update: {},
    create: { guildId },
  });
  cache.set(guildId, { at: Date.now(), data });
  return data;
}
