import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
})
export class CachedVoiceChannel extends Model {
  @PrimaryKey
  @Column
  declare guildId: string;

  @PrimaryKey
  @Column
  declare channelId: string;

  @PrimaryKey
  @Column
  declare gameId: string;

  @Column
  declare timestamp: number;
}
