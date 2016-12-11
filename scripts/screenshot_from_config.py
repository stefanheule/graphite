#!/usr/bin/env python


import sys
import humanfriendly
import os
import inspect
import random
import shutil
import threading
import re
import subprocess
import base64

def error(m):
  print(m)
  sys.exit(1)

def main():
  base = os.path.abspath(inspect.stack()[1][1] + "/../..")
  tmp = "%s/tmp" % (base)
  target = "%s/index.html" % (tmp)
  screenshotdir = "%s/screenshots/basalt" % (base)
  
  # if os.path.exists(tmp):
  #   error("tmp folder exists")

  # os.mkdir(tmp)

  # cmd = "screenshots/automate-save-page-as/save_page_as \"file:///home/stefan/dev/projects/all/2016-redshift/screenshots/src/index.html\" -d \"%s\" -b chromium-browser" % (target)
  # execute_ok(cmd)

  shutil.rmtree(screenshotdir)
  os.mkdir(screenshotdir)

  sshots = re.findall("([0-9a-z\\-]*)::::(.*)", read_file(target))
  for s in sshots:
    name = s[0]
    f = "%s/%s.png" % (screenshotdir, name)
    img = base64.b64decode(s[1])
    write_file(f, img)

    execute_ok("pngcrush -q -rem time \"%s\" tmp.png" % (f))
    os.rename("tmp.png", f)

  # shutil.rmtree(tmp)

def write_file(f, contents):
  f = open(f,'w')
  f.write(contents)
  f.close()


def read_file(f):
  data = open(f)
  r = data.read()
  data.close()
  return r

def execute_ok(cmd):
  (retval, out) = execute(cmd)
  if retval != 0:
    print("cmd: %s" % (cmd))
    print("out: %s" % (out))
    error("Failed command")
  return out

def execute(cmd, timeout = None):
  """
  Execute a command and return it's output.
  """
  return Command(cmd).run(timeout)


# taken from http://stackoverflow.com/questions/1191374/subprocess-with-timeout
class Command(object):
  def __init__(self, cmd):
    self.cmd = cmd
    self.process = None
    self.output = ""
    self.error = ""

  def run(self, timeout):
    def target():
      self.process = subprocess.Popen(self.cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
      self.output = self.process.stdout.read()
      self.error = self.process.stderr.read()
      self.child = self.process.communicate()[0]

    thread = threading.Thread(target=target)
    thread.start()

    thread.join(timeout)
    if thread.is_alive():
      self.process.terminate()
      thread.join()
    retval = self.process.returncode
    return (retval, self.output + "\n" + self.error)


if __name__ == '__main__':
  main()
