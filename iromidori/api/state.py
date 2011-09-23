from biribiri.chain.utils import view
from uuid import uuid4

import random

CHARS = [
        "faery",
        "deadly",
]

@view(url='/enter')
def enter(who, group, **kw):
    who.x = 8
    who.y = 8
    who.uid = str(uuid4())

    [char] = random.sample(CHARS, 1)

    for cn in group.subs:
        group.send({
            "fn": "add_user",
            "data": {
                "x": cn.state.x,
                "y": cn.state.y,
                "char": char,
                "uid": cn.state.uid,
            }
        })

    who.send({"fn": "set_self", "data":{
        "uid": who.uid}})


@view(url="/out")
def out(who, group, **kw):
    group.send({
        "fn": "drop_user",
        "data" : {
            "uid": who.uid,
        },
    })


@view(url="/fire")
def fire(who, group, **kw):
    group.send({
        "fn": "fire",
        "data": {
            "uid": who.uid,
        }
    })
