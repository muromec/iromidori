import logging

from tornado import websocket
from simplejson import dumps

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
                cn.write_message(data_str)
            except IOError:
                logging.error("cant send")

subs = Subscribers('main')

class EventSocket(websocket.WebSocketHandler):
    def open(self):
        subs.add(self)

    def on_message(self, message):
        logging.info("got msg: %r" % message)

    def on_close(self):
        subs.drop(self)

