import { ICleanUser } from "../types";
import { User } from "./User";

export class Room {
  public roomId: string;
  public users: User[];

  public disconnectedUsers: User[];

  constructor(roomId: string) {
    this.roomId = roomId;
    this.users = [];
    this.disconnectedUsers = [];
  }

  public getUsersClean(): ICleanUser[] {
    return this.users.map((user) => user.getClean());
  }

  public addUser(user: User): boolean {
    if (this.disconnectedUsers.find((u) => u.userId === user.userId)) {
      const index = this.disconnectedUsers.findIndex(
        (u) => u.userId === user.userId
      );
      this.users.push(this.disconnectedUsers[index]);
      this.disconnectedUsers.splice(index, 1);
      return true;
    }

    if (this.users.find((u) => u.userId === user.userId)) {
      return false;
    }

    this.users.push(user);
    console.log(this.users);
    return true;
  }

  public removeUser(user: User): boolean {
    const index = this.users.findIndex((u) => u.userId === user.userId);
    if (index === -1) return false;

    this.disconnectedUsers.push(this.users[index]);
    this.users.splice(index, 1);
    console.log(this.users);

    return true;
  }
}
