import { User } from '@prisma/client';

export type GetUserDto = Omit<User, 'password'>;
