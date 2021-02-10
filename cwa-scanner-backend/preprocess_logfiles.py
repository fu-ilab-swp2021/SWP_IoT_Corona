#%%
import pandas as pd

# %%

# 14:06
# 14:12
# 14:23
# 14:35
# 16:15
# 16:21
# 16:24
# 16:29
# 16:44
# 16:50

time_stamp = [
    1612533960,
    1612534320,
    1612534980,
    1612535700,
    1612541700,
    1612542060,
    1612542240,
    1612542540,
    1612543440,
    1612543800,
]

latitudes = [
    "52.5166016",
    "52.5161444",
    "52.5182927",
    "52.5241222",
    "52.525500",
    "52.5170221",
    "52.521961",
    "52.4978815",
    "52.486529",
    "52.486437",
]

longitudes = [
    "13.3807945",
    "13.3778661",
    "13.3746314",
    "13.3700998",
    "13.369986",
    "13.3889296",
    "13.414244",
    "13.3909684",
    "13.424702",
    "13.422988",
]

gps_data = pd.DataFrame({
    "time_stamp": time_stamp,
    "latitude": latitudes,
    "longitude": longitudes
})


# %%

df = pd.read_csv(
    "./upload-data/050221",
    sep=";",
    names=["time_stamp", "event_type", "address_type", "address", "RSSI", "data"]
)

df["latitude"] = latitudes[3]
df["longitude"] = longitudes[3]
