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
#include "net/af.h"
#include "net/ipv6/addr.h"
#include "net/gnrc.h"
#include "net/gnrc/ipv6/ext.h"
#include "net/gnrc/ipv6/ext/frag.h"
#include "net/gnrc/udp.h"
#include "net/gnrc/ipv6/hdr.h"
#include "net/gnrc/ipv6/nib.h"
#include "net/gnrc/netif/raw.h"
#include "net/netdev_test.h"

#include "net/ipv6/addr.h"
#include "net/ipv6/ext/frag.h"
// #include "net/sock/tcp.h"
#include "net/sock/udp.h"
// #include "sock_types.h"

#include "app.h"

#define ENABLE_DEBUG    (1)
#include "debug.h"

#define FILENAME_MAXLEN         (30U)

#define SERVER_MSG_QUEUE_SIZE   (8)
#define SERVER_BUFFER_SIZE      (64)

// static bool server_running = false;
// static sock_udp_t sock;
// static char server_buffer[SERVER_BUFFER_SIZE];
// static char server_stack[THREAD_STACKSIZE_DEFAULT];
// static msg_t server_msg_queue[SERVER_MSG_QUEUE_SIZE];

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

// #define FSBUF_SIZE          16384U      /* 15kb buffer */
#define FSBUF_SIZE          4096U      /* 4kb buffer */


static mutex_t _buflock = MUTEX_INIT;
static char _inbuf[FSBUF_SIZE];
static char _fsbuf[FSBUF_SIZE];
static size_t _inbuf_pos;
// uint8_t buf[128];
// sock_tcp_t sock;
static gnrc_netif_t *eth_netif;

static gnrc_pktsnip_t *_build_udp_packet(const ipv6_addr_t *dst,
                                         unsigned payload_size,
                                         gnrc_pktsnip_t *payload)
{
    udp_hdr_t *udp_hdr;
    ipv6_hdr_t *ipv6_hdr;
    gnrc_netif_hdr_t *netif_hdr;
    gnrc_pktsnip_t *hdr;
    (void)payload_size;

    // if (payload == NULL) {
    //     uint8_t *data;

    //     payload = gnrc_pktbuf_add(NULL, NULL, payload_size, GNRC_NETTYPE_UNDEF);
    //     if (payload == NULL) {
    //         return NULL;
    //     }
    //     data = payload->data;
    //     while (payload_size) {
    //         unsigned test_sample_len = sizeof(TEST_SAMPLE) - 1;

    //         if (test_sample_len > payload_size) {
    //             test_sample_len = payload_size;
    //         }

    //         memcpy(data, TEST_SAMPLE, test_sample_len);
    //         data += test_sample_len;
    //         payload_size -= test_sample_len;
    //     }
    // }
    // hdr = gnrc_udp_hdr_build(payload, 12345, 12345);
    hdr = gnrc_udp_hdr_build(payload, 14640, 14640);
    if (hdr == NULL) {
        gnrc_pktbuf_release(payload);
        return NULL;
    }
    udp_hdr = hdr->data;
    udp_hdr->length = byteorder_htons(gnrc_pkt_len(hdr));
    payload = hdr;
    // hdr = gnrc_ipv6_hdr_build(payload, local_addr, dst);
    hdr = gnrc_ipv6_hdr_build(payload, NULL, dst);
    if (hdr == NULL) {
        gnrc_pktbuf_release(payload);
        return NULL;
    }
    ipv6_hdr = hdr->data;
    ipv6_hdr->len = byteorder_htons(gnrc_pkt_len(payload));
    ipv6_hdr->nh = PROTNUM_UDP;
    ipv6_hdr->hl = CONFIG_GNRC_NETIF_DEFAULT_HL;
    gnrc_udp_calc_csum(payload, hdr);
    payload = hdr;
    hdr = gnrc_netif_hdr_build(NULL, 0, NULL, 0);
    if (hdr == NULL) {
        gnrc_pktbuf_release(payload);
        return NULL;
    }
    netif_hdr = hdr->data;
    netif_hdr->if_pid = eth_netif->pid;
    netif_hdr->flags |= GNRC_NETIF_HDR_FLAGS_MULTICAST;
    hdr->next = payload;
    return hdr;
}

char* getDataFromFile(int length) {
    int f = vfs_open("/f/1607727", O_RDONLY, 0);
    if (f < 0) {
        DEBUG("[stor] _flush: unable to open file\n");
        return NULL;
    } else {
        int n = vfs_read(f, _fsbuf, length);
        if (n < 0) {
            DEBUG("[stor] _flush: unable to read data\n");
            vfs_close(f);
            return NULL;
        }
        vfs_close(f);
        _fsbuf[n]='\0';
        char* res = (char*) malloc(n+1);
        strncpy(res, _fsbuf, n+1);
        return res;
    }
}

int tcp_send_test(int argc, char **argv)
{
    (void)argc;
    (void)argv;
    return 0;
    // int res;
    // // sock_tcp_ep_t remote = SOCK_IPV6_EP_ANY;
    // sock_tcp_ep_t remote = { .family = AF_INET6, .netif = SOCK_ADDR_ANY_NETIF };

    // remote.port = 12345;
    // ipv6_addr_from_str((ipv6_addr_t *)&remote.addr,
    //                    "FE80::6014:B3FF:FEB5:F6DE");
    // if (sock_tcp_connect(&sock, &remote, 0, 0) < 0) {
    //     puts("Error connecting sock");
    //     return 1;
    // }
    // char* data = getDataFromFile(atoi(argv[1]));
    // if ((res = sock_tcp_write(&sock, data, strlen(data))) < 0) {
    //     puts("Errored on write");
    // }
    // else {
    //     if ((res = sock_tcp_read(&sock, &buf, sizeof(buf),
    //                              SOCK_NO_TIMEOUT)) < 0) {
    //         puts("Disconnected");
    //     }
    //     printf("Read: %d\n", res);
    // }
    // sock_tcp_disconnect(&sock);
    // return res;
}

int udp_send_test(int argc, char **argv)
{
    (void)argc;
    // (void)argv;
    int res;
    sock_udp_ep_t remote = { .family = AF_INET6 };

    char* addr = "FE80::6014:B3FF:FEB5:F6DE";

    if (ipv6_addr_from_str((ipv6_addr_t *)&remote.addr, addr) == NULL) {
        puts("Error: unable to parse destination address");
        return 1;
    }
    if (ipv6_addr_is_link_local((ipv6_addr_t *)&remote.addr)) {
        /* choose first interface when address is link local */
        gnrc_netif_t *netif = gnrc_netif_iter(NULL);
        remote.netif = (uint16_t)netif->pid;
    }
    remote.port = atoi("12345");
    char* data = getDataFromFile(atoi(argv[1]));
    if((res = sock_udp_send(NULL, data, strlen(data), &remote)) < 0) {
        printf("could not send %d\n", res);
    }
    else {
        printf("Success: send %u byte\n", (unsigned) res);
    }
    return 0;
}

int udp_send_test2(int argc, char **argv)
{
    (void)argc;
    // (void)argv;
    printf("----------------1------------------\n");
    eth_netif = gnrc_netif_iter(NULL);
    printf("MTU %u\n", eth_netif->ipv6.mtu);
    // sock_udp_ep_t remote = { .family = AF_INET6 };

    // char* addr = "FE80::6014:B3FF:FEB5:F6DE";

    // if (ipv6_addr_from_str((ipv6_addr_t *)&remote.addr, addr) == NULL) {
    //     puts("Error: unable to parse destination address");
    //     return 1;
    // }
    // if (ipv6_addr_is_link_local((ipv6_addr_t *)&remote.addr)) {
    //     /* choose first interface when address is link local */
    //     gnrc_netif_t *netif = gnrc_netif_iter(NULL);
    //     remote.netif = (uint16_t)netif->pid;
    // }
    // remote.port = atoi("12345");
    // if((res = sock_udp_send(NULL, data, strlen(data), &remote)) < 0) {
    //     printf("could not send %d\n", res);
    // }
    // else {
    //     printf("Success: send %u byte\n", (unsigned) res);
    // }

    printf("----------------2------------------\n");
    char* data;
    gnrc_pktsnip_t *pkt, *payload = NULL;
    ipv6_addr_t* dst = malloc(sizeof(ipv6_addr_t));
    printf("----------------3------------------\n");
    ipv6_addr_from_str(dst, "FE80::6014:B3FF:FEB5:F6DE");
    printf("%u:%u:%u:%u:%u:%u:%u:%u\n", dst->u16[0].u16, dst->u16[1].u16, dst->u16[2].u16, dst->u16[3].u16, dst->u16[4].u16, dst->u16[5].u16, dst->u16[6].u16, dst->u16[7].u16);
    printf("----------------4------------------\n");
    unsigned payload_size = 0;

    unsigned int fragsize = atoi(argv[1]);
    while ((payload_size + fragsize) <= eth_netif->ipv6.mtu) {
        data = getDataFromFile(fragsize);
        // printf("%s\n", data);
        pkt = gnrc_pktbuf_add(payload, data, strlen(data),
                              GNRC_NETTYPE_UDP );
        printf("%u | %u\n", pkt->size, strlen(data));
        payload_size += pkt->size;
        payload = pkt;
    }
    printf("PAYLOAD_SIZE: %u\n", payload_size);
    printf("----------------9------------------\n");
    pkt = _build_udp_packet(dst, 0, payload);
    printf("----------------10------------------\n");
    gnrc_pktsnip_t* pkt2 = pkt;
    while(pkt2 != NULL) {
        if (pkt2->size == 8) {
            printf("SIZE %u\n", pkt2->size);
            printf("%u\n",((udp_hdr_t*)pkt2->data)->dst_port.u16);
            printf("%u %u\n",((gnrc_netif_hdr_t*)pkt2->data)->src_l2addr_len, ((gnrc_netif_hdr_t*)pkt2->data)->dst_l2addr_len);
        }
        if (pkt2->size == 40) {
            printf("SIZE %u\n", pkt2->size);
            printf("%u\n",((ipv6_hdr_t*)pkt2->data)->dst.u16[0].u16);
        }
        pkt2 = pkt2->next;
    }
    gnrc_ipv6_ext_frag_send_pkt(pkt, eth_netif->ipv6.mtu);
    printf("----------------11------------------\n");
    return 0;
}

int udp_send(int argc, char **argv)
{
    (void)argc;
    (void)argv;
    int res;
    sock_udp_ep_t remote = { .family = AF_INET6 };

    if (argc != 5) {
        puts("Usage: udp send <ipv6-addr> <port> <payload>");
        return -1;
    }

    if (ipv6_addr_from_str((ipv6_addr_t *)&remote.addr, argv[2]) == NULL) {
        puts("Error: unable to parse destination address");
        return 1;
    }
    if (ipv6_addr_is_link_local((ipv6_addr_t *)&remote.addr)) {
        /* choose first interface when address is link local */
        gnrc_netif_t *netif = gnrc_netif_iter(NULL);
        remote.netif = (uint16_t)netif->pid;
    }
    remote.port = atoi(argv[3]);
    if((res = sock_udp_send(NULL, argv[4], strlen(argv[4]), &remote)) < 0) {
        printf("could not send %d\n", res);
    }
    else {
        // printf("Success: send %u byte to %s\n", (unsigned) res, argv[2]);
    }
    return 0;
}


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
    printf("\nstor.c|stor_write_ln");
    printf("\nstor.c|stor_write_ln|line: %s", line);
    printf("\nstor.c|stor_write_ln|len: %d", len);
    printf("\nstor.c|stor_write_ln|Adress of *line: %p", line);

    mutex_lock(&_buflock);
    if ((_inbuf_pos + len) > FSBUF_SIZE) {
        DEBUG("[stor] _write_ln: buffer full, dropping data\n");
        mutex_unlock(&_buflock);
        printf("\nstor.c|stor_write_ln|Buffer full, dropping data");
        return 1;
    }
    memcpy(&_inbuf[_inbuf_pos], line, len);
    _inbuf_pos += len;
    mutex_unlock(&_buflock);

    return 0;
}

void stor_flush(float *lat, float *lon)
{
    printf("\nstor.c|stor_flush");
    size_t len;
    char file[FILENAME_MAXLEN] = "/f/test123";

    int buffer_snprintf_return = snprintf(file, sizeof(file), "/f/%f.%f", *lat, *lon);
    // int buffer_snprintf_return = snprintf(file, sizeof(file), "/f/test");
    // int buffer_snprintf_return = snprintf(file, sizeof(file) + 1, "/f/%dx%d", (int)*lat, (int)*lon);
    printf("\nstor.c|buffer_snprintf_return: %d", buffer_snprintf_return);


    // Current workaround for file name problem with floats.
    int lat_1 = *lat;
    int lat_2 = (*lat - lat_1) * 1000000;

    int lon_1 = *lon;
    int lon_2 = (*lon - lon_1) * 1000000;

    // float test_float = 1.2;

    printf("\nlat 1: %d, lat 2: %d, lon_1: %d, lon_2: %d", lat_1, lat_2, lon_1, lon_2);

    // char file_integer[FILENAME_MAXLEN];
    // int j = snprintf(file_integer, sizeof(file_integer), "%d%d%d%d", lat_1, lat_2, lon_1, lon_2);
    // int a = snprintf(file_name, 100, "%d%d%d%d", lat_1, lat_2, lon_1, lon_2);
    // printf("\nfile_integer: %s", file_integer);
    // printf("\nfile_integer j value: %d", j);


    // Allocate only needed memory
    // int leng = snprintf(NULL, 0, "%fx%f", *lat, *lon);
    // printf("\nleng: %d", leng);
    // char *file_name = (char *)malloc(leng + 1);
    // int b = snprintf(file_name, leng + 1, "%fx%f", *lat, *lon);

    // printf("\n\nFile Name: %s", file_name);
    // printf("\nfile_name b value: %d", b);


    // free(file_name);


    // print("\nXXX a = %d XXX", a);

    // printf("\nlat f: %f", *lat);
    // printf("\nlon f: %f", *lon);

    /* get filename from basetime (drop everything below hours) */
    // uint32_t ts;
    // wallclock_now(&ts, NULL);
    // uint32_t base = (ts - (ts % 3600)) / 1000;


    // int a = snprintf(file, sizeof(file), "/f/%fx%f", *lat, *lon);
    // int a = snprintf(file, sizeof(file), "/f/%s", file_integer);
    // int a = snprintf(file, sizeof(file), "/f/%.1f78", test_float);


    // snprintf(file, sizeof(file), "/f/%s", file_name);
    // printf("\nFile name: %s", file_name);
    // printf("\n\nFile: %s", file);
    // printf("\n\nFile size: %d", sizeof(file));


    /* copy buffer and clear inbuf */
    mutex_lock(&_buflock);
    memcpy(_fsbuf, _inbuf, _inbuf_pos);
    len = _inbuf_pos;
    _inbuf_pos = 0;
    mutex_unlock(&_buflock);

    if (len == 0) {
        return;
    }

    // printf("\nlen: %d", len);

    /* write data to FS */
    int f = vfs_open(file, (O_CREAT | O_WRONLY | O_APPEND), 0);
    printf("\nstor.c|stor_flush|f  = %d", f);
    if (f < 0) {
        printf("\nstor.c|stor_flush|unable to open file");
        DEBUG("[stor] _flush: unable to open file '%s'\n", file);
        return;
    }
    int n = vfs_write(f, _fsbuf, len);
    printf("\nstor.c|stor_flush|n  = %d", n);
    if (n < 0) {
        DEBUG("[stor] _flush: unable to write data\n");
        printf("\nstor.c|stor_flush|unable to write data");
    }
    else if ((size_t)n != len) {
        printf("\nstor.c|stor_flush|size written is not the given");
        DEBUG("[stor] _flush: size written is not the given\n");
    }
    printf("\nstor.c|stor_flush|Everything seems to work");
    vfs_close(f);
}

int send_data(int size, char* filter) {

    int argc = 5;
    char** argv = (char**) malloc(argc * sizeof(char*));
    argv[0] = "udp";
    argv[1] = "send";
    argv[2] = "FE80::6014:B3FF:FEB5:F6DE";
    argv[3] = "12345";
    // int size = 128;
    int res;
    vfs_DIR* dirp = malloc(sizeof(vfs_DIR));
    res = vfs_opendir(dirp, "/f");
    if (res!=0) {
        printf("ERROR OPEN %d\n", res);
        return 1;
    } else {
        printf("OPEN\n");
    }
    vfs_dirent_t* entry = malloc(sizeof(vfs_dirent_t));
    res = vfs_readdir(dirp, entry);
    if (res==1) {
        printf("READ\n");
    }
    while (res==1 && ENABLE_SEND) {
        printf("ENTRY %s\n",entry->d_name);
        char file[100];
        strcpy(file, "/f/");
        strcat(file, entry->d_name);
        int f;
        if(filter != NULL && strcmp(entry->d_name, filter) != 0) {
            printf("SKIPPING %s\n", file);
            f = -1;
        } else {
            f = vfs_open(file, O_RDONLY, 0);
        }
        if (f < 0) {
            DEBUG("[stor] _flush: unable to open file '%s'\n", file);
        } else {
            printf("OPEN %s\n", file);
            char filename_line[100];
            strcpy(filename_line, "filename=");
            strcat(filename_line, entry->d_name);
            argv[4] = filename_line;
            // udp_cmd(argc, argv);
            udp_send(argc, argv);
            int n = vfs_read(f, _fsbuf, size);
            if (n < 0) {
                DEBUG("[stor] _flush: unable to read data\n");
                vfs_close(f);
                argv[4] = "fail";
                // udp_cmd(argc, argv);
                udp_send(argc, argv);
                continue;
            }
            while (n>0 && ENABLE_SEND) {
                _fsbuf[n+1]='\0';
                // printf("DATASIZE: %u\n",strlen(_fsbuf));
                argv[4] = _fsbuf;
                // udp_cmd(argc, argv);
                udp_send(argc, argv);
                // vfs_lseek(f,n,SEEK_CUR);
                n = vfs_read(f, _fsbuf, size);
            }
            argv[4] = "close";
            // udp_cmd(argc, argv);
            udp_send(argc, argv);
            vfs_close(f);
        }
        res = vfs_readdir(dirp, entry);
        if (res!=1) {
            printf("ERROR READ %d\n", res);
            break;
        } else {
            printf("READ\n");
        }
    }
    argv[4] = "end";
    // udp_cmd(argc, argv);
    udp_send(argc, argv);
    return 0;
}
