import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts";

const SERVICE = "avatars";

if (!process.env.AVATARS_API_ENDPOINT) {
  throw new Error("AVATARS_API_ENDPOINT environment variable is required");
}

export default defineConfig({
  input: process.env.AVATARS_API_ENDPOINT + "openapi.json",
  output: `lib/api/${SERVICE}`,
  plugins: [
    ...defaultPlugins,
    {
      name: "@hey-api/client-next",
      baseUrl: false,
      strictBaseUrl: false,
    },
    "zod",
    {
      name: "@hey-api/sdk",
      validator: true,
    },
    {
      name: "@hey-api/typescript",
    },
  ],
});
