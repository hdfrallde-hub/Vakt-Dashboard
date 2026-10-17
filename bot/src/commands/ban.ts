import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types";
import { checkTarget, createCase, fail } from "../lib/moderation";
import { colors, reply } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banna en medlem")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((o) => o.setName("medlem").setDescription("Vem som ska bannas").setRequired(true))
    .addStringOption((o) => o.setName("orsak").setDescription("Orsak").setMaxLength(500))
    .addIntegerOption((o) =>
      o.setName("radera_dagar").setDescription("Radera medlemmens meddelanden från de senaste dagarna").setMinValue(0).setMaxValue(7),
    ),
  async execute(i) {
    const user = i.options.getUser("medlem", true);
    const target = await i.guild!.members.fetch(user.id).catch(() => null);
    if (target) {
      const err = checkTarget(i, target, "bannable");
      if (err) return i.reply(fail(err));
    }
    const reason = i.options.getString("orsak");
    await user
      .send({ embeds: [reply(`Du har bannats från **${i.guild!.name}**.\n**Orsak:** ${reason ?? "Ingen orsak angiven"}`, colors.danger)] })
      .catch(() => {});
    await i.guild!.members.ban(user, {
      reason: reason ?? undefined,
      deleteMessageSeconds: (i.options.getInteger("radera_dagar") ?? 0) * 86400,
    });
    const c = await createCase({ guild: i.guild!, type: "ban", target: user, moderator: i.user, reason });
    return i.reply({ embeds: [reply(`<@${user.id}> har bannats. Ärende #${c.caseNumber}.`, colors.danger)] });
  },
};
export default command;
