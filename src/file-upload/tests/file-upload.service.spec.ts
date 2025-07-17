import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';

import { FileUploadService } from '@/file-upload/file-upload.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
    },
  },
}));

const mockConfigService = {
  get: jest.fn((key: string) => {
    const configMap = {
      CLOUDINARY_CLOUD_NAME: 'test_cloud',
      CLOUDINARY_API_KEY: 'test_key',
      CLOUDINARY_API_SECRET: 'test_secret',
    };

    return configMap[key];
  }),
};

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage()', () => {
    it('should upload image and return secure URL', async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('fake-image-buffer'),
        mimetype: 'image/png',
      } as any;
      const mockUrl = 'https://cloudinary.com/secure-url';
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
        secure_url: mockUrl,
      });

      const result = await service.uploadImage(mockFile);

      const expectedDataUrl = `data:image/png;base64,${mockFile.buffer.toString('base64')}`;
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(expectedDataUrl, {
        upload_preset: 'avatars_unsigned',
      });
      expect(result).toBe(mockUrl);
    });
  });

  it('should configure Cloudinary in constructor', () => {
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'test_cloud',
      api_key: 'test_key',
      api_secret: 'test_secret',
    });
  });
});
