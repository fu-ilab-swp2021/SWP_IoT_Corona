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

#include "shell.h"
#include "thread.h"
#include "xtimer.h"

#include "nimble_scanner.h"

#include "app.h"

#include "msg.h"
// #include "nimble_netif_conn.h"
// #include "nimble_netif.h"
#include "shell_commands.h"
#include "services.h"

extern int _nimble_netif_handler(int argc, char **argv);

#define UPDATE_DELAY (1000 * US_PER_MS)

// Additional imports for Button handling
#include "board.h"
#include "board_common.h"
#include "periph/gpio.h"

#define SHELL_PRIO (THREAD_PRIORITY_MAIN + 1)

volatile Modi old_state = STATE_MENU;
volatile Modi current_state = STATE_MENU;
volatile Modi new_state = STATE_MENU;


static volatile int STATE_SWITCHED = 0;

#define ENABLE_DEBUG 1
#include "debug.h"

#if IS_USED(MODULE_SHELL)
static char _stack[THREAD_STACKSIZE_DEFAULT];

int settime(int argc, char **argv) {
    (void)argc;
    double t = atof(argv[1]);
    int res = wallclock_set_time(t);
    if (res != 0) {
        printf("Time could not be set!");
        return res;
    } else {
        printf("Time was set!");
    }
    return 0;
}

static const shell_command_t commands[] = {
#if SETTIME == 1
    {"settime", "print some shit", settime}
#endif
};

static void *_shell_thread(void *arg)
{
    (void)arg;

    char line_buf[SHELL_DEFAULT_BUFSIZE];
    shell_run(commands, line_buf, SHELL_DEFAULT_BUFSIZE);
    return NULL;
}

static void _start_shell(void)
{
    thread_create(_stack, sizeof(_stack), SHELL_PRIO, THREAD_CREATE_STACKTEST,
                  _shell_thread, NULL, "shell");
}
#endif


void set_scanner_mode(void *arg)
{
    (void) arg;
    current_state = STATE_SCANNER;
    STATE_SWITCHED = 1;
    return;
}


void set_gps_mode(void *arg)
{
    (void) arg;
    current_state = STATE_GPS;
    STATE_SWITCHED = 1;
}


void set_menu_mode(void *arg)
{
    (void) arg;
    current_state = STATE_MENU;
    STATE_SWITCHED = 1;
    return;
}


int main(void)
{
    init_service();
    /* run the shell if compiled in */
    #if IS_USED(MODULE_SHELL)
        _start_shell();
    #endif

    #if SETTIME == 1
        wallclock_wait_for_settime();
        exit(0);
    #endif

    int res;


    printf("\n\nThis should be the first print");

    /* start user interface */
    ui_init();

    printf("\n\nAfter UI init\n");

    /* initialize the wallclock (RTC) */
    res = wallclock_init();
    if (res != 0) {
        puts("RTC:       FAIL");
        ui_boot_msg("RTC:       FAIL");
        return 1;
    }
    else {
        puts("RTC:       OK");
        ui_boot_msg("RTC:       OK");
    }

    /* start storage module */
    res = stor_init();
    if (res != 0) {
        puts("SD-Card:   FAIL");
        ui_boot_msg("SD-Card:   FAIL");
        return 1;
    }
    else {
        puts("SD-Card:   OK");
        ui_boot_msg("SD-Card:   OK");
    }

    /* start BLe scanner */
    res = scanner_init();
    if (res != 0) {
        puts("BLE:       FAIL");
        ui_boot_msg("BLE:       FAIL");
        return 1;
    }
    else {
        puts("BLE:       OK");
        ui_boot_msg("BLE:       OK");
    }


    // Dummy longitudes and latitudes (Berlin coordinates)
    // static float lon = 52.520008;
    // static float lat = 13.404954;

#if defined(MODULE_PERIPH_GPIO_IRQ) && defined(BTN0_PIN) && defined(BTN1_PIN) && defined(BTN2_PIN) && defined(BTN3_PIN)
    gpio_init_int(BTN0_PIN, BTN0_MODE, GPIO_BOTH, set_gps_mode, NULL);
    gpio_init_int(BTN1_PIN, BTN1_MODE, GPIO_BOTH, set_scanner_mode, NULL);
    gpio_init_int(BTN3_PIN, BTN3_MODE, GPIO_BOTH, set_menu_mode, NULL);
#endif

    xtimer_ticks32_t last_wakeup = xtimer_now();
    while(1)
    {
        printf("\n\n\n________Current State: %d _______________", current_state);
        // printf("\nNimble Scanner Status: %d", nimble_scanner_status());
        // nimble_scanner_stop();

        switch (current_state)
        {

        case STATE_GPS:
            if (STATE_SWITCHED) {
                if (nimble_scanner_status() == NIMBLE_SCANNER_SCANNING) {
                    nimble_scanner_stop();
                }

                STATE_SWITCHED = 0;
            }

            gps_mode();
            break;

        case STATE_SCANNER:
            if (STATE_SWITCHED) {
                if (nimble_scanner_status() == NIMBLE_SCANNER_STOPPED) {
                    int scanner_start = nimble_scanner_start();
                    printf("\n\nmain.c|STATE_SCANNER|nimble_scanner_start_return: %d", scanner_start);
                }

                STATE_SWITCHED = 0;
            }

            scanner_mode(last_wakeup);
            break;

        case STATE_MENU:
            if (STATE_SWITCHED) {
                if (nimble_scanner_status() == NIMBLE_SCANNER_SCANNING) {
                    nimble_scanner_stop();
                }

                STATE_SWITCHED = 0;
            }

            menu_mode();
            break;

        default:
            printf("\nNo mode selected");
            xtimer_sleep(1);
        }

        // xtimer_sleep(5);

        // printf("\nBTN0: %d", gpio_read(BTN0_PIN));
        // printf("\nBTN1: %d", gpio_read(BTN1_PIN));
        // printf("\nBTN3: %d", gpio_read(BTN3_PIN));

    }


    return 0;
}
