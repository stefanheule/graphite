#!/usr/bin/env python

from jinja2 import Template
from jinja2 import Environment, FileSystemLoader
import sys
import re
import codecs


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

def c_to_js(c):
  """Take a file in C and perform an ad-hoc translation to JavaScript"""

  def starts_with(s, sub):
    return s[0:len(sub)] == sub

  newcontents = []
  basetype = "(bool|u?int[0-9]+_t|void)"
  ident = "[a-zA-Z_][a-zA-Z0-9_]*"
  for line in c.split(u"\n"):

    if starts_with(line, u"#include"): continue
    if starts_with(line, u"#ifndef"): continue
    if starts_with(line, u"#endif"): continue

    rfundecl = re.match("(?P<type>" + basetype + ") (?P<name>" + ident + ")\\((?P<arglist>.*)\\) {$", line)
    if rfundecl is not None:
      name = rfundecl.group("name")
      arglist = rfundecl.group("arglist")
      arglist = ", ".join(map(lambda x: x.strip().split(" ")[-1].strip("*"), arglist.split(",")))
      newcontents.append("function %s(%s) {" % (name, arglist))
      continue

    rlocalvar = re.match("(?P<indent> *)((const|struct) )?(?P<type>" + ident + ")\\*? \\*?(?P<name>" + ident + ") = (?P<rhs>.*)$", line)
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
      newcontents.append("%sfor(%s" % (indent, rest))
      continue

    newcontents.append(line)

  for i in range(len(newcontents)):
    line = newcontents[i]
    if "&" in line and "&&" not in line:
      newcontents[i] = line.replace("&", "");
    if "->" in line:
      newcontents[i] = line.replace("->", ".");
    if "(int)" in line:
      newcontents[i] = line.replace("(int)", "");

  newcontents = u"\n".join(newcontents)
  return newcontents

def main():
  js = c_to_js(read_file("src/ui.c"))
  write_file("js.js", js)

if __name__ == "__main__":
  main()
