import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthRegisterDTO } from 'auth/dto/auth.dto';
import { hashPassword } from 'helpers/password';
import { User, UserDocument } from 'user/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async create(dto: AuthRegisterDTO): Promise<User> {
    return this.userModel.create({
      ...dto,
      passwordHash: await hashPassword(dto.password),
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async findById(id: string): Promise<User | null> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  public async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
