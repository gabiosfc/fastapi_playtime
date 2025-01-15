from datetime import datetime, timedelta


def format_hour(hour):
        format = datetime.strptime(hour, '%H')
        return format.time()


min_hour = 14
max_hour = 22

hour_list = [format_hour(str(x)) for x in range(min_hour, max_hour + 1)]
gmt_midnight = format_hour('21')

hour_transform = datetime.combine(datetime.today(), gmt_midnight)
hour_midnight = (hour_transform + timedelta(hours=3)).time()

print(hour_midnight)
