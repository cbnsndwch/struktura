import { Injectable, Logger } from '@nestjs/common';
import jsep, { Expression } from 'jsep';

type Scope = Record<string, unknown>;

export class ExpressionEvaluationError extends Error {}

/**
 * Secure expression evaluator using jsep for safe parsing
 * Avoids unsafe Function constructor and eval
 */
@Injectable()
export class SecureExpressionEvaluatorService {
    private readonly logger = new Logger(SecureExpressionEvaluatorService.name);

    constructor() {
        this.configureJsep();
    }

    /**
     * Configure jsep to only allow safe operators
     */
    private configureJsep(): void {
        // Remove all default operators for security
        jsep.removeAllUnaryOps();
        jsep.removeAllBinaryOps();

        // Allow safe operators and conditional
        jsep.addBinaryOp('===', 10);
        jsep.addBinaryOp('!==', 10);
        jsep.addBinaryOp('==', 10);
        jsep.addBinaryOp('!=', 10);
        jsep.addBinaryOp('>=', 9);
        jsep.addBinaryOp('<=', 9);
        jsep.addBinaryOp('>', 9);
        jsep.addBinaryOp('<', 9);
        jsep.addBinaryOp('&&', 5);
        jsep.addBinaryOp('||', 4);
        jsep.addBinaryOp('+', 6);
        jsep.addBinaryOp('-', 6);
        jsep.addBinaryOp('*', 7);
        jsep.addBinaryOp('/', 7);
        jsep.addBinaryOp('%', 7);

        // Allow unary minus, plus, and not
        jsep.addUnaryOp('-');
        jsep.addUnaryOp('+');
        jsep.addUnaryOp('!');
    }

    /**
     * Safely evaluate an expression with given scope
     */
    safeEvaluate(expression: string, scope: Scope = {}): unknown {
        try {
            // Pre-validation: allow safe characters including quotes, dots, and common operators
            if (!/^[\s\w.<>=!&|()+\-*/%?:"']*$/.test(expression)) {
                throw new ExpressionEvaluationError(
                    'Disallowed characters in expression'
                );
            }

            const ast = jsep(expression);
            return this.evaluateAst(ast, scope);
        } catch (error) {
            this.logger.warn(
                `Failed to evaluate expression: ${expression}`,
                error
            );
            if (error instanceof ExpressionEvaluationError) {
                throw error;
            }
            throw new ExpressionEvaluationError(
                `Expression evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Recursively evaluate AST nodes
     */
    private evaluateAst(node: Expression, scope: Scope): unknown {
        switch (node.type) {
            case 'Literal':
                return (node as any).value;

            case 'Identifier': {
                const name = (node as any).name as string;
                if (!Object.prototype.hasOwnProperty.call(scope, name)) {
                    throw new ExpressionEvaluationError(
                        `Unknown identifier: ${name}`
                    );
                }
                return scope[name];
            }

            case 'UnaryExpression': {
                const { operator, argument } = node as any;
                const value = this.evaluateAst(argument, scope);

                if (operator === '-') {
                    const numValue = this.toNumber(value);
                    return -numValue;
                }

                if (operator === '+') {
                    const numValue = this.toNumber(value);
                    return numValue;
                }

                if (operator === '!') {
                    return !this.isTruthy(value);
                }

                throw new ExpressionEvaluationError(
                    `Unary operator not allowed: ${operator}`
                );
            }

            case 'BinaryExpression': {
                const { operator, left, right } = node as any;
                const leftValue = this.evaluateAst(left, scope);
                const rightValue = this.evaluateAst(right, scope);

                switch (operator) {
                    case '+':
                        return (
                            this.toNumber(leftValue) + this.toNumber(rightValue)
                        );
                    case '-':
                        return (
                            this.toNumber(leftValue) - this.toNumber(rightValue)
                        );
                    case '*':
                        return (
                            this.toNumber(leftValue) * this.toNumber(rightValue)
                        );
                    case '/':
                        if (this.toNumber(rightValue) === 0) {
                            throw new ExpressionEvaluationError(
                                'Division by zero'
                            );
                        }
                        return (
                            this.toNumber(leftValue) / this.toNumber(rightValue)
                        );
                    case '%':
                        if (this.toNumber(rightValue) === 0) {
                            throw new ExpressionEvaluationError(
                                'Modulo by zero'
                            );
                        }
                        return (
                            this.toNumber(leftValue) % this.toNumber(rightValue)
                        );
                    case '===':
                        return leftValue === rightValue;
                    case '!==':
                        return leftValue !== rightValue;
                    case '>':
                        return (
                            this.toNumber(leftValue) > this.toNumber(rightValue)
                        );
                    case '<':
                        return (
                            this.toNumber(leftValue) < this.toNumber(rightValue)
                        );
                    case '>=':
                        return (
                            this.toNumber(leftValue) >=
                            this.toNumber(rightValue)
                        );
                    case '<=':
                        return (
                            this.toNumber(leftValue) <=
                            this.toNumber(rightValue)
                        );
                    case '==':
                        return leftValue == rightValue;
                    case '!=':
                        return leftValue != rightValue;
                    case '&&':
                        return (
                            this.isTruthy(leftValue) &&
                            this.isTruthy(rightValue)
                        );
                    case '||':
                        return (
                            this.isTruthy(leftValue) ||
                            this.isTruthy(rightValue)
                        );
                    default:
                        throw new ExpressionEvaluationError(
                            `Binary operator not allowed: ${operator}`
                        );
                }
            }

            case 'LogicalExpression': {
                const { operator, left, right } = node as any;

                if (operator === '&&') {
                    const leftTruthy = this.isTruthy(
                        this.evaluateAst(left, scope)
                    );
                    return leftTruthy
                        ? this.isTruthy(this.evaluateAst(right, scope))
                        : false;
                }

                if (operator === '||') {
                    const leftTruthy = this.isTruthy(
                        this.evaluateAst(left, scope)
                    );
                    return leftTruthy
                        ? true
                        : this.isTruthy(this.evaluateAst(right, scope));
                }

                throw new ExpressionEvaluationError(
                    `Logical operator not allowed: ${operator}`
                );
            }

            case 'ConditionalExpression': {
                const { test, consequent, alternate } = node as any;
                const testValue = this.evaluateAst(test, scope);

                if (this.isTruthy(testValue)) {
                    return this.evaluateAst(consequent, scope);
                } else {
                    return this.evaluateAst(alternate, scope);
                }
            }

            // Explicitly block dangerous operations
            case 'MemberExpression':
            case 'CallExpression':
                throw new ExpressionEvaluationError(
                    `Operation not allowed: ${node.type}`
                );

            default:
                throw new ExpressionEvaluationError(
                    `Unsupported node type: ${node.type}`
                );
        }
    }

    /**
     * Convert value to number with validation
     */
    private toNumber(value: unknown): number {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (Number.isFinite(num)) {
                return num;
            }
        }
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        if (value === null || value === undefined) {
            return 0;
        }
        throw new ExpressionEvaluationError(
            `Expected a finite number, got: ${typeof value}`
        );
    }

    /**
     * Determine truthiness of a value
     */
    private isTruthy(value: unknown): boolean {
        return !!value;
    }

    /**
     * Validate an expression for syntax errors
     */
    validateExpression(
        expression: string,
        availableIdentifiers: string[] = []
    ): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        try {
            // Pre-validation: allow safe characters including quotes, dots, and common operators
            if (!/^[\s\w.<>=!&|()+\-*/%?:"']*$/.test(expression)) {
                errors.push('Expression contains disallowed characters');
            }

            // Check for obvious syntax errors before parsing
            // Look for specific invalid patterns like "2 + + 3"
            if (
                /\d\s*\+\s*\+\s*\d/.test(expression) ||
                /\+\s*\+\s*\d/.test(expression)
            ) {
                errors.push('Syntax error: Invalid consecutive plus operators');
            }

            // Parse to check syntax
            const ast = jsep(expression);

            // Check for valid identifiers
            const usedIdentifiers = this.extractIdentifiers(ast);
            for (const identifier of usedIdentifiers) {
                if (!availableIdentifiers.includes(identifier)) {
                    errors.push(`Unknown identifier: ${identifier}`);
                }
            }

            // Check for dangerous operations
            this.validateAstSafety(ast, errors);
        } catch (error) {
            errors.push(
                `Syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Extract all identifiers from AST
     */
    private extractIdentifiers(node: Expression): string[] {
        const identifiers: string[] = [];

        const traverse = (n: Expression) => {
            if (n.type === 'Identifier') {
                identifiers.push((n as any).name);
            } else if (n.type === 'UnaryExpression') {
                traverse((n as any).argument);
            } else if (
                n.type === 'BinaryExpression' ||
                n.type === 'LogicalExpression'
            ) {
                traverse((n as any).left);
                traverse((n as any).right);
            } else if (n.type === 'ConditionalExpression') {
                traverse((n as any).test);
                traverse((n as any).consequent);
                traverse((n as any).alternate);
            }
        };

        traverse(node);
        return [...new Set(identifiers)]; // Remove duplicates
    }

    /**
     * Validate AST for security issues
     */
    private validateAstSafety(node: Expression, errors: string[]): void {
        const traverse = (n: Expression) => {
            if (n.type === 'MemberExpression' || n.type === 'CallExpression') {
                errors.push(`Unsafe operation detected: ${n.type}`);
                return;
            }

            if (n.type === 'UnaryExpression') {
                traverse((n as any).argument);
            } else if (
                n.type === 'BinaryExpression' ||
                n.type === 'LogicalExpression'
            ) {
                traverse((n as any).left);
                traverse((n as any).right);
            } else if (n.type === 'ConditionalExpression') {
                traverse((n as any).test);
                traverse((n as any).consequent);
                traverse((n as any).alternate);
            }
        };

        traverse(node);
    }
}
