import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import { CreateUserDTO } from 'auth/dto/create-user.dto';
import { Role } from 'enums/role.enum';
import { hash } from 'helpers/hash';
import { User, UserDocument } from 'user/models/user.model';
import { IUser } from 'user/types/user';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async create(dto: CreateUserDTO): Promise<IUser> {
    return this.userModel.create({
      ...dto,
      passwordHash: hash(dto.password),
      role: dto.isAdmin ? Role.Admin : Role.User,
    });
  }

  public async update(
    id: string,
    update: UpdateQuery<UserDocument>,
  ): Promise<void> {
    await this.userModel.updateOne({ _id: id }, update).exec();
  }

  public async delete(id: string): Promise<void> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.userModel.findByIdAndDelete(id);
    } catch {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async findById(id: string): Promise<IUser | null> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  public async findAll(): Promise<IUser[]> {
    return this.userModel.find().exec();
  }
}
