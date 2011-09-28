from biribiri.chain.utils import view, upd_ctx
from simplejson import dumps

CHARS = [
        "faery",
        "deadly",
        "magma",
        "goldy",
	"dog",
]

@view(url="/info/char.list")
@upd_ctx('json')
def char_list(**kw):
    ret = {
            "chars": CHARS,
    }
    return dumps(ret), None

TILES = [
        "grass",
        "magma",
        "water_e",
        "stone_h",
]

@view(url="/info/tile.list")
@upd_ctx('json')
def tile_list(**kw):
    ret = {
            "tiles": TILES,
    }
    return dumps(ret), None
