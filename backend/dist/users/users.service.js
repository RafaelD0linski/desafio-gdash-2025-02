"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const users_schema_1 = require("./users.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async createDefaultAdmin() {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@gdash.com";
        const existingAdmin = await this.userModel.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("✅ Admin user already exists");
            return;
        }
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
        await this.userModel.create({
            email: adminEmail,
            password: hashedPassword,
            name: process.env.ADMIN_NAME || "Administrator",
            role: "admin",
        });
        console.log("✅ Default admin user created:", adminEmail);
    }
    async create(data) {
        const existingUser = await this.userModel.findOne({ email: data.email });
        if (existingUser) {
            throw new common_1.ConflictException("Email já existe");
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
    async findOne(id) {
        const user = await this.userModel.findById(id).select("-password").exec();
        if (!user) {
            throw new common_1.NotFoundException("Usuário não encontrado");
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async remove(id) {
        const user = await this.userModel.findByIdAndDelete(id).exec();
        if (!user) {
            throw new common_1.NotFoundException("Usuário não encontrado");
        }
        return { message: "Usuário removido com sucesso" };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(users_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map