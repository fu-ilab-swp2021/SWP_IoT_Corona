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
#include "nimble_netif_conn.h"
#include "nimble_netif.h"
#include "shell_commands.h"

extern int _nimble_netif_handler(int argc, char **argv);

#define UPDATE_DELAY (1000 * US_PER_MS)

// Additional imports for Button handling
#include "board.h"
#include "board_common.h"
#include "periph/gpio.h"

#define SHELL_PRIO (THREAD_PRIORITY_MAIN + 1)

volatile Modi state = STATE_MENU;

#define ENABLE_DEBUG 1
#include "debug.h"

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

#if IS_USED(MODULE_SHELL)
static void _start_shell(void)
{
    thread_create(_stack, sizeof(_stack), SHELL_PRIO, THREAD_CREATE_STACKTEST,
                  _shell_thread, NULL, "shell");
}
#endif

int send_mode(void) {
    wait_for_connection();
    send_data();
    return 0;
}

void set_scanner_mode(void *arg)
{
    (void) arg;
    printf("\n\nset_scanner_mode");
    // int res = nimble_scanner_start();
    int res = scanner_init();
    if (res != 0) {
        printf("\nSomething went wrong while setting scanner mode");
    } else
    {
        printf("\nOkay, why this?");
    }
    
    state = STATE_SCANNER;
    return;
}


void set_send_mode(void *arg)
{
    (void) arg;
    if (state == STATE_SCANNER) {
        nimble_scanner_stop();
    }

    state = STATE_SEND;
}

void set_gps_mode(void *arg)
{
    (void) arg;
    if (state == STATE_SCANNER) {
        nimble_scanner_stop();
    }

    state = STATE_GPS;
    // if (state != STATE_GPS)
    // {
    //     return;
    // } else {
    //     return;
    // }
}


void set_menu_mode(void *arg)
{
    (void) arg;
    if (state == STATE_SCANNER) {
        nimble_scanner_stop();
    }

    state = STATE_MENU;
    return;
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

    int res;

    printf("\n\nThis should be the first print");

    /* start user interface */
    ui_init();

    printf("\n\nAfter UI init\n");

    xtimer_sleep(5);

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

    // res = scanner_init();
    // if (res != 0) {
    //     puts("BLE:       FAIL");
    //     ui_boot_msg("BLE:       FAIL");
    //     return 1;
    // }
    // else {
    //     puts("BLE:       OK");
    //     ui_boot_msg("BLE:       OK");
    // }


    // Dummy longitudes and latitudes (Berlin coordinates)
    static float lon = 52.520008;
    static float lat = 13.404954;

    static double lon1 = 2.520008123456;
    static double lat1 = 113.404954123456;

    // printf("\nLongitude: %8.6f", lon);
    // printf("\nLatitude: %8.6f", lat);

    // printf("\nLon1: %8.6f", lon1);
    // printf("\nLat1: %8.6f", lat1);

    printf("\nLongitude: %f", lon);
    printf("\nLatitude: %f", lat);

    printf("\nLon1: %d", (int)lon1);
    printf("\nLat1: %g", lat1);


    // Ask user to press Button 1 to start scanning 
    // gpio_init(LED0_PIN, GPIO_OUT);
    // gpio_toggle(LED0_PIN);
    // gpio_init_int(BTN0_PIN, GPIO_IN_PD, GPIO_FALLING , );


// #if defined(MODULE_PERIPH_GPIO_IRQ) && defined(BTN0_PIN) && defined(BTN1_PIN) && defined(BTN2_PIN) && defined(BTN3_PIN)
    gpio_init_int(BTN0_PIN, GPIO_IN, GPIO_FALLING, set_gps_mode, NULL);
    gpio_init_int(BTN1_PIN, GPIO_IN, GPIO_FALLING, set_scanner_mode, NULL);
    // gpio_init_int(BTN2_PIN, GPIO_IN, GPIO_FALLING, set_send_mode, NULL);
    // gpio_init_int(BTN2_PIN, GPIO_IN, GPIO_FALLING, nimble_scanner_stop, NULL);
    gpio_init_int(BTN3_PIN, GPIO_IN, GPIO_FALLING, set_menu_mode, NULL);
// #endif


    // BTN0_MODE


    // ui_boot_msg("Button 1: GPS Mode");

    // while (1)
    // {
    //     // led_mode(void);
    //     printf("\nHello");
    // }



    /* run the update loop */
    // xtimer_ticks32_t last_wakeup = xtimer_now();
    // while (1) {
    //     ui_update();
    //     stor_flush(&lat, &lon);
    //     xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
    // }

    // scanner_mode(NULL);

    // application_modes app_mode = GPS_MODE;
    xtimer_ticks32_t last_wakeup = xtimer_now();

    while(1)
    {
        switch (state)
        {
        case STATE_GPS:
            gps_mode();
            break;
        case STATE_SCANNER:
            printf("Scanner Mode is on");
            scanner_mode(&lat, &lon, last_wakeup);
            break;
        case STATE_MENU:
            menu_mode();
            break;
        case STATE_SEND:
            send_mode();
            break;
        default:
            printf("\nNo mode selected");
            xtimer_sleep(1);
        }

        // xtimer_sleep(4);
        printf("\nCurrent State: %d\n\n", state);
        // nimble_scanner_stop();
        printf("\nNimble Scanner Status: %d\n\n", nimble_scanner_status());
        // idle_mode(NULL);
    }



    // gpio_read(BTN0_PIN)
    // while(1)
    // {    

    //     printf("\n Waiting for ");
    //     xtimer_usleep(10);
    //     // printf("\nButton 0 Pin: %d", (int)gpio_read(BTN0_PIN));
    //     // if(gpio_read(BTN0_PIN) == 1)
    //     // {
    //     // } else
    //     // {
    //     //     break;
    //     // }


    // }

    // LED0_OFF;


    return 0;
}