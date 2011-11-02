
import re
from uuid import uuid4
import simplejson

import socket
from tornado.iostream import IOStream, SSLIOStream
from tornado import ioloop
from tornado.util import bytes_type, b

from tornado.escape import utf8, _unicode, native_str
from tornado.httputil import HTTPHeaders
from tornado.websocket import WebSocketProtocol8 as WS

from iromidori.bot.events import evapi

class NR(object):
    path = None
    def __nonzero__(self): return False

class Connector(object):

    MAX_BUF = 104857600

    def __init__(self, host, port):
        self.host, self.port = host, port
        self.io_loop = ioloop.IOLoop()
        self.key = str(uuid4())

        self.connect()

    def connect(self):
        af = socket.AF_UNSPEC

        addrinfo = socket.getaddrinfo(
                self.host, self.port, af, 
                socket.SOCK_STREAM,
                0, 0)

        af, socktype, proto, canonname, sockaddr = addrinfo[0]

        self.stream = IOStream(
                socket.socket(af, socktype, proto),
                self.io_loop,
                max_buffer_size=self.MAX_BUF,
        )

        self.stream.connect(sockaddr, self.connected)

        self.request = NR()
        self.proto = WS(self)

    def connected(self):
        request_lines = [
                utf8("%s %s HTTP/1.1" % ('GET', '/events'))
        ]
        headers = (
                ("Host", "%s:%d" %(self.host,self.port)),
                ("Upgrade", "websocket"),
                ("Connection", "Upgrade"),
                ("Sec-Websocket-Version", 8),
                ("Sec-Websocket-Key", self.key,),
        )
        for k, v in headers:
            request_lines.append("%s: %s" % (k,v))

        self.stream.write(b("\r\n").join(request_lines) + b("\r\n\r\n"))

        self.stream.read_until(b("\r\n\r\n"), self._upgraded)

    def _upgraded(self, data):
        data = native_str(data.decode("latin1"))
        first_line, _, header_data = data.partition("\n")
        match = re.match("HTTP/1.[01] ([0-9]+)", first_line)
        assert match
        code = int(match.group(1))
        headers = HTTPHeaders.parse(header_data)

        self.accept = headers.get('Sec-Websocket-Accept')

        self.open()
        self.proto._receive_frame()

    def write_message(self, data):
        self.proto.write_message(data)


 
class BotConnector(Connector):
    class State(object):
        def __init__(self, cn):
            self.cn = cn

        def send(self, data):
            self.cn.write_message(simplejson.dumps(data))

    def on_message(self, data):
        msg = simplejson.loads(data)
        kw = msg.get('data')
        if not isinstance(kw, dict):
            kw = {"data": kw}

        evapi(msg['fn'], who=self.state, **kw)

    def open(self):
        self.state = self.State(self)
        print 'opened'
        self.write_message({
            "url" : "/enter",
            "char_type" : "dog",
        })

bc = BotConnector('localhost', 31574)
bc.io_loop.start()
