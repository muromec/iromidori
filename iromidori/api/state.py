from biribiri.chain.utils import view
from uuid import uuid4

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
    for player in group.subs:
        if player.dead:
            continue

        print [player.x, player.y], point
        if [player.x, player.y] == point:
            'found target!'
            target_p = player
            break
    else:
        target = None
        target_p = None
        'nobody affected'

    if target_p:
        player.stat['hp'] -= 10
        target = {
            "uid": player.uid,
            "hp": player.stat['hp'],
            "dead": player.dead,
        }

    group.send({
        "fn": "fire",
        "data": {
            "who": who.uid,
            "target": target,
            "point": point,
        }
    })
