import { UseGuards } from '@nestjs/common';

import { JWTAuthGuard } from '../guards/jwt-auth.guard';

export const Auth = () => UseGuards(JWTAuthGuard);
