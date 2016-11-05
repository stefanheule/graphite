#!/usr/bin/env python

from jinja2 import Template


# template variables
context = {
  'version': '1.0',
}

# -----------------------------

def read_file(name):
  with open(name) as f:
    return f.read()

def write_file(name, content):
  f = open(name, 'w')
  f.write(content)
  f.close()

def render(file):
  template = Template(read_file(file))
  write_file(file.replace(".template", ""), template.render(context))

def main():
  render("package.template.json")

if __name__ == "__main__":
  main()
