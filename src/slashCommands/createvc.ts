import { ChannelType, SlashCommandBuilder } from "discord.js";
import { CommandData } from "./types.ts";
import { startTrackingVoiceChannel } from "../utils/voiceChannelRemoval.ts";
import { GameChannel } from "../db/GameChannel.ts";
import { CachedVoiceChannel } from "../db/CachedVoiceChannel.ts";

async function getChannelTag(guildId: string, gameChannel: GameChannel): Promise<string> {
  // Get available choices
  const choices = gameChannel.channelNameOptions?.split(",") ?? [];
  const usedChoices = (await CachedVoiceChannel.findAll({ where: { guildId, gameName: gameChannel.gameName } })).map(
    (gc) => gc.channelTag
  );
  const availableChoices = choices.filter((x) => !usedChoices.includes(x));

  // Pick an available choice, if possible
  if (availableChoices.length > 0) {
    return availableChoices[Math.floor(Math.random() * availableChoices.length)];
  }

  // Otherwise, pick a number
  const usedNumbers = new Set(usedChoices.map((choice) => parseInt(choice)).filter((choice) => isFinite(choice)));
  for (let i = 1; ; ++i) {
    if (!usedNumbers.has(i)) {
      return `${i}`;
    }
  }
}

const commandData: CommandData = {
  data: new SlashCommandBuilder()
    .setName("createvc")
    .setDescription("Creates a new voice channel for the game")
    .setDefaultMemberPermissions("0")
    .setDMPermission(false),
  handler: async (interaction) => {
    const guildId = interaction.guildId;
    if (!guildId) {
      return;
    }

    const fromChannel = interaction.channel;
    if (fromChannel?.type !== ChannelType.GuildText) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const gameChannel = await GameChannel.findOne({
      where: {
        guildId,
        channelId: fromChannel.id,
      },
    });
    if (!gameChannel) {
      await interaction.editReply("You can't use this command here. Go to a game channel instead!");
      return;
    }

    const channelTag = await getChannelTag(guildId, gameChannel);

    const newVoiceChannel = await interaction.guild?.channels.create({
      name: `${gameChannel.gameName} ${channelTag}`,
      type: ChannelType.GuildVoice,
      parent: fromChannel.parent,
    });

    if (newVoiceChannel) {
      await interaction.editReply({
        content: `Created a voice channel for you: <#${newVoiceChannel.id}>`,
      });

      startTrackingVoiceChannel(interaction.client, guildId, newVoiceChannel.id, gameChannel.gameName, channelTag);
    }
  },
};

export default commandData;
