import { headers } from "next/headers";

export async function getPathname(): Promise<string> {
    const headersList = await headers();
    const pathname = headersList.get("X-Pathname") as string;
    return pathname
}

export async function getQueryParams(): Promise<URLSearchParams> {
    const headersList = await headers();
    const pathname = headersList.get("X-Search-Params") as string;
    return new URLSearchParams(pathname);
}