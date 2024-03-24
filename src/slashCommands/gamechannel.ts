import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { CommandData } from "./types.ts";
import { GameChannel } from "../db/GameChannel.ts";
import { Op } from "sequelize";

const commandData: CommandData = {
  data: new SlashCommandBuilder()
    .setName("gamechannel")
    .setDescription("Administrate game channel associations")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("assign")
        .setDescription("Assign a game channel association")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The game channel to associate")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption((option) => option.setName("game").setDescription("The name of the game").setRequired(true))
        .addStringOption((option) =>
          option.setName("names").setDescription("A comma-separated list of channel names to use instead of numbers")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unassign")
        .setDescription("Unassign a game channel association")
        .addStringOption((option) =>
          option.setName("game").setDescription("The name of the game").setRequired(true).setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName("info").setDescription("List all configured channels"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit a game association")
        .addStringOption((option) =>
          option.setName("game").setDescription("The name of the game").setRequired(true).setAutocomplete(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The game channel to associate")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("names").setDescription("A comma-separated list of channel names to use instead of numbers")
        )
    )
    .addSubcommandGroup((subcommand) =>
      subcommand
        .setName("private")
        .setDescription("Manage the private channel category")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("assign")
            .setDescription("Assign the private channel category")
            .addChannelOption((option) =>
              option
                .setName("category")
                .setDescription("The category to put private VCs")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("unassign").setDescription("Unassign the private channel category")
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async handler(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const subcommandGroup = interaction.options.getSubcommandGroup();
    if (subcommandGroup === "private") {
      if (subcommand === "assign") {
        const category = interaction.options.getChannel("category");

        if (!category || category.type !== ChannelType.GuildCategory) {
          await interaction.reply({
            content: "Invalid category to assign. Choose another.",
            ephemeral: true,
          });
          return;
        }

        await interaction.deferReply({ ephemeral: true });

        const existingRecord = await GameChannel.findOne({ where: { guildId, gameName: "private" } });
        if (existingRecord) {
          existingRecord.channelId = category.id;
          await existingRecord.save();

          await interaction.editReply(`Association for private channels updated.`);
        } else {
          await GameChannel.create({
            guildId,
            gameName: "private",
            channelId: category.id,
          });

          await interaction.editReply(`Association for private channels created.`);
        }
      } else if (subcommand === "unassign") {
        await interaction.deferReply({ ephemeral: true });

        await GameChannel.destroy({ where: { guildId, gameName: "private" } });

        await interaction.editReply("Association removed.");
      }
    } else if (subcommand === "assign") {
      const channel = interaction.options.getChannel("channel");
      const gameName = interaction.options.getString("game");
      const channelNameOptions = interaction.options
        .getString("names")
        ?.split(",")
        .map((name) => name.trim())
        .join(",");

      if (!channel || channel.type !== ChannelType.GuildText) {
        await interaction.reply({
          content: "Invalid channel to assign. Choose another.",
          ephemeral: true,
        });
        return;
      }

      if (!gameName) {
        await interaction.reply({
          content: "You must provide a game name.",
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const existingRecord = await GameChannel.findOne({ where: { guildId, gameName } });
      if (existingRecord) {
        await interaction.editReply(
          `An association for game "${gameName}" already exists. Try \`/gamechannel edit\` instead.`
        );
        return;
      }

      await GameChannel.create({
        guildId,
        gameName,
        channelId: channel.id,
        channelNameOptions,
      });

      await interaction.editReply(`Association for game "${gameName}" created.`);
    } else if (subcommand === "unassign") {
      const gameName = interaction.options.getString("game");

      await interaction.deferReply({ ephemeral: true });

      await GameChannel.destroy({ where: { guildId, gameName } });

      await interaction.editReply("Association removed.");
    } else if (subcommand === "edit") {
      const gameName = interaction.options.getString("game");
      const channel = interaction.options.getChannel("channel");
      const channelNameOptions = interaction.options
        .getString("names")
        ?.split(",")
        .map((name) => name.trim())
        .join(",");

      if (!channel || channel.type !== ChannelType.GuildText) {
        await interaction.reply({
          content: "Invalid channel to assign. Choose another.",
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const existingRecord = await GameChannel.findOne({ where: { guildId, gameName } });
      if (!existingRecord) {
        await interaction.editReply(
          `An association for game "${gameName}" does not exist. Try \`/gamechannel assign\` instead.`
        );
        return;
      }

      existingRecord.channelId = channel.id;
      existingRecord.channelNameOptions = channelNameOptions;
      await existingRecord.save();

      await interaction.editReply(`The association for game "${gameName}" has been updated.`);
    } else if (subcommand === "info") {
      await interaction.deferReply({ ephemeral: true });

      // Private category
      const privateChannelId = (await GameChannel.findOne({ where: { guildId, gameName: "private" } }))?.channelId;
      const privateChannelInfo = privateChannelId ? `**<#${privateChannelId}>**` : "_not set_";

      // Game channels
      const gameChannels = await GameChannel.findAll({
        where: {
          guildId,
          gameName: {
            [Op.ne]: "private",
          },
        },
      });
      const gameChannelList = gameChannels
        .map(
          (channel) =>
            `- **${channel.gameName}** => <#${channel.channelId}>` +
            (channel.channelNameOptions ? ` Channel names: ${channel.channelNameOptions.split(",").join(", ")}` : "")
        )
        .join("\n");

      await interaction.editReply(
        `Private channel category: ${privateChannelInfo}\n\nGame channels:\n${gameChannelList}`
      );
    }
  },
  async autocomplete(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return;
    }

    const focusedValue = interaction.options.getFocused(true);
    const optionName = focusedValue.name;
    const currentOption = focusedValue.value;

    let choices: string[] = [];

    if (optionName == "game") {
      choices = (await GameChannel.findAll({ where: { guildId } })).map((gc) => gc.gameName);
    }

    const filteredChoices = choices.filter((choice) => choice.includes(currentOption));
    await interaction.respond(filteredChoices.map((choice) => ({ name: choice, value: choice })));
  },
};

export default commandData;
