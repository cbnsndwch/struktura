import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import type { Dict } from '@cbnsndwch/struktura-shared-contracts';

import { User, UserDocument } from '../entities/user.entity.js';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {
        super({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL:
                process.env.GITHUB_CALLBACK_URL || '/auth/github/callback',
            scope: ['user:email']
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Dict,
        done: (error: Error | null, user?: Dict | false) => void
    ): Promise<void> {
        const { id, username, displayName, emails, photos } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
            return done(new Error('No email found from GitHub'), false);
        }

        try {
            // Check if user exists with this email
            let user = await this.userModel.findOne({ email });

            if (user) {
                // Update OAuth provider info if user exists
                if (!user.oauthProviders?.github) {
                    user.oauthProviders = {
                        ...user.oauthProviders,
                        github: {
                            id,
                            username
                        }
                    };
                    user.emailVerified = true; // GitHub emails are verified
                    await user.save();
                }
            } else {
                // Create new user
                user = new this.userModel({
                    email,
                    name: displayName || username,
                    passwordHash: '', // No password for OAuth users
                    emailVerified: true, // GitHub emails are verified
                    roles: ['editor'],
                    profile: {
                        avatar: photos?.[0]?.value
                    },
                    oauthProviders: {
                        github: {
                            id,
                            username
                        }
                    }
                });
                await user.save();
            }

            const userPayload = {
                id: (user._id as Types.ObjectId).toString(),
                email: user.email,
                name: user.name,
                roles: user.roles,
                provider: 'github'
            };

            return done(null, userPayload);
        } catch (error) {
            return done(error as Error, false);
        }
    }
}
