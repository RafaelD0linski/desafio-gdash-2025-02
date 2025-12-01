import { AuthService } from "./auth.service";
declare class LoginDto {
    email: string;
    password: string;
}
interface LoginResponse {
    access_token: string;
    user: any;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<LoginResponse>;
}
export {};
