import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsEnum, IsDate, IsOptional } from 'class-validator';

import { WorkspaceRole } from '@cbnsndwch/struktura-workspace-contracts';

@ObjectType()
export class WorkspaceMember {
    @Field(() => ID)
    user!: string;

    @Field(() => WorkspaceRole)
    @IsEnum(WorkspaceRole)
    role!: WorkspaceRole;

    @Field()
    @IsDate()
    invitedAt!: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    joinedAt?: Date;
}
