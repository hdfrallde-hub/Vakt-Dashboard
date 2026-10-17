import { EmbedBuilder } from "discord.js";

export const colors = {
  brand: 0x7c6cff,
  ok: 0x3ddbb0,
  warn: 0xffb454,
  danger: 0xff6b7a,
  muted: 0x2e2a55,
} as const;

export const reply = (description: string, color: number = colors.brand) =>
  new EmbedBuilder().setColor(color).setDescription(description);

export const typeMeta: Record<string, { label: string; color: number }> = {
  warn: { label: "Varning", color: colors.warn },
  kick: { label: "Kick", color: colors.warn },
  ban: { label: "Ban", color: colors.danger },
  timeout: { label: "Timeout", color: colors.warn },
  automod: { label: "Automod", color: colors.brand },
};

export function formatDuration(sec: number) {
  if (sec % 86400 === 0) return `${sec / 86400} d`;
  if (sec % 3600 === 0) return `${sec / 3600} h`;
  if (sec % 60 === 0) return `${sec / 60} min`;
  return `${sec} s`;
}
