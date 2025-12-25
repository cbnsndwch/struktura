import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Collection, CollectionSchema } from './entities/collection.entity.js';
import { Record, RecordSchema } from './entities/record.entity.js';
import {
    CollectionService,
    FormulaService,
    LookupService,
    FieldTypeService,
    AutoFieldService,
    SecureExpressionEvaluatorService,
    RecordService
} from './services/index.js';
import {
    CollectionsController,
    RecordsController
} from './controllers/index.js';
import { CollectionResolver } from './resolvers/collection.resolver.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Collection.name, schema: CollectionSchema },
            { name: Record.name, schema: RecordSchema }
        ])
    ],
    controllers: [CollectionsController, RecordsController],
    providers: [
        CollectionService,
        RecordService,
        FormulaService,
        LookupService,
        FieldTypeService,
        AutoFieldService,
        SecureExpressionEvaluatorService,
        CollectionResolver
    ],
    exports: [
        CollectionService,
        RecordService,
        FormulaService,
        LookupService,
        FieldTypeService,
        AutoFieldService,
        SecureExpressionEvaluatorService
    ]
})
export class CollectionsModule {}
