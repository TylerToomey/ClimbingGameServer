import { User } from "./User";
import { DateTime as dt } from "luxon";

export class Room {
  public id: string;
  private users: { [userId: string]: User };
  public lastActivityAt: string;
  public createdAt: string;

  constructor(id: string) {
    this.id = id;
    this.users = {};
    this.createdAt = dt.now().toISO();
    this.lastActivityAt = dt.now().toISO();
  }

  public addUser(user: User): void {
    if (this.users[user.userId]) {
      throw new Error(`User ${user.userId} already exists in room ${this.id}`);
      // TODO: handle logic to tell client that user already exists
    }
    this.users[user.userId] = user;
    this.lastActivityAt = dt.now().toISO();
  }

  public removeUser(user: User): void {
    if (!this.users[user.userId]) {
      throw new Error(`User ${user.userId} does not exist in room ${this.id}`);
      // TODO: handle logic to tell client that user does not exist
    }
    delete this.users[user.userId];
    this.lastActivityAt = dt.now().toISO();
  }

  public getUsers(): User[] {
    return Object.values(this.users);
  }

  public getUsersClean(): Pick<User, "userId" | "name">[] {
    return Object.values(this.users).map((user) => {
      return {
        userId: user.userId,
        name: user.name,
      };
    });
  }
}
