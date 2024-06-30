import { ICleanUser } from "../types";

export class User {
  public socketId: string;
  public userId: string;
  public username: string;

  public lobbyReady: boolean;

  constructor(socketId: string, userId: string, name: string) {
    this.socketId = socketId;
    this.userId = userId;
    this.username = name;
    this.lobbyReady = false;
  }

  public getClean(): ICleanUser {
    return {
      userId: this.userId,
      username: this.username,
    };
  }
}
