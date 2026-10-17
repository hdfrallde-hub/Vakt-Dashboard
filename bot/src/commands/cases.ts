import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types";
import { prisma } from "../lib/prisma";
import { colors, formatDuration, typeMeta } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ärenden")
    .setDescription("Visa moderationshistorik för en medlem")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((o) => o.setName("medlem").setDescription("Medlem").setRequired(true)),
  async execute(i) {
    const user = i.options.getUser("medlem", true);
    const cases = await prisma.modCase.findMany({
      where: { guildId: i.guildId!, userId: user.id },
      orderBy: { caseNumber: "desc" },
      take: 10,
    });
    const embed = new EmbedBuilder().setColor(colors.brand).setTitle(`Ärenden för ${user.username}`);
    embed.setDescription(
      cases.length
        ? cases
            .map((c) => {
              const dur = c.durationSec ? ` (${formatDuration(c.durationSec)})` : "";
              return `**#${c.caseNumber} ${typeMeta[c.type]?.label ?? c.type}${dur}** · <t:${Math.floor(c.createdAt.getTime() / 1000)}:d>\n${c.reason ?? "Ingen orsak angiven"}`;
            })
            .join("\n\n")
        : "Inga ärenden. Ren historik.",
    );
    return i.reply({ embeds: [embed], ephemeral: true });
  },
};
export default command;
