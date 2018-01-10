#!/bin/bash
basedir=`dirname $0`
cd $basedir
forever $1 --plain index.js 