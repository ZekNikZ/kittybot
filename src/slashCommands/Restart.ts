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
      await interaction.reply("Only the server admin can use this command.");
      return;
    }

    await interaction.reply("Restarting...");

    interaction.client.destroy();
  },
};

export default commandData;
