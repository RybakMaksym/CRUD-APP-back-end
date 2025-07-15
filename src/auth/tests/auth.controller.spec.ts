import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { CreateUserDTO } from '@/auth/dto/create-user.dto';
import { LogInUserDTO } from '@/auth/dto/log-in-user.dto';
import { FileUploadService } from '@/file-upload/file-upload.service';
import { TokenService } from '@/token/token.service';

const mockAuthService = {
  registerUser: jest.fn(),
  logInUser: jest.fn(),
  logOutUser: jest.fn(),
};

const mockFileUploadService = {
  uploadImage: jest.fn(),
};

const mockTokenService = {
  verifyToken: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: FileUploadService, useValue: mockFileUploadService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    it('should register a user without avatar', async () => {
      const dto: CreateUserDTO = {
        username: 'user',
        email: 'user@test.com',
        password: '12345678',
        isAdmin: false,
      };
      const response = {
        accessToken: 'token',
        refreshToken: 'token',
        user: { id: '1' },
      };
      mockAuthService.registerUser.mockResolvedValue(response);

      const result = await authController.register(dto, undefined);

      expect(mockAuthService.registerUser).toHaveBeenCalledWith({
        ...dto,
        avatarUrl: undefined,
      });
      expect(result).toEqual(response);
    });

    it('should register a user with avatar', async () => {
      const file = {
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
      } as Express.Multer.File;
      const dto: CreateUserDTO = {
        username: 'user',
        email: 'user@test.com',
        password: '12345678',
        isAdmin: false,
      };
      const response = {
        accessToken: 'token',
        refreshToken: 'token',
        user: { id: '1' },
      };
      mockFileUploadService.uploadImage.mockResolvedValue('avatar-url');
      mockAuthService.registerUser.mockResolvedValue(response);

      const result = await authController.register(dto, file);

      expect(mockFileUploadService.uploadImage).toHaveBeenCalledWith(file);
      expect(mockAuthService.registerUser).toHaveBeenCalledWith({
        ...dto,
        avatarUrl: 'avatar-url',
      });
      expect(result).toEqual(response);
    });
  });

  describe('logIn()', () => {
    it('should log in a user', async () => {
      const dto: LogInUserDTO = {
        email: 'user@test.com',
        password: '12345678',
      };
      const response = {
        accessToken: 'token',
        refreshToken: 'token',
        user: { id: '1' },
      };
      mockAuthService.logInUser.mockResolvedValue(response);

      const result = await authController.logIn(dto);

      expect(mockAuthService.logInUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe('logOut()', () => {
    it('should log out a user', async () => {
      const authHeader = 'Bearer refresh-token';
      mockTokenService.verifyToken.mockResolvedValue('user-id');
      mockAuthService.logOutUser.mockResolvedValue(undefined);

      const result = await authController.logOut(authHeader);

      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(mockAuthService.logOutUser).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
