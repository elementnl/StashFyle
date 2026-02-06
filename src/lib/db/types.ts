// Base Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string | null;
  type: "secret" | "public";
  allowed_origins: string[] | null;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface StoredFile {
  id: string;
  user_id: string;
  name: string;
  storage_key: string;
  folder: string | null;
  size_bytes: number;
  mime_type: string | null;
  is_private: boolean;
  expires_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export type SubscriptionPlan = "free" | "hobby" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "grace_period";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  grace_period_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Usage {
  id: string;
  user_id: string;
  period_start: string;
  storage_bytes: number;
  bandwidth_bytes: number;
  upload_count: number;
  created_at: string;
  updated_at: string;
}

export interface RequestLog {
  id: string;
  user_id: string;
  api_key_id: string;
  method: string;
  endpoint: string;
  status_code: number;
  response_time_ms: number;
  file_size_bytes: number | null;
  error_code: string | null;
  ip_address: string | null;
  created_at: string;
}

// Insert Types
export type UserInsert = Pick<User, "id" | "email"> &
  Partial<Pick<User, "name" | "stripe_customer_id">>;

export type ApiKeyInsert = Pick<
  ApiKey,
  "user_id" | "key_hash" | "key_prefix" | "type"
> &
  Partial<Pick<ApiKey, "name" | "allowed_origins">>;

export type FileInsert = Pick<
  StoredFile,
  "id" | "user_id" | "name" | "storage_key" | "size_bytes"
> &
  Partial<Pick<StoredFile, "folder" | "mime_type" | "is_private" | "expires_at">>;

export type SubscriptionInsert = Pick<Subscription, "user_id" | "plan" | "status"> &
  Partial<
    Pick<
      Subscription,
      | "stripe_subscription_id"
      | "stripe_price_id"
      | "current_period_start"
      | "current_period_end"
      | "cancel_at_period_end"
      | "grace_period_ends_at"
    >
  >;

export type UsageInsert = Pick<Usage, "user_id" | "period_start">;

export type RequestLogInsert = Pick<
  RequestLog,
  "user_id" | "api_key_id" | "method" | "endpoint" | "status_code" | "response_time_ms"
> &
  Partial<Pick<RequestLog, "file_size_bytes" | "error_code" | "ip_address">>;

// Update Types
export type UserUpdate = Partial<Pick<User, "name" | "stripe_customer_id">>;

export type ApiKeyUpdate = Partial<Pick<ApiKey, "name" | "allowed_origins" | "last_used_at" | "revoked_at">>;

export type FileUpdate = Partial<
  Pick<StoredFile, "name" | "folder" | "is_private" | "expires_at" | "deleted_at">
>;

export type SubscriptionUpdate = Partial<
  Pick<
    Subscription,
    | "stripe_subscription_id"
    | "stripe_price_id"
    | "plan"
    | "status"
    | "current_period_start"
    | "current_period_end"
    | "cancel_at_period_end"
    | "grace_period_ends_at"
  >
>;

export type UsageUpdate = Partial<Pick<Usage, "storage_bytes" | "bandwidth_bytes" | "upload_count">>;

// Response Types
export interface FileResponse {
  id: string;
  url: string | null;
  name: string;
  folder: string | null;
  size: number;
  type: string | null;
  private: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface ApiKeyResponse {
  id: string;
  name: string | null;
  prefix: string;
  type: "secret" | "public";
  allowed_origins: string[] | null;
  last_used_at: string | null;
  created_at: string;
}

export interface UsageResponse {
  storage_bytes: number;
  bandwidth_bytes: number;
  upload_count: number;
  period_start: string;
}

export interface RequestLogResponse {
  id: string;
  method: string;
  endpoint: string;
  status_code: number;
  response_time_ms: number;
  file_size_bytes: number | null;
  error_code: string | null;
  created_at: string;
}
