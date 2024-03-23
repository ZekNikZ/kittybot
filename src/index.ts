import dotenv from "dotenv";
dotenv.config();
const TOKEN = process.env.TOKEN;

import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("messageCreate", async (msg) => {
  msg.reply("Hello!!!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(TOKEN);

export {};
