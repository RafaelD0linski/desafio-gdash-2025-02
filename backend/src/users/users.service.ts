import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User } from "./users.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@gdash.com";

    const existingAdmin = await this.userModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "Admin@123",
      10
    );

    await this.userModel.create({
      email: adminEmail,
      password: hashedPassword,
      name: process.env.ADMIN_NAME || "Administrator",
      role: "admin",
    });

    console.log("✅ Default admin user created:", adminEmail);
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictException("Email já existe");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userModel.create({
      ...data,
      password: hashedPassword,
    });

    const { password, ...result } = user.toObject();
    return result;
  }

  async findAll() {
    return this.userModel.find().select("-password").exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select("-password").exec();
    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }
    return { message: "Usuário removido com sucesso" };
  }
}
