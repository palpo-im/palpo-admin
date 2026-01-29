// User types
export interface Threepid {
  medium: string;
  address: string;
  added_at: number;
  validated_at: number;
}

export interface ExternalId {
  auth_provider: string;
  external_id: string;
}

export interface User {
  name: string;
  displayname?: string;
  threepids: Threepid[];
  avatar_url?: string;
  is_guest: 0 | 1;
  admin: 0 | 1;
  deactivated: 0 | 1;
  erased: boolean;
  shadow_banned: 0 | 1;
  creation_ts: number;
  appservice_id?: string;
  consent_server_notice_sent?: string;
  consent_version?: string;
  consent_ts?: number;
  external_ids: ExternalId[];
  user_type?: string;
  locked: boolean;
  suspended?: boolean;
}

export interface UserRecord extends User {
  id: string;
  avatar_src?: string;
  creation_ts_ms: number;
}

// Room types
export interface Room {
  room_id: string;
  name?: string;
  canonical_alias?: string;
  avatar_url?: string;
  joined_members: number;
  joined_local_members: number;
  version: number;
  creator: string;
  encryption?: string;
  federatable: boolean;
  public: boolean;
  join_rules: "public" | "knock" | "invite" | "private";
  guest_access?: "can_join" | "forbidden";
  history_visibility: "invited" | "joined" | "shared" | "world_readable";
  state_events: number;
  room_type?: string;
  topic?: string;
  joined_local_devices?: number;
}

export interface RoomRecord extends Room {
  id: string;
  alias?: string;
  members: number;
  is_encrypted: boolean;
  avatar?: string;
}

// Room state types
export interface RoomState {
  age: number;
  content: {
    alias?: string;
    [key: string]: unknown;
  };
  event_id: string;
  origin_server_ts: number;
  room_id: string;
  sender: string;
  state_key: string;
  type: string;
  user_id: string;
  unsigned: {
    age?: number;
  };
}

export interface ForwardExtremity {
  event_id: string;
  state_group: number;
  depth: number;
  received_ts: number;
}

// Report types
export interface EventReport {
  id: number;
  received_ts: number;
  room_id: string;
  name: string;
  event_id: string;
  user_id: string;
  reason?: string;
  score?: number;
  sender: string;
  canonical_alias?: string;
  event_json?: {
    origin?: string;
    origin_server_ts?: number;
    type?: string;
    content?: {
      msgtype?: string;
      body?: string;
      format?: string;
      formatted_body?: string;
      algorithm?: string;
      url?: string;
      info?: {
        mimetype?: string;
      };
    };
  };
}

// Report record with id for data table
export type ReportRecord = EventReport & { id: number };

// Device types
export interface Device {
  device_id: string;
  display_name?: string;
  last_seen_ip?: string;
  last_seen_user_agent?: string;
  last_seen_ts?: number;
  user_id: string;
}

export interface DeviceRecord extends Device {
  id: string;
}

// Connection types
export interface Connection {
  ip: string;
  last_seen: number;
  user_agent: string;
}

export interface Whois {
  user_id: string;
  devices: Record<
    string,
    {
      sessions: {
        connections: Connection[];
      }[];
    }
  >;
}

// Pusher types
export interface Pusher {
  app_display_name: string;
  app_id: string;
  data: {
    url?: string;
    format: string;
  };
  url: string;
  format: string;
  device_display_name: string;
  profile_tag: string;
  kind: string;
  lang: string;
  pushkey: string;
}

export interface PusherRecord extends Pusher {
  id: string;
}

// Media types
export interface UserMedia {
  created_ts: number;
  last_access_ts?: number;
  media_id: string;
  media_length: number;
  media_type: string;
  quarantined_by?: string;
  safe_from_quarantine: boolean;
  upload_name?: string;
}

export interface UserMediaRecord extends UserMedia {
  id: string;
}

export interface UserMediaStatistic {
  displayname: string;
  media_count: number;
  media_length: number;
  user_id: string;
}

export interface UserMediaStatisticRecord extends UserMediaStatistic {
  id: string;
}

// Registration token types
export interface RegistrationToken {
  token: string;
  uses_allowed: number;
  pending: number;
  completed: number;
  expiry_time?: number;
}

export interface RegistrationTokenRecord extends RegistrationToken {
  id: string;
}

// Destination types
export interface Destination {
  destination: string;
  retry_last_ts: number;
  retry_interval: number;
  failure_ts: number;
  last_successful_stream_ordering?: number;
}

export interface DestinationRecord extends Destination {
  id: string;
}

export interface DestinationRoom {
  room_id: string;
  stream_ordering: number;
}

export interface DestinationRoomRecord extends DestinationRoom {
  id: string;
}

// Membership type
export interface Membership {
  id: string;
  membership: string;
}

// Media operations
export interface DeleteMediaParams {
  before_ts: string;
  size_gt: number;
  keep_profiles: boolean;
}

export interface DeleteMediaResult {
  deleted_media: string[];
  total: number;
}

export interface UploadMediaParams {
  file: File;
  filename: string;
  content_type: string;
}

export interface UploadMediaResult {
  content_uri: string;
}

// Feature and limits types
export interface ExperimentalFeaturesModel {
  features: Record<string, boolean>;
}

export interface RateLimitsModel {
  messages_per_second?: number;
  burst_count?: number;
}

export interface AccountDataModel {
  account_data: {
    global: Record<string, object>;
    rooms: Record<string, object>;
  };
}

export interface UsernameAvailabilityResult {
  available?: boolean;
  error?: string;
  errcode?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc" | "ASC" | "DESC";
}

export interface ListParams {
  pagination: PaginationParams;
  sort: SortParams;
  filter?: Record<string, unknown>;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
}

// Server status types (for Palpo admin)
export interface ServerStatusComponent {
  ok: boolean;
  category: string;
  reason: string;
  url: string;
  help: string;
  label: {
    url: string;
    icon: string;
    text: string;
  };
}

export interface ServerStatusResponse {
  success: boolean;
  maintenance?: boolean;
  ok: boolean;
  host: string;
  results: ServerStatusComponent[];
}

export interface ServerProcessResponse {
  locked_at: string;
  command: string;
  maintenance?: boolean;
}

export interface ServerNotification {
  event_id: string;
  output: string;
  sent_at: string;
}

export interface ServerNotificationsResponse {
  success: boolean;
  notifications: ServerNotification[];
}

export interface ServerCommand {
  icon: string;
  name: string;
  description: string;
  args: boolean;
  with_lock: boolean;
  additionalArgs?: string;
}

export type ServerCommandsResponse = Record<string, ServerCommand>;

export interface ScheduledCommand {
  args: string;
  command: string;
  id: string;
  is_recurring: boolean;
  scheduled_at: string;
}

export interface RecurringCommand {
  args: string;
  command: string;
  id: string;
  scheduled_at: string;
  time: string;
}

export interface Payment {
  amount: number;
  email: string;
  is_subscription: boolean;
  paid_at: string;
  transaction_id: string;
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  description?: string;
}

export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  maintenance?: boolean;
  subscription?: {
    plan?: string;
    status?: string;
    next_billing_date?: string;
  };
  payment_method?: {
    last4?: string;
    brand?: string;
  };
  invoices?: Invoice[];
}
