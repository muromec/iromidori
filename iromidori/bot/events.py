from biribiri import chain
from biribiri.chain.utils import match, upd_ctx

from random import sample

class Somebody(object):
    pass

def evapi(fn, **kw):
    return chain.run([route], fn=fn, **kw)

@match(fn='set_self')
def zigote(who, uid, **kw):
    who.uid = uid
    who.near = []


@match(frm=Somebody)
def fill_near(frm, who, **kw):
    who.near.append(frm)

@match(fn='add_user')
def fill_user(frm, **kw):
    ATTRS = [
            "uid",
            "char",
            "x",
            "y"

    ]
    for attr in ATTRS:
        setattr(frm, attr, kw[attr])


@match(fn='move')
def moved(frm, x, y, **kw):
    frm.x = x
    frm.y = y


@match(fn='move', target=Somebody)
def target_moved(target, who, **kw):
    frm = target

    def norm(val, lim=1):
        if val > 0:
            return lim
        elif val < 0:
            return -lim
        else:
            return val

    ox = norm(frm.x - who.x, lim=2)
    oy = norm(frm.y - who.y)
    if not ox and oy:
        oy*= 2

    if ox and not oy:
        [oy] = sample([1,-1],1)

    who.send({
        "url": "/move",
        "ox": ox,
        "oy": oy,
    })


@match(fn='move', frm=Somebody)
@upd_ctx('target')
def set_target(frm, who, **kw):
    target =  getattr(who, 'target', None)
    if target and target != frm:
        return None,

    who.target = frm

    return frm,

@match(uid=basestring)
@upd_ctx('frm')
def who_is(uid, who, **kw):
    frm = None
    if uid == who.uid:
        return who, None

    for near in who.near:
        if uid==near.uid:
            frm = near
            break
    else:
        print 'new'
        return Somebody(), None

    return frm, None
    

def route(**kw):
    return [
            target_moved,
            moved,
            set_target,


            fill_user,
            fill_near,

            who_is,
            zigote,
    ]
