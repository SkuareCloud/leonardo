export interface ClientEnv {
    isLocal: boolean
}

export function read_client_env(): ClientEnv {
    const isLocal = process.env.NEXT_PUBLIC_LOCAL === "true";
    return {
        isLocal
    }
}