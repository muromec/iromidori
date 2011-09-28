PY_VER  = $(shell python -V 2>&1 | cut -f 2 -d ' ' | cut -f 1 -d .)

ifeq ($(PY_VER), 3)
    PYTHON=python2
else
    PYTHON=python

endif

all: run

build: bin/py install reload

run: bin/py
	bin/py iromidori/main.py

bin/buildout:
	$(PYTHON) bootstrap.py

build: bin/py

bin/py: bin/buildout buildout.cfg
	bin/buildout

D=/var/lib/buildbot/midori-current/
PID=/var/lib/buildbot/midori.pid

install:
	rm -rf $(D)
	cp ./ $(D) -a

reload:
	start-stop-daemon --pidfile $(PID) --stop 
	start-stop-daemon --pidfile $(PID) \
	    -b  -m  \
	    -S -x $(D)/bin/py  $(D)/iromidori/main.py
# force
