// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from '@hey-api/client-next';
import type { SubmitScenarioAsyncScenarioPostData, SubmitScenarioAsyncScenarioPostResponse, SubmitScenarioAsyncScenarioPostError, SubmitScenarioSyncScenarioSyncSubmitPostData, SubmitScenarioSyncScenarioSyncSubmitPostResponse, SubmitScenarioSyncScenarioSyncSubmitPostError, GetScenariosScenarioScenarioGetData, GetScenariosScenarioScenarioGetResponse, GetScenarioByIdScenarioScenarioScenarioIdGetData, GetScenarioByIdScenarioScenarioScenarioIdGetResponse, GetScenarioByIdScenarioScenarioScenarioIdGetError, GetAllCharactersCharactersGetData, GetAllCharactersCharactersGetResponse, GetCharacterCharactersCharacterIdGetData, GetCharacterCharactersCharacterIdGetError, StopProfileCharactersCharacterIdStopPostData, StopProfileCharactersCharacterIdStopPostError, StopAllProfilesCharactersStopPostData, IsProfileRegisteredAuthIsProfileRegisteredGetData, IsProfileRegisteredAuthIsProfileRegisteredGetError, CredentialsAuthCredentialsGetData, CredentialsAuthCredentialsGetResponse, CredentialsAuthCredentialsGetError, SubmitCredentialsAuthPostData, SubmitCredentialsAuthPostResponse, SubmitCredentialsAuthPostError, ActivateActivationActivatePostData, ActivateActivationActivatePostResponse, ActivateActivationActivatePostError, ActivateWithSessionDataActivationActivateWithSessionDataPostData, ActivateWithSessionDataActivationActivateWithSessionDataPostResponse, ActivateWithSessionDataActivationActivateWithSessionDataPostError, GetStatusActivationStatusGetData, GetStatusActivationStatusGetResponse, GetStatusActivationStatusGetError } from './types.gen';
import { zSubmitScenarioAsyncScenarioPostResponse, zSubmitScenarioSyncScenarioSyncSubmitPostResponse, zGetScenariosScenarioScenarioGetResponse, zGetScenarioByIdScenarioScenarioScenarioIdGetResponse, zGetAllCharactersCharactersGetResponse, zCredentialsAuthCredentialsGetResponse, zSubmitCredentialsAuthPostResponse, zActivateActivationActivatePostResponse, zActivateWithSessionDataActivationActivateWithSessionDataPostResponse, zGetStatusActivationStatusGetResponse } from './zod.gen';
import { client as _heyApiClient } from './client.gen';

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
 * Submit Scenario Async
 * Submit a new scenario. This method is Async it will always return Accepted (202) and the status will return to the orchestrator only.
 */
export const submitScenarioAsyncScenarioPost = <ThrowOnError extends boolean = false>(options: Options<SubmitScenarioAsyncScenarioPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<SubmitScenarioAsyncScenarioPostResponse, SubmitScenarioAsyncScenarioPostError, ThrowOnError>({
        responseValidator: async (data) => {
            return await zSubmitScenarioAsyncScenarioPostResponse.parseAsync(data);
        },
        url: '/scenario',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Submit Scenario Sync
 * Submit a new scenario. This method is Async it will always return Accepted (202) and the status will return to the orchestrator only.
 */
export const submitScenarioSyncScenarioSyncSubmitPost = <ThrowOnError extends boolean = false>(options: Options<SubmitScenarioSyncScenarioSyncSubmitPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<SubmitScenarioSyncScenarioSyncSubmitPostResponse, SubmitScenarioSyncScenarioSyncSubmitPostError, ThrowOnError>({
        responseValidator: async (data) => {
            return await zSubmitScenarioSyncScenarioSyncSubmitPostResponse.parseAsync(data);
        },
        url: '/scenario/syncSubmit',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Get Scenarios
 */
export const getScenariosScenarioScenarioGet = <ThrowOnError extends boolean = false>(options?: Options<GetScenariosScenarioScenarioGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetScenariosScenarioScenarioGetResponse, unknown, ThrowOnError>({
        responseValidator: async (data) => {
            return await zGetScenariosScenarioScenarioGetResponse.parseAsync(data);
        },
        url: '/scenario/scenario',
        ...options
    });
};

/**
 * Get Scenario By Id
 */
export const getScenarioByIdScenarioScenarioScenarioIdGet = <ThrowOnError extends boolean = false>(options: Options<GetScenarioByIdScenarioScenarioScenarioIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetScenarioByIdScenarioScenarioScenarioIdGetResponse, GetScenarioByIdScenarioScenarioScenarioIdGetError, ThrowOnError>({
        responseValidator: async (data) => {
            return await zGetScenarioByIdScenarioScenarioScenarioIdGetResponse.parseAsync(data);
        },
        url: '/scenario/scenario/{scenario_id}',
        ...options
    });
};

/**
 * Get All Characters
 * Returns all the Characters that are currently running in this operator
 */
export const getAllCharactersCharactersGet = <ThrowOnError extends boolean = false>(options?: Options<GetAllCharactersCharactersGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetAllCharactersCharactersGetResponse, unknown, ThrowOnError>({
        responseValidator: async (data) => {
            return await zGetAllCharactersCharactersGetResponse.parseAsync(data);
        },
        url: '/characters',
        ...options
    });
};

/**
 * Get Character
 * Returns a specific character based on its ID
 */
export const getCharacterCharactersCharacterIdGet = <ThrowOnError extends boolean = false>(options: Options<GetCharacterCharactersCharacterIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, GetCharacterCharactersCharacterIdGetError, ThrowOnError>({
        url: '/characters/{character_id}',
        ...options
    });
};

/**
 * Stop Profile
 * Stops the current character actions and closes all its resources.
 */
export const stopProfileCharactersCharacterIdStopPost = <ThrowOnError extends boolean = false>(options: Options<StopProfileCharactersCharacterIdStopPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<unknown, StopProfileCharactersCharacterIdStopPostError, ThrowOnError>({
        url: '/characters/{character_id}/stop',
        ...options
    });
};

/**
 * Stop All Profiles
 * Stops all characters actions and closes all their resources.
 */
export const stopAllProfilesCharactersStopPost = <ThrowOnError extends boolean = false>(options?: Options<StopAllProfilesCharactersStopPostData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).post<unknown, unknown, ThrowOnError>({
        url: '/characters/stop',
        ...options
    });
};

/**
 * Is Profile Registered
 */
export const isProfileRegisteredAuthIsProfileRegisteredGet = <ThrowOnError extends boolean = false>(options: Options<IsProfileRegisteredAuthIsProfileRegisteredGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, IsProfileRegisteredAuthIsProfileRegisteredGetError, ThrowOnError>({
        url: '/auth/is-profile-registered',
        ...options
    });
};

/**
 * Credentials
 * Get credentials for a profile
 */
export const credentialsAuthCredentialsGet = <ThrowOnError extends boolean = false>(options: Options<CredentialsAuthCredentialsGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<CredentialsAuthCredentialsGetResponse, CredentialsAuthCredentialsGetError, ThrowOnError>({
        responseValidator: async (data) => {
            return await zCredentialsAuthCredentialsGetResponse.parseAsync(data);
        },
        url: '/auth/credentials',
        ...options
    });
};

/**
 * Submit Credentials
 * Submit credentials for activation of a profile
 */
export const submitCredentialsAuthPost = <ThrowOnError extends boolean = false>(options: Options<SubmitCredentialsAuthPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<SubmitCredentialsAuthPostResponse, SubmitCredentialsAuthPostError, ThrowOnError>({
        responseValidator: async (data) => {
            return await zSubmitCredentialsAuthPostResponse.parseAsync(data);
        },
        url: '/auth',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Activate
 * Activate a profile
 */
export const activateActivationActivatePost = <ThrowOnError extends boolean = false>(options: Options<ActivateActivationActivatePostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ActivateActivationActivatePostResponse, ActivateActivationActivatePostError, ThrowOnError>({
        responseValidator: async (data) => {
            return await zActivateActivationActivatePostResponse.parseAsync(data);
        },
        url: '/activation/activate',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Activate With Session Data
 * Activate a profile with session data
 */
export const activateWithSessionDataActivationActivateWithSessionDataPost = <ThrowOnError extends boolean = false>(options: Options<ActivateWithSessionDataActivationActivateWithSessionDataPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ActivateWithSessionDataActivationActivateWithSessionDataPostResponse, ActivateWithSessionDataActivationActivateWithSessionDataPostError, ThrowOnError>({
        responseValidator: async (data) => {
            return await zActivateWithSessionDataActivationActivateWithSessionDataPostResponse.parseAsync(data);
        },
        url: '/activation/activate_with_session_data',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Get Status
 * Get the status of a profile
 */
export const getStatusActivationStatusGet = <ThrowOnError extends boolean = false>(options: Options<GetStatusActivationStatusGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetStatusActivationStatusGetResponse, GetStatusActivationStatusGetError, ThrowOnError>({
        responseValidator: async (data) => {
            return await zGetStatusActivationStatusGetResponse.parseAsync(data);
        },
        url: '/activation/status',
        ...options
    });
};