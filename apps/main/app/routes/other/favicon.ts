// Favicon route handler

/**
 * Favicon route handler
 * Serves the favicon from the public directory
 */
export async function loader() {
    // Redirect favicon.ico requests to the actual favicon
    return new Response(null, {
        status: 302,
        headers: {
            Location: '/img/icon.svg'
        }
    });
}

// This component should never render since we always return a Response
export default function Favicon() {
    return null;
}
