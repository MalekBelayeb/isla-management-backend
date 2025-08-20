import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const loginRequestDtoSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginRequestDtoType = z.infer<typeof loginRequestDtoSchema>;

// swagger doc
export class LoginRequestApiBody {
  @ApiProperty({ example: 'test123@gmail.com' })
  email: string;
  @ApiProperty({ example: 'test123' })
  password: string;
}
