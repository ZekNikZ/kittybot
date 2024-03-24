import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { CommandData } from "./types";
import { ADMIN_USERNAME } from "../env";
import { createSlashCommands } from ".";

const commandData: CommandData = {
  data: new SlashCommandBuilder()
    .setName("updateslashcommands")
    .setDescription("Update the slash commands of the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async handler(interaction) {
    if (interaction.user.username !== ADMIN_USERNAME) {
      await interaction.reply({ content: "Only the server admin can use this command.", ephemeral: true });
      return;
    }

    await interaction.reply({ content: "Updating slash commands...", ephemeral: true });

    createSlashCommands();

    await interaction.editReply("Updated slash commands.");
  },
};

export default commandData;
