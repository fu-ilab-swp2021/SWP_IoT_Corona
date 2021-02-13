#include "services.h"
#include "app.h"

// Struct to save longitude and latitude
struct position GPS_POS = {
  .latitude  = 0,
  .longitude = 0,
};

// Callback is called when GATT is used
static int position_uuid_callback(
    uint16_t conn_handle,
    uint16_t attr_handle,
    struct ble_gatt_access_ctxt * ctxt,
    void *arg);
// Callback is called when Manufacturer name is asked
static int device_info_callback(
    uint16_t conn_handle,
    uint16_t attr_handle,
    struct ble_gatt_access_ctxt * ctxt,
    void *arg);
// Callback is called when model number is read
static int device_info_model_callback(
    uint16_t conn_handle,
    uint16_t attr_handle,
    struct ble_gatt_access_ctxt * ctxt,
    void *arg);


// Struct defining the services
static const struct ble_gatt_svc_def service_array[] = {
  {
    /* Service: Device Information */
    .type = BLE_GATT_SVC_TYPE_PRIMARY,
    .uuid = BLE_UUID16_DECLARE(GATT_DEVICE_INFO_UUID),
    .characteristics = (struct ble_gatt_chr_def[]) { {
      /* Characteristic: * Manufacturer name */
      .uuid = BLE_UUID16_DECLARE(GATT_MANUFACTURER_NAME_UUID),
      .access_cb = device_info_callback,
      .flags = BLE_GATT_CHR_F_READ,
    }, {
      /* Characteristic: * Model number string */
      .uuid = BLE_UUID16_DECLARE(GATT_MODEL_NUMBER_UUID),
      .access_cb = device_info_model_callback,
      .flags = BLE_GATT_CHR_F_READ,
    }, {
      0,
    }, }
  },
  {
    /* Service: Location */
    .type = BLE_GATT_SVC_TYPE_PRIMARY,
    .uuid = BLE_UUID16_DECLARE(GATT_LOCATION_UUID),
    .characteristics = (struct ble_gatt_chr_def[]) { {
      /* Characteristic: * Device Latitude */
      .uuid = BLE_UUID16_DECLARE(GATT_LATITUDE_UUID),
      .access_cb = position_uuid_callback,
      .flags = BLE_GATT_CHR_F_WRITE,
    }, {
      /* Characteristic: * Device Longitude */
      .uuid = BLE_UUID16_DECLARE(GATT_LONGITUDE_UUID),
      .access_cb = position_uuid_callback,
      .flags = BLE_GATT_CHR_F_WRITE,
    }, { 
      0, 
    }, }
  },
  {0,},
};

static void start_advertise(void);

// Callback that is called when the protocol is used
static int gap_event_cb(struct ble_gap_event *event, void *arg)
{
  (void) arg;
  switch (event->type) {
    case BLE_GAP_EVENT_CONNECT:
      if (event->connect.status) {
	puts("GAP Connected\n");
      }
      break;
    case BLE_GAP_EVENT_DISCONNECT:
      puts("GAP Disconnected\n");
      break;
      start_advertise();
  }
  return 0;
}

static void start_advertise(void) {
  struct ble_gap_adv_params advp;
  int rc;

  //reset advertise parameters
  memset(&advp, 0, sizeof(advp));
  // Undirected Connectable
  advp.conn_mode = BLE_GAP_CONN_MODE_UND;
  // General Dicovery Mode
  advp.disc_mode = BLE_GAP_DISC_MODE_GEN;
  // Stops advertising, when so connects
  rc = ble_gap_adv_start(
      nimble_riot_own_addr_type,
      NULL,
      BLE_HS_FOREVER,
      &advp,
      gap_event_cb,
      NULL);
  assert(rc == 0);
  (void)rc;
}

// Callback for Gatt
static int position_uuid_callback (
    uint16_t conn_handle,
    uint16_t attr_handle,
    struct ble_gatt_access_ctxt * ctxt,
    void *arg){

  (void) conn_handle;
  (void) attr_handle;
  (void) arg;

  double * pos;
  uint16_t om_len;

  // Check if UUID fits to Lat or Lon
  if (ble_uuid_cmp(
	ctxt->chr->uuid,
	BLE_UUID16_DECLARE(GATT_LATITUDE_UUID)
	)==0){
    pos = &GPS_POS.latitude;
  }
  else if (ble_uuid_cmp(
	ctxt->chr->uuid,
	BLE_UUID16_DECLARE(GATT_LONGITUDE_UUID)
	)==0){
    pos = &GPS_POS.longitude;
    ui_gps_received();
    generate_filename();
  } else {
  	return 1;
  }

  om_len = OS_MBUF_PKTLEN(ctxt->om);
  ble_hs_mbuf_to_flat(ctxt->om, pos,sizeof(*pos), &om_len);
  
  printf(
      "\nLatitude\t%g\nLongitude\t%g\n",
      GPS_POS.latitude,
      GPS_POS.longitude
      );
  return 0;
}

static int device_info_callback(
    uint16_t conn_handle,
    uint16_t attr_handle,
    struct ble_gatt_access_ctxt * ctxt,
    void *arg) {
  (void) conn_handle;
  (void) attr_handle;
  (void) arg;
  int rc = os_mbuf_append(
      ctxt->om, 
      DEV_MANU,
      strlen(DEV_MANU));
  return rc;
}

static int device_info_model_callback(
    uint16_t conn_handle,
    uint16_t attr_handle,
    struct ble_gatt_access_ctxt * ctxt,
    void *arg) {
  (void) conn_handle;
  (void) attr_handle;
  (void) arg;
  int rc = os_mbuf_append(
      ctxt->om, 
      DEV_MODEL,
      strlen(DEV_MODEL));
  return rc;
}

// Run on startup
int init_service(void){
  int rc=0;
  (void)rc;

  // test config
  rc = ble_gatts_count_cfg(service_array);
  assert(rc==0);
  // add services
  rc = ble_gatts_add_svcs(service_array);
  assert(rc==0);

  // set device name
  ble_svc_gap_device_name_set(DEV_NAME);
  // start gatt server
  ble_gatts_start();

  //begin advertisement
  uint8_t buf[BLE_HS_ADV_MAX_SZ];
  bluetil_ad_t ad;
  bluetil_ad_init_with_flags(&ad, buf, sizeof(buf), BLUETIL_AD_FLAGS_DEFAULT);

  bluetil_ad_add_name(&ad,DEV_NAME);
  ble_gap_adv_set_data(ad.buf, ad.pos);

  start_advertise();

  return 0;
}

