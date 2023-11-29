
type ft_GameInstance ={
  id: number;
  win: number;
  losses: number;
  rank: number;
  level: number;
  achievement: string;
  user_nickname: string;
  user: ft_User;
  player_history: ft_MatchHistory[];
}

type ft_MatchHistory ={
  id: number;
  my_score: number;
  opponent_score: number;
  opponent_nickname: string;
  win: boolean;
  player_nickname: string;
  player: ft_GameInstance;
}

type ft_Friend ={
  id: number;
  userId: string;
  friendId: string;
  user: ft_User;
  friend: ft_User;
}

type ft_BlockedUser ={
  id: number;
  userId: string;
  blockerId: string;
  user: ft_User;
  blocked: ft_User;
}

type ft_Session ={
  id: number;
  userId: string;
  sessionId: string;
  username: string;
  connected?: string | null;
  for?: string | null;
  createdAt: Date;
  updatedAt: Date;
  chats: ft_Chat[];
  lobbyAdmin: ft_Chat[];
  bannedFrom: ft_Chat[];
  muteFrom: ft_Chat[];
  messages: ft_Message[];
  user: ft_User;
}

type ft_Invitation ={
  id: number;
  username?: string | null;
  from?: string | null;
  from_userId?: string | null;
  to?: string | null;
  to_userId?: string | null;
  for_game?: string | null;
  to_be_friends?: string | null;
  inv_sent: ft_User[];
  inv_received: ft_User[];
}

type ft_Chat ={
  id: number;
  type: string;
  protected?: string | null;
  chat_name: string;
  maxUsers?: number | null;
  owner_group_chat?: string | null;
  admins: ft_Session[];
  users: ft_Session[];
  banned: ft_Session[];
  muted: ft_Session[];
  message: ft_Message[];
}

type ft_Message ={
  id: number;
  name_chat: string;
  from_id: string;
  to_id: string;
  to: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  my_chat: ft_Chat;
  from: string;
  author: ft_Session;
}

type ft_User ={
  id?:string;
  createAt?:Date;
  updatedAt?:Date;
  email?:string;
  username?:string;
  refreshtoken?: string | null;
  password_A2f?: string | null;
  login?: string | null;
  nickname?: string | null;
  avatar?: string | undefined;
  status?: string | null;  

  blocklist?:ft_BlockedUser[];
  blacklist?:ft_BlockedUser[];
  friendships?:ft_Friend[];
  friends?:ft_Friend[];
  statistic?:ft_GameInstance | null;
  
  my_invits?:ft_Invitation[];
  invits_received?:ft_Invitation[];
  session_list?:ft_Session[];
}

type ft_Data = {
user: string;
status: string;
avatar: string;
isFriend:boolean;
isBlocked:boolean;
ImBloqued:boolean;
Already_invite:boolean;
Already_send:boolean;
};


type ft_Info = {
  friendName?: string;
  channelId?:number;
  nickname?:string | null;
  blockedUser?:string;
  deblockUser?:string;
  byefriend?:string;
  otp?:string;
  refreshToken?:any;
}
type ft_GameRoom = {
  ballY?:number;
  ballX?:number;
  ballSpeedY?:number;
  ballSpeedX?:number;
  player1Score?:number;
  player2Score?:number;
  path?:string;
  paddle1Y?:number;
  paddle2Y?:number;
  winner?:string;
}