from datetime import datetime, timedelta
from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi_playtime.database import get_session
from fastapi_playtime.models.agendamento import Agendamento
from fastapi_playtime.routers.quadra import get_quadra_id

router = APIRouter(
    prefix='/horarios_disponiveis', tags=['Horários Disponíveis']
)

T_Session = Annotated[Session, Depends(get_session)]


# @router.get('/{quadra_id}/{data}', response_model=HorarioOut)
@router.get('/{quadra_id}/{data}')
def get_horarios_quadra(session: T_Session, quadra_id: int, data: str):
    def format_hour(hour):
        format = datetime.strptime(hour, '%H')
        return format.time()

    quadra = get_quadra_id(quadra_id=quadra_id, db=session)

    if not quadra:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Quadra não encontrada',
        )

    min_hour = 14
    max_hour = 22

    hour_list = [format_hour(str(x)) for x in range(min_hour, max_hour + 1)]
    gmt_midnight = format_hour('21')

    try:
        data_db = datetime.strptime(data, '%d%m%Y').date()
    except Exception:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Insira uma data no formato ddmmyyyy',
        )

    # acima de 21h em utc o dia vira
    data_gmt = data_db + timedelta(days=1)
    horarios = []

    for hour in hour_list:
        if hour < gmt_midnight:
            horarios_db = (
                session.query(Agendamento)
                .where(
                    Agendamento.id_quadra == quadra_id,
                    Agendamento.data == data_db,
                    Agendamento.inicio <= hour,
                    Agendamento.fim > hour,
                )
                .first()
            )

            if not horarios_db:
                horarios.append(hour)

        if hour >= gmt_midnight:
            hour_transform = datetime.combine(datetime.today(), hour)
            hour_midnight = (hour_transform + timedelta(hours=3)).time()

            horarios_db = (
                session.query(Agendamento)
                .where(
                    Agendamento.id_quadra == quadra_id,
                    Agendamento.data == data_gmt,
                    Agendamento.inicio <= hour_midnight,
                    Agendamento.fim > hour_midnight,
                )
                .first()
            )

            if not horarios_db:
                horarios.append(hour)

    return horarios
