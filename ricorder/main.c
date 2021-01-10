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

#include "msg.h"
#include "nimble_netif_conn.h"
#include "nimble_netif.h"
#include "shell_commands.h"

// #define MAIN_QUEUE_SIZE     (8)
// static msg_t _main_msg_queue[MAIN_QUEUE_SIZE];

extern int _nimble_netif_handler(int argc, char **argv);

#define UPDATE_DELAY (1000 * US_PER_MS)
#define SHELL_PRIO (THREAD_PRIORITY_MAIN + 1)

#define ENABLE_DEBUG 1
#include "debug.h"

#if IS_USED(MODULE_SHELL)
static char _stack[THREAD_STACKSIZE_DEFAULT];

int mode = 0;

int wait_for_connection(void) {
    int argc = 2;
    char** argv = malloc(argc * sizeof(char*));
    argv[0] = "ble";
    argv[1] = "adv";
    _nimble_netif_handler(argc, argv);
    xtimer_ticks32_t last_wakeup = xtimer_now();
    nimble_netif_conn_t* con;
    con = nimble_netif_conn_get(0);
    while (con->state != 0x0022) {
        xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
        con = nimble_netif_conn_get(0);
        printf("Waiting for connection...\n");
        printf("%u\n",con->state);
    }
    printf("CONNECTED\n");
    xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
    xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
    return 0;
}

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

int chooseMode(int argc, char **argv) {
    (void)argc;
    mode = atoi(argv[1]);
    return 0;
}

static const shell_command_t commands[] = {
#if SETTIME == 1
    {"settime", "set the time", settime},
#endif
    { "udp", "send data over UDP and listen on UDP ports", udp_cmd },
    { "ble", "ble utility", _nimble_netif_handler },
    { "mode", "choose mode", chooseMode }
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

int scan_mode(void) {
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

    /* run the update loop */
    xtimer_ticks32_t last_wakeup = xtimer_now();
    while (1) {
        ui_update();
        stor_flush();
        xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
    }

    return 0;
}

int send_mode(void) {
    wait_for_connection();
    stor_init();
    send_data();
    return 0;
}

void waitForChooseMode(void) {
    xtimer_ticks32_t last_wakeup = xtimer_now();
    while (mode == 0) {
        xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
    }
    switch (mode)
    {
    case 1:
        scan_mode();
        break;
    case 2:
        send_mode();
        break;
    default:
        break;
    }
}

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

    waitForChooseMode();

    return 0;
}
