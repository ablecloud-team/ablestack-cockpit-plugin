#!/usr/bin/bash


file_name="$1"
genisoimage -output "$file_name" -volid cidata -joliet -input-charset utf-8 -rock user-data meta-data network-config
