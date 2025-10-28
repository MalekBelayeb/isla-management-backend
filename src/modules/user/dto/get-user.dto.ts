import { User } from 'generated/prisma';

export type GetUserDto = Omit<User, 'password'>;
