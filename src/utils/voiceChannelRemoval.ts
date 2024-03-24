import { Client, Snowflake } from "discord.js";
import { CachedVoiceChannel } from "../db/CachedVoiceChannel";

const CHANNEL_TIMEOUT_SECONDS = 10;
const INITIAL_CHANNEL_TIMEOUT_SECONDS = 60;

const timeouts = new Map<string, NodeJS.Timeout>();

export async function syncCachedVoiceChannels(client: Client) {
  await deleteAllInactive(client);

  client.on("voiceStateUpdate", (oldState) => {
    if (oldState.channelId) {
      trackVCInteraction(oldState.client, oldState.guild.id, oldState.channelId);
    }
  });
}

export async function deleteAllInactive(client: Client) {
  const channels = await CachedVoiceChannel.findAll();

  for (const cachedChannel of channels) {
    cachedChannel.destroy();

    try {
      const channel = await client.channels.fetch(cachedChannel.channelId).catch(console.error);
      if (!channel?.isVoiceBased()) {
        continue;
      }
      if (channel.members.size > 0) {
        continue;
      }

      await channel?.delete();
    } catch (err) {
      console.warn(`Could not delete channel ${cachedChannel.guildId}/${cachedChannel.channelId}`);
    }
  }
}

export async function startTrackingVoiceChannel(
  client: Client,
  guildId: Snowflake,
  channelId: Snowflake,
  gameName: string,
  channelTag: string
) {
  // Start tracking the channel
  const timestamp = Date.now();
  await CachedVoiceChannel.create({
    guildId,
    channelId,
    gameName,
    timestamp,
    channelTag,
  });

  // Remove after INITIAL_CHANNEL_TIMEOUT_SECONDS seconds
  trackVCInteraction(client, guildId, channelId, INITIAL_CHANNEL_TIMEOUT_SECONDS);
}

export async function trackVCInteraction(
  client: Client,
  guildId: Snowflake,
  channelId: Snowflake,
  deadChannelTimeout: number = CHANNEL_TIMEOUT_SECONDS
) {
  const timestamp = Date.now();

  // Check if this channel is tracked
  const cachedChannel = await CachedVoiceChannel.findOne({
    where: { guildId, channelId },
  });
  if (!cachedChannel) {
    return;
  }

  // Update tracking timestamp
  cachedChannel.timestamp = timestamp;
  cachedChannel.save();

  // Clear existing timer, if applicable
  if (timeouts.has(channelId)) {
    clearTimeout(timeouts.get(channelId));
    timeouts.delete(channelId);
  }

  // Check if channel is now empty
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isVoiceBased()) {
    return;
  }
  if (channel.members.size > 0) {
    return;
  }

  // Delete the channel if still empty after the timer
  const timeout = setTimeout(async () => {
    // Get the channel
    const channel = await client.channels.fetch(channelId);

    // Ensure channel is empty
    if (!channel?.isVoiceBased()) {
      return;
    }
    if (channel.members.size > 0) {
      return;
    }

    // Delete the channel
    await channel?.delete();

    // Stop tracking the channel
    await CachedVoiceChannel.destroy({ where: { guildId, channelId } });
  }, deadChannelTimeout * 1000);

  // Keep track of the timeout
  timeouts.set(channelId, timeout);
}
