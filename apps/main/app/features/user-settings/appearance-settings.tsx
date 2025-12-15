/**
 * Appearance settings page
 */
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Label,
    RadioGroup,
    RadioGroupItem,
    useTheme
} from '@cbnsndwch/struktura-shared-ui';
import { Monitor, Moon, Sun } from 'lucide-react';

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme();

    const themeOptions = [
        {
            value: 'light',
            label: 'Light',
            description: 'Light mode theme',
            icon: Sun
        },
        {
            value: 'dark',
            label: 'Dark',
            description: 'Dark mode theme',
            icon: Moon
        },
        {
            value: 'system',
            label: 'System',
            description: 'Follow system preference',
            icon: Monitor
        }
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
                <p className="text-muted-foreground">
                    Customize how Struktura looks on your device
                </p>
            </div>

            {/* Theme Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>
                        Select your preferred theme for the interface
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={theme}
                        onValueChange={(value: 'light' | 'dark' | 'system') =>
                            setTheme(value)
                        }
                        className="grid gap-4"
                    >
                        {themeOptions.map(option => {
                            const Icon = option.icon;
                            return (
                                <div key={option.value} className="flex items-start space-x-3">
                                    <RadioGroupItem
                                        value={option.value}
                                        id={`theme-${option.value}`}
                                        className="mt-1"
                                    />
                                    <Label
                                        htmlFor={`theme-${option.value}`}
                                        className="flex flex-1 cursor-pointer items-start space-x-3"
                                    >
                                        <div className="rounded-md border p-2">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="font-medium leading-none">
                                                {option.label}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {option.description}
                                            </p>
                                        </div>
                                    </Label>
                                </div>
                            );
                        })}
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    );
}
