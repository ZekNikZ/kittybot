import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";

export interface CommandData {
  data: SlashCommandBuilder;
  handler(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction<CacheType>): Promise<void>;
}
