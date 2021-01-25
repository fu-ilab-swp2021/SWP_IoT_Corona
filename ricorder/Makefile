APPLICATION = cwa-tracker
RIOTBASE ?= $(CURDIR)/../RIOT
BOARD ?= nrf52dk

DEVELHELP ?= 1
QUIET ?= 1
SETTIME ?= 0

# enables shell and STDIO for debugging
TERM ?= 1

# define dependencies
# BLE
USEPKG += nimble
USEMODULE += nimble_scanner
USEMODULE += bluetil_addr
USEMODULE += bluetil_ad
# RTC
USEMODULE += ds3231
USEMODULE += periph_gpio_irq
USEMODULE += periph_rtt
# display
USEPKG += u8g2
# storage
USEMODULE += vfs
USEMODULE += fatfs_vfs
USEMODULE += mtd_sdcard
# misc system modules
USEMODULE += fmt
USEMODULE += xtimer

# enable shell when in debugging mode
# ifeq (1,$(TERM))
USEMODULE += shell
USEMODULE += shell_commands
USEMODULE += ps
# else
#   USEMODULE += stdio_null
# endif

# Include packages that pull up and auto-init the link layer.
# NOTE: 6LoWPAN will be included if IEEE802.15.4 devices are present

USEMODULE += gnrc_sock_udp
USEMODULE += gnrc_netdev_default
USEMODULE += auto_init_gnrc_netif
# USEMODULE += gnrc_ipv6_default
# add dummy interface to test forwarding to smaller MTU
USEMODULE += netdev_test
# Specify the mandatory networking modules for IPv6
USEMODULE += gnrc_ipv6_router_default
USEMODULE += gnrc_icmpv6_error
USEMODULE += gnrc_pktdump
USEMODULE += gnrc_pktbuf_cmd
# IPv6 extension headers
USEMODULE += gnrc_ipv6_ext_frag
# UDP support for payload
USEMODULE += gnrc_udp
USEMODULE += nimble_netif
USEMODULE += gnrc_neterr

# USEMODULE += auto_init_gnrc_netif
# USEMODULE += gnrc_sock_tcp
# USEMODULE += lwip_ipv6_autoconfig
# USEMODULE += lwip_ipv6
# USEMODULE += lwip_tcp
# USEMODULE += lwip_sock_tcp
USEMODULE += sock_util

# USEMODULE += netdev_test
# USEMODULE += gnrc_pktbuf_cmd
# # IPv6 extension headers
# USEMODULE += gnrc_ipv6_ext_frag

# USEMODULE += gnrc_tcp
# USEMODULE += ipv6_addr
# USEMODULE += gnrc_sock_ip
USEMODULE += gnrc_sock
# USEMODULE += gnrc_ipv6
# USEMODULE += gnrc_ipv6_router
# # Activate ICMPv6 error messages
# USEMODULE += gnrc_icmpv6_error
# # Specify the mandatory networking modules for IPv6 and UDP
# USEMODULE += gnrc_ipv6_router_default
# USEMODULE += gnrc_udp
# # USEMODULE += gnrc_tcp
# # Add a routing protocol
USEMODULE += gnrc_rpl
USEMODULE += auto_init_gnrc_rpl
# # This application dumps received packets to STDIO using the pktdump module
USEMODULE += gnrc_pktdump
# # Additional networking modules that can be dropped if not needed
USEMODULE += gnrc_icmpv6_echo

CFLAGS += -DCONFIG_GNRC_IPV6_NIB_SLAAC=1

# In order to use lat and lon as file names
USEMODULE += printf_float

# define pin and other board specific configuration for specific boards
ifeq (particle-xenon,$(BOARD))
  PROGRAMMER = jlink

  ifeq (1,$(TERM))
    USEMODULE += stdio_rtt
    TERMPROG ?= $(RIOTTOOLS)/jlink/jlink.sh
    TERMFLAGS ?= term-rtt
  endif

  CFLAGS += -DSDCARD_SPI_PARAM_SPI=SPI_DEV\(0\)
  CFLAGS += -DSDCARD_SPI_PARAM_CS=GPIO_PIN\(0,31\)
  CFLAGS += -DSDCARD_SPI_PARAM_CLK=GPIO_PIN\(1,15\)
  CFLAGS += -DSDCARD_SPI_PARAM_MOSI=GPIO_PIN\(1,13\)
  CFLAGS += -DSDCARD_SPI_PARAM_MISO=GPIO_PIN\(1,14\)
endif

ifeq (nrf52dk,$(BOARD))
  CFLAGS += -DSDCARD_SPI_PARAM_SPI=SPI_DEV\(0\)
  CFLAGS += -DSDCARD_SPI_PARAM_CS=GPIO_PIN\(0,22\)
  CFLAGS += -DSDCARD_SPI_PARAM_CLK=GPIO_PIN\(0,25\)
  CFLAGS += -DSDCARD_SPI_PARAM_MOSI=GPIO_PIN\(0,23\)
  CFLAGS += -DSDCARD_SPI_PARAM_MISO=GPIO_PIN\(0,24\)
endif

CFLAGS += -DSETTIME=$(SETTIME)

CFLAGS += -DCONFIG_GNRC_PKTBUF_SIZE=12000

include $(RIOTBASE)/Makefile.include
