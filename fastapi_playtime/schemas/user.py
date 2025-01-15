from typing import List

from pydantic import BaseModel, EmailStr
from pydantic.config import ConfigDict

from fastapi_playtime.models.user import PerfilUsuario


class UserBase(BaseModel):
    nome: str
    cpf: str
    email: EmailStr
    perfil: PerfilUsuario


class UserCreate(UserBase):
    senha: str
    perfil: PerfilUsuario


class UserPublic(BaseModel):
    id: int
    nome: str
    cpf: str
    email: EmailStr

    # Configuração para permitir conversão automática de atributos do modelo
    model_config = ConfigDict(from_attributes=True)


class UserPublicWithToken(BaseModel):
    id: int
    nome: str
    cpf: str
    email: EmailStr
    access_token: str
    token_type: str

    # Configuração para permitir conversão automática de atributos do modelo
    model_config = ConfigDict(from_attributes=True)


class UserList(BaseModel):
    users: List[UserPublic]


class Message(BaseModel):
    message: str
