from datetime import datetime
from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi_playtime.database import get_session
from fastapi_playtime.models.agendamento import Agendamento
from fastapi_playtime.models.quadra import Quadra
from fastapi_playtime.models.user import User
from fastapi_playtime.schemas.agendamento import (
    AgendamentoBase,
    AgendamentoOut,
)
from fastapi_playtime.security import get_current_user
from fastapi_playtime.utils.datetime_format import (
    format_data,
    gmt_to_utc,
    utc_to_gmt,
)

router = APIRouter(prefix='/agendamento', tags=['Agendamento'])

T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    '/', response_model=AgendamentoOut, status_code=HTTPStatus.CREATED
)
def create_agendamento(
    agendamento: AgendamentoBase,
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

    hora_local = datetime.now()

    if hora_local.date() > agendamento.data:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='A data do agendamento já passou.',
        )

    if hora_local.date() == agendamento.data:
        if hora_local.time() > agendamento.inicio:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail='A hora do agendamento já passou.',
            )

    data = agendamento.data

    data_utc, inicio_utc, fim_utc = gmt_to_utc(
        agendamento.data, agendamento.inicio, agendamento.fim
    )

    conflito = (
        session.query(Agendamento)
        .filter(
            Agendamento.id_quadra == agendamento.id_quadra,
            Agendamento.data == data,
            Agendamento.inicio <= fim_utc,
            Agendamento.fim > inicio_utc,
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
        data=data_utc,
        inicio=inicio_utc,
        fim=fim_utc,
    )

    session.add(novo_agendamento)
    session.commit()
    session.refresh(novo_agendamento)

    # buildando o retorno diferente do que é armazenado no banco:
    return_novo_agendamento = {
        'id': novo_agendamento.id,
        'id_quadra': agendamento.id_quadra,
        'id_usuario': current_user.id,
        'data': agendamento.data,
        'inicio': agendamento.inicio,
        'fim': agendamento.fim,
    }

    return return_novo_agendamento


@router.get('/todos_agendamentos', response_model=list[AgendamentoOut])
def list_agendamentos(session: T_Session, current_user: T_CurrentUser):
    if current_user.perfil == 'admin':
        agendamentos = session.query(Agendamento).order_by(
            Agendamento.data, Agendamento.inicio
        )

    if current_user.perfil != 'admin':
        agendamentos = (
            session.query(Agendamento)
            .where(Agendamento.id_usuario == current_user.id)
            .order_by(Agendamento.data, Agendamento.inicio)
        )

    return_agendamentos = []

    for agendamento in agendamentos:
        data_local, inicio_local, fim_local = utc_to_gmt(
            agendamento.data, agendamento.inicio, agendamento.fim
        )
        
        data, inicio, fim = format_data(data_local, inicio_local, fim_local)

        return_agendamentos.append({
            'id': agendamento.id,
            'id_quadra': agendamento.id_quadra,
            'id_usuario': agendamento.id_usuario,
            'data': data,
            'inicio': inicio,
            'fim': fim,
        })

    return return_agendamentos


@router.get('/agendamentos_futuros', response_model=list[AgendamentoOut])
def get_agendamentos_futuros(current_user: T_CurrentUser, session: T_Session):
    agendamentos = (
        session.query(Agendamento)
        .where(Agendamento.id_usuario == current_user.id)
        .order_by(Agendamento.data, Agendamento.inicio)
    )

    gmt_local = datetime.now()
    return_agendamentos = []

    for agendamento in agendamentos:
        data_local, inicio_local, fim_local = utc_to_gmt(
            agendamento.data, agendamento.inicio, agendamento.fim
        )

        data, inicio, fim = format_data(data_local, inicio_local, fim_local)

        # verificando se o horário ja passou
        if data_local > gmt_local.date():
            return_agendamentos.append({
                'id': agendamento.id,
                'id_quadra': agendamento.id_quadra,
                'id_usuario': agendamento.id_usuario,
                'data': data,
                'inicio': inicio,
                'fim': fim,
            })

        # verificando se a data é a mesma
        if data_local == gmt_local.date():
            if inicio_local >= gmt_local.time():
                return_agendamentos.append({
                    'id': agendamento.id,
                    'id_quadra': agendamento.id_quadra,
                    'id_usuario': agendamento.id_usuario,
                    'data': data,
                    'inicio': inicio,
                    'fim': fim,
                })

    return return_agendamentos


@router.get('/todos_agendamentos_futuros', response_model=list[AgendamentoOut])
def get_todos_agendamentos_futuros(
    current_user: T_CurrentUser, session: T_Session
):
    def verify_time(list_agendamentos: list[Agendamento]):
        gmt_local = datetime.now()
        return_agendamentos = []

        for agendamento in list_agendamentos:
            data_local, inicio_local, fim_local = utc_to_gmt(
                agendamento.data, agendamento.inicio, agendamento.fim
            )

            data, inicio, fim = format_data(
                data_local, inicio_local, fim_local
            )

            # verificando se o horário ja passou
            if data_local > gmt_local.date():
                return_agendamentos.append({
                    'id': agendamento.id,
                    'id_quadra': agendamento.id_quadra,
                    'id_usuario': agendamento.id_usuario,
                    'data': data,
                    'inicio': inicio,
                    'fim': fim,
                })

            # verificando se a data é a mesma
            if data_local == gmt_local.date():
                if inicio_local >= gmt_local.time():
                    return_agendamentos.append({
                        'id': agendamento.id,
                        'id_quadra': agendamento.id_quadra,
                        'id_usuario': agendamento.id_usuario,
                        'data': data,
                        'inicio': inicio,
                        'fim': fim,
                    })

        return return_agendamentos

    if current_user.perfil == 'admin':
        agendamentos = session.query(Agendamento).order_by(
            Agendamento.data, Agendamento.inicio
        )

    if current_user.perfil != 'admin':
        agendamentos = (
            session.query(Agendamento)
            .where(Agendamento.id_usuario == current_user.id)
            .order_by(Agendamento.data, Agendamento.inicio)
        )

    return_agendamentos = verify_time(list_agendamentos=agendamentos)

    return return_agendamentos


@router.get(
    '/agendamentos_futuros_quadra', response_model=list[AgendamentoOut]
)
def get_agendamentos_futuros_quadra(
    current_user: T_CurrentUser, session: T_Session, quadra_id: int
):
    if current_user.perfil != 'admin':
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail='Somente administradores podem ver horários das quadras',
        )

    agendamentos = (
        session.query(Agendamento)
        .where(Agendamento.id_quadra == quadra_id)
        .order_by(Agendamento.data, Agendamento.inicio)
    )

    gmt_local = datetime.now()
    return_agendamentos = []

    for agendamento in agendamentos:
        data_local, inicio_local, fim_local = utc_to_gmt(
            agendamento.data, agendamento.inicio, agendamento.fim
        )

        data, inicio, fim = format_data(data_local, inicio_local, fim_local)

        # verificando se o horário ja passou
        if data_local > gmt_local.date():
            return_agendamentos.append({
                'id': agendamento.id,
                'id_quadra': agendamento.id_quadra,
                'id_usuario': agendamento.id_usuario,
                'data': data,
                'inicio': inicio,
                'fim': fim,
            })

        # verificando se a data é a mesma
        if data_local == gmt_local.date():
            if inicio_local >= gmt_local.time():
                return_agendamentos.append({
                    'id': agendamento.id,
                    'id_quadra': agendamento.id_quadra,
                    'id_usuario': agendamento.id_usuario,
                    'data': data,
                    'inicio': inicio,
                    'fim': fim,
                })

    return return_agendamentos


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

    data_local, inicio_local, fim_local = utc_to_gmt(
        agendamento.data, agendamento.inicio, agendamento.fim
    )

    data, inicio, fim = format_data(data_local, inicio_local, fim_local)

    return_agendamento = {
        'id': agendamento.id,
        'id_quadra': agendamento.id_quadra,
        'id_usuario': agendamento.id_usuario,
        'data': data,
        'inicio': inicio,
        'fim': fim,
    }

    return return_agendamento


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
