import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../common/mail.service';
import { RedisService } from '../common/redis.service';
import { SmsService } from '../common/sms.service';
import { AUTH_TTL } from '../config/auth.constants';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, UpdateMfaDto, VerifyMfaDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      passwordHash,
      emailVerified: false,
    });

    const token = uuidv4();
    await this.redisService.set(
      `verify_email:${token}`,
      user.id,
      AUTH_TTL.EMAIL_VERIFICATION_SECONDS,
    );
    await this.mailService.sendEmailVerification(user.email, token);

    return {
      message:
        'Registered successfully. Check your inbox for verification link.',
    };
  }

  async verifyEmail(token: string) {
    const userId = await this.redisService.get(`verify_email:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    user.emailVerified = true;
    await this.usersService.save(user);
    await this.redisService.del(`verify_email:${token}`);

    return { message: 'Email verified successfully.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email is not verified.');
    }

    if (user.mfaEnabled) {
      return this.createMfaChallenge(user);
    }

    return this.issueTokenPair(user);
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }
    await this.redisService.del(`refresh_token:${payload.jti}`);
    return this.issueTokenPair(user);
  }

  async logout(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    await this.redisService.del(`refresh_token:${payload.jti}`);
    return { message: 'Logged out successfully.' };
  }

  async verifyMfa(dto: VerifyMfaDto) {
    const mfaPayload = await this.redisService.get(`mfa:${dto.challengeId}`);
    if (!mfaPayload) {
      throw new UnauthorizedException('MFA challenge expired.');
    }
    const { userId, code } = this.parseMfaPayload(mfaPayload);
    if (dto.code !== code) {
      throw new UnauthorizedException('Invalid MFA code.');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    await this.redisService.del(`mfa:${dto.challengeId}`);
    return this.issueTokenPair(user);
  }

  async loginWithGoogle(profile: {
    email: string;
    name: string;
    googleId: string;
  }) {
    if (!profile.email) {
      throw new BadRequestException('Google account did not provide an email.');
    }

    let user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
        emailVerified: true,
      });
    }

    if (user.mfaEnabled) {
      return this.createMfaChallenge(user);
    }

    return this.issueTokenPair(user);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      mfaMethod: user.mfaMethod,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
    };
  }

  async updateMfa(userId: string, dto: UpdateMfaDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.method === 'none') {
      user.mfaEnabled = false;
      user.mfaMethod = null;
      await this.usersService.save(user);
      return { message: 'MFA disabled.' };
    }

    if (dto.method === 'sms' && !dto.phoneNumber && !user.phoneNumber) {
      throw new BadRequestException('phoneNumber is required for SMS MFA.');
    }

    user.mfaEnabled = true;
    user.mfaMethod = dto.method;
    user.phoneNumber = dto.phoneNumber ?? user.phoneNumber;
    await this.usersService.save(user);

    return {
      message: `MFA enabled with ${dto.method}.`,
      mfaEnabled: user.mfaEnabled,
      mfaMethod: user.mfaMethod,
      phoneNumber: user.phoneNumber,
    };
  }

  private async createMfaChallenge(user: User) {
    const challengeId = uuidv4();
    const code = `${randomInt(100000, 999999)}`;
    await this.redisService.set(
      `mfa:${challengeId}`,
      JSON.stringify({ userId: user.id, code }),
      AUTH_TTL.MFA_CHALLENGE_SECONDS,
    );

    if (user.mfaMethod === 'sms' && user.phoneNumber) {
      await this.smsService.sendMfaSms(user.phoneNumber, code);
    } else {
      await this.mailService.sendMfaEmail(user.email, code);
    }

    return {
      mfaRequired: true,
      challengeId,
      method: user.mfaMethod ?? 'email',
    };
  }

  private async issueTokenPair(user: User) {
    const jti = uuidv4();
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.get<string>(
          'JWT_ACCESS_SECRET',
          'dev_access_secret',
        ),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ) as never,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, jti },
      {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'dev_refresh_secret',
        ),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as never,
      },
    );

    await this.redisService.set(
      `refresh_token:${jti}`,
      user.id,
      AUTH_TTL.REFRESH_TOKEN_SECONDS,
    );
    return { accessToken, refreshToken };
  }

  private parseMfaPayload(raw: string): { userId: string; code: string } {
    try {
      return JSON.parse(raw) as { userId: string; code: string };
    } catch {
      throw new UnauthorizedException('Invalid MFA challenge payload.');
    }
  }

  private async verifyRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        jti: string;
      }>(token, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'dev_refresh_secret',
        ),
      });
      const cachedUserId = await this.redisService.get(
        `refresh_token:${payload.jti}`,
      );
      if (!cachedUserId || cachedUserId !== payload.sub) {
        throw new UnauthorizedException('Refresh token already rotated.');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }
}
