// Authentication & Security
export const AUTH = {
  JWT_EXPIRES_IN: '7d',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 8,
  TOKEN_BLACKLIST_CLEANUP_HOURS: 24,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  SERVICE_TIMES_LIMIT: 5,
  NOTIFICATIONS_LIMIT: 5,
  LOGIN_HISTORY_LIMIT: 5,
  SERMONS_LIMIT: 12,
  EVENTS_LIMIT: 10,
  MEMBERS_LIMIT: 20,
};



// Audit Actions
export const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  FAILED_LOGIN: 'failed_login',
  PASSWORD_CHANGE: 'password_change',
  PROFILE_UPDATE: 'profile_update',
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  ROLE_CHANGE: 'role_change',
};

// File Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  IMAGE_MAX_WIDTH: 1920,
  IMAGE_MAX_HEIGHT: 1080,
  THUMBNAIL_WIDTH: 400,
  THUMBNAIL_HEIGHT: 300,
};

// WebSocket Events
export const WS_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CHAT_MESSAGE: 'chat_message',
  VIEWER_COUNT: 'viewer_count',
  STREAM_START: 'stream_start',
  STREAM_END: 'stream_end',
  NOTIFICATION: 'notification',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Content Keys
export const CONTENT_KEYS = {
  HERO_TITLE: 'hero_title',
  HERO_SUBTITLE: 'hero_subtitle',
  ABOUT_TEXT: 'about_text',
  LEADERSHIP_TEXT: 'leadership_text',
  SCRIPTURE_TEXT: 'scripture_text',
  HISTORY_TEXT: 'history_text',
  CONTACT_ADDRESS_LINE1: 'contact_address_line1',
  CONTACT_ADDRESS_LINE2: 'contact_address_line2',
  CONTACT_EMAIL: 'contact_email',
  CONTACT_PHONE: 'contact_phone',
};

// Time Formats
export const TIME_FORMAT = {
  TWELVE_HOUR: 'hh:mm A',
  TWENTY_FOUR_HOUR: 'HH:mm',
};

// Cache Duration (in seconds)
export const CACHE_DURATION = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};


