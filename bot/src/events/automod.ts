import { PermissionFlagsBits, type Message } from "discord.js";
import type { BotEvent } from "./types";
import { getSettings } from "../lib/settings";
import { createCase } from "../lib/moderation";

const recent = new Map<string, number[]>();
const LINK = /(https?:\/\/|discord\.gg\/|www\.)\S+/i;

const event: BotEvent = {
  name: "messageCreate",
  async execute(msg: Message) {
    if (!msg.inGuild() || msg.author.bot || !msg.member) return;
    if (msg.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const s = await getSettings(msg.guildId);
    let reason: string | null = null;

    if (s.automodSpam) {
      const key = `${msg.guildId}:${msg.author.id}`;
      const now = Date.now();
      const list = (recent.get(key) ?? []).filter((t) => now - t < s.spamIntervalSec * 1000);
      list.push(now);
      recent.set(key, list);
      if (list.length >= s.spamMaxMessages) {
        reason = "Spam";
        recent.delete(key);
      }
    }
    if (!reason && s.automodLinks && LINK.test(msg.content)) reason = "Otillåten länk";
    if (!reason && s.automodWords && s.bannedWords) {
      const lower = msg.content.toLowerCase();
      const words = s.bannedWords.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
      if (words.some((w) => lower.includes(w))) reason = "Förbjudet ord";
    }
    if (!reason) return;

    await msg.delete().catch(() => {});
    const timeoutSec = s.automodAction === "timeout" ? 300 : null;
    if (timeoutSec) await msg.member.timeout(timeoutSec * 1000, `Automod: ${reason}`).catch(() => {});
    await createCase({
      guild: msg.guild,
      type: "automod",
      target: msg.author,
      moderator: msg.client.user,
      reason,
      durationSec: timeoutSec,
    });
    const note = await msg.channel.send(`<@${msg.author.id}>, ${reason.toLowerCase()} är inte tillåtet här.`).catch(() => null);
    if (note) setTimeout(() => note.delete().catch(() => {}), 5000);
  },
};
export default event;
