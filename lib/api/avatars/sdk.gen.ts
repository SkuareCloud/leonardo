// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from '@hey-api/client-next';
import type { RootGetData, HealthHealthGetData, AvatarsAvatarsGetData, AvatarsAvatarsGetResponse, AddAvatarAvatarsPostData, AddAvatarAvatarsPostError, QueryAvatarsAvatarsQueryGetData, QueryAvatarsAvatarsQueryGetResponse, QueryAvatarsAvatarsQueryGetError, DeleteAvatarAvatarsAvatarIdDeleteData, DeleteAvatarAvatarsAvatarIdDeleteResponse, DeleteAvatarAvatarsAvatarIdDeleteError, GetAvatarAvatarsAvatarIdGetData, GetAvatarAvatarsAvatarIdGetResponse, GetAvatarAvatarsAvatarIdGetError, PatchAvatarAvatarsAvatarIdPatchData, PatchAvatarAvatarsAvatarIdPatchResponse, PatchAvatarAvatarsAvatarIdPatchError, ReplaceAvatarAvatarsAvatarIdPutData, ReplaceAvatarAvatarsAvatarIdPutResponse, ReplaceAvatarAvatarsAvatarIdPutError, AssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostData, AssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostResponse, AssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostError, UnassignProxyForAvatarAvatarsAvatarIdProxyDeleteData, UnassignProxyForAvatarAvatarsAvatarIdProxyDeleteResponse, UnassignProxyForAvatarAvatarsAvatarIdProxyDeleteError, GetAvatarProxyAvatarsAvatarIdProxyGetData, GetAvatarProxyAvatarsAvatarIdProxyGetResponse, GetAvatarProxyAvatarsAvatarIdProxyGetError, AssignProxyToAvatarAvatarsAvatarIdProxyPostData, AssignProxyToAvatarAvatarsAvatarIdProxyPostResponse, AssignProxyToAvatarAvatarsAvatarIdProxyPostError, GetPirsPirsGetData, GetPirsPirsGetResponse, AddPirPirsPostData, AddPirPirsPostError, DeletePirPirsPirIdDeleteData, DeletePirPirsPirIdDeleteResponse, DeletePirPirsPirIdDeleteError, GetPirPirsPirIdGetData, GetPirPirsPirIdGetResponse, GetPirPirsPirIdGetError, GetProxiesProxiesGetData, GetProxiesProxiesGetResponse, AddProxyProxiesPostData, AddProxyProxiesPostError, QueryProxyProxiesQueryGetData, QueryProxyProxiesQueryGetResponse, QueryProxyProxiesQueryGetError, DeleteProxyProxiesProxyIdDeleteData, DeleteProxyProxiesProxyIdDeleteResponse, DeleteProxyProxiesProxyIdDeleteError, GetProxyProxiesProxyIdGetData, GetProxyProxiesProxyIdGetResponse, GetProxyProxiesProxyIdGetError, ReplaceProxyProxiesProxyIdPutData, ReplaceProxyProxiesProxyIdPutResponse, ReplaceProxyProxiesProxyIdPutError, UpdateProxyStatusProxiesProxyIdStatusPutData, UpdateProxyStatusProxiesProxyIdStatusPutResponse, UpdateProxyStatusProxiesProxyIdStatusPutError, PingProxyProxiesProxyIdPingPutData, PingProxyProxiesProxyIdPingPutResponse, PingProxyProxiesProxyIdPingPutError, CreateApiKeyKeysPostData, CreateApiKeyKeysPostError, DeleteApiKeyKeysUserNameDeleteData, DeleteApiKeyKeysUserNameDeleteResponse, DeleteApiKeyKeysUserNameDeleteError } from './types.gen';
import { client as _heyApiClient } from './client.gen';
import { zAvatarsAvatarsGetResponse, zQueryAvatarsAvatarsQueryGetResponse, zDeleteAvatarAvatarsAvatarIdDeleteResponse, zGetAvatarAvatarsAvatarIdGetResponse, zPatchAvatarAvatarsAvatarIdPatchResponse, zReplaceAvatarAvatarsAvatarIdPutResponse, zAssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostResponse, zUnassignProxyForAvatarAvatarsAvatarIdProxyDeleteResponse, zGetAvatarProxyAvatarsAvatarIdProxyGetResponse, zAssignProxyToAvatarAvatarsAvatarIdProxyPostResponse, zGetPirsPirsGetResponse, zDeletePirPirsPirIdDeleteResponse, zGetPirPirsPirIdGetResponse, zGetProxiesProxiesGetResponse, zQueryProxyProxiesQueryGetResponse, zDeleteProxyProxiesProxyIdDeleteResponse, zGetProxyProxiesProxyIdGetResponse, zReplaceProxyProxiesProxyIdPutResponse, zUpdateProxyStatusProxiesProxyIdStatusPutResponse, zPingProxyProxiesProxyIdPingPutResponse, zDeleteApiKeyKeysUserNameDeleteResponse } from './zod.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};

/**
 * Root
 */
export const rootGet = <ThrowOnError extends boolean = false>(options?: Options<RootGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<unknown, unknown, ThrowOnError>({
        url: '/',
        ...options
    });
};

/**
 * Health
 */
export const healthHealthGet = <ThrowOnError extends boolean = false>(options?: Options<HealthHealthGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<unknown, unknown, ThrowOnError>({
        url: '/health',
        ...options
    });
};

/**
 * Avatars
 */
export const avatarsAvatarsGet = <ThrowOnError extends boolean = false>(options?: Options<AvatarsAvatarsGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<AvatarsAvatarsGetResponse, unknown, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zAvatarsAvatarsGetResponse.parseAsync(data);
        },
        url: '/avatars',
        ...options
    });
};

/**
 * Add Avatar
 */
export const addAvatarAvatarsPost = <ThrowOnError extends boolean = false>(options: Options<AddAvatarAvatarsPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<unknown, AddAvatarAvatarsPostError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        url: '/avatars',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Query Avatars
 */
export const queryAvatarsAvatarsQueryGet = <ThrowOnError extends boolean = false>(options: Options<QueryAvatarsAvatarsQueryGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<QueryAvatarsAvatarsQueryGetResponse, QueryAvatarsAvatarsQueryGetError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zQueryAvatarsAvatarsQueryGetResponse.parseAsync(data);
        },
        url: '/avatars/query',
        ...options
    });
};

/**
 * Delete Avatar
 */
export const deleteAvatarAvatarsAvatarIdDelete = <ThrowOnError extends boolean = false>(options: Options<DeleteAvatarAvatarsAvatarIdDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<DeleteAvatarAvatarsAvatarIdDeleteResponse, DeleteAvatarAvatarsAvatarIdDeleteError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zDeleteAvatarAvatarsAvatarIdDeleteResponse.parseAsync(data);
        },
        url: '/avatars/{avatar_id}',
        ...options
    });
};

/**
 * Get Avatar
 */
export const getAvatarAvatarsAvatarIdGet = <ThrowOnError extends boolean = false>(options: Options<GetAvatarAvatarsAvatarIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetAvatarAvatarsAvatarIdGetResponse, GetAvatarAvatarsAvatarIdGetError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zGetAvatarAvatarsAvatarIdGetResponse.parseAsync(data);
        },
        url: '/avatars/{avatar_id}',
        ...options
    });
};

/**
 * Patch Avatar
 */
export const patchAvatarAvatarsAvatarIdPatch = <ThrowOnError extends boolean = false>(options: Options<PatchAvatarAvatarsAvatarIdPatchData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).patch<PatchAvatarAvatarsAvatarIdPatchResponse, PatchAvatarAvatarsAvatarIdPatchError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zPatchAvatarAvatarsAvatarIdPatchResponse.parseAsync(data);
        },
        url: '/avatars/{avatar_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Replace Avatar
 */
export const replaceAvatarAvatarsAvatarIdPut = <ThrowOnError extends boolean = false>(options: Options<ReplaceAvatarAvatarsAvatarIdPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<ReplaceAvatarAvatarsAvatarIdPutResponse, ReplaceAvatarAvatarsAvatarIdPutError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zReplaceAvatarAvatarsAvatarIdPutResponse.parseAsync(data);
        },
        url: '/avatars/{avatar_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Assign Specific Proxy To Avatar
 */
export const assignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPost = <ThrowOnError extends boolean = false>(options: Options<AssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<AssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostResponse, AssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zAssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostResponse.parseAsync(data);
        },
        url: '/avatars/{avatar_id}/proxy/{proxy_id}',
        ...options
    });
};

/**
 * Unassign Proxy For Avatar
 */
export const unassignProxyForAvatarAvatarsAvatarIdProxyDelete = <ThrowOnError extends boolean = false>(options: Options<UnassignProxyForAvatarAvatarsAvatarIdProxyDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<UnassignProxyForAvatarAvatarsAvatarIdProxyDeleteResponse, UnassignProxyForAvatarAvatarsAvatarIdProxyDeleteError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zUnassignProxyForAvatarAvatarsAvatarIdProxyDeleteResponse.parseAsync(data);
        },
        url: '/avatars/{avatar_id}/proxy',
        ...options
    });
};

/**
 * Get Avatar Proxy
 */
export const getAvatarProxyAvatarsAvatarIdProxyGet = <ThrowOnError extends boolean = false>(options: Options<GetAvatarProxyAvatarsAvatarIdProxyGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetAvatarProxyAvatarsAvatarIdProxyGetResponse, GetAvatarProxyAvatarsAvatarIdProxyGetError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zGetAvatarProxyAvatarsAvatarIdProxyGetResponse.parseAsync(data);
        },
        url: '/avatars/{avatar_id}/proxy',
        ...options
    });
};

/**
 * Assign Proxy To Avatar
 */
export const assignProxyToAvatarAvatarsAvatarIdProxyPost = <ThrowOnError extends boolean = false>(options: Options<AssignProxyToAvatarAvatarsAvatarIdProxyPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<AssignProxyToAvatarAvatarsAvatarIdProxyPostResponse, AssignProxyToAvatarAvatarsAvatarIdProxyPostError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zAssignProxyToAvatarAvatarsAvatarIdProxyPostResponse.parseAsync(data);
        },
        url: '/avatars/{avatar_id}/proxy',
        ...options
    });
};

/**
 * Get Pirs
 */
export const getPirsPirsGet = <ThrowOnError extends boolean = false>(options?: Options<GetPirsPirsGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetPirsPirsGetResponse, unknown, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zGetPirsPirsGetResponse.parseAsync(data);
        },
        url: '/pirs',
        ...options
    });
};

/**
 * Add Pir
 */
export const addPirPirsPost = <ThrowOnError extends boolean = false>(options: Options<AddPirPirsPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<unknown, AddPirPirsPostError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        url: '/pirs',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Delete Pir
 */
export const deletePirPirsPirIdDelete = <ThrowOnError extends boolean = false>(options: Options<DeletePirPirsPirIdDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<DeletePirPirsPirIdDeleteResponse, DeletePirPirsPirIdDeleteError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zDeletePirPirsPirIdDeleteResponse.parseAsync(data);
        },
        url: '/pirs/{pir_id}',
        ...options
    });
};

/**
 * Get Pir
 */
export const getPirPirsPirIdGet = <ThrowOnError extends boolean = false>(options: Options<GetPirPirsPirIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetPirPirsPirIdGetResponse, GetPirPirsPirIdGetError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zGetPirPirsPirIdGetResponse.parseAsync(data);
        },
        url: '/pirs/{pir_id}',
        ...options
    });
};

/**
 * Get Proxies
 */
export const getProxiesProxiesGet = <ThrowOnError extends boolean = false>(options?: Options<GetProxiesProxiesGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetProxiesProxiesGetResponse, unknown, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zGetProxiesProxiesGetResponse.parseAsync(data);
        },
        url: '/proxies',
        ...options
    });
};

/**
 * Add Proxy
 */
export const addProxyProxiesPost = <ThrowOnError extends boolean = false>(options: Options<AddProxyProxiesPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<unknown, AddProxyProxiesPostError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        url: '/proxies',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Query Proxy
 */
export const queryProxyProxiesQueryGet = <ThrowOnError extends boolean = false>(options: Options<QueryProxyProxiesQueryGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<QueryProxyProxiesQueryGetResponse, QueryProxyProxiesQueryGetError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zQueryProxyProxiesQueryGetResponse.parseAsync(data);
        },
        url: '/proxies/query',
        ...options
    });
};

/**
 * Delete Proxy
 */
export const deleteProxyProxiesProxyIdDelete = <ThrowOnError extends boolean = false>(options: Options<DeleteProxyProxiesProxyIdDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<DeleteProxyProxiesProxyIdDeleteResponse, DeleteProxyProxiesProxyIdDeleteError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zDeleteProxyProxiesProxyIdDeleteResponse.parseAsync(data);
        },
        url: '/proxies/{proxy_id}',
        ...options
    });
};

/**
 * Get Proxy
 */
export const getProxyProxiesProxyIdGet = <ThrowOnError extends boolean = false>(options: Options<GetProxyProxiesProxyIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetProxyProxiesProxyIdGetResponse, GetProxyProxiesProxyIdGetError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zGetProxyProxiesProxyIdGetResponse.parseAsync(data);
        },
        url: '/proxies/{proxy_id}',
        ...options
    });
};

/**
 * Replace Proxy
 */
export const replaceProxyProxiesProxyIdPut = <ThrowOnError extends boolean = false>(options: Options<ReplaceProxyProxiesProxyIdPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<ReplaceProxyProxiesProxyIdPutResponse, ReplaceProxyProxiesProxyIdPutError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zReplaceProxyProxiesProxyIdPutResponse.parseAsync(data);
        },
        url: '/proxies/{proxy_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Update Proxy Status
 */
export const updateProxyStatusProxiesProxyIdStatusPut = <ThrowOnError extends boolean = false>(options: Options<UpdateProxyStatusProxiesProxyIdStatusPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UpdateProxyStatusProxiesProxyIdStatusPutResponse, UpdateProxyStatusProxiesProxyIdStatusPutError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zUpdateProxyStatusProxiesProxyIdStatusPutResponse.parseAsync(data);
        },
        url: '/proxies/{proxy_id}/status',
        ...options
    });
};

/**
 * Ping Proxy
 */
export const pingProxyProxiesProxyIdPingPut = <ThrowOnError extends boolean = false>(options: Options<PingProxyProxiesProxyIdPingPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<PingProxyProxiesProxyIdPingPutResponse, PingProxyProxiesProxyIdPingPutError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zPingProxyProxiesProxyIdPingPutResponse.parseAsync(data);
        },
        url: '/proxies/{proxy_id}/ping',
        ...options
    });
};

/**
 * Create Api Key
 */
export const createApiKeyKeysPost = <ThrowOnError extends boolean = false>(options: Options<CreateApiKeyKeysPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<unknown, CreateApiKeyKeysPostError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        url: '/keys',
        ...options
    });
};

/**
 * Delete Api Key
 */
export const deleteApiKeyKeysUserNameDelete = <ThrowOnError extends boolean = false>(options: Options<DeleteApiKeyKeysUserNameDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<DeleteApiKeyKeysUserNameDeleteResponse, DeleteApiKeyKeysUserNameDeleteError, ThrowOnError>({
        security: [
            {
                name: 'X-API-Key',
                type: 'apiKey'
            }
        ],
        responseValidator: async (data) => {
            return await zDeleteApiKeyKeysUserNameDeleteResponse.parseAsync(data);
        },
        url: '/keys/{user_name}',
        ...options
    });
};