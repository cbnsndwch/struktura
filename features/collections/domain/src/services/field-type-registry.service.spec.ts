import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { FieldType } from '@cbnsndwch/struktura-schema-contracts';
import { FieldTypeService } from './field-type-registry.service.js';

describe('FieldTypeService', () => {
    let service: FieldTypeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FieldTypeService]
        }).compile();

        service = module.get<FieldTypeService>(FieldTypeService);
    });

    describe('getFieldTypeCapabilities', () => {
        it('should return capabilities for TEXT field', () => {
            const capabilities = service.getFieldTypeCapabilities(FieldType.TEXT);
            
            expect(capabilities).toBeDefined();
            expect(capabilities?.supportsValidation).toBe(true);
            expect(capabilities?.supportsDefaultValue).toBe(true);
            expect(capabilities?.isComputed).toBe(false);
            expect(capabilities?.category).toBe('basic');
        });

        it('should return capabilities for FORMULA field', () => {
            const capabilities = service.getFieldTypeCapabilities(FieldType.FORMULA);
            
            expect(capabilities).toBeDefined();
            expect(capabilities?.isComputed).toBe(true);
            expect(capabilities?.requiresProcessing).toBe(true);
            expect(capabilities?.category).toBe('computed');
        });

        it('should return null for unknown field type', () => {
            const capabilities = service.getFieldTypeCapabilities('UNKNOWN' as FieldType);
            expect(capabilities).toBeNull();
        });
    });

    describe('getAllFieldTypes', () => {
        it('should return all registered field types', () => {
            const allTypes = service.getAllFieldTypes();
            
            expect(allTypes.length).toBeGreaterThan(0);
            expect(allTypes.some(t => t.type === FieldType.TEXT)).toBe(true);
            expect(allTypes.some(t => t.type === FieldType.FORMULA)).toBe(true);
            expect(allTypes.some(t => t.type === FieldType.LOOKUP)).toBe(true);
        });
    });

    describe('getFieldTypesByCategory', () => {
        it('should return basic field types', () => {
            const basicTypes = service.getFieldTypesByCategory('basic');
            
            expect(basicTypes).toContain(FieldType.TEXT);
            expect(basicTypes).toContain(FieldType.NUMBER);
            expect(basicTypes).toContain(FieldType.BOOLEAN);
        });

        it('should return computed field types', () => {
            const computedTypes = service.getFieldTypesByCategory('computed');
            
            expect(computedTypes).toContain(FieldType.FORMULA);
            expect(computedTypes).toContain(FieldType.CREATED_TIME);
            expect(computedTypes).toContain(FieldType.AUTO_INCREMENT);
        });

        it('should return relationship field types', () => {
            const relationshipTypes = service.getFieldTypesByCategory('relationship');
            
            expect(relationshipTypes).toContain(FieldType.REFERENCE);
            expect(relationshipTypes).toContain(FieldType.LOOKUP);
            expect(relationshipTypes).toContain(FieldType.ROLLUP);
        });
    });

    describe('supportsCapability', () => {
        it('should return true for TEXT supporting validation', () => {
            const supports = service.supportsCapability(FieldType.TEXT, 'supportsValidation');
            expect(supports).toBe(true);
        });

        it('should return false for FORMULA supporting validation', () => {
            const supports = service.supportsCapability(FieldType.FORMULA, 'supportsValidation');
            expect(supports).toBe(false);
        });

        it('should return true for CREATED_TIME being computed', () => {
            const supports = service.supportsCapability(FieldType.CREATED_TIME, 'isComputed');
            expect(supports).toBe(true);
        });
    });

    describe('processFieldValue', () => {
        it('should process CREATED_TIME field value', async () => {
            const processedValue = await service.processFieldValue(FieldType.CREATED_TIME, null);
            // Since CREATED_TIME doesn't have a processValue handler, it should return the original value
            expect(processedValue).toBeNull();
        });

        it('should return original value for fields without handlers', async () => {
            const originalValue = 'test value';
            const processedValue = await service.processFieldValue(FieldType.TEXT, originalValue);
            expect(processedValue).toBe(originalValue);
        });
    });

    describe('validateFieldValue', () => {
        it('should validate CURRENCY field with valid value', () => {
            const result = service.validateFieldValue(FieldType.CURRENCY, 100.50, { min: 0, max: 1000 });
            expect(result.isValid).toBe(true);
        });

        it('should validate CURRENCY field with invalid value', () => {
            const result = service.validateFieldValue(FieldType.CURRENCY, 'invalid', { min: 0, max: 1000 });
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should validate CURRENCY field below minimum', () => {
            const result = service.validateFieldValue(FieldType.CURRENCY, -10, { min: 0, max: 1000 });
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('at least');
        });

        it('should return valid for fields without validation handlers', () => {
            const result = service.validateFieldValue(FieldType.TEXT, 'any value');
            expect(result.isValid).toBe(true);
        });
    });

    describe('generateDefaultValue', () => {
        it('should generate default value for CREATED_TIME', () => {
            const defaultValue = service.generateDefaultValue(FieldType.CREATED_TIME);
            expect(defaultValue).toBeInstanceOf(Date);
        });

        it('should return null for fields without default value generators', () => {
            const defaultValue = service.generateDefaultValue(FieldType.TEXT);
            expect(defaultValue).toBeNull();
        });
    });

    describe('formatFieldValue', () => {
        it('should format CREATED_TIME field value', () => {
            const date = new Date('2024-01-01T12:00:00Z');
            const formatted = service.formatFieldValue(FieldType.CREATED_TIME, date, { displayFormat: 'YYYY-MM-DD' });
            expect(formatted).toBe('2024-01-01');
        });

        it('should format CURRENCY field value', () => {
            const formatted = service.formatFieldValue(FieldType.CURRENCY, 1234.56, { currency: 'USD', precision: 2 });
            expect(formatted).toMatch(/\$1,234\.56/);
        });

        it('should return string representation for fields without formatters', () => {
            const formatted = service.formatFieldValue(FieldType.TEXT, 'test value');
            expect(formatted).toBe('test value');
        });

        it('should handle null/undefined values', () => {
            const formatted = service.formatFieldValue(FieldType.TEXT, null);
            expect(formatted).toBe('');
        });
    });
});