import { GameManager, ServerSocket } from '@managers';
import { log } from '@utils';
import { type User } from '@models';
import { type TCleanUser } from '../types';

export class Room {
  public roomId: string;
  public users: User[];

  public disconnectedUsers: User[];
  private gameManager: GameManager;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.users = [];
    this.disconnectedUsers = [];

    this.gameManager = new GameManager(roomId);
  }

  public getUsersClean(): TCleanUser[] {
    return this.users.map((user) => user.getClean());
  }

  public addUser(user: User): boolean {
    // Handle reconnect event logic
    if (this.disconnectedUsers.find((u) => u.userId === user.userId)) {
      const index = this.disconnectedUsers.findIndex(
        (u) => u.userId === user.userId,
      );
      this.users.push(this.disconnectedUsers[index]);
      this.disconnectedUsers.splice(index, 1);
      return true;
    }

    // Handle duplicate request to join room from active user
    if (this.users.find((u) => u.userId === user.userId)) {
      return false;
    }

    this.users.push(user);
    if (this.users.length > 1) {
      this.gameManager.startGame();
    }
    return true;
  }

  public removeUser(user: User): boolean {
    const index = this.users.findIndex((u) => u.userId === user.userId);
    if (index === -1) return false;

    this.disconnectedUsers.push(this.users[index]);
    this.users.splice(index, 1);

    return true;
  }

  public broadcast(event: string, data: any): void {
    for (const user of this.users) {
      log(`Broadcasting ${event} to ${user.username} (${user.userId})`, 'info');
      ServerSocket.instance.io.to(user.socketId).emit(event, data);
    }
  }
}
