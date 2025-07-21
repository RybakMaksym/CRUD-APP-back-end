import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AuthService } from '@/auth/auth.service';
import type { CreateUserDTO } from '@/auth/dto/create-user.dto';
import type { LogInUserDTO } from '@/auth/dto/log-in-user.dto';
import { Role } from '@/enums/role.enum';
import { compareHash } from '@/helpers/hash';
import { TokenService } from '@/token/token.service';
import { UserService } from '@/user/user.service';

jest.mock('@/helpers/hash', () => ({
  ...jest.requireActual('@/helpers/hash'),
  compareHash: jest.fn(),
}));

const userServiceMock = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const tokenServiceMock = {
  generateJwtTokens: jest.fn(),
  saveTokenToDb: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: TokenService,
          useValue: tokenServiceMock,
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser()', () => {
    it('should register a user and return auth response', async () => {
      const dto: CreateUserDTO = {
        username: 'test',
        email: 'test@mail.com',
        password: 'password',
        isAdmin: false,
      };
      const mockUser = {
        id: 'user-id',
        username: dto.username,
        email: dto.email,
        passwordHash: 'hash-password',
        role: Role.User,
        avatarUrl: null,
        profiles: [],
      };
      const expectedUser = {
        id: 'user-id',
        username: dto.username,
        email: dto.email,
        role: Role.User,
        avatarUrl: null,
      };
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(mockUser);
      tokenService.generateJwtTokens.mockReturnValue(mockTokens);

      const result = await authService.registerUser(dto);

      expect(userService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(tokenService.generateJwtTokens).toHaveBeenCalledWith(mockUser.id);
      expect(tokenService.saveTokenToDb).toHaveBeenCalledWith(
        mockUser.id,
        mockTokens.refreshToken,
      );
      expect(result).toEqual({ user: expectedUser, ...mockTokens });
    });

    it('should throw if user already exists', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'username',
        email: 'email@gmail.com',
        passwordHash: 'hash-password',
        role: Role.User,
        avatarUrl: null,
        profiles: [],
      };
      userService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.registerUser({
          username: 'name',
          email: 'exists@mail.com',
          password: 'pass',
          isAdmin: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logInUser()', () => {
    it('should log in a user with correct password', async () => {
      const dto: LogInUserDTO = {
        email: 'test@mail.com',
        password: 'password',
      };
      const mockUser = {
        id: 'user-id',
        username: 'test',
        email: dto.email,
        passwordHash: 'hashed-password',
        role: Role.User,
        avatarUrl: null,
        profiles: [],
      };
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      userService.findByEmail.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockReturnValue(true);
      tokenService.generateJwtTokens.mockReturnValue(mockTokens);

      const result = await authService.logInUser(dto);

      expect(userService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(compareHash).toHaveBeenCalledWith(
        dto.password,
        mockUser.passwordHash,
      );
      expect(tokenService.generateJwtTokens).toHaveBeenCalledWith(mockUser.id);
      expect(tokenService.saveTokenToDb).toHaveBeenCalledWith(
        mockUser.id,
        mockTokens.refreshToken,
      );
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
          avatarUrl: mockUser.avatarUrl,
        },
        ...mockTokens,
      });
    });

    it('should throw if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.logInUser({ email: 'no@mail.com', password: '123' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if password is invalid', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'test',
        email: `email@gmail.com`,
        passwordHash: 'hashed-password',
        role: Role.User,
        avatarUrl: null,
        profiles: [],
      };
      userService.findByEmail.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockReturnValue(false);

      await expect(
        authService.logInUser({
          email: 'test@mail.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logOutUser()', () => {
    it('should clear refresh token', async () => {
      await authService.logOutUser('user-id');

      expect(userService.update).toHaveBeenCalledWith('user-id', {
        refreshToken: null,
      });
    });
  });
});
