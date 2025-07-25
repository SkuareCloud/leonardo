// This file is auto-generated by @hey-api/openapi-ts

export type ActionPrefrences = {
    fail_fast?: boolean | null;
    timeout?: number | null;
};

export type ActionResponse = {
    id?: string;
    status: ActionStatus;
    type: 'send_message' | 'send_bulk_messages' | 'join_group' | 'leave_group' | 'reply_to_message' | 'forward_message' | 'behavioural';
    content: SendMessageResponseContent | ReplyToMessageResponseContent | LeaveGroupResponseContent | JoinGroupResponseContent | ForwardMessageResponseContent | BehaviouralResponseContent | SendBulkMessagesResponseContent | null;
    start_time: Date;
    end_time?: Date | null;
};

export type ActionStatus = {
    status_code: ActionStatusCode;
    error?: string | null;
};

export type ActionStatusCode = 'success' | 'failed' | 'cancelled' | 'fail_fast' | 'running' | 'pending';

export type ActivationRequest = {
    /**
     * The ID (GUID) of the profile to activate
     */
    profile_id: string;
    /**
     * Verify if the profile exists
     */
    verify_profile_exists?: boolean;
    /**
     * Should override the datadar if exists
     */
    should_override?: boolean;
    /**
     * Session data to override the local storage
     */
    session_data?: {
        [key: string]: unknown;
    } | null;
};

export type ActivationResponse = {
    /**
     * The status of the activation
     */
    status: ActivationStatus;
};

export type ActivationStatus = 'CHECKING_PROFILE' | 'STARTED' | 'ALREADY_LOGGED_IN' | 'WAITING_FOR_OTP' | 'ENTERING_OTP' | 'CHECKING_IF_WAITING_FOR_PASSWORD' | 'WAITING_FOR_PASSWORD' | 'ENTERING_PASSWORD' | 'WAITING_10_SECONDS' | 'VERIFYING_LOGIN' | 'LOGIN_VERIFICATION_FAILED' | 'SKIPPED' | 'FAILED' | 'SUCCESS';

export type AsyncWorkerState = 'init' | 'starting' | 'stopping' | 'stopped' | 'idle' | 'working' | 'paused';

export type Attachment = {
    url: string;
    name?: string | null;
    mime_type?: string | null;
};

export type AuthRequest = {
    profile_id: string;
    otp?: string | null;
    password?: string | null;
};

export type BehaviouralAction = {
    id?: string;
    type?: 'send_message' | 'send_bulk_messages' | 'join_group' | 'leave_group' | 'reply_to_message' | 'forward_message' | 'behavioural';
    prefrences?: ActionPrefrences;
    args: BehaviouralArgs;
};

export type BehaviouralArgs = {
    wait_time?: number;
    sync_context?: boolean;
    get_chats?: boolean;
    sync_personal_details?: boolean;
    disable_auto_download_media?: boolean;
    delete_all_active_sessions?: boolean;
    get_unread_messages?: boolean;
};

export type BehaviouralResponseContent = {
    current_context?: unknown | null;
    chats?: Array<GroupInfo | ChannelInfo> | null;
    personal_details_synced?: boolean;
    auto_download_media_disabled?: boolean;
    all_active_sessions_deleted?: boolean;
    unread_messages?: Array<ChatInfo> | null;
};

export type ChannelInfo = {
    id?: number | null;
    name?: string | null;
    title?: string | null;
    type?: ChatType;
    description?: string | null;
    read_inbox_max_id?: number | null;
    read_outbox_max_id?: number | null;
    unread_count?: number | null;
    unread_mentions_count?: number | null;
    unread_reactions_count?: number | null;
    subscribers?: number | null;
};

export type Character = {
    id?: string;
};

export type ChatInfo = {
    id?: number | null;
    name?: string | null;
    title?: string | null;
    type?: ChatType | null;
    description?: string | null;
    read_inbox_max_id?: number | null;
    read_outbox_max_id?: number | null;
    unread_count?: number | null;
    unread_mentions_count?: number | null;
    unread_reactions_count?: number | null;
};

export type ChatType = 'User' | 'Group' | 'Channel' | 'Bot' | 'Unknown';

export type ForwardMessageAction = {
    id?: string;
    type?: 'send_message' | 'send_bulk_messages' | 'join_group' | 'leave_group' | 'reply_to_message' | 'forward_message' | 'behavioural';
    prefrences?: ActionPrefrences;
    args: ForwardMessageArgs;
};

export type ForwardMessageArgs = {
    /**
     * The chat to forward from, if not provided, the message link will be used
     */
    from_chat?: ChatInfo | null;
    /**
     * The message to forward, if not provided, the message link will be used
     */
    message_info?: MessageInfo | null;
    target_chat: ChatInfo;
    message?: InputMessage;
    /**
     * The link to the message to forward, if not provided, the from chat and message info will be used
     */
    message_link?: string | null;
};

export type ForwardMessageResponseContent = {
    message_info: MessageInfo;
};

export type GroupInfo = {
    id?: number | null;
    name?: string | null;
    title?: string | null;
    type?: ChatType;
    description?: string | null;
    read_inbox_max_id?: number | null;
    read_outbox_max_id?: number | null;
    unread_count?: number | null;
    unread_mentions_count?: number | null;
    unread_reactions_count?: number | null;
    members?: number | null;
    online?: number | null;
};

export type HttpValidationError = {
    detail?: Array<ValidationError>;
};

export type InputMessage = {
    text?: string | null;
    attachments?: Array<Attachment>;
};

export type JoinGroupAction = {
    id?: string;
    type?: 'send_message' | 'send_bulk_messages' | 'join_group' | 'leave_group' | 'reply_to_message' | 'forward_message' | 'behavioural';
    prefrences?: ActionPrefrences;
    args: JoinGroupArgs;
};

export type JoinGroupArgs = {
    chat?: ChatInfo | null;
    join_discussion_group_if_availble?: boolean;
    invite_link?: string | null;
};

export type JoinGroupResponseContent = {
    chat_info: ChannelInfo | GroupInfo | null;
    discussion_group_chat_info: ChannelInfo | GroupInfo | null;
};

export type LeaveGroupAction = {
    id?: string;
    type?: 'send_message' | 'send_bulk_messages' | 'join_group' | 'leave_group' | 'reply_to_message' | 'forward_message' | 'behavioural';
    prefrences?: ActionPrefrences;
    args: LeaveGroupArgs;
};

export type LeaveGroupArgs = {
    chat: ChatInfo;
};

export type LeaveGroupResponseContent = {
    [key: string]: unknown;
};

export type MessageInfo = {
    timestamp: string;
    peer_id?: string | null;
    from_id?: string | null;
    text_hash?: string | null;
    message_id?: string | null;
    viewer_id?: string | null;
};

export type Prefrences = {
    actions_timeout?: number | null;
    action_interval?: number | null;
    close_browser_when_finished?: boolean | null;
    should_login_telegram?: boolean | null;
    verify_proxy_working?: boolean | null;
    fail_fast?: boolean | null;
};

export type ProfileWorkerView = {
    id?: string;
    state: AsyncWorkerState;
    current_scenario: Scenario | null;
    current_scenario_result: ScenarioResult | null;
    pending_actions: number;
    browser_port: number | null;
};

export type ReplyToMessageAction = {
    id?: string;
    type?: 'send_message' | 'send_bulk_messages' | 'join_group' | 'leave_group' | 'reply_to_message' | 'forward_message' | 'behavioural';
    prefrences?: ActionPrefrences;
    args: ReplyToMessageArgs;
};

export type ReplyToMessageArgs = {
    /**
     * The chat to reply to, if not provided, the message link will be used
     */
    chat?: ChatInfo | null;
    /**
     * The message to reply to, if not provided, the message link will be used
     */
    message_info?: MessageInfo | null;
    input_message_content: InputMessage;
    /**
     * The link to the message to reply to, if not provided, the chat and message info will be used
     */
    message_link?: string | null;
};

export type ReplyToMessageResponseContent = {
    message_info: MessageInfo;
};

export type Scenario = {
    id?: string;
    profile: Character;
    prefrences?: Prefrences;
    actions: Array<JoinGroupAction | LeaveGroupAction | ReplyToMessageAction | SendMessageAction | ForwardMessageAction | BehaviouralAction | SendBulkMessagesAction>;
};

export type ScenarioInfo = {
    start_time?: Date;
    end_time?: Date | null;
};

export type ScenarioResult = {
    id?: string;
    status?: ScenarioStatus;
    scenario_info?: ScenarioInfo;
    actions_responses?: Array<ActionResponse>;
};

export type ScenarioResultStatus = 'success' | 'failed' | 'pending' | 'finished' | 'proxy_error' | 'browser_error' | 'telegram_error' | 'profile_not_logged_in' | 'profile_already_running' | 'profile_failed_to_start' | 'profile_startup_timeout' | 'profile_proxy_not_configured';

export type ScenarioStatus = {
    status_code?: ScenarioResultStatus;
    error?: string | null;
};

export type ScenarioWithResult = {
    scenario: Scenario;
    result?: ScenarioResult;
};

export type SendBulkMessagesAction = {
    id?: string;
    type?: 'send_message' | 'send_bulk_messages' | 'join_group' | 'leave_group' | 'reply_to_message' | 'forward_message' | 'behavioural';
    prefrences?: ActionPrefrences;
    args: SendBulkMessagesArgs;
};

export type SendBulkMessagesArgs = {
    chat: ChatInfo;
    messages: Array<string>;
    interval?: number;
};

export type SendBulkMessagesResponseContent = {
    message_infos: Array<MessageInfo>;
};

export type SendMessageAction = {
    id?: string;
    type?: 'send_message' | 'send_bulk_messages' | 'join_group' | 'leave_group' | 'reply_to_message' | 'forward_message' | 'behavioural';
    prefrences?: ActionPrefrences;
    args: SendMessageArgs;
};

export type SendMessageArgs = {
    chat: ChatInfo;
    input_message_content: InputMessage;
};

export type SendMessageResponseContent = {
    message_info: MessageInfo;
};

export type SubmitCredentialsResponse = {
    /**
     * Whether the credentials were submitted successfully
     */
    success: boolean;
};

export type TgAuthCredentialsResponse = {
    otp?: string | null;
    password?: string | null;
};

export type ValidationError = {
    loc: Array<string | number>;
    msg: string;
    type: string;
};

export type SubmitScenarioAsyncScenarioPostData = {
    body: Scenario;
    path?: never;
    query?: never;
    url: '/scenario';
};

export type SubmitScenarioAsyncScenarioPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type SubmitScenarioAsyncScenarioPostError = SubmitScenarioAsyncScenarioPostErrors[keyof SubmitScenarioAsyncScenarioPostErrors];

export type SubmitScenarioAsyncScenarioPostResponses = {
    /**
     * Successful Response
     */
    202: Scenario;
};

export type SubmitScenarioAsyncScenarioPostResponse = SubmitScenarioAsyncScenarioPostResponses[keyof SubmitScenarioAsyncScenarioPostResponses];

export type SubmitScenarioSyncScenarioSyncSubmitPostData = {
    body: Scenario;
    path?: never;
    query?: never;
    url: '/scenario/syncSubmit';
};

export type SubmitScenarioSyncScenarioSyncSubmitPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type SubmitScenarioSyncScenarioSyncSubmitPostError = SubmitScenarioSyncScenarioSyncSubmitPostErrors[keyof SubmitScenarioSyncScenarioSyncSubmitPostErrors];

export type SubmitScenarioSyncScenarioSyncSubmitPostResponses = {
    /**
     * Successful Response
     */
    200: Scenario;
};

export type SubmitScenarioSyncScenarioSyncSubmitPostResponse = SubmitScenarioSyncScenarioSyncSubmitPostResponses[keyof SubmitScenarioSyncScenarioSyncSubmitPostResponses];

export type GetScenariosScenarioScenarioGetData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/scenario/scenario';
};

export type GetScenariosScenarioScenarioGetResponses = {
    /**
     * Successful Response
     */
    200: {
        [key: string]: ScenarioWithResult;
    };
};

export type GetScenariosScenarioScenarioGetResponse = GetScenariosScenarioScenarioGetResponses[keyof GetScenariosScenarioScenarioGetResponses];

export type GetScenarioByIdScenarioScenarioScenarioIdGetData = {
    body?: never;
    path: {
        scenario_id: string;
    };
    query?: never;
    url: '/scenario/scenario/{scenario_id}';
};

export type GetScenarioByIdScenarioScenarioScenarioIdGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetScenarioByIdScenarioScenarioScenarioIdGetError = GetScenarioByIdScenarioScenarioScenarioIdGetErrors[keyof GetScenarioByIdScenarioScenarioScenarioIdGetErrors];

export type GetScenarioByIdScenarioScenarioScenarioIdGetResponses = {
    /**
     * Successful Response
     */
    200: ScenarioWithResult | null;
};

export type GetScenarioByIdScenarioScenarioScenarioIdGetResponse = GetScenarioByIdScenarioScenarioScenarioIdGetResponses[keyof GetScenarioByIdScenarioScenarioScenarioIdGetResponses];

export type GetAllCharactersCharactersGetData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/characters';
};

export type GetAllCharactersCharactersGetResponses = {
    /**
     * Successful Response
     */
    200: Array<ProfileWorkerView>;
};

export type GetAllCharactersCharactersGetResponse = GetAllCharactersCharactersGetResponses[keyof GetAllCharactersCharactersGetResponses];

export type GetCharacterCharactersCharacterIdGetData = {
    body?: never;
    path: {
        character_id: string;
    };
    query?: never;
    url: '/characters/{character_id}';
};

export type GetCharacterCharactersCharacterIdGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetCharacterCharactersCharacterIdGetError = GetCharacterCharactersCharacterIdGetErrors[keyof GetCharacterCharactersCharacterIdGetErrors];

export type GetCharacterCharactersCharacterIdGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type StopProfileCharactersCharacterIdStopPostData = {
    body?: never;
    path: {
        character_id: string;
    };
    query?: never;
    url: '/characters/{character_id}/stop';
};

export type StopProfileCharactersCharacterIdStopPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type StopProfileCharactersCharacterIdStopPostError = StopProfileCharactersCharacterIdStopPostErrors[keyof StopProfileCharactersCharacterIdStopPostErrors];

export type StopProfileCharactersCharacterIdStopPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type StopAllProfilesCharactersStopPostData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/characters/stop';
};

export type StopAllProfilesCharactersStopPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type IsProfileRegisteredAuthIsProfileRegisteredGetData = {
    body?: never;
    path?: never;
    query: {
        profile_id: string;
    };
    url: '/auth/is-profile-registered';
};

export type IsProfileRegisteredAuthIsProfileRegisteredGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type IsProfileRegisteredAuthIsProfileRegisteredGetError = IsProfileRegisteredAuthIsProfileRegisteredGetErrors[keyof IsProfileRegisteredAuthIsProfileRegisteredGetErrors];

export type IsProfileRegisteredAuthIsProfileRegisteredGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type CredentialsAuthCredentialsGetData = {
    body?: never;
    path?: never;
    query: {
        profile_id: string;
    };
    url: '/auth/credentials';
};

export type CredentialsAuthCredentialsGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CredentialsAuthCredentialsGetError = CredentialsAuthCredentialsGetErrors[keyof CredentialsAuthCredentialsGetErrors];

export type CredentialsAuthCredentialsGetResponses = {
    /**
     * Successful Response
     */
    200: TgAuthCredentialsResponse;
};

export type CredentialsAuthCredentialsGetResponse = CredentialsAuthCredentialsGetResponses[keyof CredentialsAuthCredentialsGetResponses];

export type SubmitCredentialsAuthPostData = {
    body: AuthRequest;
    path?: never;
    query?: {
        verify_profile_exists?: boolean;
        should_override?: boolean;
    };
    url: '/auth';
};

export type SubmitCredentialsAuthPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type SubmitCredentialsAuthPostError = SubmitCredentialsAuthPostErrors[keyof SubmitCredentialsAuthPostErrors];

export type SubmitCredentialsAuthPostResponses = {
    /**
     * Successful Response
     */
    200: SubmitCredentialsResponse;
};

export type SubmitCredentialsAuthPostResponse = SubmitCredentialsAuthPostResponses[keyof SubmitCredentialsAuthPostResponses];

export type ActivateActivationActivatePostData = {
    body: ActivationRequest;
    path?: never;
    query?: never;
    url: '/activation/activate';
};

export type ActivateActivationActivatePostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type ActivateActivationActivatePostError = ActivateActivationActivatePostErrors[keyof ActivateActivationActivatePostErrors];

export type ActivateActivationActivatePostResponses = {
    /**
     * Successful Response
     */
    200: ActivationResponse;
};

export type ActivateActivationActivatePostResponse = ActivateActivationActivatePostResponses[keyof ActivateActivationActivatePostResponses];

export type ActivateWithSessionDataActivationActivateWithSessionDataPostData = {
    body: ActivationRequest;
    path?: never;
    query?: never;
    url: '/activation/activate_with_session_data';
};

export type ActivateWithSessionDataActivationActivateWithSessionDataPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type ActivateWithSessionDataActivationActivateWithSessionDataPostError = ActivateWithSessionDataActivationActivateWithSessionDataPostErrors[keyof ActivateWithSessionDataActivationActivateWithSessionDataPostErrors];

export type ActivateWithSessionDataActivationActivateWithSessionDataPostResponses = {
    /**
     * Successful Response
     */
    200: ActivationResponse;
};

export type ActivateWithSessionDataActivationActivateWithSessionDataPostResponse = ActivateWithSessionDataActivationActivateWithSessionDataPostResponses[keyof ActivateWithSessionDataActivationActivateWithSessionDataPostResponses];

export type GetStatusActivationStatusGetData = {
    body?: never;
    path?: never;
    query: {
        /**
         * The ID (GUID) of the profile to get the status of
         */
        profile_id: string;
    };
    url: '/activation/status';
};

export type GetStatusActivationStatusGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetStatusActivationStatusGetError = GetStatusActivationStatusGetErrors[keyof GetStatusActivationStatusGetErrors];

export type GetStatusActivationStatusGetResponses = {
    /**
     * Successful Response
     */
    200: ActivationResponse;
};

export type GetStatusActivationStatusGetResponse = GetStatusActivationStatusGetResponses[keyof GetStatusActivationStatusGetResponses];

export type ClientOptions = {
    baseUrl: (string & {});
};