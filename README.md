# Remote logger.

This simple node program is to log data collected from multiple 1 wire temperature sensors and a BME280 on a Raspberry Pi. It
writes the data to disk in csv format which can then be synced with Google Drive using Google Skicka from https://github.com/google/skicka 

To run use forever

    forever start index.js

The data will appear in iotdata/

To sync with Google Drive setup skicka and run skicka in a corntab eg.

    30 * * * * /usr/local/bin/skicka upload /home/ieb/iotlogger/iotdata iotdata/ 1> /home/ieb/iotlogger/lastupload.log 2>&1


# Why ?

I am using this to monitor the temperature and humidity of the air drying out the decks of a boat 90 minutes drive away. Saves travel time and fuel.
