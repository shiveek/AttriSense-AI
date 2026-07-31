import time
import logging
import traceback
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("AttriSenseSRE")

class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """
    Logs transaction metadata (method, url, status code, IP) and processing latency.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        
        try:
            response = await call_next(request)
            duration = (time.time() - start_time) * 1000  # milliseconds
            
            logger.info(
                f"IP: {client_ip} | {request.method} {request.url.path} "
                f"| Status: {response.status_code} | Duration: {duration:.2f}ms"
            )
            return response
        except Exception as e:
            # Re-raise to let the GlobalExceptionMiddleware handle it
            raise e

class GlobalExceptionMiddleware(BaseHTTPMiddleware):
    """
    Catches unhandled errors, logs the full stack trace, and returns a clean 500 JSON payload.
    Prevents standard python tracebacks from leaking to customers.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            client_ip = request.client.host if request.client else "unknown"
            # Log full stack trace
            logger.error(
                f"Unhandled Exception on {request.method} {request.url.path} from IP {client_ip}\n"
                f"Error: {str(exc)}\n"
                f"Traceback: {traceback.format_exc()}"
            )
            
            # Return standardized sanitized error payload
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "An internal system error occurred. Our site reliability engineering team has been notified."
                }
            )
