# Shepherd

## Prerequisites

1. Install dependencies
    ```shell
    npm install
    ```
1. Populate env vars in a `.env` file:
    ```python
    OPERATOR_API_ENDPOINT = "..."
    AVATARS_API_ENDPOINT = "..."
    AVATARS_API_KEY="..."

    # Uncomment if working against an environment.
    # SERVER_URL="..."

    # Uncomment if working locally.
    # LOCAL=true
    # NEXT_PUBLIC_LOCAL=true
    ```

## Development

```shell
# Run development server
npm run dev
```

## Automations

```shell
OPERATOR_API_ENDPOINT = "..."
AVATARS_API_ENDPOINT = "..."

# Generate API clients
npx @hey-api/openapi-ts -i $OPERATOR_API_ENDPOINT/openapi.json -o lib/api/operator -c @hey-api/client-next -p zod
npx @hey-api/openapi-ts -i $AVATARS_API_ENDPOINT/openapi.json -o lib/api/avatars -c @hey-api/client-next -p zod
# IMPORTANT: Make sure to remove the base URLs after.
```