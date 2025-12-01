import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const { password: _, ...safeUser } = user.toObject ? user.toObject() : user;
    return safeUser;
  }

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.validateUser(email, password);

    const payload = { sub: user._id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user,
    };
  }
}
