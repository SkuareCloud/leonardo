// This file is auto-generated by @hey-api/openapi-ts

import { z } from 'zod';

export const zAvatarBase = z.object({
    data: z.object({})
});

export const zProxyType = z.enum([
    'socks4',
    'socks4a',
    'socks5',
    'socks5h',
    'https',
    'http'
]);

export const zProxy = z.object({
    name: z.string(),
    type: zProxyType,
    ip_address: z.union([
        z.string().ip(),
        z.null()
    ]).optional(),
    fqdn: z.union([
        z.string(),
        z.null()
    ]).optional(),
    port: z.number().int(),
    username: z.string(),
    password: z.union([
        z.string(),
        z.null()
    ]).optional(),
    remarks: z.union([
        z.string(),
        z.null()
    ]).optional(),
    last_ping_remarks: z.union([
        z.string(),
        z.null()
    ]).optional(),
    id: z.string().uuid(),
    ip_api_data: z.union([
        z.object({}),
        z.null()
    ]),
    status: z.string(),
    city: z.union([
        z.string(),
        z.null()
    ]),
    iso_3166_1_alpha_2_code: z.union([
        z.string(),
        z.null()
    ]),
    iso_3166_2_subdivision_code: z.union([
        z.string(),
        z.null()
    ]),
    continent_code: z.union([
        z.string(),
        z.null()
    ]),
    timezone: z.union([
        z.string(),
        z.null()
    ]),
    status_is_success: z.boolean()
});

export const zAvatarModelWithProxy = z.object({
    id: z.string().uuid(),
    data: z.object({}),
    pir_id: z.string().uuid(),
    home_continent_code: z.string(),
    home_iso_3166_1_alpha_2_code: z.string(),
    home_iso_3166_2_subdivision_code: z.string(),
    home_city: z.string(),
    proxy: z.union([
        zProxy,
        z.null()
    ])
});

export const zValidationError = z.object({
    loc: z.array(z.unknown()),
    msg: z.string(),
    type: z.string()
});

export const zHttpValidationError = z.object({
    detail: z.array(zValidationError).optional()
});

export const zPir = z.object({
    parent_pir_id: z.union([
        z.string().uuid(),
        z.null()
    ]).optional(),
    name: z.string(),
    id: z.string().uuid()
});

export const zPatchAvatar = z.object({
    path: z.array(z.string()),
    new_value: z.union([
        z.unknown(),
        z.null()
    ]).optional()
});

export const zPirBase = z.object({
    parent_pir_id: z.union([
        z.string().uuid(),
        z.null()
    ]).optional(),
    name: z.string()
});

export const zProxyBase = z.object({
    name: z.string(),
    type: zProxyType,
    ip_address: z.union([
        z.string().ip(),
        z.null()
    ]).optional(),
    fqdn: z.union([
        z.string(),
        z.null()
    ]).optional(),
    port: z.number().int(),
    username: z.string(),
    password: z.union([
        z.string(),
        z.null()
    ]).optional(),
    remarks: z.union([
        z.string(),
        z.null()
    ]).optional(),
    last_ping_remarks: z.union([
        z.string(),
        z.null()
    ]).optional()
});

export const zAddress = z.object({
    continent_code: z.string().length(2),
    iso_3166_1_alpha_2_code: z.string().regex(/^[A-Z]{2}$/),
    iso_3166_2_subdivision_code: z.string().regex(/^[A-Z]{2}-[A-Z0-9]{1,3}$/),
    city: z.string().min(1).max(128)
});

export const zApi = z.object({
    api_id: z.number().int(),
    api_hash: z.string().min(1)
});

export const zTelegram = z.object({
    activation_source: z.union([
        z.string(),
        z.null()
    ]).optional(),
    active: z.union([
        z.boolean(),
        z.null()
    ]).optional(),
    activity_rate: z.union([
        z.number().int().gte(0).lte(15),
        z.null()
    ]).optional(),
    api: z.union([
        zApi,
        z.null()
    ]).optional()
});

export const zSocialNetworkAccounts = z.object({
    telegram: z.union([
        zTelegram,
        z.null()
    ]).optional()
});

export const zGender = z.enum([
    'Male',
    'Female'
]);

export const zAvatarData = z.object({
    pir_id: z.string().uuid(),
    eliza_character: z.object({}),
    gender: zGender,
    date_of_birth: z.string().date(),
    phone_number: z.string(),
    email: z.string().email(),
    addresses: z.object({}),
    social_network_accounts: z.union([
        zSocialNetworkAccounts,
        z.null()
    ]).optional()
});

export const zAvatarsAvatarsGetResponse = z.array(zAvatarModelWithProxy);

export const zQueryAvatarsAvatarsQueryGetResponse = z.array(zAvatarModelWithProxy);

export const zDeleteAvatarAvatarsAvatarIdDeleteResponse = z.void();

export const zGetAvatarAvatarsAvatarIdGetResponse = zAvatarModelWithProxy;

export const zPatchAvatarAvatarsAvatarIdPatchResponse = z.void();

export const zReplaceAvatarAvatarsAvatarIdPutResponse = z.union([
    z.unknown(),
    z.void()
]);

export const zAssignSpecificProxyToAvatarAvatarsAvatarIdProxyProxyIdPostResponse = zProxy;

export const zUnassignProxyForAvatarAvatarsAvatarIdProxyDeleteResponse = z.void();

export const zGetAvatarProxyAvatarsAvatarIdProxyGetResponse = zProxy;

export const zAssignProxyToAvatarAvatarsAvatarIdProxyPostResponse = zProxy;

export const zGetPirsPirsGetResponse = z.array(zPir);

export const zDeletePirPirsPirIdDeleteResponse = z.void();

export const zGetPirPirsPirIdGetResponse = zPir;

export const zGetProxiesProxiesGetResponse = z.array(zProxy);

export const zQueryProxyProxiesQueryGetResponse = z.array(zProxy);

export const zDeleteProxyProxiesProxyIdDeleteResponse = z.void();

export const zGetProxyProxiesProxyIdGetResponse = zProxy;

export const zReplaceProxyProxiesProxyIdPutResponse = z.union([
    z.unknown(),
    z.void()
]);

export const zUpdateProxyStatusProxiesProxyIdStatusPutResponse = zProxy;

export const zPingProxyProxiesProxyIdPingPutResponse = zProxy;

export const zDeleteApiKeyKeysUserNameDeleteResponse = z.void();