from biribiri.chain.utils import view, upd_ctx
from simplejson import dumps, dump, load
import os
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
            "x": who.x,
            "y": who.y,
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
        for _x in range(col, col+COLS, 2):
            _col = []
            for _y in range(row, row+ROWS, 2):
                _col.append(sample(TILES,1)[0])

            tileret.append(_col)

        return tileret

    if (col,row) not in MAP:
        fname = "./data/map/%dx%d.json" % (col, row)
        if os.access(fname, 0):
            MAP[(col,row)] = load(open(fname))
        else:
            MAP[(col,row)] = gen()

    ret = {
            "col": col,
            "row": row,
            "vp": MAP.get((col,row,)),
    }

    return dumps(ret), None

@view(url="/map/vp.change")
def vp_edit(col, row, vp, **kw):
    MAP[(col,row)] = vp 
    f = open("./data/map/%dx%d.json" % (col, row), 'wb')
    dump(vp, f)
    f.flush()
    f.close()

