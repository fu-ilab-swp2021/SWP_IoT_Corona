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

#define FSBUF_SIZE          4096U      /* 15kb buffer */

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
    printf("\nstor_init | res: %d", res);
    if (res != 0) {
        return res;
    }

    return res;
}

int stor_write_ln(char *line, size_t len)
{
    mutex_lock(&_buflock);
    if ((_inbuf_pos + len) > FSBUF_SIZE) {
        DEBUG("[stor] _write_ln: buffer full, dropping data\n");
        mutex_unlock(&_buflock);
        // printf("\n\nI am lost in here..");
        return 1;
    }
    memcpy(&_inbuf[_inbuf_pos], line, len);
    _inbuf_pos += len;
    mutex_unlock(&_buflock);

    return 0;
}

void stor_flush(float *lat, float *lon)
{
    size_t len;
    char file[FILENAME_MAXLEN];

    // Current workaround for file name problem with floats.
    int lat_1 = *lat;
    int lat_2 = (*lat - lat_1) * 1000000;

    int lon_1 = *lon;
    int lon_2 = (*lon - lon_1) * 1000000;

    float test_float = 1.2;

    printf("lat 1: %d, lat 2: %d, lon_1: %d, lon_2: %d", lat_1, lat_2, lon_1, lon_2);

    char file_integer[FILENAME_MAXLEN];
    int j = snprintf(file_integer, sizeof(file_integer), "%d%d%d%d", lat_1, lat_2, lon_1, lon_2);
    // int a = snprintf(file_name, 100, "%d%d%d%d", lat_1, lat_2, lon_1, lon_2);
    printf("\nfile_integer: %s", file_integer);
    printf("\nfile_integer j value: %d", j);


    // Allocate only needed memory
    int leng = snprintf(NULL, 0, "%fx%f", *lat, *lon);
    printf("\nleng: %d", leng);
    char *file_name = (char *)malloc(leng + 1);
    int b = snprintf(file_name, leng + 1, "%fx%f", *lat, *lon);

    printf("\n\nFile Name: %s", file_name);
    printf("\nfile_name b value: %d", b);


    free(file_name);


    // print("\nXXX a = %d XXX", a);

    // printf("\nlat f: %f", *lat);
    // printf("\nlon f: %f", *lon);

    /* get filename from basetime (drop everything below hours) */
    // uint32_t ts;
    // wallclock_now(&ts, NULL);
    // uint32_t base = (ts - (ts % 3600)) / 1000;


    // int a = snprintf(file, sizeof(file) + 1, "/f/%dx%d", (int)*lat, (int)*lon);
    // int a = snprintf(file, sizeof(file), "/f/%fx%f", *lat, *lon);
    // int a = snprintf(file, sizeof(file), "/f/%s", file_integer);
    int a = snprintf(file, sizeof(file), "/f/%.1f78", test_float);


    // snprintf(file, sizeof(file), "/f/%s", file_name);
    // printf("\nFile name: %s", file_name);
    printf("\n\nFile: %s", file);
    printf("\n\nFile size: %d", sizeof(file));
    printf("\n\nXXX a = %d XXX", a);

    /* copy buffer and clear inbuf */
    mutex_lock(&_buflock);
    memcpy(_fsbuf, _inbuf, _inbuf_pos);
    len = _inbuf_pos;
    _inbuf_pos = 0;
    mutex_unlock(&_buflock);

    if (len == 0) {
        return;
    }

    printf("\nlen: %d", len);

    /* write data to FS */
    int f = vfs_open(file, (O_CREAT | O_WRONLY | O_APPEND), 0);
    printf("\nf  = %d", f);
    if (f < 0) {
        DEBUG("[stor] _flush: unable to open file '%s'\n", file);
        return;
    }
    int n = vfs_write(f, _fsbuf, len);
    if (n < 0) {
        DEBUG("[stor] _flush: unable to write data\n");
    }
    else if ((size_t)n != len) {
        DEBUG("[stor] _flush: size written is not the given\n");
    }
    vfs_close(f);
}
