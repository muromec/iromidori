from biribiri import chain
from biribiri.chain.utils import match, upd_ctx

from random import sample

class Somebody(object):
    pass

def evapi(**kw):
    return chain.run([route], **kw)

@match(fn='set_self')
def zigote(who, uid, **kw):
    who.uid = uid
    who.near = []
    who.target = None
    who.will = None


@match(fn='add_user', frm=Somebody)
def fill_near(frm, who, **kw):
    who.near.append(frm)

@match(fn='drop_user')
def drop_user(who, frm, **kw):
    if frm in who.near:
        who.near.remove(frm)

    if frm == who.target:
        who.target = None

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


@match(will='stalk_move', target=Somebody, frm=Somebody)
def stalk(who, x, y, target, **kw):

    if target != who.target:
        return

    if (target.x, target.y) != (x,y):
        return

    def norm(val, lim=1):
        if val > 0:
            return lim
        elif val < 0:
            return -lim
        else:
            return val

    ox = norm(x - who.x, lim=2)
    oy = norm(y - who.y)
    if not ox and oy:
        oy*= 2

    if ox and not oy:
        [oy] = sample([1,-1],1)

    who.send({
        "url": "/move",
        "ox": ox,
        "oy": oy,
    })

    who.sched(1.8, will='stalk_move', x=x, y=y, uid=target.uid)


@upd_ctx('target', 'will')
def get_target(who, will=None, **kw):
    return who.target, who.will or will

@match(frm=Somebody)
def select_target(who, frm, fn=None, will=None, **kw):
    if who.target or will:
        return

    ATTRACT = [
            "add_user",
            "move",
    ]
    if fn in ATTRACT and frm in who.near:
        who.target = frm
        who.will = 'stalk_move'


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
        return Somebody(), None

    return frm, None
    

def route(**kw):
    return [
            stalk,

            moved,
            get_target,

            select_target,

            drop_user,
            fill_user,
            fill_near,

            who_is,
            zigote,
    ]
