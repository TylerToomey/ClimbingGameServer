import { Room } from "./Room";

export class User {
  public socketId: string;
  public userId: string;
  public currentRoom: Room;
  public name: string;

  constructor(
    socketId: string,
    userId: string,
    name: string,
    currentRoom: Room
  ) {
    this.socketId = socketId;
    this.userId = userId;
    this.currentRoom = currentRoom;
    this.name = name;
  }

  public getClean(): Pick<User, "userId" | "name"> {
    return {
      userId: this.userId,
      name: this.name,
    };
  }
}
