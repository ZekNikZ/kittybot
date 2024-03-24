import { ChannelType, SlashCommandBuilder, TextChannel } from "discord.js";
import { CommandData } from "./types.ts";
import { startTrackingVoiceChannel } from "../utils/voiceChannelRemoval.ts";

const commandData: CommandData = {
  data: new SlashCommandBuilder().setName("createvc").setDescription("Creates a new voice channel for the game"),
  handler: async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (!interaction.guildId) {
      return;
    }

    const fromChannel = interaction.channel;
    if (!(fromChannel instanceof TextChannel)) {
      return;
    }

    const newVoiceChannel = await interaction.guild?.channels.create({
      name: `VC for #${fromChannel.name}`,
      type: ChannelType.GuildVoice,
      parent: fromChannel.parent,
    });

    if (newVoiceChannel) {
      if (interaction.isRepliable()) {
        interaction.reply({ content: `Created a voice channel for you: <#${newVoiceChannel.id}>`, ephemeral: true });
      }

      startTrackingVoiceChannel(interaction.client, interaction.guildId, newVoiceChannel.id, fromChannel.name);
    }
  },
};

export default commandData;
