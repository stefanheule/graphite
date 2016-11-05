#!/usr/bin/env python

from jinja2 import Template
from jinja2 import Environment, FileSystemLoader
import sys
import re

# ------------------------------------------------------------------------------
# --- configuration
# ------------------------------------------------------------------------------

version = '1.0'

configuration = [
  {
    'key': 'COLOR_OUTER_BACKGROUND',
    'default': '',
  },
]

msg_keys = [
  'WEATHER_TEMP_LOW',
  'WEATHER_TEMP_HIGH',
  'WEATHER_TEMP_CUR',
  'WEATHER_ICON_CUR',
  'WEATHER_PERC_DATA',
  'FETCH_WEATHER',
  'WEATHER_FAILED',
  'JS_READY',
]

# "CONFIG_COLOR_OUTER_BACKGROUND": 1,
# "CONFIG_COLOR_INNER_BACKGROUND": 2,
# "CONFIG_COLOR_MINUTE_HAND": 3,
# "CONFIG_COLOR_INNER_MINUTE_HAND": 4,
# "CONFIG_COLOR_HOUR_HAND": 5,
# "CONFIG_COLOR_INNER_HOUR_HAND": 6,
# "CONFIG_COLOR_CIRCLE": 7,
# "CONFIG_COLOR_TICKS": 8,
# "CONFIG_COLOR_DAY_OF_WEEK": 9,
# "CONFIG_COLOR_DATE": 10,
# "CONFIG_BATTERY_LOGO": 11,
# "CONFIG_COLOR_BATTERY_LOGO": 12,
# "CONFIG_COLOR_BATTERY_BG_30": 13,
# "CONFIG_COLOR_BATTERY_BG_20": 14,
# "CONFIG_COLOR_BATTERY_BG_10": 15,
# "CONFIG_COLOR_BLUETOOTH_LOGO": 16,
# "CONFIG_COLOR_BLUETOOTH_LOGO_2": 17,
# "CONFIG_BLUETOOTH_LOGO": 18,
# "CONFIG_VIBRATE_DISCONNECT": 19,
# "CONFIG_VIBRATE_RECONNECT": 20,
# "CONFIG_MESSAGE_DISCONNECT": 21,
# "CONFIG_MESSAGE_RECONNECT": 22,
# "CONFIG_MINUTE_TICKS": 23,
# "CONFIG_HOUR_TICKS": 24,
# "CONFIG_COLOR_BATTERY_30": 25,
# "CONFIG_COLOR_BATTERY_20": 26,
# "CONFIG_COLOR_BATTERY_10": 27,
# "CONFIG_WEATHER_LOCAL": 28,
# "CONFIG_COLOR_WEATHER": 29,
# "CONFIG_WEATHER_MODE_LOCAL": 30,
# "CONFIG_WEATHER_UNIT_LOCAL": 31,
# "CONFIG_WEATHER_SOURCE_LOCAL": 32,
# "CONFIG_WEATHER_APIKEY_LOCAL": 33,
# "CONFIG_WEATHER_LOCATION_LOCAL": 34,
# "CONFIG_WEATHER_REFRESH": 35,
# "CONFIG_WEATHER_EXPIRATION": 36,
# "CONFIG_SQUARE": 37,
# "CONFIG_SECONDS": 38,
# "CONFIG_COLOR_SECONDS": 39,
# "CONFIG_DATE_FORMAT": 40,

# ------------------------------------------------------------------------------
# --- end configuration
# ------------------------------------------------------------------------------

line_statement_prefix = '##'

# global cache of context
_context = None
def get_context():
  """Get the context used to render templates"""
  global _context
  if _context is None:
    _context =  {
      'version': version,
      'supported_platforms': read_configure('SUPPORTED_PLATFORMS').split(' '),
      'configuration': add_key_id(configuration, 'CONFIG', 1),
      'message_keys': add_key_id(msg_keys, 'MSG_KEY', 100),
    }
  return _context

def add_key_id(keys, prefix, start_id):
  """Helper to add id's to some list of keys"""
  res = []
  i = start_id
  for k in keys:
    if type(k) in [str, unicode]:
      res.append({'key': "%s_%s" % (prefix, k), 'id': i})
    else:
      k['key'] = "%s_%s" % (prefix, k['key'])
      k['id'] = i
      res.append(k)
    i += 1
  return res

def read_configure(key):
  """Read the value of a ./configure setting"""
  config = read_file(".redshift_config")
  for line in config.split("\n"):
    if line[0:len(key)] == key:
      return line[len(key)+1:].strip('"')
  error("tried to read '%s' in .redshift_config, but key does not exist." % (key))

def read_file(name):
  """Read a file from disk"""
  with open(name) as f:
    return f.read()

def write_file(name, content):
  """Write a file to disk"""
  f = open(name, 'w')
  f.write(content)
  f.close()

def error(msg):
  """Exit program with an error message"""
  print "ERROR: %s" % (msg)
  sys.exit(1)

def render(file):
  """Take a template file and render its contents"""
  env = Environment(loader=FileSystemLoader('.'), line_statement_prefix=line_statement_prefix)
  template = env.get_template(file)
  write_file(file.replace(".template", ""), template.render(get_context()))

def inline_render(file):
  """Take a file, look for all inline locations that have an associated template and render them inline"""

  def starts_with(s, sub):
    return s[0:len(sub)] == sub

  newcontents = []
  env = Environment(line_statement_prefix=line_statement_prefix)
  contents = read_file(file)
  current_section = ''
  tpl = []
  mode = 'init'
  for line in contents.split("\n"):
    isstart = re.search(r"^ *(// --) autogen ([a-z_]+)", line)
    isend = re.search(r"^ *(// --) end autogen", line)
    istpl = re.search(r"^ *(// --)(.*)", line)
    if mode == 'init':
      if isstart is not None:
        newcontents.append(line)
        current_section = isstart.group(2)
        mode = 'template'
      else:
        newcontents.append(line)
    elif mode == 'ignore':
      if isend is not None:
        newcontents.append(line)
        mode = 'init'
    elif mode == 'template':
      if istpl is not None:
        tpl.append(istpl.group(2))
      else:
        template = env.from_string("\n".join(tpl))
        newcontents.append(template.render(get_context()).strip("\n"))
        mode = 'ignore'

  if mode != 'init':
    error("Unclosed autogen section '%s', stopped in mode %s." % (current_section, mode))
  write_file(file, "\n".join(newcontents))

  # 
  # write_file(file.replace(".template", ""), )

def main():
  render("package.template.json")
  inline_render("src/redshift.h")

if __name__ == "__main__":
  main()
