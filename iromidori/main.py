import sys
sys.path.insert(0, '.')

from werkzeug.wrappers import Request, Response
from biribiri import chain

from iromidori.static import serve as static

def route(request, upd_ctx, **ctx):
    upd_ctx['url'] = request.path

    return [static]

@Request.application
def entry(request):

    ret = chain.run([route], request=request)
    body = ret.get('render')
    code = ret.get('return_code', 202)
    headers = ret.get('headers')

    content_type = ret.get('content_type', 'text/html; charset=utf-8')

    response = Response(body, content_type=content_type, status=code, headers=headers)

    return response

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.DEBUG)

    from werkzeug.serving import run_simple
    run_simple("0.0.0.0", 31574, entry)
