from datetime import date, time

from pydantic import BaseModel


class AgendamentoBase(BaseModel):
    id_quadra: int
    id_usuario: int
    data: date
    inicio: time
    fim: time


class AgendamentoCreate(AgendamentoBase):
    pass


class AgendamentoOut(AgendamentoBase):
    id: int

    class Config:
        orm_mode = True
