from http import HTTPStatus

from fastapi import FastAPI

from fastapi_playtime.database import engine
from fastapi_playtime.models.user import (
    table_registry,  # Certifique-se de importar o registry
)
from fastapi_playtime.routers import agendamento, quadra, users

# Criar tabelas no banco de dados
table_registry.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(quadra.router, prefix="/quadras", tags=["Quadras"])
app.include_router(agendamento.router, prefix="/agendamentos", tags=["Agendamentos"])


@app.get('/', status_code=HTTPStatus.OK)
def read_root():
    return {'message': 'Playtime API'}
