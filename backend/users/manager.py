# backend/users/manager.py
from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users import BaseUserManager, IntegerIDMixin
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User

# ───────────────────────────────────────────────
# CONFIG
# ───────────────────────────────────────────────
SECRET = "WDPWQbQGx--4qzN7e4WZ4hD8l0GT9Vj3zjK8E7ojyFA"          # pon un token seguro en prod

# JWT transport (Bearer header)
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=60 * 60 * 24)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# ───────────────────────────────────────────────
# USER DB  (adaptador SQLAlchemy)
# ───────────────────────────────────────────────
async def get_user_db(session: AsyncSession = Depends(get_db)) -> AsyncGenerator[SQLAlchemyUserDatabase, None]:
    yield SQLAlchemyUserDatabase(session, User)

# ───────────────────────────────────────────────
# USER MANAGER
# ───────────────────────────────────────────────
class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = SECRET
    verification_token_secret   = SECRET

async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)) -> AsyncGenerator[UserManager, None]:
    yield UserManager(user_db)
