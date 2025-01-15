from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo


def utc_to_gmt(data: date, inicio: time, fim: time):
    local_tz = ZoneInfo('America/Sao_Paulo')

    inicio_local = (
        datetime.combine(data, inicio)
        .replace(tzinfo=ZoneInfo('UTC'))
        .astimezone(local_tz)
    )

    fim_local = (
        datetime.combine(data, fim)
        .replace(tzinfo=ZoneInfo('UTC'))
        .astimezone(local_tz)
        .time()
    )

    data = inicio_local.date()

    return data, inicio_local.time(), fim_local


utc = datetime.now() + timedelta(hours=5)
data_utc = utc.date()
inicio_utc = utc.time()
fim_utc = (utc + timedelta(hours=1)).time()

now = datetime.now()
data = now.date()
inicio = now.time()
fim = (now + timedelta(hours=1)).time()

data_gmt, inicio_gmt, fim_gmt = utc_to_gmt(data_utc, inicio_utc, fim_utc)

print(data_utc, inicio_utc, fim_utc)
print(data_gmt, inicio_gmt, fim_gmt)
print(data, inicio, fim)

if data_gmt == data:
    if inicio_gmt > inicio:
        print('true1')

if data_gmt > data:
    print('true2')
    if inicio_gmt > inicio:
        print('true3')

# print(data, inicio, fim)
# print('data gmt ->', data_gmt, '-', inicio_gmt, '-', fim_gmt)
# print('data utc ->', data_utc, '-', inicio_utc, '-', fim_utc)
