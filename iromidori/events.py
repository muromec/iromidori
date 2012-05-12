import logging

from tornado import websocket
from simplejson import dumps

from evapi import evapi
from char import CharStats

class Subscribers(object):
    def __init__(self,name):
        self.name = name
        self.subs = []

    def add(self, cn):
        self.subs.append(cn)

    def drop(self, cn):
        self.subs.remove(cn)


    def send(self, data):
        data_str = dumps(data)

        for cn in self.subs:
            try:
                cn.send(data_str)
            except IOError:
                logging.error("cant send")

subs = Subscribers('main')

class EventSocket(websocket.WebSocketHandler):
    class State(CharStats):
        def __init__(self, cn):
            self.cn = cn

            super(self.__class__, self).__init__()

        def send(self, data):
            if not isinstance(data, basestring):
                data = dumps(data)

            self.cn.write_message(data)

        def sched(self, delta, **kw):
            import time
            def send():
                evapi(who=self, group=subs, **kw)

            next_time = time.time() + delta

            self.cn.io_loop.add_timeout(next_time, send)

    def open(self):
        self.state = self.State(self)

        subs.add(self.state)

    def on_message(self, message):
        logging.info("got msg: %r" % message)
        evapi(raw=message, group=subs, who=self.state)

    def on_close(self):
        subs.drop(self.state)
        evapi(msg={"url": "/out"}, group=subs, who=self.state)
