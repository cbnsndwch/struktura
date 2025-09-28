import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Collection, CollectionSchema } from './entities/collection.entity.js';
import {
    CollectionService,
    FormulaService,
    LookupService,
    FieldTypeService,
    AutoFieldService
} from './services/index.js';
import { CollectionsController } from './controllers/collections.controller.js';
import { CollectionResolver } from './resolvers/collection.resolver.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Collection.name, schema: CollectionSchema }
        ])
    ],
    controllers: [CollectionsController],
    providers: [
        CollectionService,
        FormulaService,
        LookupService,
        FieldTypeService,
        AutoFieldService,
        CollectionResolver
    ],
    exports: [
        CollectionService,
        FormulaService,
        LookupService,
        FieldTypeService,
        AutoFieldService
    ]
})
export class CollectionsModule {}
