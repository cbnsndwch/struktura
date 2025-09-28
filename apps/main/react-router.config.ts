import type { Config } from '@react-router/dev/config';

export default {
    ssr: true,
    serverModuleFormat: 'esm',
    // return a list of URLs to prerender at build time
    async prerender() {
        return [
            '/',
            // '/about',
            // '/contact'
            //
        ];
    }
} satisfies Config;
