import { TCleanUser } from './user.types';

export type TRoom = {
  roomId: string;
  users: TCleanUser[];
};
