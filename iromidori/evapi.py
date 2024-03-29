from simplejson import loads
from biribiri.chain.utils import match, upd_ctx
from biribiri import chain

from iromidori.api import state, move, info

def evapi(**kw):
    return chain.run([parse, route], **kw)


def parse(upd_ctx, raw=None, msg=None, **kw):
    if not msg and not raw:
        return

    if not msg:
        msg = loads(raw)

    # XXX: security
    upd_ctx['msg'] = msg
    upd_ctx.update(msg)

def route(**kw):

    # TODO: autodiscover
    return [
            state.enter,
            state.out,
            state.fire,
            state.set_hp,
            move.move,
            move.vp,
            move.vp_edit,
            info.char_list,
            info.tile_list,
    ]
