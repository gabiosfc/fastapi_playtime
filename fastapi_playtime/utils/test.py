from datetime import date, time, datetime, timedelta
from zoneinfo import ZoneInfo

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

data = datetime.strptime('06/01/2025', '%d/%m/%Y').date()
inicio = datetime.strptime('21:00:00', '%H:%M:%S').time()
fim = datetime.strptime('22:00:00', '%H:%M:%S').time()

data_utc, inicio_utc, fim_utc = gmt_to_utc(data, inicio, fim)

print(data, inicio, fim)
print(data_utc, inicio_utc, fim_utc)
