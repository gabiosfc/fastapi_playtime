from http import HTTPStatus

from fastapi import FastAPI

from fastapi_playtime.database import engine
from fastapi_playtime.models.user import (
    table_registry,  # Certifique-se de importar o registry
)
from fastapi_playtime.routers import agendamento, auth, quadra, users

# Criar tabelas no banco de dados
table_registry.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router)
app.include_router(quadra.router)
app.include_router(agendamento.router)
app.include_router(auth.router)


@app.get('/', status_code=HTTPStatus.OK)
def read_root():
    return {'message': 'Playtime API'}
