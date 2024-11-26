from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi_playtime.database import get_session
from fastapi_playtime.models.user import User
from fastapi_playtime.schemas.comum import Message
from fastapi_playtime.schemas.user import UserCreate, UserList, UserPublic
from fastapi_playtime.security import get_current_user, get_password_hash

router = APIRouter(prefix='/users', tags=['Users'])
T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post('/', status_code=HTTPStatus.CREATED, response_model=UserPublic)
def create_user(user: UserCreate, session: T_Session):
    # Verifica se CPF ou email já existe
    db_user = session.scalar(
        select(User).where((User.cpf == user.cpf) | (User.email == user.email))
    )

    if db_user:
        if db_user.cpf == user.cpf:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail='CPF já está cadastrado',
            )
        if db_user.email == user.email:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail='Email já está cadastrado',
            )

    # Criação do usuário
    db_user = User(
        nome=user.nome,
        cpf=user.cpf,
        email=user.email,
        perfil=user.perfil,
        senha=get_password_hash(user.senha),  # Hash da senha
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


@router.get('/', response_model=UserList)
def read_users(
    session: T_Session,
    current_user: T_CurrentUser,
    limit: int = 10,
    skip: int = 0,
):
    if current_user.perfil != 'admin':
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Somente administradores podem ver os usuários',
        )

    users = session.scalars(select(User).limit(limit).offset(skip)).all()
    return {'users': users}


@router.put('/{user_id}', response_model=UserPublic)
def update_user(
    current_user: T_CurrentUser,
    session: T_Session,
    user_id: int,
    user: UserCreate,
):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Not enough permission',
        )

    # Atualizar os dados do usuário autenticado
    current_user.nome = user.nome
    current_user.cpf = user.cpf
    current_user.email = user.email
    current_user.senha = get_password_hash(user.senha)

    session.commit()
    session.refresh(current_user)

    return current_user


@router.delete('/{user_id}', response_model=Message)
def delete_user(current_user: T_CurrentUser, session: T_Session, user_id: int):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Not enough permission',
        )

    session.delete(current_user)
    session.commit()

    return {'message': 'Usuário excluído'}
