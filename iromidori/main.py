import sys
here = str.join("/", sys.argv[0].split("/")[:-2]) or '.'
sys.path.insert(0, here)

from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado import web

from simplejson import loads

from biribiri import chain

from iromidori.static import serve as static
from iromidori.events import EventSocket

def route(request, upd_ctx, **ctx):
    upd_ctx['url'] = request.path

    return [static]

class ApiHandler(web.RequestHandler):
    def get(self):
        return self.chain(self.request.arguments)

    def chain(self, args):
        from iromidori.evapi import route
        kw = {
                "request": self.request,
                "url": self.request.path[4:], # XXX!
        }
        kw.update(args)  # XXX: insecure!
        ret = chain.run([route], **kw)
        json = ret.get('json') or "Nani-Nani"
        self.write(json)

    def post(self):
        json = self.request.arguments.get("data")
        return self.chain(loads(json[0]))


if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)

    DATA = here+"/data/"

    application = web.Application([
            (r"/events", EventSocket),
            (r"/api/.*", ApiHandler),
            (r"/(.*(png|js|html|css))", web.StaticFileHandler, {"path": DATA}),
    ])
    http_server = HTTPServer(application)
    http_server.listen(31574)
    IOLoop.instance().start()
