/*
 * Copyright (C) 2020 Freie Universität Berlin
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @ingroup     cwa-tracker
 * @{
 *
 * @file
 * @brief       Corona-Warn-App Tracker
 *
 * @author      Hauke Petersen <hauke.petersen@fu-berlin.de>
 *
 * @}
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>

#include "irq.h"
#include "fmt.h"
#include "vfs.h"
#include "mutex.h"
#include "fs/fatfs.h"
#include "mtd_sdcard.h"
#include "sdcard_spi.h"
#include "sdcard_spi_params.h"

#include "app.h"

#define ENABLE_DEBUG    (0)
#include "debug.h"

#define FILENAME_MAXLEN         (30U)

/* Configure MTD device for the first SD card */
extern sdcard_spi_t sdcard_spi_devs[ARRAY_SIZE(sdcard_spi_params)];
static mtd_sdcard_t mtd_sdcard_dev = {
    .base = {
        .driver = &mtd_sdcard_driver
    },
    .sd_card = &sdcard_spi_devs[0],
    .params = &sdcard_spi_params[0],
};
mtd_dev_t *fatfs_mtd_devs[FF_VOLUMES];
static fatfs_desc_t fs_desc;
static vfs_mount_t flash_mount = {
    .fs = &fatfs_file_system,
    .mount_point = "/f",
    .private_data = &fs_desc,
};

// #define FSBUF_SIZE          4096U      /* 4kb buffer */
#define FSBUF_SIZE          15360U      /* 15kb buffer */

static mutex_t _buflock = MUTEX_INIT;
static char _inbuf[FSBUF_SIZE];
static char _fsbuf[FSBUF_SIZE];
static size_t _inbuf_pos;

int stor_init(void)
{
    int res;

    fatfs_mtd_devs[fs_desc.vol_idx] = (mtd_dev_t*)&mtd_sdcard_dev;

    DEBUG("[stor] mounting FS (SD-Card)\n");
    res = vfs_mount(&flash_mount);
    if (res != 0) {
        return res;
    }

    return res;
}


void save_gps_location(char *file_name, double latitude, double longitude) {
    int g = vfs_open("/f/gps", (O_CREAT | O_WRONLY | O_APPEND), 0);
    if (g < 0) {
        DEBUG("[stor] _flush: unable to open file '%s'\n", "gps");
        return;
    }

    char gps_log_line_temp[100];
    sprintf(gps_log_line_temp, "\n%s,%.3f,%.3f", file_name, latitude, longitude);
    int len = strlen(gps_log_line_temp);
    char gps_log_line[len];
    sprintf(gps_log_line, "%s", gps_log_line_temp);
    printf("\ngps_log_line: %s", gps_log_line);  

    int n = vfs_write(g, gps_log_line, len);
    if (n < 0) {
        DEBUG("[stor] _flush: unable to write data\n");
        printf("\nstor.c|stor_flush|unable to write data");
        return;
    }
    else if (n != len) {
        printf("\nstor.c|stor_flush|size written is not the given");
        DEBUG("[stor] _flush: size written is not the given\n");
        return;
    }
    printf("\nstor.c|save_gps_locaton | saved gps succesfully");
    vfs_close(g);
}

int stor_write_ln(char *line, size_t len)
{
    mutex_lock(&_buflock);
    if ((_inbuf_pos + len) > FSBUF_SIZE) {
        DEBUG("[stor] _write_ln: buffer full, dropping data\n");
        mutex_unlock(&_buflock);
        printf("\nstor.c|stor_write_ln|Buffer full, dropping data");
        return 1;
    }
    memcpy(&_inbuf[_inbuf_pos], line, len);
    _inbuf_pos += len;
    mutex_unlock(&_buflock);

    return 0;
}

// void stor_flush(float *lat, float *lon)
void stor_flush(void)
{
    size_t len;
    char file[FILENAME_MAXLEN];

    /* get filename from basetime (drop everything below hours) */
    uint32_t ts;
    wallclock_now(&ts, NULL);
    printf("\n time ts: %lu", ts);
    uint32_t base = (ts - (ts % 60)) / 1000;
    snprintf(file, sizeof(file), "/f/%u", (unsigned)base);

    /* copy buffer and clear inbuf */
    mutex_lock(&_buflock);
    memcpy(_fsbuf, _inbuf, _inbuf_pos);
    len = _inbuf_pos;
    _inbuf_pos = 0;
    mutex_unlock(&_buflock);

    if (len == 0) {
        return;
    }

    /* write data to FS */
    int f = vfs_open(file, (O_WRONLY | O_CREAT | O_EXCL), 0);
    printf("\nstor.c|stor_flush|f 1  = %d", f);
    if (f < 0) {
        f = vfs_open(file, (O_WRONLY | O_APPEND), 0);
        // printf("\nAppending to existing file");
        printf("\nstor.c|stor_flush|f 2  = %d", f);

        if (f < 0) {
            // printf("\nstor.c|stor_flush|unable to open file");
            DEBUG("[stor] _flush: unable to open file '%s'\n", file);
            return;
        } 
    } else {
        // printf("\nNew GPS log line written.");
        save_gps_location(file, LAT, LON);
    }

    int n = vfs_write(f, _fsbuf, len);
    if (n < 0) {
        DEBUG("[stor] _flush: unable to write data\n");
        printf("\nstor.c|stor_flush|unable to write data");
    }
    else if ((size_t)n != len) {
        printf("\nstor.c|stor_flush|size written is not the given");
        DEBUG("[stor] _flush: size written is not the given\n");
    } else {
        // printf("\nstor.c|stor_flush|Everything seems to work");
    }
    vfs_close(f);
}


