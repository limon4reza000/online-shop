import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { env } from './env.js';
import { prisma } from '../lib/prisma.js';

async function findOrCreateOAuthUser(params: { provider: 'google' | 'facebook'; providerId: string; email: string; name: string; avatarUrl?: string }) {
  const idField = params.provider === 'google' ? 'googleId' : 'facebookId';

  const existing = await prisma.user.findFirst({ where: { OR: [{ [idField]: params.providerId }, { email: params.email }] } });
  if (existing) {
    if (!existing[idField]) {
      return prisma.user.update({ where: { id: existing.id }, data: { [idField]: params.providerId, emailVerified: true } });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      avatarUrl: params.avatarUrl,
      emailVerified: true,
      [idField]: params.providerId,
    },
  });
}

/**
 * Registers OAuth strategies only when credentials are present in .env —
 * this lets the rest of the API run locally without Google/Facebook
 * developer app setup. See .env.example for the required keys.
 */
export function configurePassport() {
  if (env.google.enabled) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.google.clientId,
          clientSecret: env.google.clientSecret,
          callbackURL: env.google.callbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await findOrCreateOAuthUser({
              provider: 'google',
              providerId: profile.id,
              email: profile.emails?.[0]?.value || `${profile.id}@google.oauth`,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  } else {
    console.warn('[passport] Google OAuth disabled — GOOGLE_CLIENT_ID/SECRET not set in .env');
  }

  if (env.facebook.enabled) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: env.facebook.appId,
          clientSecret: env.facebook.appSecret,
          callbackURL: env.facebook.callbackUrl,
          profileFields: ['id', 'displayName', 'emails', 'photos'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await findOrCreateOAuthUser({
              provider: 'facebook',
              providerId: profile.id,
              email: profile.emails?.[0]?.value || `${profile.id}@facebook.oauth`,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  } else {
    console.warn('[passport] Facebook OAuth disabled — FACEBOOK_APP_ID/SECRET not set in .env');
  }

  return passport;
}
