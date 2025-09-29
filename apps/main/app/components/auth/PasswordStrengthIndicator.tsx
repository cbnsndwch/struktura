import { useMemo } from 'react';

import { Progress } from '@cbnsndwch/struktura-shared-ui';

import { calculatePasswordStrength } from '../../lib/validations/auth.js';

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({
    password
}: PasswordStrengthIndicatorProps) {
    const { score, label, color } = useMemo(
        () => calculatePasswordStrength(password),
        [password]
    );
    const percentage = useMemo(
        () => (password ? (score / 6) * 100 : 0),
        [password, score]
    );

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Password strength</span>
                <span className={color}>{label}</span>
            </div>
            <Progress
                value={percentage}
                className="h-2"
                data-testid="password-strength-progress"
            />
            {password && (
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>Password should contain:</p>
                    <ul className="space-y-0.5 ml-2">
                        <li
                            className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}
                        >
                            <span className="text-xs">
                                {password.length >= 8 ? '✓' : '○'}
                            </span>
                            At least 8 characters
                        </li>
                        <li
                            className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}
                        >
                            <span className="text-xs">
                                {/[a-z]/.test(password) ? '✓' : '○'}
                            </span>
                            One lowercase letter
                        </li>
                        <li
                            className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}
                        >
                            <span className="text-xs">
                                {/[A-Z]/.test(password) ? '✓' : '○'}
                            </span>
                            One uppercase letter
                        </li>
                        <li
                            className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-600' : ''}`}
                        >
                            <span className="text-xs">
                                {/\d/.test(password) ? '✓' : '○'}
                            </span>
                            One number
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
