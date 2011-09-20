from biribiri.chain.utils import view

@view(url='/move')
def move(who, ox, oy, group, **kw):
    who.x += ox
    who.y += oy

    group.send({
        "fn": "move",
        "data": {
            "ox": ox,
            "oy": oy,
            "uid": who.uid,
        }
    })

