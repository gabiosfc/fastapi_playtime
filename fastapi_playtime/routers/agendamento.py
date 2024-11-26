from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi_playtime.database import get_session
from fastapi_playtime.models.agendamento import Agendamento
from fastapi_playtime.models.quadra import Quadra
from fastapi_playtime.models.user import User
from fastapi_playtime.schemas.agendamento import (
    AgendamentoCreate,
    AgendamentoOut,
)
from fastapi_playtime.security import get_current_user

router = APIRouter(prefix='/agendamento', tags=['Agendamento'])

T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    '/', response_model=AgendamentoOut, status_code=HTTPStatus.CREATED
)
def create_agendamento(
    agendamento: AgendamentoCreate,
    session: T_Session,
    current_user: T_CurrentUser,
):
    quadra = (
        session.query(Quadra)
        .filter(Quadra.id == agendamento.id_quadra)
        .first()
    )
    if not quadra:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail='Quadra não encontrada'
        )

    if not quadra.disponivel:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Quadra não está disponível para agendamento',
        )

    conflito = (
        session.query(Agendamento)
        .filter(
            Agendamento.id_quadra == agendamento.id_quadra,
            Agendamento.data == agendamento.data,
            Agendamento.inicio < agendamento.fim,
            Agendamento.fim > agendamento.inicio,
        )
        .first()
    )

    if conflito:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail='Conflito de horário para esta quadra',
        )

    novo_agendamento = Agendamento(
        id_quadra=agendamento.id_quadra,
        id_usuario=current_user.id,
        data=agendamento.data,
        inicio=agendamento.inicio,
        fim=agendamento.fim,
    )

    session.add(novo_agendamento)
    session.commit()
    session.refresh(novo_agendamento)

    return novo_agendamento


@router.get('/', response_model=list[AgendamentoOut])
def list_agendamentos(session: T_Session):
    return session.query(Agendamento).all()


@router.get('/{agendamento_id}', response_model=AgendamentoOut)
def get_agendamento(agendamento_id: int, session: T_Session):
    agendamento = (
        session.query(Agendamento)
        .filter(Agendamento.id == agendamento_id)
        .first()
    )
    if not agendamento:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Agendamento não encontrado',
        )
    return agendamento


@router.delete('/{agendamento_id}', status_code=HTTPStatus.NO_CONTENT)
def delete_agendamento(
    agendamento_id: int, session: T_Session, current_user: T_CurrentUser
):
    agendamento = (
        session.query(Agendamento)
        .filter(Agendamento.id == agendamento_id)
        .first()
    )
    if not agendamento:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Agendamento não encontrado',
        )

    if (agendamento.id_usuario != current_user.id) and (
        current_user.perfil != 'admin'
    ):
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Apenas administradores ou donos do horario podem excluir',
        )

    session.delete(agendamento)
    session.commit()

    return {'message': 'Agendamento cancelado.'}
