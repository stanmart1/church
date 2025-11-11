from fastapi import HTTPException
from app.core.constants import HTTPStatus

class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(status_code=HTTPStatus.UNAUTHORIZED, detail={"error": detail})

class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=HTTPStatus.FORBIDDEN, detail={"error": detail})

class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=HTTPStatus.NOT_FOUND, detail={"error": detail})

class ConflictException(HTTPException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=HTTPStatus.CONFLICT, detail={"error": detail})

class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=HTTPStatus.BAD_REQUEST, detail={"error": detail})

class TooManyRequestsException(HTTPException):
    def __init__(self, detail: str = "Too many requests"):
        super().__init__(status_code=HTTPStatus.TOO_MANY_REQUESTS, detail={"error": detail})
