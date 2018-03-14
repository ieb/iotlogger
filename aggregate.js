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

// for each file open it,
// read the data and split it
// average over the period
// output
var fname = "agregate.csv";
var headerneeded = true;
function outputHeader(headers) {
    if ( headerneeded ) {
        fs.appendFileSync(fname,headers+"\n");
        headerneeded = false;
    }
}


function outputData(bucket, data) {
    if ( bucket != undefined) {
        for (var i = 1; i < fields.length; i++) {
            data[i] = data[i]/data[0];
        }
        var d = new Date(bucket*bucketSize*60000);
        data[0] = "\""+d.toISOString()+"\"";
        var output = "";
        output = output+data[0];
        for (var i = 1; i < data.length; i++) {
            output = output + "," + data[i].toFixed(2);
        };
        output = output + "\n";
        fs.appendFileSync(fname,output);
    }
}


var bucketSize = 30; // 30 minutes.
var data = undefined;
var dateBucket = undefined;

var files = fs.readdirSync('iotdata');
for (var i = 0; i < files.length; i++) {
    console.log("Reading ", files[i], files[i].slice(-4));
    if ( files[i].slice(-4) === ".csv") {
        var csv = fs.readFileSync('iotdata/'+files[i], 'utf-8').split("\n");
        for (var j = 0; j < csv.length; j++) {
            var line = csv[j];
            var fields = line.split(",");
            if (fields[0] === '"ts"') {
                console.log("New header ", line);
                outputData(dateBucket, data);
                outputHeader(line);
                dateBucket = undefined;
            } else {
                var dn = Date.parse(fields[0].slice(1,-1));
                if (isNaN(dn)) {
                    console.log("Bad line ", line);
                } else {
                    var n = Math.floor(dn/(bucketSize*60000));
                    if ( dateBucket != undefined && n != dateBucket ) {
                        console.log("New Bucket with  ",dateBucket,data[0]);

                        if (data != undefined) {
                            outputData(dateBucket, data);
                        }
                        dateBucket = undefined;
                    }
                    if (dateBucket === undefined) {
                        dateBucket = n;
                        data = [];
                        data.push(1);
                        for (var k = 1; k < fields.length; k++) {
                            data.push(+fields[k]);
                        }
                    } else {
                        data[0]++;
                        if ( data[0] % 100 === 0 ) {
                            console.log("n ",data[0]);
                        }
                        for (var k = 1; k < fields.length; k++) {
                            data[k] = data[k]+(+fields[k]);
                        };
                    }                    
                }
            }
        };
    }
}


