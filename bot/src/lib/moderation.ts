import {
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type Guild,
  type GuildMember,
  type User,
} from "discord.js";
import { prisma } from "./prisma";
import { getSettings } from "./settings";
import { colors, formatDuration, reply, typeMeta } from "./embeds";

export async function sendLog(guild: Guild, embed: EmbedBuilder) {
  const s = await getSettings(guild.id);
  if (!s.logChannelId) return;
  const ch = guild.channels.cache.get(s.logChannelId);
  if (ch && ch.isTextBased() && "send" in ch) await ch.send({ embeds: [embed] }).catch(() => {});
}

export async function createCase(opts: {
  guild: Guild;
  type: string;
  target: User;
  moderator: User;
  reason?: string | null;
  durationSec?: number | null;
}) {
  const { guild, type, target, moderator } = opts;
  const last = await prisma.modCase.findFirst({
    where: { guildId: guild.id },
    orderBy: { caseNumber: "desc" },
    select: { caseNumber: true },
  });
  const c = await prisma.modCase.create({
    data: {
      guildId: guild.id,
      caseNumber: (last?.caseNumber ?? 0) + 1,
      type,
      userId: target.id,
      userTag: target.username,
      moderatorId: moderator.id,
      moderatorTag: moderator.username,
      reason: opts.reason ?? null,
      durationSec: opts.durationSec ?? null,
    },
  });

  const meta = typeMeta[type] ?? { label: type, color: colors.brand };
  const embed = new EmbedBuilder()
    .setColor(meta.color)
    .setTitle(`${meta.label} · ärende #${c.caseNumber}`)
    .addFields(
      { name: "Medlem", value: `<@${target.id}> (${target.username})`, inline: true },
      { name: "Moderator", value: `<@${moderator.id}>`, inline: true },
    )
    .setTimestamp();
  if (opts.durationSec) embed.addFields({ name: "Längd", value: formatDuration(opts.durationSec), inline: true });
  embed.addFields({ name: "Orsak", value: opts.reason || "Ingen orsak angiven" });
  await sendLog(guild, embed);
  return c;
}

/** Kontrollerar rollhierarki och att boten kan agera. Returnerar felmeddelande eller null. */
export function checkTarget(
  i: ChatInputCommandInteraction,
  target: GuildMember | null,
  can: "kickable" | "bannable" | "moderatable",
): string | null {
  if (!target) return "Medlemmen finns inte på servern.";
  if (target.id === i.user.id) return "Du kan inte göra det mot dig själv.";
  if (target.id === i.guild!.ownerId) return "Du kan inte göra det mot serverägaren.";
  const mod = i.member as GuildMember;
  if (i.guild!.ownerId !== mod.id && target.roles.highest.position >= mod.roles.highest.position)
    return "Medlemmens högsta roll är lika hög som eller högre än din.";
  if (!target[can]) return "Jag har inte behörighet att göra det mot den medlemmen. Flytta min roll högre upp.";
  return null;
}

export const fail = (msg: string) => ({ embeds: [reply(msg, colors.danger)], ephemeral: true as const });
