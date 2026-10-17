import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types";
import { createCase, fail } from "../lib/moderation";
import { colors, reply } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Varna en medlem")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) => o.setName("medlem").setDescription("Vem som ska varnas").setRequired(true))
    .addStringOption((o) => o.setName("orsak").setDescription("Orsak").setMaxLength(500)),
  async execute(i) {
    const user = i.options.getUser("medlem", true);
    if (user.bot) return i.reply(fail("Botar kan inte varnas."));
    const reason = i.options.getString("orsak");
    const c = await createCase({ guild: i.guild!, type: "warn", target: user, moderator: i.user, reason });
    await user
      .send({ embeds: [reply(`Du har fått en varning i **${i.guild!.name}**.\n**Orsak:** ${reason ?? "Ingen orsak angiven"}`, colors.warn)] })
      .catch(() => {});
    return i.reply({ embeds: [reply(`<@${user.id}> har varnats. Ärende #${c.caseNumber}.`, colors.warn)] });
  },
};
export default command;
