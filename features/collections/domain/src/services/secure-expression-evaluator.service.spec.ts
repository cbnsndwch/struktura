import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { SecureExpressionEvaluatorService, ExpressionEvaluationError } from './secure-expression-evaluator.service.js';

describe('SecureExpressionEvaluatorService', () => {
    let service: SecureExpressionEvaluatorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SecureExpressionEvaluatorService]
        }).compile();

        service = module.get<SecureExpressionEvaluatorService>(SecureExpressionEvaluatorService);
    });

    describe('safeEvaluate', () => {
        it('should evaluate basic mathematical expressions', () => {
            expect(service.safeEvaluate('2 + 3')).toBe(5);
            expect(service.safeEvaluate('10 - 4')).toBe(6);
            expect(service.safeEvaluate('3 * 4')).toBe(12);
            expect(service.safeEvaluate('15 / 3')).toBe(5);
            expect(service.safeEvaluate('17 % 5')).toBe(2);
        });

        it('should evaluate expressions with variables', () => {
            const scope = { x: 10, y: 5 };
            
            expect(service.safeEvaluate('x + y', scope)).toBe(15);
            expect(service.safeEvaluate('x * y', scope)).toBe(50);
            expect(service.safeEvaluate('x / y', scope)).toBe(2);
        });

        it('should handle parentheses correctly', () => {
            const scope = { a: 2, b: 3, c: 4 };
            
            expect(service.safeEvaluate('(a + b) * c', scope)).toBe(20);
            expect(service.safeEvaluate('a + (b * c)', scope)).toBe(14);
        });

        it('should handle comparison operators', () => {
            const scope = { x: 10, y: 5 };
            
            expect(service.safeEvaluate('x > y', scope)).toBe(true);
            expect(service.safeEvaluate('x < y', scope)).toBe(false);
            expect(service.safeEvaluate('x >= y', scope)).toBe(true);
            expect(service.safeEvaluate('x <= y', scope)).toBe(false);
            expect(service.safeEvaluate('x === y', scope)).toBe(false);
            expect(service.safeEvaluate('x !== y', scope)).toBe(true);
        });

        it('should handle logical operators', () => {
            const scope = { a: true, b: false };
            
            expect(service.safeEvaluate('a && b', scope)).toBe(false);
            expect(service.safeEvaluate('a || b', scope)).toBe(true);
        });

        it('should handle unary minus', () => {
            const scope = { x: 5 };
            
            expect(service.safeEvaluate('-x', scope)).toBe(-5);
            expect(service.safeEvaluate('-(x + 3)', scope)).toBe(-8);
        });

        it('should throw error for division by zero', () => {
            expect(() => service.safeEvaluate('10 / 0')).toThrow(ExpressionEvaluationError);
            expect(() => service.safeEvaluate('10 % 0')).toThrow(ExpressionEvaluationError);
        });

        it('should throw error for unknown variables', () => {
            expect(() => service.safeEvaluate('unknownVar + 5')).toThrow(ExpressionEvaluationError);
        });

        it('should throw error for unsafe operations', () => {
            expect(() => service.safeEvaluate('Math.max(1, 2)')).toThrow(ExpressionEvaluationError);
            expect(() => service.safeEvaluate('window.alert("test")')).toThrow(ExpressionEvaluationError);
            expect(() => service.safeEvaluate('obj.property')).toThrow(ExpressionEvaluationError);
        });

        it('should throw error for disallowed characters', () => {
            expect(() => service.safeEvaluate('2 + 3; console.log("hack")')).toThrow(ExpressionEvaluationError);
            expect(() => service.safeEvaluate('eval("malicious code")')).toThrow(ExpressionEvaluationError);
        });

        it('should handle string values in scope', () => {
            const scope = { str: 'hello' };
            
            // String comparison should work
            expect(service.safeEvaluate('str === "hello"', scope)).toBe(true);
            expect(service.safeEvaluate('str !== "world"', scope)).toBe(true);
        });

        it('should convert string numbers to numbers for arithmetic', () => {
            const scope = { strNum: '5' };
            
            expect(service.safeEvaluate('strNum + 3', scope)).toBe(8);
            expect(service.safeEvaluate('strNum * 2', scope)).toBe(10);
        });
    });

    describe('validateExpression', () => {
        it('should validate correct expressions', () => {
            const result = service.validateExpression('x + y * 2', ['x', 'y']);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect unknown identifiers', () => {
            const result = service.validateExpression('a + unknownVar', ['a']);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Unknown identifier: unknownVar');
        });

        it('should detect disallowed characters', () => {
            const result = service.validateExpression('2 + 3; alert("test")', []);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('disallowed characters'))).toBe(true);
        });

        it('should detect unsafe operations', () => {
            const result = service.validateExpression('Math.max(1, 2)', []);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('CallExpression'))).toBe(true);
        });

        it('should handle syntax errors', () => {
            const result = service.validateExpression('2 + + 3', []);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('Syntax error'))).toBe(true);
        });

        it('should validate complex expressions', () => {
            const identifiers = ['price', 'quantity', 'discount'];
            const result = service.validateExpression(
                '(price * quantity) - (price * quantity * discount)',
                identifiers
            );
            expect(result.isValid).toBe(true);
        });
    });

    describe('security tests', () => {
        it('should prevent code injection attempts', () => {
            const maliciousExpressions = [
                'constructor.constructor("return process")().exit()',
                '__proto__.constructor.constructor("return process")().exit()',
                'this.constructor.constructor("return process")().exit()',
                'global.process.exit()',
                'process.exit()',
                'require("fs").readFileSync("/etc/passwd")',
                'new Function("return process")().exit()'
            ];

            maliciousExpressions.forEach(expr => {
                expect(() => service.safeEvaluate(expr)).toThrow();
            });
        });

        it('should prevent property access', () => {
            const scope = { obj: { dangerous: 'value' } };
            
            expect(() => service.safeEvaluate('obj.dangerous', scope)).toThrow(ExpressionEvaluationError);
            expect(() => service.safeEvaluate('obj["dangerous"]', scope)).toThrow(ExpressionEvaluationError);
        });

        it('should prevent function calls', () => {
            expect(() => service.safeEvaluate('alert("test")')).toThrow(ExpressionEvaluationError);
            expect(() => service.safeEvaluate('console.log("test")')).toThrow(ExpressionEvaluationError);
            expect(() => service.safeEvaluate('Math.random()')).toThrow(ExpressionEvaluationError);
        });
    });

    describe('edge cases', () => {
        it('should handle empty expressions', () => {
            expect(() => service.safeEvaluate('')).toThrow();
        });

        it('should handle whitespace', () => {
            expect(service.safeEvaluate('  2 + 3  ')).toBe(5);
        });

        it('should handle complex nested expressions', () => {
            const scope = { a: 1, b: 2, c: 3, d: 4 };
            const result = service.safeEvaluate('((a + b) * (c + d)) / (a + b + c)', scope);
            expect(result).toBe((3 * 7) / 6);
        });

        it('should handle boolean values correctly', () => {
            const scope = { isActive: true, isDisabled: false };
            
            expect(service.safeEvaluate('isActive && !isDisabled', scope)).toBe(true);
            expect(service.safeEvaluate('isActive || isDisabled', scope)).toBe(true);
        });
    });
});