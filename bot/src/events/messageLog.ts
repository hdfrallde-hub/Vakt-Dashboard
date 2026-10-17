import { EmbedBuilder, type Message, type PartialMessage } from "discord.js";
import type { BotEvent } from "./types";
import { sendLog } from "../lib/moderation";
import { colors } from "../lib/embeds";

export const del: BotEvent = {
  name: "messageDelete",
  async execute(msg: Message | PartialMessage) {
    if (!msg.inGuild() || msg.author?.bot || !msg.content) return;
    await sendLog(
      msg.guild,
      new EmbedBuilder()
        .setColor(colors.muted)
        .setTitle("Meddelande raderat")
        .setDescription(msg.content.slice(0, 1500))
        .addFields(
          { name: "Av", value: `<@${msg.author?.id}>`, inline: true },
          { name: "Kanal", value: `<#${msg.channelId}>`, inline: true },
        )
        .setTimestamp(),
    );
  },
};

export const edit: BotEvent = {
  name: "messageUpdate",
  async execute(before: Message | PartialMessage, after: Message | PartialMessage) {
    if (!after.inGuild() || after.author?.bot || !before.content || before.content === after.content) return;
    await sendLog(
      after.guild,
      new EmbedBuilder()
        .setColor(colors.muted)
        .setTitle("Meddelande ändrat")
        .addFields(
          { name: "Före", value: before.content.slice(0, 1000) },
          { name: "Efter", value: (after.content ?? "").slice(0, 1000) || "–" },
          { name: "Av", value: `<@${after.author?.id}>`, inline: true },
          { name: "Kanal", value: `<#${after.channelId}>`, inline: true },
        )
        .setTimestamp(),
    );
  },
};

export default [del, edit];
