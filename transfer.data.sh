#!/bin/bash
# Install this as a root crontab to periodically connect to wifi and send the data.
# To install 
# sudo cp transfer.data.sh /etc/cron.hourly/transfer-data
# chmod +x /etc/cron.hourly/transfer-data
(
    pppd call huawei &
    sleep 20
    # force the modem up waiting for 60s max for a response
    curl --connect-timeout 60 --max-time 120 http://www.google.com
    # transfer the data. 
    sudo -u ieb -i -n /usr/local/bin/skicka upload /home/ieb/iotlogger/iotdata iotdata/
    pkill pppd
) 1>> /home/ieb/iotlogger/updatesync.log 2>&1
