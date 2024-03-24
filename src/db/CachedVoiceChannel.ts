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

  @Column
  declare gameName: string;

  @Column
  declare channelTag: string;

  @Column
  declare timestamp: number;
}
