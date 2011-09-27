from biribiri.chain.utils import view, upd_ctx
from simplejson import dumps
from info import TILES
from random import sample

MAP = {
}

ROWS = 12
COLS = 16

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


@view(url="/map/vp")
@upd_ctx('json')
def vp(col, row, **kw):

    col = int(col[0])
    row = int(row[0])

    def gen():
        tileret = []
        for _x in range(col, col+COLS):
            _col = []
            for _y in range(row, row+ROWS):
                _col.append(sample(TILES,1)[0])

            tileret.append(_col)

        MAP[(col,row)] = tileret
        return tileret

    ret = {
            "col": col,
            "row": row,
            "vp": MAP.get((col,row,)) or gen()
    }

    return dumps(ret), None
