/**
 * Cell editor components for different field types
 */
import { useState, useEffect, useRef } from 'react';
import { FieldType } from '@cbnsndwch/struktura-schema-contracts';
import type { FieldDefinition } from '@cbnsndwch/struktura-collections-contracts';
import {
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Checkbox
} from '@cbnsndwch/struktura-shared-ui';

export interface CellEditorProps {
    field: FieldDefinition;
    value: unknown;
    onChange: (value: unknown) => void;
    onCommit: () => void;
    onCancel: () => void;
}

export function CellEditor({
    field,
    value,
    onChange,
    onCommit,
    onCancel
}: CellEditorProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onCommit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            onCommit();
            // TODO: Move to next cell
        }
    };

    switch (field.type) {
        case FieldType.TEXT:
        case FieldType.EMAIL:
        case FieldType.URL:
        case FieldType.PHONE:
            return (
                <Input
                    ref={inputRef}
                    type={
                        field.type === FieldType.EMAIL
                            ? 'email'
                            : field.type === FieldType.URL
                              ? 'url'
                              : field.type === FieldType.PHONE
                                ? 'tel'
                                : 'text'
                    }
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onCommit}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full px-2 py-1 border-2 border-blue-500 outline-none rounded-none"
                />
            );

        case FieldType.NUMBER:
        case FieldType.CURRENCY:
        case FieldType.PERCENT:
            return (
                <Input
                    ref={inputRef}
                    type="number"
                    step={field.type === FieldType.PERCENT ? 0.01 : 'any'}
                    value={(value as number) || ''}
                    onChange={(e) =>
                        onChange(
                            e.target.value === ''
                                ? null
                                : parseFloat(e.target.value)
                        )
                    }
                    onBlur={onCommit}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full px-2 py-1 border-2 border-blue-500 outline-none rounded-none"
                />
            );

        case FieldType.DATE:
            return (
                <Input
                    ref={inputRef}
                    type="date"
                    value={
                        value
                            ? new Date(value as string)
                                  .toISOString()
                                  .split('T')[0]
                            : ''
                    }
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onCommit}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full px-2 py-1 border-2 border-blue-500 outline-none rounded-none"
                />
            );

        case FieldType.DATETIME:
            return (
                <Input
                    ref={inputRef}
                    type="datetime-local"
                    value={
                        value
                            ? new Date(value as string)
                                  .toISOString()
                                  .slice(0, 16)
                            : ''
                    }
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onCommit}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full px-2 py-1 border-2 border-blue-500 outline-none rounded-none"
                />
            );

        case FieldType.BOOLEAN:
            return (
                <div className="flex items-center justify-center h-full">
                    <Checkbox
                        checked={!!value}
                        onCheckedChange={(checked) => {
                            onChange(checked);
                            onCommit();
                        }}
                        autoFocus
                    />
                </div>
            );

        case FieldType.SELECT:
            if (!field.options?.choices) {
                return (
                    <Input
                        ref={inputRef}
                        type="text"
                        value={(value as string) || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onCommit}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full px-2 py-1 border-2 border-blue-500 outline-none rounded-none"
                    />
                );
            }

            return (
                <Select
                    value={(value as string) || ''}
                    onValueChange={(newValue) => {
                        onChange(newValue);
                        onCommit();
                    }}
                >
                    <SelectTrigger className="w-full border-2 border-blue-500 rounded-none">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.choices.map((choice) => (
                            <SelectItem key={choice.value} value={choice.value}>
                                {choice.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        // For unsupported types, use text input as fallback
        default:
            return (
                <Input
                    ref={inputRef}
                    type="text"
                    value={String(value || '')}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onCommit}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full px-2 py-1 border-2 border-blue-500 outline-none rounded-none"
                />
            );
    }
}
