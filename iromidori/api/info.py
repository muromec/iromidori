from biribiri.chain.utils import view, upd_ctx
from simplejson import dumps

CHARS = [
        "faery",
        "deadly",
        "magma",
        "goldy",
	"dog",
        "suncrawler",
        "bloodeye",
]

@view(url="/info/char.list")
@upd_ctx('json')
def char_list(**kw):
    ret = {
            "chars": CHARS,
    }
    return dumps(ret), None

TILES = [
        ("grass",0),
        ("grass_void",3),
        ("magma",0),
        ("water_e",0),
        ("stone_h",0),
]

@view(url="/info/tile.list")
@upd_ctx('json')
def tile_list(**kw):
    ret = {
            "tiles": TILES,
    }
    return dumps(ret), None
