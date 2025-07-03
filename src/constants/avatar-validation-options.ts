import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const AVATAR_VALIDATION_OPTIONS: MulterOptions = {
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const isImage =
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp' ||
      file.mimetype === 'image/gif';

    if (!isImage) {
      return cb(
        new BadRequestException(
          'Only image files are allowed (jpeg, png, webp, gif)',
        ),
        false,
      );
    }

    cb(null, true);
  },
};
