PY_VER  = $(shell python -V 2>&1 | cut -f 2 -d ' ' | cut -f 1 -d .)

ifeq ($(PY_VER), 3)
    PYTHON=python2
else
    PYTHON=python

endif

all: run

run: bin/py
	bin/py iromidori/main.py

bin/buildout:
	$(PYTHON) bootstrap.py

build: bin/py

bin/py: bin/buildout buildout.cfg
	bin/buildout

# force
