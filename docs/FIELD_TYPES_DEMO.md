# Dynamic Field Types System Demo

This document demonstrates the new Dynamic Field Types System implemented for Struktura.

## Overview

The Dynamic Field Types System extends Struktura's schema management capabilities with advanced field types including formula fields, lookup fields, auto-generated fields, and enhanced file attachment support.

## New Field Types Implemented

### 1. Formula Fields

Formula fields automatically calculate values based on other fields using mathematical expressions and functions.

**Example Usage:**
```typescript
// Create a collection with formula fields
const collection = await collectionService.create({
  name: 'Sales Orders',
  workspaceId: 'workspace-123',
  fields: [
    {
      name: 'quantity',
      type: FieldType.NUMBER,
      required: true
    },
    {
      name: 'unitPrice',
      type: FieldType.CURRENCY,
      required: true,
      options: {
        currency: 'USD',
        precision: 2
      }
    },
    {
      name: 'totalAmount',
      type: FieldType.FORMULA,
      options: {
        formula: '{quantity} * {unitPrice}'
      }
    },
    {
      name: 'averageItemValue',
      type: FieldType.FORMULA,
      options: {
        formula: 'AVERAGE({unitPrice}, {discountPrice})'
      }
    }
  ]
});
```

**Supported Functions:**
- `SUM(field1, field2, ...)` - Add multiple values
- `AVERAGE(field1, field2, ...)` - Calculate average
- `IF(condition, trueValue, falseValue)` - Conditional logic
- Basic mathematical operations: `+`, `-`, `*`, `/`

### 2. Lookup Fields

Lookup fields display values from related records in other collections.

**Example Usage:**
```typescript
// Create a collection with lookup fields
const collection = await collectionService.create({
  name: 'Orders',
  workspaceId: 'workspace-123',
  fields: [
    {
      name: 'customerId',
      type: FieldType.REFERENCE,
      required: true,
      options: {
        referencedCollection: 'customers'
      }
    },
    {
      name: 'customerName',
      type: FieldType.LOOKUP,
      options: {
        lookupCollection: 'customers',
        lookupField: 'customerId',
        displayField: 'name'
      }
    },
    {
      name: 'customerEmail',
      type: FieldType.LOOKUP,
      options: {
        lookupCollection: 'customers',
        lookupField: 'customerId',
        displayField: 'email'
      }
    }
  ]
});
```

### 3. Auto-Generated Fields

Auto-generated fields are automatically populated with system-generated values.

**Example Usage:**
```typescript
const collection = await collectionService.create({
  name: 'Documents',
  workspaceId: 'workspace-123',
  fields: [
    {
      name: 'title',
      type: FieldType.TEXT,
      required: true
    },
    {
      name: 'documentNumber',
      type: FieldType.AUTO_INCREMENT,
      options: {
        startValue: 1000,
        increment: 1
      }
    },
    {
      name: 'createdAt',
      type: FieldType.CREATED_TIME,
      options: {
        displayFormat: 'YYYY-MM-DD HH:mm'
      }
    },
    {
      name: 'updatedAt',
      type: FieldType.MODIFIED_TIME,
      options: {
        displayFormat: 'YYYY-MM-DD HH:mm'
      }
    },
    {
      name: 'createdBy',
      type: FieldType.CREATED_BY
    },
    {
      name: 'lastModifiedBy',
      type: FieldType.MODIFIED_BY
    }
  ]
});
```

### 4. Enhanced File Fields

File fields now support comprehensive validation and metadata options.

**Example Usage:**
```typescript
const collection = await collectionService.create({
  name: 'Media Library',
  workspaceId: 'workspace-123',
  fields: [
    {
      name: 'document',
      type: FieldType.ATTACHMENT,
      options: {
        allowedTypes: ['pdf', 'doc', 'docx', 'txt'],
        maxSize: 10485760, // 10MB in bytes
        helpText: 'Upload documents up to 10MB'
      }
    },
    {
      name: 'profileImage',
      type: FieldType.IMAGE,
      options: {
        allowedTypes: ['jpg', 'jpeg', 'png', 'gif'],
        maxSize: 5242880, // 5MB in bytes
        helpText: 'Upload images up to 5MB'
      }
    }
  ]
});
```

## Field Type Registry

The new Field Type Registry provides centralized management of all field types and their capabilities:

```typescript
// Get field type capabilities
const fieldTypeService = new FieldTypeService();

// Check what a field type supports
const capabilities = fieldTypeService.getFieldTypeCapabilities(FieldType.FORMULA);
console.log({
  supportsValidation: capabilities.supportsValidation, // false
  isComputed: capabilities.isComputed, // true
  requiresProcessing: capabilities.requiresProcessing, // true
  category: capabilities.category // 'computed'
});

// Get all field types by category
const computedTypes = fieldTypeService.getFieldTypesByCategory('computed');
// Returns: [FORMULA, AUTO_INCREMENT, CREATED_TIME, MODIFIED_TIME, CREATED_BY, MODIFIED_BY]

const basicTypes = fieldTypeService.getFieldTypesByCategory('basic');
// Returns: [TEXT, NUMBER, BOOLEAN, DATE, DATETIME, EMAIL, URL, etc.]

// Process field values
const processedValue = await fieldTypeService.processFieldValue(
  FieldType.CURRENCY,
  1234.56,
  { currency: 'USD', precision: 2 }
);

// Validate field values
const validation = fieldTypeService.validateFieldValue(
  FieldType.CURRENCY,
  "invalid",
  { min: 0, max: 1000 }
);
console.log(validation); // { isValid: false, error: 'Invalid curry value' }
```

## Formula Evaluation Examples

```typescript
const formulaService = new FormulaService();

// Simple mathematical operations
await formulaService.evaluateFormula(
  '{price} * {quantity}',
  { price: 10, quantity: 5 }
); // Returns: 50

// Using functions
await formulaService.evaluateFormula(
  'SUM({value1}, {value2}, {value3})',
  { value1: 10, value2: 20, value3: 30 }
); // Returns: 60

await formulaService.evaluateFormula(
  'AVERAGE({score1}, {score2}, {score3})',
  { score1: 85, score2: 90, score3: 95 }
); // Returns: 90

// Formula validation
const validation = formulaService.validateFormula(
  '{price} * {quantity}',
  [
    { name: 'price', type: 'number' },
    { name: 'quantity', type: 'number' }
  ]
);
console.log(validation); // { isValid: true, errors: [] }
```

## Auto Field Generation

```typescript
const autoFieldService = new AutoFieldService();

// Generate values for new records
const autoValues = await autoFieldService.generateAutoFields(
  [
    { name: 'createdAt', type: FieldType.CREATED_TIME },
    { name: 'createdBy', type: FieldType.CREATED_BY },
    { name: 'docNumber', type: FieldType.AUTO_INCREMENT, options: { startValue: 1000 } }
  ],
  'user-123' // User ID
);
console.log(autoValues);
// Returns: { createdAt: Date, createdBy: 'user-123', docNumber: 1000 }

// Update values for modified records
const updateValues = await autoFieldService.updateAutoFields(
  [
    { name: 'updatedAt', type: FieldType.MODIFIED_TIME },
    { name: 'modifiedBy', type: FieldType.MODIFIED_BY }
  ],
  'user-456',
  existingData
);
console.log(updateValues);
// Returns: { updatedAt: Date, modifiedBy: 'user-456' }
```

## Lookup Field Resolution

```typescript
const lookupService = new LookupService();

// Resolve lookup values for a record
const resolvedData = await lookupService.resolveLookupFields(
  'orders-collection',
  { customerId: 'cust-123', orderTotal: 500 },
  [
    {
      name: 'customerId',
      lookupCollection: 'customers',
      lookupField: 'id',
      displayField: 'name'
    }
  ]
);
console.log(resolvedData);
// Returns: { customerId: 'cust-123', orderTotal: 500, customerId_resolved: 'John Smith' }

// Validate lookup configuration
const validation = await lookupService.validateLookupField(
  'source-collection',
  'target-collection',
  'lookupField',
  'displayField'
);
console.log(validation); // { isValid: true, errors: [] }
```

## Integration with Collection Service

The new field types integrate seamlessly with the existing collection service:

```typescript
const collectionService = new CollectionService();

// Create collection with advanced field types
const collection = await collectionService.create({
  name: 'Advanced Collection',
  workspaceId: 'workspace-123',
  fields: [
    { name: 'title', type: FieldType.TEXT, required: true },
    { name: 'price', type: FieldType.CURRENCY, options: { currency: 'USD' } },
    { name: 'quantity', type: FieldType.NUMBER, required: true },
    { name: 'total', type: FieldType.FORMULA, options: { formula: '{price} * {quantity}' } },
    { name: 'createdAt', type: FieldType.CREATED_TIME },
    { name: 'createdBy', type: FieldType.CREATED_BY }
  ]
});

// Add formula field to existing collection
await collectionService.addField(collection.id, {
  name: 'discountedTotal',
  type: FieldType.FORMULA,
  options: {
    formula: '{total} * 0.9' // 10% discount
  }
});
```

## Error Handling

All services include comprehensive error handling:

```typescript
// Formula validation errors
const validation = formulaService.validateFormula(
  '{nonexistent} * 2',
  [{ name: 'price', type: 'number' }]
);
console.log(validation);
// Returns: { isValid: false, errors: ["Field 'nonexistent' does not exist"] }

// Lookup validation errors
const lookupValidation = await lookupService.validateLookupField(
  'source',
  'nonexistent-target',
  'field',
  'display'
);
console.log(lookupValidation);
// Returns: { isValid: false, errors: ["Target collection nonexistent-target does not exist"] }

// Auto field configuration errors
const autoValidation = autoFieldService.validateAutoFieldConfiguration(
  FieldType.AUTO_INCREMENT,
  { startValue: -1 }
);
console.log(autoValidation);
// Returns: { isValid: false, errors: ["Start value must be a non-negative integer"] }
```

## Performance Considerations

- **Formula Evaluation**: Cached and optimized for common expressions
- **Lookup Resolution**: Supports batch processing for multiple records
- **Auto Field Generation**: Minimal overhead with intelligent update detection
- **Field Type Registry**: In-memory caching of capabilities and handlers

## Future Enhancements

- Enhanced formula engine with more mathematical and string functions
- Real-time lookup field updates when referenced data changes
- Advanced file processing with thumbnail generation
- Rollup fields with aggregation functions (SUM, COUNT, MIN, MAX)
- Custom field type plugins for extensibility

This implementation provides a solid foundation for advanced field types while maintaining the flexibility to extend with additional capabilities as needed.