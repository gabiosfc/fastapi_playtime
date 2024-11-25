from datetime import timedelta
from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi_playtime.database import (
    get_session,  # Importando o get_session existente
)
from fastapi_playtime.models.agendamento import Agendamento
from fastapi_playtime.models.quadra import Quadra
from fastapi_playtime.models.user import User
from fastapi_playtime.schemas.agendamento import (
    AgendamentoCreate,
    AgendamentoOut,
)

router = APIRouter(prefix='/agendamento', tags=['Agendamento'])

T_Session = Annotated[Session, Depends(get_session)]


@router.post('/', response_model=AgendamentoOut, status_code=201)
def create_agendamento(agendamento: AgendamentoCreate, db: T_Session):
    # Validar se o usuário existe
    user = db.query(User).filter(User.id == agendamento.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')

    # Validar se a quadra existe
    quadra = (
        db.query(Quadra).filter(Quadra.id == agendamento.quadra_id).first()
    )
    if not quadra:
        raise HTTPException(status_code=404, detail='Quadra não encontrada')

    # Validar se o horário está disponível
    horario_inicio = agendamento.horario
    horario_fim = horario_inicio + timedelta(hours=1)
    conflito = (
        db.query(Agendamento)
        .filter(
            Agendamento.quadra_id == agendamento.quadra_id,
            Agendamento.horario >= horario_inicio,
            Agendamento.horario < horario_fim,
        )
        .first()
    )
    if conflito:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Horário indisponível para esta quadra',
        )

    # Criar agendamento
    new_agendamento = Agendamento(
        user_id=agendamento.user_id,
        quadra_id=agendamento.quadra_id,
        horario=agendamento.horario,
    )
    db.add(new_agendamento)
    db.commit()
    db.refresh(new_agendamento)
    return new_agendamento


@router.get('/', response_model=list[AgendamentoOut])
def list_agendamentos(db: T_Session):
    return db.query(Agendamento).all()


@router.get('/{agendamento_id}', response_model=AgendamentoOut)
def get_agendamento(agendamento_id: int, db: T_Session):
    agendamento = (
        db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    )
    if not agendamento:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Agendamento não encontrado',
        )
    return agendamento


@router.delete('/{agendamento_id}', status_code=204)
def delete_agendamento(agendamento_id: int, db: T_Session):
    agendamento = (
        db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    )
    if not agendamento:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Agendamento não encontrado',
        )
    db.delete(agendamento)
    db.commit()
