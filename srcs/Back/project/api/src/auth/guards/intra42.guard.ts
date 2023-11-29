// import { Injectable, CanActivate, ExecutionContext, } from "@nestjs/common";
// import { AuthGuard } from "@nestjs/passport";

/* Guard is a fonction that stands between the request and the endpoint 
and it will allow or not the execution of this endpoint. In general Guard check the strategy
to know it's good or not. This is how we protect the code in nestjs */


// @Injectable()
// export class IntraGuard extends AuthGuard('42') implements CanActivate {
//     constructor() {
//         super();
//     }

// 	canActivate(context: ExecutionContext) {
//         return super.canActivate(context); 
// 	}
// }
