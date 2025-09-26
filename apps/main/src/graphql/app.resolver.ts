import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
    @Query(() => String)
    hello(): string {
        return 'Hello from Struktura GraphQL API!';
    }

    @Query(() => String)
    health(): string {
        return 'OK';
    }
}