import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsPositive, IsString, isNotEmpty} from "class-validator";

export class AuthDto{
    @IsEmail() //this module check for use if email: is an email and isn't empty
    @IsNotEmpty()
    email: string;

    // @IsString() //this accept number too
    // @IsNotEmpty()
    // password : string; 

    @IsString()
    @IsNotEmpty()
    nickname: string

    // @IsNotEmpty()
    refreshtoken: string;

}

export class GameInstanceDto{
    @IsBoolean()
    winner: boolean;

    @IsNumber()
    @IsPositive()
    win: number; 

    @IsNumber()
    @IsPositive()
    losses: number;
}

export class MatchHistoryDto{
    my_score: number;
    opponent_score: number;
    opponent_nickname : string;
    win: boolean;
}

export class SessionDto{
    userId: string;
    sessionId: string;
    username: string; 
    connected: string;
}