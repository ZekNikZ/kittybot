import { Client, REST, Routes, Snowflake } from "discord.js";
import { CLIENT_ID, TOKEN } from "./env.ts";
import path from "path";
import fs from "fs/promises";
import { CommandData } from "./slashCommands/types.ts";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const folderPath = path.join(__dirname, "slashCommands");
const commandFiles = await fs.readdir(folderPath);
const commands: CommandData[] = [];
for (const file of commandFiles) {
  if (file.endsWith(".js") || file.endsWith(".ts")) {
    const filePath = path.join(folderPath, file);
    const relativePath = path.relative(__dirname, filePath);
    const { default: commandData } = await import("./" + relativePath.replace(/\\/g, "/"));
    if (commandData && "data" in commandData && "handler" in commandData) {
      console.info(`Found slash command at ${filePath}`);
      commands.push(commandData);
    } else {
      console.warn(`The command at ${filePath} is missing a required "data" or "handler" property`);
    }
  }
}

export async function createSlashCommands(guildId?: Snowflake) {
  const rest = new REST().setToken(TOKEN);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const body = commands.map((command) => command.data.toJSON());

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
      const command = commands.filter((c) => c.data.name === interaction.commandName)[0];

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
      const command = commands.filter((c) => c.data.name === interaction.commandName)[0];

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
