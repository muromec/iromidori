import os

from biribiri.chain.utils import upd_ctx

# TODO: config
root = './data/'

mime = {
        "css": "text/css",
        "png": "image/png",
        "jpg": "image/jpeg",
        "html": "text/html",
        "js": "text/javascript",
}

@upd_ctx('found_view', 'content_type', 'render')
def serve(url, **kw):
    url = url.replace('..', '.')  # serve trollface unstead?
    fname = root+url

    if not os.access(fname, 0):
        return None, None

    ext = url.rsplit('.', 1)[-1]  # path ext
    typ = mime.get(ext, 'application/bin')

    return True, typ, open(fname)
