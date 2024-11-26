from datetime import datetime

from sqlalchemy import Boolean, func
from sqlalchemy.orm import Mapped, mapped_column

from .user import table_registry


@table_registry.mapped_as_dataclass
class Quadra:
    __tablename__ = 'quadras'

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    nome: Mapped[str] = mapped_column(unique=True)
    descricao: Mapped[str] = mapped_column(nullable=True)
    disponivel: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), server_onupdate=func.now()
    )
