import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import {
  AVATAR_ALLOWED_FILE_TYPES,
  AVATAR_IMAGE_SIZE,
} from '@/constants/file.constants';

export const AVATAR_VALIDATION_OPTIONS: MulterOptions = {
  limits: {
    fileSize: AVATAR_IMAGE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const isImageTypeValid = AVATAR_ALLOWED_FILE_TYPES.includes(file.mimetype);

    if (!isImageTypeValid) {
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
