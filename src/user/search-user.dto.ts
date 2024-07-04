import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  minAge?: number;

  @IsInt()
  @Max(120)
  @IsOptional()
  maxAge?: number;
}
