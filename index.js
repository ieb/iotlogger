/*jshint node:true */
"use strict";
/*
 * Copyright 2017 Ian Boston <ianboston@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const sensors = require('ds18b20-raspi');  
const BME280 = require('node-bme280');
var barometer = new BME280({address: 0x76});

var data = [0, 0.0,0.0,0.0];
var headers = [ "ts", "t", "p", "rh"];
var newsensors = false;
var currentfile = "";

try {
    barometer.begin((err) => {
        if (err) {
            console.info('error initializing barometer', err);
            return;
        }
     
        console.info('barometer running');

        // read the BME280
        setInterval(() => {

                barometer.readPressureAndTemparature((err, pressure, temperature, humidity) => {
                    if ( err ) {
                        console.log("Error Reading BME280 ",err);
                    } else {
                        data[1] = temperature;
                        data[2] = pressure;
                        data[3] = humidity;
                    }
                });
            }, 10000);

    });

} catch(e) {
    console.info('error initializing barometer', e);

}
// read everything on the 1wire
setInterval(() => {
      sensors.readAllC((err, temps) => {
        if (err) {
            console.log("Error Reading 1 Wire ",err);
        } else {
            var readings = {};
            for(var i = 0; i < temps.length; i++) {
                readings[temps[i].id] = temps[i].t;
            }
            // add new headers.
            if ( headers.length-4 < temps.length) {
                for(var i = headers.length-4; i < temps.length; i++) {
                    headers.push(temps[i].id);
                }
                newsensors = true;                    
            }
            for(var i = 4; i < headers.length; i++) {
                data[i] = readings[headers[i]];
            }
        }
      });
    }, 10000);
function pad2Zeros(n) {
    return ("00" + n).slice(-2);
}

// dump everything out.
setInterval(() => {
    var d = new Date();
    data[0] = d.toISOString();
    var fname = "iotdata/data-"+d.getFullYear()+pad2Zeros(d.getMonth()+1)+pad2Zeros(d.getDate())+".csv";
    var output = "";
    if ( currentfile !== fname || newsensors ) {
        currentfile = fname;
        newsensors = false;
        output = headers.join(",")+"\n";
    }
    output = output + data.join(",")+"\n";
    fs.appendFile(fname,output, (err) => {
        if ( err ) {
            console.log("Failed to write to ", fname);
        }
    });
}, 60000);

