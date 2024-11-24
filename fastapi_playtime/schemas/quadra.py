from pydantic import BaseModel


class QuadraBase(BaseModel):
    nome: str
    descricao: str | None = None


class QuadraCreate(QuadraBase):
    pass


class QuadraOut(QuadraBase):
    id: int

    class Config:
        orm_mode = True
