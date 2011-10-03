from biribiri.chain.utils import view, upd_ctx
from biribiri.chain import Derail

from simplejson import dumps, dump, load
from info import TILES
from random import sample

from vp import Vp
COLS, ROWS = Vp.COLS, Vp.ROWS

MAP = {
}

def err(msg):
    def send_err(who, **kw):
        who.send({"fn": "err", "data": msg})

    raise Derail(send_err)

@view(url='/move')
def move(**kw):
    return [
            group_send,
            notify_move,
            do_move,
            point_check,
            point_get,   # ^
            _vp_get,     # ^
            coord_get,   # !
    ]



@upd_ctx("col", "row")
def coord_get(who, ox, oy, **kw):
    return who.x + ox, who.y + oy, None


def _vp_get(col, row, **kw):
    vp_y = row / ROWS * ROWS
    vp_x = col / COLS * COLS

    return vp_get(col=vp_x, row=vp_y, **kw)


def point_check(point, point_state, who, **kw):
    if isinstance(point, tuple):
        point_typ = point[0]
    else:
        point_typ = point

    if 'void' in point_typ:
        return err("nothing here")

    
    if 'used' in point_state:
        return err("point used")


@upd_ctx("point", 'point_state')
def point_get(vp, col, row, **kw):
    point = vp[(col,row)]
    state = vp.state.get((col,row)) or {}
    vp.state[(col,row)] = state

    return point, state, None


def do_move(who, col, row, point_state, **kw):
    who.point.pop("used", None)

    who.x, who.y = col, row
    who.point = point_state

    point_state['used'] = who


@upd_ctx("send_out")
def notify_move(who, **kw):
    return {
        "fn": "move",
        "data": {
            "x": who.x,
            "y": who.y,
            "uid": who.uid,
        }
    }, None


def group_send(send_out, group, **kw):
    group.send(send_out)


@view(url="/map/vp")
@upd_ctx("col", "row")
def vp(col, row, **kw):

    col = int(col[0])
    row = int(row[0])

    return col, row, [
            ret_json,
            notify_vp,
            vp_get,
    ]


@upd_ctx("vp")
def vp_get(col, row, **kw):

    def gen():
        points = [[Vp.genpoint]*(ROWS/2)]*(COLS/2)
        return Vp.from_flat(points, col, row)

    if (col,row) not in MAP:
        vp = Vp.load(col, row)

        if not vp:
            vp = gen()

        MAP[(col,row)] = vp

    vp = MAP.get((col,row,))

    return vp, None


@upd_ctx("send_out")
def notify_vp(col, row, vp, **kw):

    return {
            "col": col,
            "row": row,
            "vp": vp.flat(),
    }, None


@upd_ctx("json")
def ret_json(send_out, **kw):
    return dumps(send_out), None

@view(url="/map/vp.change")
def vp_edit(col, row, vp, **kw):
    vp = Vp.from_flat(vp, col, row)
    vp.save()

    MAP[(col,row)] = vp
