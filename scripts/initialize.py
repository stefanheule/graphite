#!/usr/bin/env python

from jinja2 import Template
from jinja2 import Environment, FileSystemLoader
import sys
import re
import codecs
import itertools
import time
import copy
import datetime

def flatten(l): return [x for y in l for x in y]

def enum_complication(compl, m):
  if isinstance(compl, list): return flatten(map(lambda x: enum_complication(x, m), compl))
  res = []
  for element in itertools.product(*[map(lambda v: (k, v), m[k]) for k in reversed(m.keys())]):
    tmp = copy.copy(compl)
    iden = compl["key"]
    info = []
    for (k, v) in element:
      tmp[k] = v
      if v in ["true", "false"]:
        if v == "false":
          info.append("no %s" % (k))
        else:
          iden += ("_%s" % (k)).upper()
      tmp["key"] = iden
    if len(info) > 0:
      tmp["desc"] += " (%s)" % (", ".join(info))
    res.append(tmp)
  return res

# ------------------------------------------------------------------------------
# --- configuration
# ------------------------------------------------------------------------------

version = '1.0'
config_version = '1'

configuration = [
  {
    'key': 'CONFIG_VIBRATE_DISCONNECT',
    'default': 'true',
  },
  {
    'key': 'CONFIG_VIBRATE_RECONNECT',
    'default': 'true',
  },
  {
    'key': 'CONFIG_MESSAGE_DISCONNECT',
    'default': 'true',
  },
  {
    'key': 'CONFIG_MESSAGE_RECONNECT',
    'default': 'true',
  },
  {
    'key': 'CONFIG_WEATHER_UNIT_LOCAL',
    'default': '2',
    'mydefault': '1',
  },
  {
    'key': 'CONFIG_WEATHER_RAIN_LOCAL',
    'default': 'true',
  },
  {
    'key': 'CONFIG_WEATHER_SOURCE_LOCAL',
    'default': '1',
    'mydefault': '2',
  },
  {
    'key': 'CONFIG_WEATHER_APIKEY_LOCAL',
    'default': '""',
    'type': 'string',
  },
  {
    'key': 'CONFIG_WEATHER_LOCATION_LOCAL',
    'default': '""',
    'type': 'string',
  },
  {
    'key': 'CONFIG_WEATHER_REFRESH',
    'default': '60',
    'type': 'uint16_t',
  },
  {
    'key': 'CONFIG_WEATHER_EXPIRATION',
    'default': '3*60',
    'type': 'uint16_t',
  },
  {
    'key': 'CONFIG_WEATHER_REFRESH_FAILED',
    'default': '30',
    'type': 'uint16_t',
  },
  {
    'key': 'CONFIG_COLOR_TOPBAR_BG',
    'default': 'GColorVividCeruleanARGB8',
    'desc': 'Top bar background color',
  },
  {
    'key': 'CONFIG_COLOR_INFO_BELOW',
    'default': 'GColorVividCeruleanARGB8',
    'desc': 'Color of information text below time',
  },
  {
    'key': 'CONFIG_COLOR_PROGRESS_BAR',
    'default': 'GColorVividCeruleanARGB8',
    'desc': 'Progress bar color',
    'show_only_if': '+readConfig("CONFIG_PROGRESS") != 0',
  },
  {
    'key': 'CONFIG_COLOR_PROGRESS_BAR2',
    'default': 'GColorWhiteARGB8',
    'desc': 'Second progress bar color',
    'show_only_if': '+readConfig("CONFIG_PROGRESS") != 0',
  },
  {
    'key': 'CONFIG_COLOR_TIME',
    'default': 'GColorWhiteARGB8',
    'desc': 'Time color',
  },
  {
    'key': 'CONFIG_COLOR_PERC',
    'default': 'GColorWhiteARGB8',
    'desc': 'Precipitation bars color',
  },
  {
    'key': 'CONFIG_COLOR_BOTTOM_COMPLICATIONS',
    'default': 'GColorWhiteARGB8',
    'desc': 'Bottom complications color',
  },
  {
    'key': 'CONFIG_COLOR_BACKGROUND',
    'default': 'GColorBlackARGB8',
    'desc': 'Background color',
  },
  {
    'key': 'CONFIG_COLOR_TOP_COMPLICATIONS',
    'default': 'GColorBlackARGB8',
    'desc': 'Top complications color',
  },
  {
    'key': 'CONFIG_COLOR_DAY',
    'default': 'GColorLightGrayARGB8',
    'desc': 'Precipitation day time indicator color',
    'show_only_if': 'readConfig("CONFIG_WEATHER_RAIN_LOCAL") == 1 && readConfig("CONFIG_SHOW_DAYNIGHT") == 1',
  },
  {
    'key': 'CONFIG_COLOR_NIGHT',
    'default': 'GColorBlackARGB8',
    'desc': 'Precipitation night time indicator color',
    'show_only_if': 'readConfig("CONFIG_WEATHER_RAIN_LOCAL") == 1 && readConfig("CONFIG_SHOW_DAYNIGHT") == 1',
  },
  {
    'key': 'CONFIG_COLOR_BAT_30',
    'default': 'GColorYellowARGB8',
    'desc': '',
    'show_only_if': 'readConfig("CONFIG_LOWBAT_COL") != 0',
    'dont_show_in_main_color_section': True,
  },
  {
    'key': 'CONFIG_COLOR_BAT_20',
    'default': 'GColorChromeYellowARGB8',
    'desc': '',
    'show_only_if': 'readConfig("CONFIG_LOWBAT_COL") != 0',
    'dont_show_in_main_color_section': True,
  },
  {
    'key': 'CONFIG_COLOR_BAT_10',
    'default': 'GColorFollyARGB8',
    'desc': '',
    'show_only_if': 'readConfig("CONFIG_LOWBAT_COL") != 0',
    'dont_show_in_main_color_section': True,
  },
  {
    'key': 'CONFIG_LOWBAT_COL',
    'default': 'false',
    'mydefault': 'true',
  },
  {
    'key': 'CONFIG_ADVANCED_APPEARANCE_LOCAL',
    'default': 'false',
  },
  {
    'key': 'CONFIG_COMPLICATION_1',
    'default': 'COMPLICATION_WEATHER_LOW_TEMP',
  },
  {
    'key': 'CONFIG_COMPLICATION_2',
    'default': 'COMPLICATION_WEATHER_CUR_TEMP_ICON',
  },
  {
    'key': 'CONFIG_COMPLICATION_3',
    'default': 'COMPLICATION_WEATHER_HIGH_TEMP',
  },
  {
    'key': 'CONFIG_COMPLICATION_4',
    'default': 'IF_HR(COMPLICATION_HEARTRATE_CUR_ICON, COMPLICATION_STEPS_SHORT_ICON)',
  },
  {
    'key': 'CONFIG_COMPLICATION_5',
    'default': 'COMPLICATION_BLUETOOTH_DISCONLY',
  },
  {
    'key': 'CONFIG_COMPLICATION_6',
    'default': 'COMPLICATION_BATTERY_ICON',
  },
  {
    'key': 'CONFIG_PROGRESS',
    'default': '1',
  },
  {
    'key': 'CONFIG_TIME_FORMAT',
    'default': '"%I:0%M"',
    'type': 'string',
  },
  {
    'key': 'CONFIG_INFO_BELOW',
    'default': '"%A, %m/%d"',
    'type': 'string',
  },
  {
    'key': 'CONFIG_UPDATE_SECOND',
    'default': '0',
  },
  {
    'key': 'CONFIG_ADVANCED_FORMAT_LOCAL',
    'default': 'false',
  },
  {
    'key': 'CONFIG_TIME_FORMAT_LOCAL',
    'default': '0',
    'options': [
      '"%I:0%M"',
      '"0%I:0%M"',
      '"%H:0%M"',
      '"0%H:0%M"',
    ],
  },
  {
    'key': 'CONFIG_INFO_BELOW_LOCAL',
    'default': '0',
    'options': [
      '"%A, %m/%d"',
      '"%A, %d.%m."',
      '"%Y-0%m-0%d"',
      '"%B %d"',
      '"%d. %B"',
      '"%p"',
      '"%P"',
    ],
  },
  {
    'key': 'CONFIG_SHOW_DAYNIGHT',
    'default': 'true',
    'show_only_if': 'readConfig("CONFIG_WEATHER_RAIN_LOCAL") == 1',
  },
  {
    'key': 'CONFIG_STEP_GOAL',
    'default': '10000',
    'type': 'uint16_t',
    'show_only_if': 'readConfig("CONFIG_PROGRESS") == 1',
  },
]

simple_config = [
  {
    'key': 'SIMPLECONFIG_COLOR_MAIN',
    'desc': 'Main color',
    'depends': ['CONFIG_COLOR_TIME', 'CONFIG_COLOR_PERC', 'CONFIG_COLOR_BOTTOM_COMPLICATIONS', 'CONFIG_COLOR_PROGRESS_BAR2'],
  },
  {
    'key': 'SIMPLECONFIG_COLOR_ACCENT',
    'desc': 'Accent color',
    'depends': ['CONFIG_COLOR_TOPBAR_BG', 'CONFIG_COLOR_INFO_BELOW', 'CONFIG_COLOR_PROGRESS_BAR'],
  },
  {
    'key': 'SIMPLECONFIG_COLOR_BACKGROUND',
    'desc': 'Background color',
    'depends': ['CONFIG_COLOR_BACKGROUND', 'CONFIG_COLOR_TOP_COMPLICATIONS', 'CONFIG_COLOR_NIGHT'],
  },
]

complications = [
  {
    'key': 'COMPLICATION_EMPTY',
    'desc': 'Empty',
  },
  {
    'key': 'COMPLICATION_WEATHER_CUR_TEMP_ICON',
    'desc': 'Weather: Current temperature and icon',
    'group': 'WEATHER',
  },
  {
    'key': 'COMPLICATION_WEATHER_LOW_TEMP',
    'desc': 'Weather: Today\'s low',
    'group': 'WEATHER',
  },
  {
    'key': 'COMPLICATION_WEATHER_HIGH_TEMP',
    'desc': 'Weather: Today\'s high',
    'group': 'WEATHER',
  },
  {
    'key': 'COMPLICATION_BLUETOOTH_DISCONLY',
    'desc': 'Bluetooth (on disconnect only)',
  },
  {
    'key': 'COMPLICATION_BLUETOOTH_DISCONLY_ALT',
    'desc': 'Bluetooth (on disconnect only), alternative',
  },
  {
    'key': 'COMPLICATION_BLUETOOTH_YESNO',
    'desc': 'Bluetooth (yes/no)',
  },
  {
    'key': 'COMPLICATION_BATTERY_ICON',
    'desc': 'Battery icon',
  },
  {
    'key': 'COMPLICATION_QUIET_OFFONLY',
    'desc': 'Quiet time enabled (only when on)',
  },
  {
    'key': 'COMPLICATION_QUIET',
    'desc': 'Quiet time indicator (two icons for on/off)',
  },
] + enum_complication(
  [
    {
      'key': 'COMPLICATION_HEARTRATE_CUR',
      'desc': 'Heart rate',
      'noton': ['basalt'],
      'icontext': 'J',
      'text': 'format_unitless((int)health_service_peek_current_value(HealthMetricHeartRateBPM))',
    },
    {
      'key': 'COMPLICATION_STEPS',
      'desc': 'Steps',
      'icontext': 'A',
      'text': 'format_unitless(health_service_sum_today(HealthMetricStepCount))',
    },
    {
      'key': 'COMPLICATION_STEPS_SHORT',
      'desc': 'Steps abbreviated',
      'icontext': 'A',
      'text': 'format_thousands(health_service_sum_today(HealthMetricStepCount))',
    },
    {
      'key': 'COMPLICATION_CALORIES_RESTING',
      'desc': 'Calories burned, resting',
      'icontext': 'K',
      'text': 'format_unitless(health_service_sum_today(HealthMetricRestingKCalories))',
    },
    {
      'key': 'COMPLICATION_CALORIES_ACTIVE',
      'desc': 'Calories burned, active',
      'icontext': 'K',
      'text': 'format_unitless(health_service_sum_today(HealthMetricActiveKCalories))',
    },
    {
      'key': 'COMPLICATION_CALORIES_ALL',
      'desc': 'Calories burned, resting + active',
      'icontext': 'K',
      'text': 'format_unitless(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories))',
    },
    {
      'key': 'COMPLICATION_CALORIES_RESTING_SHORT',
      'desc': 'Calories burned, resting, abbreviated',
      'icontext': 'K',
      'text': 'format_thousands(health_service_sum_today(HealthMetricRestingKCalories))',
    },
    {
      'key': 'COMPLICATION_CALORIES_ACTIVE_SHORT',
      'desc': 'Calories burned, active, abbreviated',
      'icontext': 'K',
      'text': 'format_thousands(health_service_sum_today(HealthMetricActiveKCalories))',
    },
    {
      'key': 'COMPLICATION_CALORIES_ALL_SHORT',
      'desc': 'Calories burned, resting + active, abbreviated',
      'icontext': 'K',
      'text': 'format_thousands(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories))',
    },
  ],
  {
    'icon': ['true', 'false'],
    'autogen': ['icon_text'],
  }
) + [
  {
    'key': 'COMPLICATION_AMPM',
    'desc': 'AM/PM',
  },
  {
    'key': 'COMPLICATION_AMPM_LOWER',
    'desc': 'am/pm',
  },
  {
    'key': 'COMPLICATION_SECONDS',
    'desc': 'Seconds',
  },
  {
    'key': 'COMPLICATION_DAY_OF_WEEK',
    'desc': 'Day of week',
  },
]
  # {
  #   'key': 'COMPLICATION_DISTANCE_KM',
  #   'desc': 'Distance walked (km)',
  # },
  # {
  #   'key': 'COMPLICATION_DISTANCE_MI',
  #   'desc': 'Distance walked (miles)',
  # },
  # {
  #   'key': 'COMPLICATION_ACTIVE_TIME',
  #   'desc': 'Minutes spent active',
  # },
  # {
  #   'key': 'COMPLICATION_CALORIES',
  #   'desc': 'Calories burned (active)',
  # },
  # {
  #   'key': 'COMPLICATION_CALORIES_FULL',
  #   'desc': 'Calories burned (active + resting)',
  # },

config_groups = [
  {
    'name': 'WEATHER',
    'show_only_if': 'has_complication(ALL_WEATHER_COMPLICATION_IDS)',
  },
]

msg_keys = [
  'WEATHER_TEMP_LOW',
  'WEATHER_TEMP_HIGH',
  'WEATHER_TEMP_CUR',
  'WEATHER_ICON_CUR',
  'WEATHER_PERC_DATA',
  'WEATHER_PERC_DATA_LEN',
  'WEATHER_PERC_DATA_TS',
  'FETCH_WEATHER',
  'WEATHER_FAILED',
  'JS_READY',
]

perc_max_len = 30

files_to_render = [
  "package.template.json",
]
files_to_inline_render = [
  "src/redshift.h",
  "src/redshift.c",
  "src/settings.c",
  "src/complications.c",
  "src/complications.h",
  "src/ui.c",
  "src/js/pebble-js-app.js",
  "config/index.html",
  "config/js/preview.js",
]

now = datetime.datetime(2016, 11, 27, 17, 44, 57, 0)
nowt = now.timetuple()

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
    config = add_key_id(configuration, '', 1)
    sc = add_additional_info(simple_config)
    compls = add_key_id(complications, '', 0)
    pre_process(config, simple_config, compls, config_groups)
    _context =  {
      'version': version,
      'config_version': config_version,
      'supported_platforms': read_configure('SUPPORTED_PLATFORMS').split(' '),
      'configuration': config,
      'configuration_lookup': to_lookup(config),
      'simple_config': sc,
      'simple_config_lookup': to_lookup(sc),
      'config_groups': config_groups,
      'complications': compls,
      'complications_lookup': to_lookup(compls),
      'num_config_items': len(config),
      'message_keys': add_key_id(msg_keys, 'MSG_KEY_', 100),
      'perc_max_len': perc_max_len,
      'fontsize_complications': 27,
      'build': read_configure('BUILD'),
    }
  return _context

def pre_process(config, simple_config, compls, groups):
  lc = to_lookup(config)
  # decide which colors are part of a simple color, and which are not
  for k in simple_config:
    for i in k['depends']:
      lc[i]['belongs_to_simple'] = True

  def resolve_complications(x):
    # sort to avoid problems with keys that are substrings of other keys
    for k in sorted(clc.keys(), key=lambda x: -len(x)):
      x = x.replace(k, str(clc[k]["id"]))
    return x

  def format_time(format):
    res = time.strftime(format, nowt).strip('"')
    if res[0] == "0": res = res[1:]
    res = re.sub("([^0-9])0", "\\1", res)
    return res

  # resolve complication defaults
  clc = to_lookup(compls)
  group_ids = {}
  for k in config:
    k['default'] = resolve_complications(k['default'])
    k['jsdefault'] = resolve_complications(k['jsdefault'])
    k['mydefault'] = resolve_complications(k['mydefault'])
    k['jsmydefault'] = resolve_complications(k['jsmydefault'])
    if 'options' in k:
      k['options'] = map(lambda x: {'desc': format_time(x[1]), 'id': x[0], 'format': x[1]}, enumerate(k['options']))

  # prepare complication groups
  for k in compls:
    if 'group' in k:
      if k['group'] not in group_ids:
        group_ids[k['group']] = []
      group_ids[k['group']].append(k['id'])
  for k in groups:
    name = k['name']
    k['key'] = "GROUP_%s" % (name)
    ids = map(lambda x: str(x), group_ids[name])
    resolved = "[%s]" % (", ".join(ids))
    for kk in k:
      k[kk] = k[kk].replace("ALL_%s_COMPLICATION_IDS" % (name), resolved)

def to_lookup(ls):
  res = {}
  for l in ls:
    res[l['key']] = l
  return res;

def to_js_default(val, type):
  jsdefault = val
  if 'int' in type:
    jsdefault = "+%s" % (jsdefault)
  if "GColor" in jsdefault:
    jsdefault = re.sub(r"GColor(.*)ARGB8", "GColor.\\1", jsdefault)
  return jsdefault

def add_additional_info(keys):
  res = []
  for k in keys:
    name = k['key']

    k['local'] = name[-5:] == 'LOCAL'
    if 'type' not in k:
      k['type'] = 'uint8_t'

    if 'default' in k:
      k['jsdefault'] = to_js_default(k['default'], k['type'])
      if 'mydefault' in k:
        k['jsmydefault'] = to_js_default(k['mydefault'], k['type'])
      else:
        k['mydefault'] = k['default']
        k['jsmydefault'] = k['jsdefault']


    k['iscolor'] = "_COLOR_" in name
    k['belongs_to_simple'] = False

    res.append(k)
  return res

def add_key_id(keys, prefix, start_id):
  """Helper to add id's to some list of keys"""
  res = []
  i = start_id
  for k in keys:
    if type(k) in [str, unicode]:
      res.append({'key': "%s%s" % (prefix, k), 'id': i})
    else:
      name = k['key']
      k['key'] = "%s%s" % (prefix, k['key'])
      k['id'] = i
      res.append(k)
    i += 1
  return add_additional_info(res)

def read_configure(key):
  """Read the value of a ./configure setting"""
  config = read_file(".redshift_config")
  for line in config.split("\n"):
    if line[0:len(key)] == key:
      return line[len(key)+1:].strip('"')
  error("tried to read '%s' in .redshift_config, but key does not exist." % (key))

def read_file(name):
  """Read a file from disk"""
  f = codecs.open(name, encoding='utf-8')
  res = f.read()
  f.close()
  return res

def write_file(name, content):
  """Write a file to disk"""
  f = codecs.open(name, encoding='utf-8', mode='w')
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

  ishtml = False
  newcontents = []
  env = Environment(line_statement_prefix=line_statement_prefix)
  contents = read_file(file)
  linenr = 0
  laststart = 0
  tpl = []
  mode = 'init'
  typ = '' # is this a build or autogen block?
  should_render_template = True
  for line in contents.split("\n"):
    linenr += 1
    isstart = re.search(r"^ *(// --) autogen", line)
    isstart2 = re.search(r"^ *(// --) build=(.*)", line)
    isend = re.search(r"^ *(// --) end (build|autogen)", line)
    istpl = re.search(r"^ *(// --) (.*)", line)
    ishtmlcomment = re.search(r"^<!--", line)
    if mode == 'init':
      if isstart is not None:
        typ = "autogen"
        should_render_template = True
        newcontents.append(line)
        laststart = linenr
        mode = 'template'
      elif isstart2 is not None:
        typ = "build"
        should_render_template = isstart2.group(2) == get_context()['build']
        newcontents.append(line)
        laststart = linenr
        mode = 'template'
      else:
        newcontents.append(line)
        if ishtmlcomment is not None:
          ishtml = True
        else:
          ishtml = False
    elif mode == 'ignore':
      if isend is not None:
        if isend.group(2) != typ: error("Started a '%s' block, but ended with '%s'" % (typ, isend.group(2)))
        newcontents.append(line)
        mode = 'init'
    elif mode == 'template':
      if istpl is not None and isend is None:
        tpl.append(istpl.group(2))
        newcontents.append(line)
      else:
        tpl = "\n".join(tpl)
        if starts_with(tpl, "c_to_js"):
          newcontents.append(c_to_js(tpl[8:]))
        else:
          if should_render_template:
            template = env.from_string(tpl)
            if ishtml: newcontents.append('-->')
            newcontents.append(template.render(get_context()).strip("\n"))
            if ishtml: newcontents.append('<!--')
        tpl = []
        mode = 'ignore'
        if isend is not None:
          if isend.group(2) != typ: error("Started a '%s' block, but ended with '%s'" % (typ, isend.group(2)))
          newcontents.append(line)
          mode = 'init'

  if mode != 'init':
    error("Unclosed autogen section started on line %d, stopped in mode %s." % (laststart, mode))

  newcontents = "\n".join(newcontents)
  if contents != newcontents:
    write_file(file, newcontents)


def c_to_js(f):
  """Take a file in C and perform an ad-hoc translation to JavaScript"""

  c = read_file(f)

  def starts_with(s, sub):
    return s[0:len(sub)] == sub

  newcontents = []
  basetype = "(char|bool|[a-z_0-9]+_t|void)"
  ident = "(?!return)[a-zA-Z_][a-zA-Z0-9_]*"
  mode = "init"
  for line in c.split(u"\n"):

    isstart = re.search(r"^ *(// --) jsalternative", line)
    isend = re.search(r"^ *(// --) end jsalternative", line)
    istpl = re.search(r"^ *(// --) (.*)", line)

    if mode == 'init':
      if isstart is not None:
        mode = 'alt'
        continue
    elif mode == 'ignore':
      if isend is not None:
        mode = 'init'
      continue
    elif mode == 'alt':
      if istpl is not None and isend is None:
        newcontents.append(istpl.group(2))
      else:
        mode = 'ignore'
        if isend is not None:
          mode = 'init'
      continue

    if starts_with(line, u"#include"): continue
    if starts_with(line, u"#ifndef"): continue
    if starts_with(line, u"#endif"): continue
    if starts_with(line, u"typedef"): continue
    if starts_with(line.strip(), u"//"): continue
    if line == "": continue

    rfundecl = re.match("(?P<type>" + basetype + "\\*?) (?P<name>" + ident + ")\\((?P<arglist>.*)\\) {$", line)
    if rfundecl is not None:
      name = rfundecl.group("name")
      arglist = rfundecl.group("arglist")
      arglist = ", ".join(map(lambda x: x.strip().split(" ")[-1].strip("*"), arglist.split(",")))
      newcontents.append("function %s(%s) {" % (name, arglist))
      continue

    rlocalvar = re.match("(?P<indent> *)((const|struct) )?(?P<type>" + ident + ")\\*? \\*?(?P<name>" + ident + ")(\\[\\])? = (?P<rhs>.*)$", line)
    if rlocalvar is not None:
      name = rlocalvar.group("name")
      rhs = rlocalvar.group("rhs")
      indent =  rlocalvar.group("indent")
      newcontents.append("%svar %s = %s" % (indent, name, rhs))
      continue

    rlocalvarnorhs = re.match("(?P<indent> *)(const )?(?P<type>" + ident + ")\\*? \\*?(?P<name>" + ident + ");$", line)
    if rlocalvarnorhs is not None:
      name = rlocalvarnorhs.group("name")
      indent =  rlocalvarnorhs.group("indent")
      newcontents.append("%svar %s;" % (indent, name))
      continue

    rforloop = re.match("(?P<indent> *)for \\(int (?P<rest>.*)$", line)
    if rforloop is not None:
      rest = rforloop.group("rest")
      indent =  rforloop.group("indent")
      newcontents.append("%sfor(var %s" % (indent, rest))
      continue

    rstrformat = re.match("(?P<indent> *)(?P<fun>strftime|snprintf)\\((?P<target>" + ident + "), [^,]*, (?P<format>.*), (?P<what>[^,]*)\\);$", line)
    if rstrformat is not None:
      indent = rstrformat.group("indent")
      form = rstrformat.group("format")
      target = rstrformat.group("target")
      what = rstrformat.group("what")
      fun = rstrformat.group("fun")
      if fun == "strftime":
        newcontents.append("%s%s = strftime(%s, new Date());" % (indent, target, form))
      else:
        newcontents.append("%s%s = sprintf(%s, %s);" % (indent, target, form, what))
      continue

    newcontents.append(line)

  if mode != 'init':
    error("Unclosed jsalternative section started, stopped in mode %s." % (mode))

  for i in range(len(newcontents)):
    line = newcontents[i]
    line = re.sub(r"GColor([A-Za-z]+)ARGB8", "GColor.\\1", line)
    if "&" in line and "&&" not in line:
      line = line.replace("&", "");
    if "->" in line:
      line = line.replace("->", ".");
    if "(int)" in line:
      line = line.replace("(int)", "");
    if "(fixed_t)" in line:
      line = line.replace("(fixed_t)", "");
    newcontents[i] = line

  newcontents = u"\n".join(newcontents)
  return newcontents


def main():
  if len(sys.argv) == 3 and sys.argv[1] == "inline":
    env = Environment()
    template = env.from_string(sys.argv[2])
    print template.render(get_context()).strip("\n")
    return
  for f in files_to_render:
    render(f)
  for f in files_to_inline_render:
    inline_render(f)

if __name__ == "__main__":
  main()
