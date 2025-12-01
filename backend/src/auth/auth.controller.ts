import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

class LoginDto {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: any;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() body: LoginDto): Promise<LoginResponse> {
    return this.authService.login(body);
  }
}
