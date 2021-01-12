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

// Additional imports for Button handling
#include "board.h"
#include "board_common.h"
#include "periph/gpio.h"

#define SHELL_PRIO (THREAD_PRIORITY_MAIN + 1)

volatile Modi old_state = STATE_MENU;
volatile Modi current_state = STATE_MENU;
volatile Modi new_state = STATE_MENU;

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
//     printf("\n\nset_scanner_mode");
//     // int res = nimble_scanner_start();
//     // int res = scanner_init();
//     if (res != 0) {
//         printf("\nSomething went wrong while setting scanner mode");
//     } else
//     {
//         printf("\nOkay, why this?");
//     }
    
    current_state = STATE_SCANNER;
    return;
}


void set_gps_mode(void *arg)
{
    (void) arg;
    // if (state == STATE_SCANNER) {
    //     nimble_scanner_stop();
    // }

    // if (state != STATE_GPS)
    // {
    //     return;
    // } else {
    //     return;
    // }
    current_state = STATE_GPS;
    // gpio_irq_enable(BTN0_PIN);
    // gpio_irq_enable(BTN3_PIN);
}


void set_menu_mode(void *arg)
{
    (void) arg;
    // if (state == STATE_SCANNER) {
    //     printf("\n\nInterrupting Scanner Mode");
    //     nimble_scanner_stop();
    //     // printf("set_menu_mode | res = %d", res);
    //     printf("\n\nset_menu_mode");
    // }

    current_state = STATE_MENU;
    // gpio_irq_enable(BTN0_PIN);
    // gpio_irq_enable(BTN3_PIN);
    return;
}


// void set_switch_state(void *state)
// {
//     printf("\n\nSet switch context");
//     printf("\nState argument: %d", *(int *)state);
//     int *arg = (int *) state;
//     int *arg_2 = state;
//     printf("\n arg = %d, arg_2 = %d", *arg, *arg_2);
//     old_state = current_state;
//     current_state = STATE_SWITCHED;
//     new_state = *(int *)state;
//     printf("\nBefore: old_state = %d, current_state = %d, new_state = %d", old_state, current_state, new_state);
//     return;
// }

static int switch_context(void) {
    printf("\nSwitch Context");

    // if (old_state == STATE_SCANNER) {
    //     printf("\n\nInterrupting Scanner Mode");
    //     nimble_scanner_stop();
    //     // printf("set_menu_mode | res = %d", res);
    //     printf("\n\nset_menu_mode");
    // }

    // OLD_state = CURRENT_state;
    current_state = new_state;
    return 0;
    // state_switched = 1;
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
    static float lon = 52.520008;
    static float lat = 13.404954;

    // static double lon1 = 2.520008123456;
    // static double lat1 = 113.404954123456;

    // printf("\nLongitude: %8.6f", lon);
    // printf("\nLatitude: %8.6f", lat);

    // printf("\nLon1: %8.6f", lon1);
    // printf("\nLat1: %8.6f", lat1);

    // printf("\nLongitude: %f", lon);
    // printf("\nLatitude: %f", lat);

    // printf("\nLon1: %d", (int)lon1);
    // printf("\nLat1: %g", lat1);


    // Ask user to press Button 1 to start scanning 
    // gpio_init(LED0_PIN, GPIO_OUT);
    // gpio_toggle(LED0_PIN);
    // gpio_init_int(BTN0_PIN, GPIO_IN_PD, GPIO_FALLING , );


// #if defined(MODULE_PERIPH_GPIO_IRQ) && defined(BTN0_PIN) && defined(BTN1_PIN) && defined(BTN2_PIN) && defined(BTN3_PIN)
    gpio_init_int(BTN0_PIN, BTN0_MODE, GPIO_FALLING, set_gps_mode, NULL);
    // gpio_init_int(BTN0_PIN, GPIO_IN, GPIO_FALLING, set_switch_state, (void *)STATE_GPS);
    gpio_init_int(BTN1_PIN, GPIO_IN, GPIO_FALLING, set_scanner_mode, NULL);
    // gpio_init_int(BTN2_PIN, GPIO_IN, GPIO_FALLING, nimble_scanner_stop, NULL);
    // gpio_init_int(BTN3_PIN, GPIO_IN, GPIO_FALLING, set_switch_state, (void *)STATE_MENU);
    // gpio_init(BTN2_PIN, GPIO_IN, GPIO_FALLING, nimble_scanner_stop, NULL);
    gpio_init_int(BTN3_PIN, BTN0_MODE, GPIO_FALLING, set_menu_mode, NULL);
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
        // xtimer_sleep(2);
        printf("\n\n\n________Current State: %d _______________", current_state);
        // printf("\nNimble Scanner Status: %d", nimble_scanner_status());

        // nimble_scanner_stop();

        gpio_irq_enable(BTN0_PIN);
        gpio_irq_enable(BTN1_PIN);
        gpio_irq_enable(BTN3_PIN);

        switch (current_state)
        {
        case STATE_SWITCHED:
            switch_context();
            break;
        case STATE_GPS:
            // if state_swtiched && (old_state == STATE_SCANNER) {
            //     nimble_scanner_stop();
            // }
            if (nimble_scanner_status() == NIMBLE_SCANNER_SCANNING) {
                nimble_scanner_stop();
            }

            gps_mode();
            break;
        case STATE_SCANNER:
            // printf("Scanner Mode is on");
            if (nimble_scanner_status() == NIMBLE_SCANNER_STOPPED) {
                int scanner_start = nimble_scanner_start();
                printf("\n\nmain.c|STATE_SCANNER|nimble_scanner_start_return: %d", scanner_start);
            }

            scanner_mode(&lat, &lon, last_wakeup);
            break;
        case STATE_MENU:
            if (nimble_scanner_status() == NIMBLE_SCANNER_SCANNING) {
                nimble_scanner_stop();
            }
            menu_mode();
            break;
        default:
            printf("\nNo mode selected");
            xtimer_sleep(1);
        }

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
