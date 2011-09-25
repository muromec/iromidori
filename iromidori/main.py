import sys
sys.path.insert(0, '.')

from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado import web

from biribiri import chain

from iromidori.static import serve as static
from iromidori.events import EventSocket

def route(request, upd_ctx, **ctx):
    upd_ctx['url'] = request.path

    return [static]

class ApiHandler(web.RequestHandler):
    def get(self):
        from iromidori.evapi import route
        kw = {
                "request": self.request,
                "url": self.request.path[4:], # XXX!
        }
        ret = chain.run([route], **kw)
        json = ret.get('json') or "Nani-Nani"
        self.write(json)


if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)

    application = web.Application([
            (r"/events", EventSocket),
            (r"/api/.*", ApiHandler),
            (r"/(.*(png|js|html|css))", web.StaticFileHandler, {"path": "./data/"}),
    ])
    http_server = HTTPServer(application)
    http_server.listen(31574)
    IOLoop.instance().start()
