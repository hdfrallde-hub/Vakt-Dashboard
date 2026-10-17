import type { Client } from "discord.js";
import type { BotEvent } from "./types";
import { prisma } from "../lib/prisma";
import { commandJson } from "../loader";

const event: BotEvent = {
  name: "ready",
  once: true,
  async execute(client: Client<true>) {
    await client.application.commands.set(commandJson());
    for (const g of client.guilds.cache.values()) {
      await prisma.guild.upsert({
        where: { id: g.id },
        update: { name: g.name, icon: g.icon, memberCount: g.memberCount },
        create: { id: g.id, name: g.name, icon: g.icon, memberCount: g.memberCount },
      });
    }
    console.log(`✔ Inloggad som ${client.user.tag} på ${client.guilds.cache.size} servrar`);
  },
};
export default event;
