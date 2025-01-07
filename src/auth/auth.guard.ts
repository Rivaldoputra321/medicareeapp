import { AuthGuard } from "@nestjs/passport";

export class authGuard extends AuthGuard('jwt'){}