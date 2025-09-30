import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useRouteError,
    isRouteErrorResponse,
    type LoaderFunctionArgs
} from 'react-router';
import { ThemeProvider } from '@cbnsndwch/struktura-shared-ui';

import './app.css';

export async function loader({ request }: LoaderFunctionArgs) {
    // TODO: Add authentication check and load user preferences
    // For now, return empty preferences to maintain backward compatibility
    const userTheme: string | null = null;

    // In the future, check for user authentication and load preferences:
    // const user = await getUserFromRequest(request);
    // if (user?.preferences?.theme) {
    //     userTheme = user.preferences.theme;
    // }

    return {
        url: request.url,
        userTheme
    };
}

export function meta() {
    const title = 'Struktura • No-Code Document Management Platform';
    const description =
        'Struktura combines the ease-of-use of apps like Airtable with the schema flexibility of MongoDB. Create, manage, and collaborate on complex data structures without coding.';
    const url = 'https://struktura.cbnsndwch.dev';
    const image = '/img/og-image.svg';
    const icon = '/img/icon.svg';

    return [
        { title },
        { name: 'description', content: description },
        { property: 'og:site_name', content: 'Struktura' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: url },
        { property: 'og:image', content: image },
        { property: 'og:image:alt', content: title },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
        { name: 'twitter:image:alt', content: title },
        { rel: 'icon', href: icon },
        { rel: 'apple-touch-icon', href: icon }
    ];
}

function ThemeScript({ userTheme }: { userTheme?: string | null }) {
    const themeScript = `
        (function() {
            // Priority: 1. User preference from server, 2. localStorage, 3. system default
            const userTheme = ${JSON.stringify(userTheme)};
            const localTheme = localStorage.getItem('struktura-theme');
            const theme = userTheme || localTheme || 'system';
            
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const resolvedTheme = theme === 'system' ? systemTheme : theme;
            
            // Apply theme immediately to prevent flash
            document.documentElement.classList.add(resolvedTheme);
            
            // Store in localStorage for consistency (if not already there)
            if (!localTheme && userTheme) {
                try {
                    localStorage.setItem('struktura-theme', userTheme);
                } catch (e) {
                    // Silently fail if localStorage is not available
                }
            }
        })();
    `;

    return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

export function Layout({ children }: { children: React.ReactNode }) {
    const loaderData = useLoaderData<typeof loader>();
    const userTheme = loaderData?.userTheme || null;

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" type="image/svg+xml" href="/img/icon.svg" />
                <Meta />
                <Links />
                <ThemeScript userTheme={userTheme} />
            </head>
            <body className="flex flex-col min-h-screen">
                <ThemeProvider>{children}</ThemeProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    
    let errorMessage = 'An unexpected error occurred';
    let errorDetails = '';

    if (isRouteErrorResponse(error)) {
        errorMessage = `${error.status} ${error.statusText}`;
        if (error.status === 404) {
            errorMessage = 'Page Not Found';
            errorDetails = 'The page you are looking for does not exist.';
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || '';
    }

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>Error - Struktura</title>
                <Meta />
                <Links />
            </head>
            <body className="flex flex-col min-h-screen bg-background text-foreground">
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md text-center space-y-4">
                        <div className="text-6xl font-bold text-red-500">!</div>
                        <h1 className="text-2xl font-bold">{errorMessage}</h1>
                        {errorDetails && (
                            <p className="text-muted-foreground">
                                {errorDetails}
                            </p>
                        )}
                        <div className="space-y-2">
                            <a
                                href="/"
                                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Go Home
                            </a>
                            <div>
                                <button
                                    onClick={() => window.history.back()}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    ← Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}
