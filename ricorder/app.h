/*
 * Copyright (C) 2020 Freie Universität Berlin
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @defgroup    cwa-tracker Corona Warn App Tracker
 * @brief       Corona-Warn-App Tracker
 *
 * @{
 * @file
 * @brief       Corona-Warn-App Tracker
 *
 * @author      Hauke Petersen <hauke.petersen@fu-berlin.de>
 */

#ifndef APP_H
#define APP_H

#include <stdint.h>
#include "xtimer.h"


#ifdef __cplusplus
extern "C" {
#endif

#define SCANNER_ITVL        BLE_GAP_SCAN_ITVL_MS(60)
#define SCANNER_WIN         BLE_GAP_SCAN_WIN_MS(60)

typedef struct {
    uint32_t pkt_cnt;
    uint32_t cwa_cnt;
} scanner_stats_t;

typedef enum {
    STATE_SWITCHED = 1,
    STATE_GPS = 2,
    STATE_SCANNER = 3,
    STATE_MENU = 4
} Modi;

int wallclock_init(void);
int wallclock_set_time(double time);
void wallclock_now(uint32_t *secs, uint32_t *msecs);
struct tm *wallclock_time(void);
struct tm *wallclock_time_local(void);
int wallclock_wait_for_settime(void);

int scanner_init(void);
void scanner_getcount(scanner_stats_t *stats);

int stor_init(void);
int stor_write_ln(char *line, size_t len);
void stor_flush(float *lat, float *lon);

void ui_init(void);
void ui_boot_msg(const char *msg);
void ui_update_scanner(void);
void ui_update_gps(void);
void ui_update_menu(void);

void set_gps_mode(void *arg);
void set_scanner_mode(void *arg);
void set_menu_mode(void *arg);
void gps_mode(void);
void scanner_mode(float *lat, float *lon, xtimer_ticks32_t last_wakeup);
void menu_mode(void);

#ifdef __cplusplus
}
#endif

#endif /* APP_H */
/** @} */
