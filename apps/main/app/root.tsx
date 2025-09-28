import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    type LoaderFunctionArgs
} from 'react-router';

import './app.css';

export async function loader({ request }: LoaderFunctionArgs) {
    return {
        url: request.url
    };
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body className="flex flex-col min-h-screen">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}
