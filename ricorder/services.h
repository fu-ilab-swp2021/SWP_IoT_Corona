#ifndef APP_SERVICES_H
#define APP_SERVICES_H

#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "nimble_riot.h"
#include "net/bluetil/ad.h"

#include "host/ble_hs.h"
#include "host/util/util.h"
#include "host/ble_gatt.h"
#include "services/gap/ble_svc_gap.h"
#include "services/gatt/ble_svc_gatt.h"

#define GATT_DEVICE_INFO_UUID		0x180A
#define GATT_MANUFACTURER_NAME_UUID	0x2A29
#define GATT_MODEL_NUMBER_UUID		0x2A24
 
#define GATT_LOCATION_UUID		0x1819

#define GATT_LATITUDE_UUID		0x2AAE
#define GATT_LONGITUDE_UUID		0x2AAF

#define DEV_MANU			"SWP Internet-Technologien 20/21"
#define DEV_MODEL			"Corona Scanner"
#define DEV_NAME			"Corona Scanner"

int init_service(void);

struct position {
  int latitude;
  int longitude;
};

#endif 
