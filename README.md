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
