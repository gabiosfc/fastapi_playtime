from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo


def utc_to_gmt(data: date, inicio: time, fim: time):
    local_tz = ZoneInfo('America/Sao_Paulo')

    inicio_local = (
        datetime.combine(data, inicio)
        .replace(tzinfo=ZoneInfo('UTC'))
        .astimezone(local_tz)
        .time()
    )

    fim_local = (
        datetime.combine(data, fim)
        .replace(tzinfo=ZoneInfo('UTC'))
        .astimezone(local_tz)
        .time()
    )

    return inicio_local, fim_local


def gmt_to_utc(data: date, inicio: time, fim: time):
    local_tz = ZoneInfo('America/Sao_Paulo')

    inicio_utc = (
        datetime.combine(data, inicio)
        .replace(tzinfo=local_tz)
        .astimezone(ZoneInfo('UTC'))
    )

    fim_utc = (
        datetime.combine(data, fim)
        .replace(tzinfo=local_tz)
        .astimezone(ZoneInfo('UTC'))
        .time()
    )

    data = inicio_utc.date()

    return data, inicio_utc.time(), fim_utc


def format_data(data: date, inicio: time, fim: time):
    return_data = data.strftime('%d/%m/%Y')
    return_inicio = inicio.strftime('%H:%M:%S')
    return_fim = fim.strftime('%H:%M:%S')

    return return_data, return_inicio, return_fim
