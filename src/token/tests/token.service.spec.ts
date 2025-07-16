import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { compareHash } from '@/helpers/hash';
import { TokenService } from '@/token/token.service';
import { UserService } from '@/user/user.service';

jest.mock('@/helpers/hash', () => ({
  ...jest.requireActual('@/helpers/hash'),
  hash: jest.fn((val) => `hashed-${val}`),
  compareHash: jest.fn((val, hash) => hash === `hashed-${val}`),
}));

const jwtServiceMock = {
  sign: jest.fn(),
  verifyAsync: jest.fn(),
};

const configServiceMock = {
  get: jest.fn((key) => {
    const config = {
      ACCESS_TOKEN_SECRET: 'access-secret',
      ACCESS_TOKEN_EXPIRE_IN: '15m',
      REFRESH_TOKEN_SECRET: 'refresh-secret',
      REFRESH_TOKEN_EXPIRE_IN: '7d',
    };

    return config[key];
  }),
};

const userServiceMock = {
  update: jest.fn(),
  findById: jest.fn(),
};

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateJwtTokens()', () => {
    it('should generate access and refresh tokens', () => {
      (jwtService.sign as jest.Mock).mockReturnValueOnce('access-token');
      (jwtService.sign as jest.Mock).mockReturnValueOnce('refresh-token');

      const tokens = tokenService.generateJwtTokens('user-id');

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('saveTokenToDb()', () => {
    it('should save hashed refresh token', async () => {
      await tokenService.saveTokenToDb('user-id', 'refresh-token');

      expect(userService.update).toHaveBeenCalledWith('user-id', {
        refreshToken: 'hashed-refresh-token',
      });
    });
  });

  describe('verifyToken()', () => {
    it('should return userId if token is valid and matches hash', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        id: 'user-id',
      });
      (userService.findById as jest.Mock).mockResolvedValue({
        refreshToken: 'hashed-refresh-token',
      });

      const result = await tokenService.verifyToken('refresh-token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh-token', {
        secret: 'refresh-secret',
      });
      expect(result).toBe('user-id');
    });

    it('should throw Unauthorized if token is invalid or user not found', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        id: 'user-id',
      });
      (userService.findById as jest.Mock).mockResolvedValue({
        refreshToken: null,
      });

      await expect(tokenService.verifyToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Unauthorized if token does not match hash', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        id: 'user-id',
      });
      (userService.findById as jest.Mock).mockResolvedValue({
        refreshToken: 'some-other-hash',
      });
      (compareHash as jest.Mock).mockReturnValue(false);

      await expect(tokenService.verifyToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
