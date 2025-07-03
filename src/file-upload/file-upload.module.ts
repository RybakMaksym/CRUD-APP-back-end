import { Module } from '@nestjs/common';

import { FileUploadService } from 'file-upload/file-upload.service';

@Module({
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
