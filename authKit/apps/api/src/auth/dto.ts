import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

export class VerifyEmailDto {
  @IsString()
  token!: string;
}

export class VerifyMfaDto {
  @IsString()
  challengeId!: string;

  @IsString()
  code!: string;
}

export class UpdateMfaDto {
  @IsIn(['sms', 'email', 'none'])
  @IsString()
  method!: 'sms' | 'email' | 'none';

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
