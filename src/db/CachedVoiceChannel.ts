import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
})
export class CachedVoiceChannel extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare guildId: string;

  @PrimaryKey
  @Column(DataType.STRING)
  declare channelId: string;

  @Column(DataType.STRING)
  declare gameName: string;

  @Column(DataType.STRING)
  declare channelTag: string;

  @Column(DataType.INTEGER)
  declare timestamp: number;
}
