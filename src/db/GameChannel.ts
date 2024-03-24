import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
})
export class GameChannel extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare guildId: string;

  @PrimaryKey
  @Column(DataType.STRING)
  declare gameName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare channelId: string;

  @Column(DataType.STRING)
  declare channelNameOptions?: string;
}
