import bcrypt from 'bcrypt';

export class PasswordHash {
    constructor(private readonly hash: string) {
        if (!hash || hash.length < 10) {
            throw new Error('Invalid password hash');
        }
    }

    getValue(): string {
        return this.hash;
    }

    static async create(
        plainPassword: string,
        saltRounds = 12
    ): Promise<PasswordHash> {
        const hash = await bcrypt.hash(plainPassword, saltRounds);
        return new PasswordHash(hash);
    }

    async verify(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.hash);
    }
}
