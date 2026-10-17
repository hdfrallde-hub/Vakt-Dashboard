import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types";
import { checkTarget, createCase, fail } from "../lib/moderation";
import { colors, reply } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Sparka en medlem från servern")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((o) => o.setName("medlem").setDescription("Vem som ska sparkas").setRequired(true))
    .addStringOption((o) => o.setName("orsak").setDescription("Orsak").setMaxLength(500)),
  async execute(i) {
    const user = i.options.getUser("medlem", true);
    const target = await i.guild!.members.fetch(user.id).catch(() => null);
    const err = checkTarget(i, target, "kickable");
    if (err) return i.reply(fail(err));
    const reason = i.options.getString("orsak");
    await user
      .send({ embeds: [reply(`Du har sparkats från **${i.guild!.name}**.\n**Orsak:** ${reason ?? "Ingen orsak angiven"}`, colors.danger)] })
      .catch(() => {});
    await target!.kick(reason ?? undefined);
    const c = await createCase({ guild: i.guild!, type: "kick", target: user, moderator: i.user, reason });
    return i.reply({ embeds: [reply(`<@${user.id}> har sparkats. Ärende #${c.caseNumber}.`, colors.warn)] });
  },
};
export default command;
