import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { CommandData } from "./types";
import { ADMIN_USERNAME } from "../env";

const commandData: CommandData = {
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart and update the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async handler(interaction) {
    if (interaction.user.username !== ADMIN_USERNAME) {
      await interaction.reply({ content: "Only the server admin can use this command.", ephemeral: true });
      return;
    }

    await interaction.reply({ content: "Restarting...", ephemeral: true });

    interaction.client.destroy();
  },
};

export default commandData;
