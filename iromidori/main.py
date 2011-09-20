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


def entry(request):
    

    print request.path

    ret = chain.run([route], request=request)
    body = ret.get('render')
    code = ret.get('return_code', 202)
    headers = ret.get('headers')

    content_type = ret.get('content_type', 'text/html; charset=utf-8')

    request.write("HTTP/1.0 200 OK\r\n\r\n")

    message = "You requested %s\n" % request.uri
    request.write("HTTP/1.1 200 OK\r\nContent-Length: %d\r\n\r\n%s" % (
                         len(message), message))
    request.finish()

    """
    if isinstance(body, file):
        for chk in iter(body.read, ""):
            print chk.__class__, len(chk)
            request.write(chk)
    else:
        request.write(body)

    request.finish()
    """
    print 'finish'

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.DEBUG)

    application = web.Application([
            (r"/events", EventSocket),
            (r"/(.*(png|js|html))", web.StaticFileHandler, {"path": "./data/"}),
    ])
    http_server = HTTPServer(application)
    http_server.listen(31574)
    IOLoop.instance().start()
