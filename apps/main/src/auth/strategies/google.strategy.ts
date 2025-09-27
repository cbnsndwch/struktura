import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;
        const email = emails[0]?.value;

        if (!email) {
            return done(new Error('No email found from Google'), false);
        }

        try {
            // Check if user exists with this email
            let user = await this.userModel.findOne({ email });

            if (user) {
                // Update OAuth provider info if user exists
                if (!user.oauthProviders?.google) {
                    user.oauthProviders = {
                        ...user.oauthProviders,
                        google: {
                            id,
                            email,
                        },
                    };
                    user.emailVerified = true; // Google emails are pre-verified
                    await user.save();
                }
            } else {
                // Create new user
                user = new this.userModel({
                    email,
                    name: `${name.givenName} ${name.familyName}`,
                    passwordHash: '', // No password for OAuth users
                    emailVerified: true, // Google emails are pre-verified
                    roles: ['editor'],
                    profile: {
                        avatar: photos[0]?.value,
                    },
                    oauthProviders: {
                        google: {
                            id,
                            email,
                        },
                    },
                });
                await user.save();
            }

            const userPayload = {
                id: (user._id as mongoose.Types.ObjectId).toString(),
                email: user.email,
                name: user.name,
                roles: user.roles,
                provider: 'google',
            };

            return done(null, userPayload);
        } catch (error) {
            return done(error, false);
        }
    }
}