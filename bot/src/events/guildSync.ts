import type { Guild } from "discord.js";
import type { BotEvent } from "./types";
import { prisma } from "../lib/prisma";

export const create: BotEvent = {
  name: "guildCreate",
  async execute(g: Guild) {
    await prisma.guild.upsert({
      where: { id: g.id },
      update: { name: g.name, icon: g.icon, memberCount: g.memberCount },
      create: { id: g.id, name: g.name, icon: g.icon, memberCount: g.memberCount },
    });
    await prisma.guildSettings.upsert({ where: { guildId: g.id }, update: {}, create: { guildId: g.id } });
  },
};

export const remove: BotEvent = {
  name: "guildDelete",
  async execute(g: Guild) {
    await prisma.guild.deleteMany({ where: { id: g.id } });
  },
};

export default [create, remove];
