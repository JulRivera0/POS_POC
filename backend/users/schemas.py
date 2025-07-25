# backend/users/schemas.py
from fastapi_users import schemas

class UserRead(schemas.BaseUser[int]):
    pass

class UserCreate(schemas.BaseUserCreate):
    pass
