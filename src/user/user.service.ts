import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthRegisterDTO } from 'auth/dto/auth.dto';

import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async create(dto: AuthRegisterDTO): Promise<User> {
    return this.userRepo.create({
      ...dto,
      password: await hash(dto.password),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
