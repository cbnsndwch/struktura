import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class MonitoringResolver {
    @Query(() => String)
    health(): string {
        return 'OK';
    }
}
