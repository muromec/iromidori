PY_VER  = $(shell python -V 2>&1 | cut -f 2 -d ' ' | cut -f 1 -d .)
TORNADO = $(wildcard etc/eggs/tornado-2*.egg/tornado/)

CHARS = $(patsubst %_0.png,%_sprite.png,$(wildcard data/img/char/*_0.png))

P=/sbin:/usr/sbin:$(PATH)

ifeq ($(PY_VER), 3)
    PYTHON=python2
else
    PYTHON=python

endif

%_sprite.png: %_0.png
	sh merge.sh $(patsubst %_0.png,%,$<)

tiles: $(CHARS)

all: tiles run

build: env/bin/python install reload

JS_ALL_NAMES = jquery-1.7.2.min.js \
	processing-1.3.6.min.js \
	coffee-script.js \
	eco.js \
	keymaster.min.js \

JS_ALL = $(patsubst %.js,data/js/%.js, $(JS_ALL_NAMES))
COFFEE_ALL = $(wildcard data/coffee/*.coffee)

data/js/draw.js: $(COFFEE_ALL)
	coffee -c -j $@ $(COFFEE_ALL)

data/midori.min.js: $(JS_ALL) data/js/draw.js
	cat $(JS_ALL) > $@
	echo ';;' >> $@
	cat data/js/draw.js >> $@


compile: data/js/draw.js data/midori.min.js

env/bin/python:
	$(PY) -m virtualenv env

run: env/bin/python
	env/bin/python iromidori/main.py

run_bot: env/bin/python
	env PYTHONPATH=. bin/python iromidori/botclient.py

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
