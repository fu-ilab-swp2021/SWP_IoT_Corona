#include <stdio.h>
#include <stdlib.h>

#include "shell.h"
#include "thread.h"
#include "xtimer.h"


// Additional imports for Button handling
#include "board.h"
#include "board_common.h"
#include "periph/gpio.h"

#include "app.h"

#define UPDATE_DELAY (1000 * US_PER_MS)

extern volatile Modi state;

void gps_mode(void)
{

    ui_update_gps();

    LED0_OFF;
    LED1_OFF;
    LED2_OFF;
    LED3_OFF;

    // (void) arg;
    // while (1)
    // {

    LED3_OFF;
    LED0_ON;
    xtimer_usleep(500000);
    LED0_OFF;
    LED1_ON;
    xtimer_usleep(500000);
    LED1_OFF;
    LED2_ON;
    xtimer_usleep(500000);
    LED2_OFF;
    LED3_ON;
    
    // xtimer_sleep(1);
    // }
}


void scanner_mode(float *lat, float *lon, xtimer_ticks32_t last_wakeup)
{
    // (void) arg;

    printf("\nmodi.c|scanner_mode");
    // printf("\nLat: %f,  Lon: %f\n", *lat, *lon);
    // xtimer_sleep(1);

    
    ui_update_scanner();
    stor_flush(lat, lon);
    xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
}

void menu_mode(void)
{
    // printf("\nHello, this is the Menu mode.");
    // xtimer_sleep(2);
    ui_update_menu();
}