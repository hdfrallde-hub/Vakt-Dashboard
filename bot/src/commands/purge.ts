import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types";
import { fail } from "../lib/moderation";
import { colors, reply } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Radera flera meddelanden på en gång")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addIntegerOption((o) => o.setName("antal").setDescription("1–100").setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption((o) => o.setName("medlem").setDescription("Radera bara den här medlemmens meddelanden")),
  async execute(i) {
    const ch = i.channel;
    if (!ch || !("bulkDelete" in ch)) return i.reply(fail("Det går inte att rensa i den här kanalen."));
    const user = i.options.getUser("medlem");
    const n = i.options.getInteger("antal", true);
    await i.deferReply({ ephemeral: true });
    let messages = await ch.messages.fetch({ limit: user ? 100 : n });
    if (user) messages = messages.filter((m) => m.author.id === user.id);
    const deleted = await ch.bulkDelete([...messages.values()].slice(0, n), true);
    return i.editReply({ embeds: [reply(`Raderade ${deleted.size} meddelanden. Meddelanden äldre än 14 dagar hoppas över.`, colors.ok)] });
  },
};
export default command;
