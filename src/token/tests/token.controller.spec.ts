import { BadGatewayException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { TokenController } from '@/token/token.controller';
import { TokenService } from '@/token/token.service';
import type { ITokens } from '@/token/tokens.types';

const mockTokenService = {
  verifyToken: jest.fn(),
  generateJwtTokens: jest.fn(),
  saveTokenToDb: jest.fn(),
};

describe('TokenController', () => {
  let tokenController: TokenController;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    tokenController = module.get<TokenController>(TokenController);
    tokenService = module.get<TokenService>(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNewToken()', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const fakeRefreshToken = 'valid-refresh-token';
      const fakeAuthorization = `Bearer ${fakeRefreshToken}`;
      const fakeUserId = 'user-id';
      const fakeTokens: ITokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockTokenService.verifyToken.mockResolvedValue(fakeUserId);
      mockTokenService.generateJwtTokens.mockReturnValue(fakeTokens);
      mockTokenService.saveTokenToDb.mockResolvedValue(undefined);

      const result = await tokenController.getNewToken(fakeAuthorization);

      expect(tokenService.verifyToken).toHaveBeenCalledWith(fakeRefreshToken);
      expect(tokenService.generateJwtTokens).toHaveBeenCalledWith(fakeUserId);
      expect(tokenService.saveTokenToDb).toHaveBeenCalledWith(
        fakeUserId,
        fakeTokens.refreshToken,
      );
      expect(result).toEqual(fakeTokens);
    });

    it('should throw if no authorization header is provided', async () => {
      await expect(tokenController.getNewToken(undefined)).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should throw if authorization header is malformed', async () => {
      await expect(
        tokenController.getNewToken('InvalidHeader'),
      ).rejects.toThrow(BadGatewayException);
    });

    it('should throw if tokenService.verifyToken throws', async () => {
      mockTokenService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const fakeAuthorization = 'Bearer invalid-refresh-token';

      await expect(
        tokenController.getNewToken(fakeAuthorization),
      ).rejects.toThrow(Error);
    });
  });
});
