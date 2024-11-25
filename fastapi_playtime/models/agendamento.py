from datetime import date, time

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, registry

from .user import table_registry


@table_registry.mapped_as_dataclass
class Agendamento:
    __tablename__ = 'agendamentos'

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    id_quadra: Mapped[int] = mapped_column(ForeignKey('quadras.id'))
    id_usuario: Mapped[int] = mapped_column(ForeignKey('users.id'))
    data: Mapped[date] = mapped_column(nullable=False)
    inicio: Mapped[time] = mapped_column(nullable=False)
    fim: Mapped[time] = mapped_column(nullable=False)
