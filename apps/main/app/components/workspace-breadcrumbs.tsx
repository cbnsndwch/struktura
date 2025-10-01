/**
 * Breadcrumb navigation for workspace hierarchy
 */
import { Link } from 'react-router';
import { Home, ChevronRight } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@cbnsndwch/struktura-shared-ui';

export interface BreadcrumbSegment {
    label: string;
    href?: string;
}

interface WorkspaceBreadcrumbsProps {
    workspaceId: string;
    workspaceName: string;
    segments?: BreadcrumbSegment[];
}

export function WorkspaceBreadcrumbs({
    workspaceId,
    workspaceName,
    segments = []
}: WorkspaceBreadcrumbsProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* Home */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/workspaces">
                            <Home className="h-4 w-4" />
                            <span className="sr-only">Workspaces</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>

                {/* Workspace */}
                <BreadcrumbItem>
                    {segments.length > 0 ? (
                        <BreadcrumbLink asChild>
                            <Link to={`/workspaces/${workspaceId}`}>
                                {workspaceName}
                            </Link>
                        </BreadcrumbLink>
                    ) : (
                        <BreadcrumbPage>{workspaceName}</BreadcrumbPage>
                    )}
                </BreadcrumbItem>

                {/* Additional segments */}
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1;

                    return (
                        <div key={index} className="contents">
                            <BreadcrumbSeparator>
                                <ChevronRight className="h-4 w-4" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                {isLast || !segment.href ? (
                                    <BreadcrumbPage>
                                        {segment.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={segment.href}>
                                            {segment.label}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </div>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
