import { Injectable } from '@nestjs/common';

import { AuthRegisterDTO } from 'auth/dto/auth.dto';

import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  public async create(dto: AuthRegisterDTO): Promise<User> {
    return this.userRepo.create(dto);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  public async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  public async findAll(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
