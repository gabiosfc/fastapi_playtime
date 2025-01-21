from datetime import date, datetime, time

from pydantic import BaseModel, field_validator


class AgendamentoBase(BaseModel):
    id_quadra: int
    id_usuario: int
    data: date
    inicio: time
    fim: time

    # validação da data
    @field_validator('data', mode='before')
    def validar_data(cls, value):
        if isinstance(value, date):
            return value

        try:
            return datetime.strptime(value, '%d/%m/%Y').date()
        except ValueError:
            raise ValueError('A data deve estar no formato dd/mm/yyyy')

    # validação de inicio e fim
    @field_validator('inicio', 'fim', mode='before')
    def validar_horas(cls, value):
        if isinstance(value, time):
            return value

        try:
            return datetime.strptime(value, '%H:%M:%S').time()
        except ValueError:
            raise ValueError('Horário deve estar no formato hh:mm:ss')


class AgendamentoCreate(AgendamentoBase):
    pass


class AgendamentoOut(AgendamentoBase):
    id: int
    id_quadra: int
    id_usuario: int
    data: date
    inicio: time
    fim: time

    class Config:
        orm_mode = True


class AgendamentoNomeado(AgendamentoBase):
    id: int
    id_quadra: int
    nome_quadra: str
    id_usuario: int
    nome_usuario: str
    data: date
    inicio: time
    fim: time

    class Config:
        orm_mode = True
