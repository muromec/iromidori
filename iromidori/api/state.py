from biribiri.chain.utils import view, upd_ctx, match
from biribiri.chain import Stop

from uuid import uuid4
from iromidori import util
from iromidori.char import hp_check

@view(url='/enter')
def enter(who, group, char_type, char_name, **kw):
    who.x = 8
    who.y = 8
    who.uid = str(uuid4())
    who.char = char_type
    who.name = char_name
    who.point = {}
    who.stat = {
            'hp': 59,
    }

    who.send({"fn": "set_self", "data":{
        "uid": who.uid}})

    subs = group.subs[:]
    subs.remove(who)
    subs.insert(0, who)

    for cn in subs:
        group.send({
            "fn": "add_user",
            "data": {
                "x": cn.x,
                "y": cn.y,
                "char": cn.char,
                "uid": cn.uid,
                "name": cn.name,
                "stat": cn.stat,
            }
        })


@view(url="/out")
def out(who, group, **kw):
    group.send({
        "fn": "drop_user",
        "data" : {
            "uid": who.uid,
        },
    })


@view(url="/fire")
def fire(who, group, point, **kw):
    return [
            util.group_send,
            notify_fire,
            do_fire,
            hp_check,
            range_check,
    ]

def m(x):
    return -x if  x < 0 else x

def range_check(who, point, **kw):
    x,y = point
    x_o = m(who.x - x)
    y_o = m(who.y - y)

    import math
    dst = math.sqrt(x_o**2 + y_o**2)
    print dst
    if dst > 15:
        raise Stop

@upd_ctx("target")
def do_fire(group, point, who, **kw):
    for player in group.subs:
        if player.dead:
            continue

        if [player.x, player.y] == point:
            target_p = player
            break
    else:
        target_p = None

    if target_p:
        player.stat['hp'] -= 10

        if target_p.dead:
            target_p.sched(10, do='hp', hp=10)

    return target_p, None

@match(do='hp')
def set_hp(who, hp, **kw):
    who.stat['hp'] = hp

    if hp < 60:
        who.sched(15, do='hp', hp=hp+10)

    return [
            util.group_send,
            notify_stat,
    ]

@upd_ctx("send_out")
def notify_stat(who, **kw):
    return {
            "fn": "stats",
            "data": {
                "who": who.uid,
                "stat": who.stat,
                "dead": who.dead,
            }
    }

@upd_ctx("send_out")
def notify_fire(who, target, point, **kw):
    target_o = {
        "uid": target.uid,
        "hp": target.stat['hp'],
        "dead": target.dead,
    } if target else None

    return {
        "fn": "fire",
        "data": {
            "who": who.uid,
            "target": target_o,
            "point": point,
        }
    }, None
