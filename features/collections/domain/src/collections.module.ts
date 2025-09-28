import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Collection, CollectionSchema } from './entities/collection.entity.js';
import {
    CollectionService,
    FormulaService,
    LookupService,
    FieldTypeService,
    AutoFieldService,
    SecureExpressionEvaluatorService
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
        SecureExpressionEvaluatorService,
        CollectionResolver
    ],
    exports: [
        CollectionService,
        FormulaService,
        LookupService,
        FieldTypeService,
        AutoFieldService,
        SecureExpressionEvaluatorService
    ]
})
export class CollectionsModule {}
