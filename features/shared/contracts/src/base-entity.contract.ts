// Base entity interfaces

export interface IEntityBase {
    id: string;

    createdAt: Date;
    createdBy: Date;

    updatedAt: Date;
    updatedBy: Date;

    deletedAt?: Date;
    deletedBy?: Date;
}
