from biribiri import chain
from biribiri.chain.utils import match, upd_ctx

from random import sample

HOME = 20, 14

class Somebody(object):
    pass

def evapi(**kw):
    return chain.run([route], **kw)

@match(fn='set_self')
def zigote(who, uid, **kw):
    who.uid = uid
    who.near = []
    who.target = None
    who.will = "free_move"
    who.direction_ttl = 0

    who.sched(1.4, will=who.will, fn="sched")


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


def close(who, target):
    ox = target.x - who.x
    oy = target.y - who.y

    return (
            ( -2 <= ox <= 2 and -1 <= oy <= 1)
            or
            ( ox == 0 and -2 <= oy <= 2)
    )



@match(will="free_move", fn="sched")
def free_move(who, **kw):
    who.direction_ttl -= 1
    if who.direction_ttl <= 0:
        print 'reset direction'
	[who.direction] = sample([
		(2,1), (2,-1), (-2,1), (-2,-1)
	], 1)
	[who.direction_ttl] = sample([5,7,13,17], 1)

    ox, oy = who.direction

    who.send({
        "url": "/move",
        "ox": ox,
        "oy": oy,
    })


def away(who, (x,y), limit=15):
    def norm(val):
        return val if val > 0 else -val

    ox = norm(who.x - x)
    oy = norm(who.y - y)

    return ox > limit or oy > limit


@match(fn='move')
def moved_self(frm, who, target, **kw):
    # TODO: find a way to match myself
    if frm != who:
        return

    # split away?
    if who.will == 'stalk_move' and close(who, target):
        who.will = 'free_move'
	who.target = None

    elif who.will == 'free_move' and away(who, HOME):
        print 'go home!'
        who.will = 'home_move'

    elif who.will == 'home_move' and not away(who, HOME, limit=5):
        who.will = 'free_move'

def dir_point(who, (x,y)):

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


    return ox, oy

def do_move(who, (ox, oy)):

    who.send({
        "url": "/move",
        "ox": ox,
        "oy": oy,
    })

@match(will='stalk_move', target=Somebody, fn='sched')
def stalk(who, target, **kw):
    ox, oy = dir_point(who, (target.x, target.y))
    do_move(who, (ox, oy))


@match(will="home_move")
def home_move(who, **kw):
    ox, oy = dir_point(who, HOME)
    do_move(who, (ox, oy))



@upd_ctx('target', 'will')
def get_target(who, will=None, **kw):
    return who.target, who.will or will

@match(frm=Somebody)
def select_target(who, frm, fn=None, will=None, **kw):
    if will and 'free' in will:
        will = None

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

@match(fn='err')
def err_stop(who, data, **kw):
    import logging
    logging.error("stop err: %r" % data)

    who.will = 'free_move'
    who.target = None
    who.direction_ttl = 0

    raise chain.Stop

@match(fn='sched')
def sched(who, **kw):
    who.sched(1.4, fn="sched")

def route(**kw):
    return [
            sched,
            free_move,
            stalk,
            home_move,

            moved_self,
            moved,
            get_target,

            select_target,

            err_stop,

            drop_user,
            fill_user,
            fill_near,

            who_is,
            zigote,
    ]
