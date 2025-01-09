from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi_playtime.database import get_session
from fastapi_playtime.models.agendamento import Agendamento
from fastapi_playtime.models.user import User
from fastapi_playtime.routers.quadra import get_quadra_id
from fastapi_playtime.routers.users import get_user_id
from fastapi_playtime.schemas.agendamento import AgendamentoNomeado
from fastapi_playtime.security import get_current_user
from fastapi_playtime.utils.datetime_format import (
    format_data,
    utc_to_gmt,
)

router = APIRouter(
    prefix='/agendamentos_nomeados', tags=['Agendamento Nomeados']
)

T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get('/agendamentos_nomeados', response_model=list[AgendamentoNomeado])
def get_agendamentos_nomeados(current_user: T_CurrentUser, session: T_Session):
    if current_user.perfil != 'admin':
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail='Somente administradores podem ver agendamentos nomeados',
        )

    agendamentos = session.query(Agendamento).order_by(
        Agendamento.data, Agendamento.inicio
    )

    if not agendamentos:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Sem agendamentos a listar',
        )

    return_agendamentos = []
    for agendamento in agendamentos:
        user: User = get_user_id(
            session=session,
            current_user=current_user,
            user_id=agendamento.id_usuario,
        )

        quadra = get_quadra_id(db=session, quadra_id=agendamento.id_quadra)

        data_local, inicio_local, fim_local = utc_to_gmt(
            agendamento.data, agendamento.inicio, agendamento.fim
        )

        data, inicio, fim = format_data(data_local, inicio_local, fim_local)

        return_agendamentos.append({
            'id': agendamento.id,
            'id_quadra': agendamento.id_quadra,
            'nome_quadra': quadra.nome,
            'id_usuario': agendamento.id_usuario,
            'nome_usuario': user.nome,
            'data': data,
            'inicio': inicio,
            'fim': fim,
        })

    return return_agendamentos
