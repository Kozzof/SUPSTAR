import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
} from 'passport-google-oauth20';

export interface GoogleProfileData {
  provider: 'google';
  subject: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(configService: ConfigService) {
    super({
      clientID:
        configService.getOrThrow<string>(
          'GOOGLE_CLIENT_ID',
        ),

      clientSecret:
        configService.getOrThrow<string>(
          'GOOGLE_CLIENT_SECRET',
        ),

      callbackURL:
        configService.getOrThrow<string>(
          'GOOGLE_CALLBACK_URL',
        ),

      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GoogleProfileData {
    const email = profile.emails?.[0]?.value
      ?.trim()
      .toLowerCase();

    if (!email) {
      throw new UnauthorizedException(
        "Google n'a retourné aucune adresse e-mail.",
      );
    }

    return {
      provider: 'google',
      subject: profile.id,
      email,
      displayName:
        profile.displayName || email.split('@')[0],
      avatarUrl:
        profile.photos?.[0]?.value ?? null,
    };
  }
}