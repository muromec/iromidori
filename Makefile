PY_VER  = $(shell python -V 2>&1 | cut -f 2 -d ' ' | cut -f 1 -d .)
TORNADO = $(wildcard etc/eggs/tornado-2*.egg/tornado/)

P=/sbin:/usr/sbin:$(PATH)

ifeq ($(PY_VER), 3)
    PYTHON=python2
else
    PYTHON=python

endif

all: run

build: env/bin/python install reload

env/bin/python:
	$(PY) -m virtualenv env

run: env/bin/python
	env/bin/python iromidori/main.py

run_bot: env/bin/python
	env PYTHONPATH=. bin/python iromidori/botclient.py

build: bin/py

D=/var/lib/buildbot/midori-current/
MAP=/var/lib/buildbot/midori-data/
PID=/var/lib/buildbot/midori.pid

install:
	rm -rf $(D)
	cp ./ $(D) -a

reload:
	env PATH=$(P) start-stop-daemon --pidfile $(PID) --stop --oknodo
	env PATH=$(P) MAPDATA=$(MAP) start-stop-daemon --pidfile $(PID) \
	    -b  -m  \
	    -S -x $(D)env/bin/python  $(D)/iromidori/main.py
# force
