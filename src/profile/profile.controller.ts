import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { AVATAR_VALIDATION_OPTIONS } from '@/constants/avatar-validation-options.constants';
import { DEFAULT_PROFILES_PAGE_LIMIT } from '@/constants/profile.constants';
import { GetUserId } from '@/decorators/get-user-id.decorator';
import { FilterFields } from '@/enums/filter.enums';
import { FileUploadService } from '@/file-upload/file-upload.service';
import { CreateProfileDTO } from '@/profile/dto/create-profile.dto';
import { UpdateProfileDTO } from '@/profile/dto/update-profile.dto';
import { ProfileService } from '@/profile/profile.service';
import { IProfile } from '@/profile/types/profile';
import { FilterableFields } from '@/types/filterable-fileds.type';
import { IMessageReponse } from '@/types/message.interfaces';
import { IPaginatedResponse } from '@/types/pagination.interfaces';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('my-profiles')
  @UseGuards(AccessTokenGuard)
  public async getMyProfiles(
    @GetUserId() myId: string,
    @Query('page') page = 1,
    @Query('limit') limit = DEFAULT_PROFILES_PAGE_LIMIT,
  ): Promise<IPaginatedResponse<IProfile>> {
    return this.profileService.findAllWithPagination(myId, +page, +limit);
  }

  @Get('profiles/:id')
  @UseGuards(AccessTokenGuard)
  public async getProfilesByUserId(
    @Param('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = DEFAULT_PROFILES_PAGE_LIMIT,
  ): Promise<IPaginatedResponse<IProfile>> {
    return this.profileService.findAllWithPagination(userId, +page, +limit);
  }

  @Get('search')
  @UseGuards(AccessTokenGuard)
  public async searchProfiles(
    @GetUserId() myId: string,
    @Query('query') query: string,
  ): Promise<IProfile[]> {
    return this.profileService.searchProfiles(query, myId);
  }

  @Get('suggestions')
  @UseGuards(AccessTokenGuard)
  public async getFilterSuggestions(
    @GetUserId() myId: string,
    @Query('field') field: FilterableFields,
    @Query('query') query: string,
  ): Promise<string[]> {
    return this.profileService.getFilterSuggestions(field, query, myId);
  }

  @Get('filter')
  @UseGuards(AccessTokenGuard)
  public async filterProfiles(
    @GetUserId() myId: string,
    @Query('field') field: FilterFields,
    @Query('query') query: string,
  ): Promise<IProfile[]> {
    if (field === 'age') {
      return this.profileService.filterByAge(myId);
    }

    return this.profileService.filterByFields(field, query, myId);
  }

  @Post('create/:id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('avatar', AVATAR_VALIDATION_OPTIONS))
  public async create(
    @Param('id') userId: string,
    @Body() dto: CreateProfileDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IProfile> {
    let avatarUrl: string | undefined;

    if (file) {
      avatarUrl = await this.fileUploadService.uploadImage(file);
    }

    return this.profileService.create(userId, {
      ...dto,
      avatarUrl,
    });
  }

  @Patch('/update/:id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('avatar', AVATAR_VALIDATION_OPTIONS))
  public async updateProfileById(
    @Param('id') profileId: string,
    @Body() dto: UpdateProfileDTO,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IProfile> {
    const profile = await this.profileService.findById(profileId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const avatarUrl = file
      ? await this.fileUploadService.uploadImage(file)
      : profile.avatarUrl;

    return this.profileService.update(profileId, {
      name: dto.name ?? profile.name,
      birthDate: dto.birthDate ?? profile.birthDate,
      gender: dto.gender ?? profile.gender,
      county: dto.country ?? profile.country,
      city: dto.city ?? profile.city,
      avatarUrl,
    });
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  public async deleteProfileById(
    @Param('id') id: string,
  ): Promise<IMessageReponse> {
    await this.profileService.delete(id);

    return { message: 'Profile deleted successfuly' };
  }
}
