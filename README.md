# Remote logger.

This simple node program is to log data collected from multiple 1 wire temperature sensors (ds18b20), gpio pins and a BME280 (https://www.bosch-sensortec.com/bst/products/all_products/bme280) on a Raspberry Pi. The Gpio pins 17,27,22,23 monitor status of 
something. It
writes the data to disk in csv format which can then be synced with Google Drive using Google Skicka from https://github.com/google/skicka 

To run use forever

    forever start index.js

The data will appear in iotdata/

To sync with Google Drive setup skicka and run skicka in a crontab see transfer.data.sh

Since this is intended to run of a 3G modem providing Wifi connectivity the network interface is only up when the data is being transfered. The rest of the time it is down to minimise data usage. ntp will need to sync when the network interface is up.

The iotologger uses forever to stay up started by a systemd service definition (iotlogger.service and run.sh)


# Why ?

I am using this to monitor the temperature and humidity of the air drying out the decks of a boat 90 minutes drive away. The Gpio status pins monitor for rain and water getting through the covers. Last night the recored max gust nearby was 70kn. Saves travel time and fuel checking the status and cover.


# Installing a E173 modem

The min Wifi modem I have been using crashes so I want to try a directly connected USB modem that I can reset and doesnt rely on its own OS to keep running. Huawei E173 is low cost and widely used. The following is for that modem connecting to GiffGaff. 

apt-get update
apt-get install ppp usb-modeswitch wvdial
apt-get install ufw


Bus 001 Device 005: ID 12d1:1436 Huawei Technologies Co., Ltd. Broadband stick

add to /lib/udev/rules.d/40-usb_modeswitch.rules
ATTRS{idVendor}=="12d1", ATTRS{idProduct}=="1436", RUN+="usb_modeswitch '%b/%k'"

cat << EOF > '/etc/usb_modeswitch.d/12d1:1436'

# Huawei, newer modems

TargetVendor=  0x12d1
TargetProductList="1001,1406,140b,140c,1412,141b,1432,1433,1436,14ac,1506,1511"

MessageContent="55534243123456780000000000000011062000000100000000000000000000"
EOF

cat << EOF > /etc/ppp/peers/huawei
/dev/serial/by-id/usb-HUAWEI_Technology_HUAWEI_Mobile-if00-port0
460800

nodetach
connect '/usr/sbin/chat -v -f /etc/ppp/peers/huawei-on'
disconnect '/usr/sbin/chat -v -f /etc/ppp/peers/huawei-off'
noauth
usepeerdns
local
defaultroute
replacedefaultroute
noipdefault
EOF

cat << EOF > /etc/ppp/peers/huawei-on
ABORT BUSY ABORT 'NO CARRIER' ABORT ERROR
'' AT
AT ""
OK ATZ
OK AT+CGDCONT=1,"IP","giffgaff.com"
OK "AT Q0 V1 E1 S0=0 &C1 &D2 +FCLASS=0"
OK ATX3
OK "ATDT*99#"
CONNECT \d\c
EOF

cat << EOF > /etc/ppp/peers/huawei-off

"" "\K"
"" "+++ath"
EOF

cat << EOF > /etc/ppp/peers/provider
# example configuration for a dialup connection authenticated with PAP or CHAP
#
# This is the default configuration used by pon(1) and poff(1).
# See the manual page pppd(8) for information on all the options.

# MUST CHANGE: replace myusername@realm with the PPP login name given to
# your by your provider.
# There should be a matching entry with the password in /etc/ppp/pap-secrets
# and/or /etc/ppp/chap-secrets.
user "giffgaff"

# MUST CHANGE: replace ******** with the phone number of your provider.
# The /etc/chatscripts/pap chat script may be modified to change the
# modem initialization string.
connect "/usr/sbin/chat -v -f /etc/chatscripts/pap -T ********"

# Serial device to which the modem is connected.
/dev/modem

# Speed of the serial line.
460800

# Assumes that your IP address is allocated dynamically by the ISP.
noipdefault
# Try to get the name server addresses from the ISP.
usepeerdns
# Use this connection as the default route.
defaultroute

# Makes pppd "dial again" when the connection is lost.
persist

# Do not ask the remote to authenticate.
noauth
EOF


# to bring the connection up, 
# unload the USB drivers.
modprobe -r option usb_wwan
sleep 10
insmod /lib/modules/4.9.41-v7+/kernel/drivers/usb/serial/usbserial.ko
sleep 1 
insmod /lib/modules/4.9.41-v7+/kernel/drivers/usb/serial/usb_wwan.ko 
sleep 1 
insmod /lib/modules/4.9.41-v7+/kernel/drivers/usb/serial/option.ko 
sleep 10
pppd call huawei &

Do the work.

pkill pppd
sleep 10 
modprobe -r option usb_wwan


# setup the firewall

ufw deny in on ppp0
ufw allow out on ppp0
ufw allow from 192.168.0.0/16
ufw enable





