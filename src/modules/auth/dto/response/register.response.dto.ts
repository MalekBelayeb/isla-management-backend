import { User } from 'generated/prisma';

export type AuthUser = Omit<User, 'password'>;
