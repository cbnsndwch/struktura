/**
 * View switcher for different collection visualization modes
 */
import { Grid3X3, List, Calendar, Kanban, BarChart3 } from 'lucide-react';
import {
    ToggleGroup,
    ToggleGroupItem,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@cbnsndwch/struktura-shared-ui';

export type ViewType = 'grid' | 'list' | 'kanban' | 'calendar' | 'gallery';

interface ViewSwitcherProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    availableViews?: ViewType[];
    size?: 'sm' | 'default' | 'lg';
}

const VIEW_CONFIGS = {
    grid: {
        icon: Grid3X3,
        label: 'Grid View',
        description: 'View items in a grid layout'
    },
    list: {
        icon: List,
        label: 'List View',
        description: 'View items in a list format'
    },
    kanban: {
        icon: Kanban,
        label: 'Kanban Board',
        description: 'View items as cards on a kanban board'
    },
    calendar: {
        icon: Calendar,
        label: 'Calendar View',
        description: 'View items on a calendar'
    },
    gallery: {
        icon: BarChart3,
        label: 'Gallery View',
        description: 'View items in a gallery layout'
    }
};

export function ViewSwitcher({
    currentView,
    onViewChange,
    availableViews = ['grid', 'list', 'kanban', 'calendar'],
    size = 'default'
}: ViewSwitcherProps) {
    return (
        <TooltipProvider>
            <ToggleGroup
                type="single"
                value={currentView}
                onValueChange={value => {
                    if (value && availableViews.includes(value as ViewType)) {
                        onViewChange(value as ViewType);
                    }
                }}
                size={size}
            >
                {availableViews.map(view => {
                    const config = VIEW_CONFIGS[view];
                    const Icon = config.icon;

                    return (
                        <Tooltip key={view}>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value={view}
                                    aria-label={config.label}
                                >
                                    <Icon className="h-4 w-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-medium">{config.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {config.description}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </ToggleGroup>
        </TooltipProvider>
    );
}
