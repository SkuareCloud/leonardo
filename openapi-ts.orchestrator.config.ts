import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts";

const SERVICE = "orchestrator";

if (!process.env.ORCHESTRATOR_API_ENDPOINT) {
  throw new Error("ORCHESTRATOR_API_ENDPOINT environment variable is required");
}

export default defineConfig({
  input: process.env.ORCHESTRATOR_API_ENDPOINT + "openapi.json",
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
  ],
});
