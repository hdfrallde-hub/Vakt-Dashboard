import type { Interaction } from "discord.js";
import type { BotEvent } from "./types";
import { commands } from "../loader";
import { colors, reply } from "../lib/embeds";

const event: BotEvent = {
  name: "interactionCreate",
  async execute(i: Interaction) {
    if (!i.isChatInputCommand()) return;
    const cmd = commands.get(i.commandName);
    if (!cmd) return;
    try {
      await cmd.execute(i);
    } catch (err) {
      console.error(`Fel i /${i.commandName}:`, err);
      const payload = { embeds: [reply("Något gick fel. Försök igen om en stund.", colors.danger)], ephemeral: true };
      if (i.deferred || i.replied) await i.followUp(payload).catch(() => {});
      else await i.reply(payload).catch(() => {});
    }
  },
};
export default event;
