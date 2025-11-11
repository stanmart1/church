from enum import Enum

class HTTPStatus:
    OK = 200
    CREATED = 201
    NO_CONTENT = 204
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    CONFLICT = 409
    TOO_MANY_REQUESTS = 429
    INTERNAL_SERVER_ERROR = 500

class UserRole(str, Enum):
    ADMIN = "admin"
    PASTOR = "pastor"
    MINISTER = "minister"
    STAFF = "staff"
    MEMBER = "member"

class MembershipStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    VISITOR = "visitor"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class AuditAction(str, Enum):
    LOGIN = "Successful Login"
    FAILED_LOGIN = "Failed Login Attempt"
    LOGOUT = "Logout"
    LOGOUT_ALL = "Logout All Devices"
    ACCOUNT_LOCKED = "Account Locked"

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15
PASSWORD_MIN_LENGTH = 8
MAX_FILE_SIZE = 10485760
