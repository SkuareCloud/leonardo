import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

const SERVICE = "operator"

if (!process.env.OPERATOR_API_ENDPOINT) {
    throw new Error('OPERATOR_API_ENDPOINT environment variable is required');
}

export default defineConfig({
    input: process.env.OPERATOR_API_ENDPOINT + "openapi.json",
    output: `lib/api/${SERVICE}`,
    plugins: [
        ...defaultPlugins,
        '@hey-api/client-fetch',
        '@hey-api/client-next',
        'zod',
        {
            name: '@hey-api/sdk',
            validator: true,
        },
    ],
});