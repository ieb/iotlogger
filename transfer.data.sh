#!/bin/bash
# Install this as a root crontab to periodically connect to wifi and send the data.
# To install 
# sudo cp transfer.data.sh /etc/cron.hourly/transfer-data
# chmod +x /etc/cron.hourly/transfer-data
ip link set dev wlan0 up
sleep 60
# force the modem up.
curl --connect-timeout 60 --max-time 120 http://www.google.com 1> /dev/null 2>&1
# transfer the data. 
sudo -u ieb -i -n /usr/local/bin/skicka upload /home/ieb/iotlogger/iotdata iotdata/ 1> /home/ieb/iotlogger/lastupload.log 2>&1
ip link set dev wlan0 down
