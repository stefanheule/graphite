#!/usr/bin/env python3


import base64
import os
import re
import shutil
import subprocess
import sys

def error(m):
  print(m)
  sys.exit(1)

def main():
  base = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
  tmp = "%s/tmp" % (base)
  target = "%s/index.html" % (tmp)
  screenshotdir = "%s/screenshots/basalt" % (base)
  source = "%s/screenshots/src/index.html" % (base)
  save_page_as = "%s/screenshots/automate-save-page-as/save_page_as" % (base)
  browser = os.environ.get("SAVE_PAGE_AS_BROWSER")
  supported_browsers = ("chromium-browser", "google-chrome", "firefox")
  if browser is None:
    browser = next((name for name in supported_browsers if shutil.which(name)), None)

  if os.path.exists(tmp):
    error("tmp folder exists")
  if not os.path.isfile(save_page_as):
    error("save_page_as tool not found: %s" % (save_page_as))
  if browser not in supported_browsers:
    error("Supported browser not found; set SAVE_PAGE_AS_BROWSER to %s" % (", ".join(supported_browsers)))

  os.mkdir(tmp)
  try:
    execute_ok([
      save_page_as,
      "--save-wait-time", "1",
      "--load-wait-time", "2",
      "file://" + source,
      "-d", target,
      "-b", browser,
    ])

    if os.path.exists(screenshotdir):
      shutil.rmtree(screenshotdir)
    os.mkdir(screenshotdir)

    sshots = re.findall("([0-9a-z\\-]*)::::(.*)", read_file(target))
    for s in sshots:
      name = s[0]
      f = "%s/%s.png" % (screenshotdir, name)
      if name == "":
        print(s[1])
        continue
      img = base64.b64decode(s[1])
      write_file(f, img)

      crushed = f + ".crushed"
      execute_ok(["pngcrush", "-q", "-rem", "time", f, crushed])
      os.replace(crushed, f)
  finally:
    shutil.rmtree(tmp, ignore_errors=True)

def write_file(f, contents):
  f = open(f,'wb')
  f.write(contents)
  f.close()


def read_file(f):
  data = open(f, 'r')
  r = data.read()
  data.close()
  return r

def execute_ok(cmd):
  (retval, out) = execute(cmd)
  if retval != 0:
    print("cmd: %s" % (" ".join(cmd)))
    print("out: %s" % (out))
    error("Failed command")
  return out

def execute(cmd, timeout = None):
  try:
    completed = subprocess.run(
      cmd,
      stdout=subprocess.PIPE,
      stderr=subprocess.PIPE,
      text=True,
      timeout=timeout,
      check=False,
    )
    return (completed.returncode, completed.stdout + completed.stderr)
  except subprocess.TimeoutExpired as exc:
    output = (exc.stdout or "") + (exc.stderr or "")
    return (124, output + "\nCommand timed out")


if __name__ == '__main__':
  main()
