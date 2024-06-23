import { log } from "../utils/logger";
import { User } from "./User";
import { DateTime as dt } from "luxon";

export class Room {
  public id: string;
  private users: { [userId: string]: User } = {};
  public lastActivityAt: string;
  public createdAt: string;

  constructor(id: string) {
    this.id = id;
    this.createdAt = dt.now().toISO();
    this.lastActivityAt = dt.now().toISO();
  }

  public addUser(user: User): void {
    this.users[user.userId] = user;
    this.lastActivityAt = dt.now().toISO();
    log(`User ${user.userId} added to room ${this.id}`, "success");
  }

  public removeUser(user: User): void {
    delete this.users[user.userId];
    this.lastActivityAt = dt.now().toISO();
  }

  public getUsers(): User[] {
    return Object.values(this.users);
  }

  public getUsersClean(): Pick<User, "userId" | "name">[] {
    return Object.values(this.users).map((user) => user.getClean());
  }
}
