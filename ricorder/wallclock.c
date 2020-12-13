
#include "periph/rtt.h"
#include "ds3231.h"
#include "ds3231_params.h"

#include "app.h"
#include "thread.h"
#include "xtimer.h"

#include <stdlib.h>
#include <time.h>

#define UPDATE_DELAY        (1000 * US_PER_MS)
#define ENABLE_DEBUG    0
#include "debug.h"

static ds3231_t _rtc;

static uint32_t _tbase;
static uint32_t _rtt_last = 0;

bool timeSet = false;

static uint32_t _ticks(void)
{
    uint32_t ticks = rtt_get_counter();
    if (ticks < _rtt_last) {
        DEBUG("_tbase old %u\n", (unsigned)_tbase);
        _tbase += RTT_TICKS_TO_SEC(RTT_MAX_VALUE + 1);
        DEBUG("_tbase new %u\n", (unsigned)_tbase);
        DEBUG("time now: %u\n", (unsigned)(_tbase + RTT_TICKS_TO_SEC(ticks)));
    }
    _rtt_last = ticks;
    return ticks;
}

int wallclock_init(void)
{
    /* connect to external RTC */
    int res = ds3231_init(&_rtc, &ds3231_params[0]);
    if (res != 0) {
        return res;
    }

    /* read initial time from RTC */
    struct tm now;
    uint32_t ticks = rtt_get_counter();
    res = ds3231_get_time(&_rtc, &now);
    if (res != 0) {
        return res;
    }

    time_t ts = mktime(&now);
    _tbase = (uint32_t)ts - RTT_TICKS_TO_SEC(ticks);

    return 0;
}

int wallclock_wait_for_settime(void) {
    /* connect to external RTC */
    int res = ds3231_init(&_rtc, &ds3231_params[0]);
    if (res != 0) {
        return res;
    }

    xtimer_ticks32_t last_wakeup = xtimer_now();
    while (!timeSet) {
        printf("Waiting for time set...\n");
        xtimer_periodic_wakeup(&last_wakeup, UPDATE_DELAY);
    }
    return 0;
}

int wallclock_set_time(double time) {
    int intTime = (int) time;
    time_t timeTime = (time_t) intTime;
    struct tm* setnow = localtime(&timeTime);
    int res = ds3231_set_time(&_rtc, setnow);
    timeSet = true;
    if (res != 0) {
        return res;
    }
    return 0;
}

void wallclock_now(uint32_t *secs, uint32_t *msecs)
{
    uint32_t ticks = _ticks();
    if (secs) {
        *secs = _tbase + RTT_TICKS_TO_SEC(ticks);
    }
    if (msecs) {
        *msecs = RTT_TICKS_TO_MS(ticks) % 1000;
    }
}

struct tm *wallclock_time(void)
{
    uint32_t ticks = _ticks();
    time_t now = (time_t)(_tbase + RTT_TICKS_TO_SEC(ticks));
    return localtime(&now);
}

struct tm *wallclock_time_local(void)
{
    uint32_t ticks = _ticks();
    time_t now = (time_t)(_tbase + RTT_TICKS_TO_SEC(ticks));
    now += 3600;
    return localtime(&now);
}

