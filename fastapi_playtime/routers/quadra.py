from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi_playtime.database import get_session
from fastapi_playtime.models.quadra import Quadra
from fastapi_playtime.models.user import User
from fastapi_playtime.routers.agendamento import (
    get_agendamentos_futuros_quadra,
)
from fastapi_playtime.schemas.quadra import QuadraCreate, QuadraOut
from fastapi_playtime.security import get_current_user

router = APIRouter(prefix='/quadras', tags=['Quadras'])

T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post('/', response_model=QuadraOut, status_code=HTTPStatus.CREATED)
def create_quadra(
    quadra: QuadraCreate,
    session: T_Session,
    current_user: T_CurrentUser,
):
    if current_user.perfil != 'admin':
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Apenas administradores podem criar quadras.',
        )

    db_quadra = (
        session.query(Quadra).filter(Quadra.nome == quadra.nome).first()
    )
    if db_quadra:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail='Quadra já cadastrada'
        )

    db_quadra = Quadra(
        nome=quadra.nome,
        descricao=quadra.descricao,
        disponivel=quadra.disponivel,
    )
    session.add(db_quadra)
    session.commit()
    session.refresh(db_quadra)

    return db_quadra


@router.get('/', response_model=list[QuadraOut])
def list_quadras(session: T_Session):
    return session.query(Quadra).all()


@router.get('/{quadra_id}', response_model=QuadraOut)
def get_quadra_id(quadra_id: int, db: T_Session):
    quadra = db.query(Quadra).filter(Quadra.id == quadra_id).first()
    if not quadra:
        raise HTTPException(status_code=404, detail='Quadra não encontrada')
    return quadra


@router.patch('/{quadra_id}', response_model=QuadraOut)
def update_quadra(
    quadra_id: int,
    quadra_input: QuadraCreate,
    session: T_Session,
    current_user: T_CurrentUser,
):
    if current_user.perfil != 'admin':
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Apenas administradores podem atualizar quadras',
        )

    quadra = session.query(Quadra).filter(Quadra.id == quadra_id).first()
    if not quadra:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail='Quadra não encontrada'
        )

    for key, value in quadra_input.model_dump(exclude_unset=True).items():
        setattr(quadra, key, value)

    session.add(quadra)
    session.commit()
    session.refresh(quadra)

    return quadra


@router.delete('/{quadra_id}', status_code=HTTPStatus.NO_CONTENT)
def delete_quadra(
    quadra_id: int,
    session: T_Session,
    current_user: T_CurrentUser,
):
    if current_user.perfil != 'admin':
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Apenas administradores podem excluir quadras',
        )

    quadra = session.query(Quadra).filter(Quadra.id == quadra_id).first()
    if not quadra:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail='Quadra não encontrada'
        )

    agendamentos_futuros = get_agendamentos_futuros_quadra(
        current_user=current_user, session=session, quadra_id=quadra_id
    )

    if agendamentos_futuros:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Essa quadra tem agendamentos portanto ser excluída',
        )

    session.delete(quadra)
    session.commit()

    return {'message': 'Quadra excluída.'}
