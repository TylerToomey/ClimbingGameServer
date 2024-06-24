import { ICleanUser } from "../types";
import { User } from "./User";

export class Room {
  public roomId: string;
  public users: User[];

  constructor(roomId: string) {
    this.roomId = roomId;
    this.users = [];
  }

  public getUsersClean(): ICleanUser[] {
    return this.users.map((user) => user.getClean());
  }

  public addUser(user: User): boolean {
    if (this.users.find((u) => u.userId === user.userId)) {
      return false;
    }

    this.users.push(user);
    return true;
  }

  public removeUser(user: User): boolean {
    const index = this.users.findIndex((u) => u.userId === user.userId);
    if (index === -1) {
      return false;
    }

    this.users.splice(index, 1);
    return true;
  }
}
