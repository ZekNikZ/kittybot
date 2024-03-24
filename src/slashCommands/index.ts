import { Client, REST, Routes, Snowflake } from "discord.js";
import { CLIENT_ID, TOKEN } from "../env";
import { CommandData } from "./types";
import CreateVCCommand from "./CreateVC";
import CreatePrivateVCCommand from "./CreatePrivateVC";
import GameChannelCommand from "./GameChannel";
import RestartCommand from "./Restart";
import { resolve } from "path";
import { fileURLToPath } from "url";

const COMMANDS: CommandData[] = [CreateVCCommand, CreatePrivateVCCommand, GameChannelCommand, RestartCommand];

export async function createSlashCommands(guildId?: Snowflake) {
  const rest = new REST().setToken(TOKEN);

  try {
    console.log(`Started refreshing ${COMMANDS.length} application (/) commands.`);

    const body = COMMANDS.map((command) => command.data.toJSON());

    let data;
    if (guildId) {
      // The put method is used to fully refresh all commands in the guild with the current set
      data = (await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body })) as unknown[];
    } else {
      data = (await rest.put(Routes.applicationCommands(CLIENT_ID), { body })) as unknown[];
    }

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}

export function registerSlashCommandHandler(client: Client) {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = COMMANDS.filter((c) => c.data.name === interaction.commandName)[0];

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.handler(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
        } else {
          await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
      }
    } else if (interaction.isAutocomplete()) {
      const command = COMMANDS.filter((c) => c.data.name === interaction.commandName)[0];

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.autocomplete?.(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

const pathToThisFile = resolve(fileURLToPath(import.meta.url));
const pathPassedToNode = resolve(process.argv[1]);
const isThisFileBeingRunViaCLI = pathToThisFile.includes(pathPassedToNode);
if (isThisFileBeingRunViaCLI) {
  createSlashCommands();
}
