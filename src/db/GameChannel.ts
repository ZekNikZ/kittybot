import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
})
export class GameChannel extends Model {
  @PrimaryKey
  @Column
  declare guildId: string;

  @PrimaryKey
  @Column
  declare gameName: string;

  @Column
  declare channelId: string;

  @Column
  declare channelNameOptions?: string;
}
