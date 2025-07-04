# backend/users/dependencies.py
from fastapi_users import FastAPIUsers
from models import User
from users.manager import get_user_manager, auth_backend

# instancia global de FastAPIUsers
fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

current_user = fastapi_users.current_user(active=True)
