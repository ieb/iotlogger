#!/bin/bash
# Install this as a root crontab to periodically connect to wifi and send the data.
# To install 
# sudo cp transfer.data.sh /etc/cron.hourly/transfer-data
# chmod +x /etc/cron.hourly/transfer-data
(
    ip link set dev wlan0 up
    networkup=0
    timeout=10
    date
    while [[ $networkup == 0 ]]
    do
        networkup=`netstat -nr | grep '^0.0.0.0' | grep 'UG' | wc -l`
        let "timeout--"
        echo "Network ${networkup} Timeout ${timeout}"
        if [[ $timeout == 0 ]]
        then
            networkup=99
        fi
        if [[ $networkup == 0 ]]
        then
            sleep 10
        fi
    done
    echo "Network is up or timedout"
    # force the modem up waiting for 60s max for a response
    curl --connect-timeout 60 --max-time 120 http://www.google.com
    # transfer the data. 
    sudo -u ieb -i -n /usr/local/bin/skicka upload /home/ieb/iotlogger/iotdata iotdata/
    ip link set dev wlan0 down
) 1>> /home/ieb/iotlogger/updatesync.log 2>&1
