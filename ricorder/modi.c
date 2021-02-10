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
    
}


void scanner_mode(xtimer_ticks32_t last_wakeup)
{

    printf("\nmodi.c|scanner_mode");
   
    int res = stor_flush();
    if (res != 0) {
        ui_error_screen();
    } else {
        ui_update_scanner();
    }
    xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
}

void menu_mode(void)
{
    ui_update_menu();
}