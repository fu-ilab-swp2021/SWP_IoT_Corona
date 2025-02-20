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

#include <time.h>

#include "fmt.h"
#include "xtimer.h"
#include "u8g2.h"
#include "u8x8_riotos.h" 
#include "periph/i2c.h"
#include "debug.h"

#include "app.h"

#define SSD1306_I2C_ADDR    (0xbc)

#define STARTUP_DELAY       (1U)
#define UPDATE_INTERVAL     (250U * US_PER_MS)

static u8g2_t _disp;

static u8x8_riotos_t _disp_if = {
    .device_index = I2C_DEV(0),
    .pin_cs = GPIO_UNDEF,
    .pin_dc = GPIO_UNDEF,
    .pin_reset = GPIO_UNDEF,
};

/* RIOT-OS logo, 64x32 pixels at 8 pixels per byte */
static const uint8_t _riot_logo[] = {
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xE0,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0F, 0xF8, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x1F, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x3C,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78, 0x1E, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x70, 0x0E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x70, 0x0E,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x0E, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xF0, 0x0E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x1E,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3C, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xF0, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x73, 0xF8,
    0x30, 0x3C, 0x3F, 0xC0, 0x00, 0x0C, 0x77, 0xF0, 0x38, 0x7E, 0x3F, 0xC0,
    0x00, 0x7E, 0x73, 0xC0, 0x38, 0xE7, 0x06, 0x00, 0x00, 0xFC, 0x71, 0x00,
    0x38, 0xE3, 0x06, 0x00, 0x01, 0xF0, 0x70, 0x00, 0x38, 0xE3, 0x06, 0x00,
    0x01, 0xC0, 0x70, 0x00, 0x38, 0xE3, 0x06, 0x00, 0x03, 0x80, 0x70, 0xC0,
    0x38, 0xE3, 0x06, 0x00, 0x03, 0x80, 0x71, 0xE0, 0x38, 0xE3, 0x06, 0x00,
    0x03, 0x80, 0x70, 0xE0, 0x38, 0xE3, 0x06, 0x00, 0x03, 0x80, 0x70, 0xF0,
    0x38, 0xE3, 0x06, 0x00, 0x03, 0x80, 0x70, 0x70, 0x38, 0xE3, 0x06, 0x00,
    0x03, 0x80, 0xF0, 0x78, 0x38, 0xE3, 0x06, 0x00, 0x03, 0xC1, 0xE0, 0x3C,
    0x38, 0xE7, 0x06, 0x00, 0x01, 0xE3, 0xE0, 0x3C, 0x38, 0x7E, 0x06, 0x00,
    0x01, 0xFF, 0xC0, 0x1C, 0x30, 0x3C, 0x06, 0x00, 0x00, 0x7F, 0x80, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x1C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00
};

static void _draw_logo(void)
{
    u8g2_FirstPage(&_disp);
    do {
        u8g2_DrawBitmap(&_disp, 32, 0, 8, 32, _riot_logo);
    } while(u8g2_NextPage(&_disp));
}

void ui_init(void)
{
    u8g2_Setup_ssd1306_i2c_128x64_noname_1(&_disp, U8G2_R0,
                                              u8x8_byte_hw_i2c_riotos,
                                              u8x8_gpio_and_delay_riotos);
    u8g2_SetUserPtr(&_disp, &_disp_if);
    u8g2_SetI2CAddress(&_disp, SSD1306_I2C_ADDR);
    u8g2_InitDisplay(&_disp);
    u8g2_SetPowerSave(&_disp, 0);

    u8g2_SetFont(&_disp, u8g2_font_6x10_tf);
    _draw_logo();
    xtimer_sleep(STARTUP_DELAY);
    printf("\n\nUI INIT");
}

void ui_boot_msg(const char *msg)
{
    u8g2_FirstPage(&_disp);
    do {
        u8g2_DrawStr(&_disp, 0, 16, msg);
    } while(u8g2_NextPage(&_disp));
    xtimer_sleep(1);
}

void ui_update_scanner(void)
{
    scanner_stats_t stats;
    scanner_getcount(&stats);
    struct tm *time = wallclock_time_local();

    char pkt_str[12];
    size_t pos = fmt_u32_dec(pkt_str, stats.pkt_cnt);
    pkt_str[pos] = '\0';
    char cwa_str[12];
    pos = fmt_u32_dec(cwa_str, stats.cwa_cnt);
    cwa_str[pos] = '\0';

    char time_str[20];
    snprintf(time_str, sizeof(time_str), "%04i/%02i/%02i %02i:%02i:%02i",
             (time->tm_year + 1900), (time->tm_mon + 1), time->tm_mday,
             time->tm_hour, time->tm_min, time->tm_sec);


    u8g2_FirstPage(&_disp);
    DEBUG("%s | %s | %s\n",time_str,pkt_str,cwa_str); 
    do {
        u8g2_DrawStr(&_disp, 0, 10, time_str);
        u8g2_DrawStr(&_disp, 0, 21, "# Pkts:");
        u8g2_DrawStr(&_disp, 52, 21, pkt_str);
        u8g2_DrawStr(&_disp, 0, 32, "# CWA :");
        u8g2_DrawStr(&_disp, 52, 32, cwa_str);
        u8g2_DrawStr(&_disp, 0, 43, "__________________");
        u8g2_DrawStr(&_disp, 0, 54, "BTN 4: Menu");
    } while(u8g2_NextPage(&_disp));
}

void ui_gps_received(void)
{
    u8g2_FirstPage(&_disp);
    do {
        u8g2_DrawStr(&_disp, 0, 10, "GPS received!");
        u8g2_DrawStr(&_disp, 0, 21, "__________________");
        u8g2_DrawStr(&_disp, 0, 32, "BTN 4: Menu");
    } while(u8g2_NextPage(&_disp));
}

void ui_update_gps(void)
{
    u8g2_FirstPage(&_disp);
    do {
        u8g2_DrawStr(&_disp, 0, 10, "Waiting for GPS..");
        u8g2_DrawStr(&_disp, 0, 21, "__________________");
        u8g2_DrawStr(&_disp, 0, 32, "BTN 4: Menu");
    } while(u8g2_NextPage(&_disp));
}

void ui_update_menu(void)
{
    u8g2_FirstPage(&_disp);
    do {
        u8g2_DrawStr(&_disp, 0, 10, "Choose your Mode!");
        u8g2_DrawStr(&_disp, 0, 21, "__________________");
        u8g2_DrawStr(&_disp, 0, 32, "BTN 1: GPS Mode");
        u8g2_DrawStr(&_disp, 0, 43, "BTN 2: Scanner Mode");
    } while(u8g2_NextPage(&_disp));
}

void ui_error_screen(void)
{
    u8g2_FirstPage(&_disp);
    do {
        u8g2_DrawStr(&_disp, 0, 10, "SD Card Error");
    } while(u8g2_NextPage(&_disp));
}