from pydantic import BaseModel


class QuadraBase(BaseModel):
    nome: str
    descricao: str | None = None


class QuadraCreate(QuadraBase):
    disponivel: bool = True


class QuadraOut(QuadraBase):
    id: int
    disponivel: bool

    class Config:
        orm_mode = True
