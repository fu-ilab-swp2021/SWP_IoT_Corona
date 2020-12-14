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

#include "app.h"

// Additional imports for Button handling
#include "board.h"
#include "board_common.h"
#include "periph/gpio.h"

#define UPDATE_DELAY (1000 * US_PER_MS)
#define SHELL_PRIO (THREAD_PRIORITY_MAIN + 1)

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

int main(void)
{
    /* run the shell if compiled in */
#if IS_USED(MODULE_SHELL)
    _start_shell();
#endif

#if SETTIME == 1
    wallclock_wait_for_settime();
    exit(0);
#endif

    int res;

    /* start user interface */
    ui_init();

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

    // Ask user to press Button 1 to start scanning 
    gpio_init(LED0_PIN, GPIO_OUT);
    gpio_init(BTN0_PIN, BTN0_MODE);
    while(1)
    {
        if(gpio_read(BTN0_PIN) == 1)
        {
            ui_boot_msg("Press Button 1 to start scanning.");
        } else
        {
            break;
        }
    }

    /* run the update loop */
    xtimer_ticks32_t last_wakeup = xtimer_now();
    while (1) {
        ui_update();
        stor_flush();
        xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
    }

    return 0;
}
