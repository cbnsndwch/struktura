import { Injectable, Logger } from '@nestjs/common';

/**
 * Service for evaluating formula expressions in formula fields
 */
@Injectable()
export class FormulaService {
    private readonly logger = new Logger(FormulaService.name);

    /**
     * Evaluate a formula expression with given context data
     */
    async evaluateFormula(
        formula: string,
        recordData: Record<string, unknown>,
        collectionId: string
    ): Promise<unknown> {
        try {
            // Basic formula evaluation - supports simple expressions and functions
            return this.parseAndEvaluate(formula, recordData);
        } catch (error) {
            this.logger.error(`Failed to evaluate formula: ${formula}`, error);
            return null; // Return null on formula errors to avoid breaking records
        }
    }

    /**
     * Validate a formula expression for syntax and field references
     */
    validateFormula(
        formula: string,
        availableFields: Array<{ name: string; type: string }>
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        try {
            // Check for basic syntax
            if (!formula || formula.trim().length === 0) {
                errors.push('Formula cannot be empty');
            }

            // Check for field references
            const fieldReferences = this.extractFieldReferences(formula);
            for (const fieldRef of fieldReferences) {
                const fieldExists = availableFields.some(f => f.name === fieldRef);
                if (!fieldExists) {
                    errors.push(`Field '${fieldRef}' does not exist`);
                }
            }

            // Try to parse the formula
            this.parseFormula(formula);
        } catch (error) {
            errors.push(`Syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private parseAndEvaluate(formula: string, data: Record<string, unknown>): unknown {
        // Replace field references with actual values
        let processedFormula = formula;
        const fieldReferences = this.extractFieldReferences(formula);
        
        for (const fieldRef of fieldReferences) {
            const value = data[fieldRef];
            const stringValue = this.convertToFormulaValue(value);
            processedFormula = processedFormula.replace(
                new RegExp(`\\{${fieldRef}\\}`, 'g'),
                stringValue
            );
        }

        // Handle basic functions
        processedFormula = this.processFunctions(processedFormula, data);

        // Evaluate mathematical expressions safely
        return this.safeEvaluate(processedFormula);
    }

    private parseFormula(formula: string): void {
        // Basic syntax validation
        const openBraces = (formula.match(/\{/g) || []).length;
        const closeBraces = (formula.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            throw new Error('Mismatched braces in formula');
        }

        // Check for invalid characters (basic security)
        const invalidChars = /[<>]/;
        if (invalidChars.test(formula)) {
            throw new Error('Invalid characters in formula');
        }
    }

    private extractFieldReferences(formula: string): string[] {
        const matches = formula.match(/\{([^}]+)\}/g);
        if (!matches) return [];
        
        return matches.map(match => match.slice(1, -1)); // Remove { and }
    }

    private convertToFormulaValue(value: unknown): string {
        if (value === null || value === undefined) {
            return '0';
        }
        if (typeof value === 'number') {
            return value.toString();
        }
        if (typeof value === 'boolean') {
            return value ? '1' : '0';
        }
        if (typeof value === 'string') {
            // Escape quotes and return as string literal
            return `"${value.replace(/"/g, '\\"')}"`;
        }
        if (value instanceof Date) {
            return value.getTime().toString(); // Convert to timestamp
        }
        return '0';
    }

    private processFunctions(formula: string, data: Record<string, unknown>): string {
        // Handle built-in functions
        let processed = formula;

        // SUM function: SUM({field1}, {field2}, ...)
        processed = processed.replace(
            /SUM\(([^)]+)\)/g,
            (match, args) => {
                const argList = args.split(',').map((arg: string) => arg.trim());
                const sum = argList.reduce((acc: number, arg: string) => {
                    const value = this.parseValue(arg, data);
                    return acc + (typeof value === 'number' ? value : 0);
                }, 0);
                return sum.toString();
            }
        );

        // AVERAGE function: AVERAGE({field1}, {field2}, ...)
        processed = processed.replace(
            /AVERAGE\(([^)]+)\)/g,
            (match, args) => {
                const argList = args.split(',').map((arg: string) => arg.trim());
                const values = argList.map((arg: string) => this.parseValue(arg, data))
                    .filter((v: unknown): v is number => typeof v === 'number');
                const average = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
                return average.toString();
            }
        );

        // IF function: IF(condition, trueValue, falseValue)
        processed = processed.replace(
            /IF\(([^,]+),([^,]+),([^)]+)\)/g,
            (match, condition, trueVal, falseVal) => {
                const conditionResult = this.safeEvaluate(condition.trim());
                return conditionResult ? trueVal.trim() : falseVal.trim();
            }
        );

        return processed;
    }

    private parseValue(arg: string, data: Record<string, unknown>): unknown {
        const trimmed = arg.trim();
        
        // Check if it's a field reference
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const fieldName = trimmed.slice(1, -1);
            return data[fieldName];
        }
        
        // Check if it's a number
        const numValue = parseFloat(trimmed);
        if (!isNaN(numValue)) {
            return numValue;
        }
        
        // Return as string
        return trimmed.replace(/"/g, '');
    }

    private safeEvaluate(expression: string): unknown {
        try {
            // Only allow basic mathematical operations and safe functions
            const allowedChars = /^[0-9+\-*/(). "]+$/;
            if (!allowedChars.test(expression)) {
                throw new Error('Invalid characters in expression');
            }

            // Use Function constructor for safer evaluation than eval
            // Still not completely safe, but better than direct eval
            const func = new Function('return ' + expression);
            return func();
        } catch (error) {
            this.logger.warn(`Failed to evaluate expression: ${expression}`, error);
            return 0;
        }
    }
}