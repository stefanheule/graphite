#!/usr/bin/env python

from jinja2 import Template
from jinja2 import Environment, FileSystemLoader
import sys
import re
import codecs

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
    'default': '1',
  },
  {
    'key': 'CONFIG_WEATHER_SOURCE_LOCAL',
    'default': '1',
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
    'default': '30',
    'type': 'uint16_t',
  },
  {
    'key': 'CONFIG_WEATHER_EXPIRATION',
    'default': '3*60',
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
    'key': 'CONFIG_COLOR_INFO_ABOVE',
    'default': 'GColorVividCeruleanARGB8',
    'desc': 'Color of information text above time',
  },
  {
    'key': 'CONFIG_COLOR_PROGRESS_BAR',
    'default': 'GColorVividCeruleanARGB8',
    'desc': 'Progress bar color',
  },
  {
    'key': 'CONFIG_COLOR_PROGRESS_BAR2',
    'default': 'GColorWhiteARGB8',
    'desc': 'Second progress bar color',
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
  },
  {
    'key': 'CONFIG_COLOR_NIGHT',
    'default': 'GColorBlackARGB8',
    'desc': 'Precipitation night time indicator color',
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
    'default': 'COMPLICATION_HEARTRATE_CUR',
  },
  {
    'key': 'CONFIG_COMPLICATION_5',
    'default': 'COMPLICATION_BLUETOOTH_DISCONLY',
  },{
    'key': 'CONFIG_COMPLICATION_6',
    'default': 'COMPLICATION_BATTERY_ICON',
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
    'depends': ['CONFIG_COLOR_TOPBAR_BG', 'CONFIG_COLOR_INFO_BELOW', 'CONFIG_COLOR_INFO_ABOVE', 'CONFIG_COLOR_PROGRESS_BAR'],
  },
  {
    'key': 'SIMPLECONFIG_COLOR_BACKGROUND',
    'desc': 'Background color',
    'depends': ['CONFIG_COLOR_BACKGROUND', 'CONFIG_COLOR_TOP_COMPLICATIONS'],
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
  },
  {
    'key': 'COMPLICATION_WEATHER_LOW_TEMP',
    'desc': 'Weather: Today\'s low',
  },
  {
    'key': 'COMPLICATION_WEATHER_HIGH_TEMP',
    'desc': 'Weather: Today\'s high',
  },
  {
    'key': 'COMPLICATION_BLUETOOTH_DISCONLY',
    'desc': 'Bluetooth (on disconnect only)',
  },
  {
    'key': 'COMPLICATION_HEARTRATE_CUR',
    'desc': 'Heart rate',
    'noton': ['basalt'],
  },
  {
    'key': 'COMPLICATION_BATTERY_ICON',
    'desc': 'Battery icon',
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
    pre_process(config, simple_config, compls)
    _context =  {
      'version': version,
      'config_version': config_version,
      'supported_platforms': read_configure('SUPPORTED_PLATFORMS').split(' '),
      'configuration': config,
      'configuration_lookup': to_lookup(config),
      'simple_config': sc,
      'simple_config_lookup': to_lookup(sc),
      'complications': compls,
      'num_config_items': len(config),
      'message_keys': add_key_id(msg_keys, 'MSG_KEY_', 100),
      'perc_max_len': perc_max_len,
    }
  return _context

def pre_process(config, simple_config, compls):
  lc = to_lookup(config)
  # decide which colors are part of a simple color, and which are not
  for k in simple_config:
    for i in k['depends']:
      lc[i]['belongs_to_simple'] = True

  # resolve complication defaults
  clc = to_lookup(compls)
  for k in config:
    if "COMPLICATION_" in k['default']:
      i = clc[k['default']]['id']
      k['default'] = i
      k['jsdefault'] = "+%d" % (i)


def to_lookup(ls):
  res = {}
  for l in ls:
    res[l['key']] = l
  return res;

def add_additional_info(keys):
  res = []
  for k in keys:
    name = k['key']

    k['local'] = name[-5:] == 'LOCAL'
    if 'type' not in k:
      k['type'] = 'uint8_t'

    if 'default' in k:
      jsdefault = k['default']
      if 'int' in k['type']:
        jsdefault = "+%s" % (jsdefault)
      if "GColor" in jsdefault:
        jsdefault = re.sub(r"GColor(.*)ARGB8", "GColor.\\1", jsdefault)
      k['jsdefault'] = jsdefault

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
  for line in contents.split("\n"):
    linenr += 1
    isstart = re.search(r"^ *(// --) autogen", line)
    isend = re.search(r"^ *(// --) end autogen", line)
    istpl = re.search(r"^ *(// --) (.*)", line)
    ishtmlcomment = re.search(r"^<!--", line)
    if mode == 'init':
      if isstart is not None:
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
          template = env.from_string(tpl)
          if ishtml: newcontents.append('-->')
          newcontents.append(template.render(get_context()).strip("\n"))
          if ishtml: newcontents.append('<!--')
        tpl = []
        mode = 'ignore'
        if isend is not None:
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
  basetype = "(bool|[a-z_0-9]+_t|void)"
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

    rfundecl = re.match("(?P<type>" + basetype + ") (?P<name>" + ident + ")\\((?P<arglist>.*)\\) {$", line)
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
  for f in files_to_render:
    render(f)
  for f in files_to_inline_render:
    inline_render(f)

if __name__ == "__main__":
  main()
