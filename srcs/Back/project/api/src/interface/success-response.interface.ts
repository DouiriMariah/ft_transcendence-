export interface SuccessResponse {
    data: any;
    message: string;
    status: number;
  }

import { Socket } from "socket.io";
import internal from "stream";

export interface CustomSocket extends Socket {
  sessionId?: string;
  userId?: string;
  username?: string;
  status? : string;
  origin? : string;
}

export interface GroupChat {
  name_chat? : string;
  type? : string;
  protected? : string;
  maxUsers? : number; 
  owner_group_chat? : string;
}

export interface MessageForm {
  name_chat ? : string;
  from      ? : string;
  from_id   ? : string;
  to_id     ? : string;
  to        ? : string;
  content   ? : string;
}

export interface MatchForm{
  my_score ?: number;
  op_score ?: number;
  op_nickname? : string;
  win ?: boolean;
  my_nickname ?: string;
}