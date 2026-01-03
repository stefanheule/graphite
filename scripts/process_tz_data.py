#!/usr/bin/env python3

import sys
import re
import codecs
import itertools
import time
import copy
import datetime
import shutil
import os
import csv

def main():
  country_reader = csv.reader(open('tz-data/country.csv', 'rt'))
  countries = []
  for row in country_reader:
    countries.append((row[1], row[0]))

  zone_reader = csv.reader(open('tz-data/zone.csv', 'rt'))
  country_id_2_zone = {}
  for row in zone_reader:
    cid = row[1]
    zone = row[2]

    if cid not in country_id_2_zone:
      country_id_2_zone[cid] = []
    country_id_2_zone[cid].append(zone)

  for country in sorted(countries):
    if country[1] not in country_id_2_zone: continue # not sure why this can happen

    print('<optgroup label="%s">' % (country[0]))
    for zone in country_id_2_zone[country[1]]:
      print('  <option value="%s">%s</option>' % (zone, zone))
    print('</optgroup>')

  ## add utc timezone
  print('<optgroup label="Coordinated Universal Time">')
  print('  <option value="Etc/UCT">Coordinated Universal Time</option>')
  print('</optgroup>')

if __name__ == "__main__":
  main()
