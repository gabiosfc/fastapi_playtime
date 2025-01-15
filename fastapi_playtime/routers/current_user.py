from datetime import datetime
from http import HTTPStatus
from typing import Annotated
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from fastapi_playtime.database import get_session
from fastapi_playtime.models.agendamento import Agendamento
from fastapi_playtime.models.user import User
from fastapi_playtime.schemas.agendamento import AgendamentoOut
from fastapi_playtime.schemas.user import UserPublicWithToken
from fastapi_playtime.security import get_current_user

router = APIRouter(prefix='/current_user', tags=['Usuário Atual'])
T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get('/', response_model=UserPublicWithToken)
def get_current_user_attributes_and_token(
    current_user: T_CurrentUser, request: Request
):
    # Recupera o token do cabeçalho Authorization
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail='Token não encontrado no cabeçalho Authorization',
        )

    access_token = auth_header.split('Bearer ')[1]

    return {
        'id': current_user.id,
        'nome': current_user.nome,
        'cpf': current_user.cpf,
        'email': current_user.email,
        'access_token': access_token,
        'token_type': 'Bearer',
    }


@router.get('/agendamento', response_model=list[AgendamentoOut])
def get_current_user_schedules(
    current_user: T_CurrentUser,
    session: T_Session,
):
    local_tz = ZoneInfo('America/Sao_Paulo')

    agendamentos = (
        session.query(Agendamento)
        .filter(Agendamento.id_usuario == current_user.id)
        .order_by(Agendamento.data, Agendamento.inicio)
    )

    return_agendamentos = []

    for agendamento in agendamentos:
        if agendamento.data > (datetime.now()).date():
            inicio_local = (
                datetime.combine(agendamento.data, agendamento.inicio)
                .replace(tzinfo=ZoneInfo('UTC'))
                .astimezone(local_tz)
                .time()
            )

            fim_local = (
                datetime.combine(agendamento.data, agendamento.fim)
                .replace(tzinfo=ZoneInfo('UTC'))
                .astimezone(local_tz)
                .time()
            )

            return_agendamentos.append({
                'id': agendamento.id,
                'id_quadra': agendamento.id_quadra,
                'id_usuario': agendamento.id_usuario,
                'data': agendamento.data.strftime('%d/%m/%Y'),
                'inicio': inicio_local.strftime('%H:%M:%S'),
                'fim': fim_local.strftime('%H:%M:%S'),
            })

    return return_agendamentos
