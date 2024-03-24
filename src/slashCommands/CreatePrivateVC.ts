import { ChannelType, SlashCommandBuilder } from "discord.js";
import { CommandData } from "./types";
import { startTrackingVoiceChannel } from "../utils/voiceChannelRemoval";
import { GameChannel } from "../db/GameChannel";
import { CachedVoiceChannel } from "../db/CachedVoiceChannel";

const commandData: CommandData = {
  data: new SlashCommandBuilder()
    .setName("createprivatevc")
    .setDescription("Creates a new private voice channel")
    .setDefaultMemberPermissions("0")
    .setDMPermission(false),
  handler: async (interaction) => {
    const guildId = interaction.guildId;
    if (!guildId) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const parentChannelId = (await GameChannel.findOne({ where: { guildId, gameName: "private" } }))?.channelId;
    if (!parentChannelId) {
      await interaction.editReply("Private channels are not configured on this server. Contact the server admins.");
      return;
    }

    const existingChannel = await CachedVoiceChannel.findOne({
      where: { guildId, channelTag: interaction.user.username },
    });
    if (existingChannel) {
      await interaction.editReply(`You already have a private channel! Here it is: <#${existingChannel.channelId}>`);
      return;
    }

    const newVoiceChannel = await interaction.guild?.channels.create({
      name: `Private: @${interaction.user.displayName}`,
      type: ChannelType.GuildVoice,
      parent: parentChannelId,
    });

    if (newVoiceChannel) {
      await interaction.editReply({
        content: `Created a voice channel for you: <#${newVoiceChannel.id}>`,
      });

      startTrackingVoiceChannel(interaction.client, guildId, newVoiceChannel.id, "private", interaction.user.username);
    }
  },
};

export default commandData;
