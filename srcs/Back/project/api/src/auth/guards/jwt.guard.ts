import { AuthGuard } from "@nestjs/passport";
import { CanActivate, ExecutionContext } from "@nestjs/common";

export class JwtGuard extends AuthGuard('jwt_access_token') implements CanActivate {
    constructor() {
        super();
    }

    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

}

export class JwtRefreshGuard extends AuthGuard('jwt_refresh_token') implements CanActivate {
    constructor() {
        super();
    }

    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

}