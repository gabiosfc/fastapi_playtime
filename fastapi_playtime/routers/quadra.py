from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi_playtime.database import (
    get_session,  # Importando o get_session existente
)
from fastapi_playtime.models.quadra import Quadra
from fastapi_playtime.schemas.quadra import QuadraCreate, QuadraOut

router = APIRouter()


@router.post("/", response_model=QuadraOut, status_code=201)
def create_quadra(quadra: QuadraCreate, db: Session = Depends(get_session)):
    db_quadra = db.query(Quadra).filter(Quadra.nome == quadra.nome).first()
    if db_quadra:
        raise HTTPException(status_code=400, detail="Quadra já cadastrada")
    new_quadra = Quadra(nome=quadra.nome, descricao=quadra.descricao)
    db.add(new_quadra)
    db.commit()
    db.refresh(new_quadra)
    return new_quadra


@router.get("/", response_model=list[QuadraOut])
def list_quadras(db: Session = Depends(get_session)):
    return db.query(Quadra).all()


@router.get("/{quadra_id}", response_model=QuadraOut)
def get_quadra(quadra_id: int, db: Session = Depends(get_session)):
    quadra = db.query(Quadra).filter(Quadra.id == quadra_id).first()
    if not quadra:
        raise HTTPException(status_code=404, detail="Quadra não encontrada")
    return quadra


@router.delete("/{quadra_id}", status_code=204)
def delete_quadra(quadra_id: int, db: Session = Depends(get_session)):
    quadra = db.query(Quadra).filter(Quadra.id == quadra_id).first()
    if not quadra:
        raise HTTPException(status_code=404, detail="Quadra não encontrada")
    db.delete(quadra)
    db.commit()
