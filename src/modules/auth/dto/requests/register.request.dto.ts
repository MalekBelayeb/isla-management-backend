import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const registerRequestDtoSchema = z.object({
  email: z.email(),
  password: z.string(),
  firstname: z.string(),
  lastname: z.string(),
});

export type RegisterRequestDtoType = z.infer<typeof registerRequestDtoSchema>;

// swagger doc
export class RegisterRequestApiBody {
  @ApiProperty({ example: 'test123@gmail.com' })
  email: string;
  @ApiProperty({ example: 'test123' })
  password: string;
  @ApiProperty({ example: 'test123' })
  firstname: string;
  @ApiProperty({ example: 'test123' })
  lastname: string;
}
