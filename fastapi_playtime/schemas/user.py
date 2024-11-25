from typing import List

from pydantic import BaseModel, EmailStr
from pydantic.config import ConfigDict


class UserBase(BaseModel):
    nome: str
    cpf: str
    email: EmailStr


class UserCreate(UserBase):
    senha: str


class UserPublic(BaseModel):
    id: int
    nome: str
    cpf: str
    email: EmailStr

    # Configuração para permitir conversão automática de atributos do modelo
    model_config = ConfigDict(from_attributes=True)


class UserList(BaseModel):
    users: List[UserPublic]


class Message(BaseModel):
    message: str
