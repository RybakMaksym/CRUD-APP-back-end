import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import { RegisterUserDTO } from 'auth/dto/auth-register.dto';
import { hash } from 'helpers/hash';
import { User, UserDocument } from 'user/models/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async create(dto: RegisterUserDTO): Promise<User> {
    return this.userModel.create({
      ...dto,
      passwordHash: await hash(dto.password),
    });
  }

  public async update(
    id: string,
    update: UpdateQuery<UserDocument>,
  ): Promise<void> {
    await this.userModel.updateOne({ _id: id }, update).exec();
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
