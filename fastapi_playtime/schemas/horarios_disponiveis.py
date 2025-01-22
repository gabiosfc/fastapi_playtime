from pydantic import BaseModel


class HorarioOut(BaseModel):
    horarios: str
