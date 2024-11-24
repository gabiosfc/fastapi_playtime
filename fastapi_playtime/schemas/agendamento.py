from datetime import datetime

from pydantic import BaseModel


class AgendamentoBase(BaseModel):
    user_id: int
    quadra_id: int
    horario: datetime


class AgendamentoCreate(AgendamentoBase):
    pass


class AgendamentoOut(AgendamentoBase):
    id: int

    class Config:
        orm_mode = True
