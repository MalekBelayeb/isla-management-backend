import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  token: string;
}

// swagger doc
export class LoginResponseApiBody {
  @ApiProperty({ example: 'ey123trld3...' })
  token: string;
}
