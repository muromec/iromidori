from biribiri.chain.utils import view, upd_ctx
from simplejson import dumps

from .state import CHARS

@view(url="/info/char.list")
@upd_ctx('json')
def char_list(**kw):
    ret = {
            "chars": CHARS,
    }
    return dumps(ret), None
