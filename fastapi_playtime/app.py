from http import HTTPStatus

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi_playtime.database import engine
from fastapi_playtime.models.user import table_registry
from fastapi_playtime.routers import (
    agendamento,
    auth,
    current_user,
    quadra,
    users,
)

# Criar tabelas no banco de dados
table_registry.metadata.create_all(bind=engine)

app = FastAPI()

origins = ['http://localhost:3000']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(agendamento.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(current_user.router)
app.include_router(quadra.router)


@app.get('/', status_code=HTTPStatus.OK)
def read_root():
    return {'message': 'Playtime API'}
