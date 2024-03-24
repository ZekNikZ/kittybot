import { Client, GatewayIntentBits } from "discord.js";
import { TEST_SERVER, TOKEN } from "./env";
import { createSlashCommands, registerSlashCommandHandler } from "./slashCommands";
import { syncCachedVoiceChannels } from "./utils/voiceChannelRemoval";
import { initDB } from "./db/database";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.on("ready", async () => {
  // Init DB
  await initDB();

  // Sync cached voice channels
  await syncCachedVoiceChannels(client);

  console.log(`Logged in as ${client.user?.tag}!`);
});

registerSlashCommandHandler(client);

if (TEST_SERVER) {
  await createSlashCommands(TEST_SERVER);
}

client.login(TOKEN);
