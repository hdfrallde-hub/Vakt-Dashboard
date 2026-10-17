import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types";
import { checkTarget, createCase, fail } from "../lib/moderation";
import { colors, formatDuration, reply } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Stäng av en medlem tillfälligt")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) => o.setName("medlem").setDescription("Medlem").setRequired(true))
    .addIntegerOption((o) =>
      o.setName("minuter").setDescription("Hur länge (1–40320)").setRequired(true).setMinValue(1).setMaxValue(40320),
    )
    .addStringOption((o) => o.setName("orsak").setDescription("Orsak").setMaxLength(500)),
  async execute(i) {
    const user = i.options.getUser("medlem", true);
    const target = await i.guild!.members.fetch(user.id).catch(() => null);
    const err = checkTarget(i, target, "moderatable");
    if (err) return i.reply(fail(err));
    const sec = i.options.getInteger("minuter", true) * 60;
    const reason = i.options.getString("orsak");
    await target!.timeout(sec * 1000, reason ?? undefined);
    const c = await createCase({ guild: i.guild!, type: "timeout", target: user, moderator: i.user, reason, durationSec: sec });
    return i.reply({
      embeds: [reply(`<@${user.id}> är avstängd i ${formatDuration(sec)}. Ärende #${c.caseNumber}.`, colors.warn)],
    });
  },
};
export default command;
