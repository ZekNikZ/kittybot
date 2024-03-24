import { SlashCommandBuilder, Interaction, CacheType } from "discord.js";

export interface CommandData {
  data: SlashCommandBuilder;
  handler(interaction: Interaction<CacheType>): Promise<void>;
}
