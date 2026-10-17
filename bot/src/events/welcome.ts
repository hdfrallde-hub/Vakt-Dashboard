import type { GuildMember, PartialGuildMember } from "discord.js";
import type { BotEvent } from "./types";
import { getSettings } from "../lib/settings";

const fill = (tpl: string, m: GuildMember | PartialGuildMember) =>
  tpl
    .replaceAll("{user}", `<@${m.id}>`)
    .replaceAll("{username}", m.user?.username ?? "Någon")
    .replaceAll("{server}", m.guild.name)
    .replaceAll("{count}", String(m.guild.memberCount));

async function post(m: GuildMember | PartialGuildMember, channelId: string | null, text: string) {
  if (!channelId) return;
  const ch = m.guild.channels.cache.get(channelId);
  if (ch && ch.isTextBased() && "send" in ch) await ch.send({ content: fill(text, m), allowedMentions: { users: [m.id] } }).catch(() => {});
}

export const join: BotEvent = {
  name: "guildMemberAdd",
  async execute(m: GuildMember) {
    const s = await getSettings(m.guild.id);
    if (s.autoRoleId && !m.user.bot) await m.roles.add(s.autoRoleId).catch(() => {});
    if (s.welcomeEnabled) await post(m, s.welcomeChannelId, s.welcomeMessage);
  },
};

export const leave: BotEvent = {
  name: "guildMemberRemove",
  async execute(m: GuildMember | PartialGuildMember) {
    const s = await getSettings(m.guild.id);
    if (s.goodbyeEnabled) await post(m, s.goodbyeChannelId, s.goodbyeMessage);
  },
};

export default [join, leave];
