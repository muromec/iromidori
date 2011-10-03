from simplejson import dumps, dump, load
import os

MAP_DATA = os.getenv("MAPDATA") or "./data/"

class Vp(object):
    genpoint = 'grass'

    ROWS = 12
    COLS = 16


    def __init__(self, data, col, row):
        self.points = data
        self.col, self.row = col, row
        self.state = {}

    def __getitem__(self, val):
        return self.points[val]


    def flat(self):
        return [

            [
                self.points[(x,y+1 if x % 4 else y)]
                for y in range(
                    self.row, self.row + self.ROWS, 2
                )
            ]
            for x in range(self.col, self.col + self.COLS, 2)
        ]

    @classmethod
    def load(cls, col, row):
        fname = MAP_DATA+"/map/%dx%d.json" % (col, row)
        if not os.access(fname, 0):
            return

        flatpoints = load(open(fname))

        return cls.from_flat(flatpoints, col, row)

    @classmethod
    def from_flat(cls, flat, col, row):
        points = {}
        for x in range(0, cls.COLS, 2):
            _x = x + col
            for y in range(0, cls.ROWS, 2):
                _y = y + row
                if _x % 4:
                    _y += 1
                    
                points[(_x,_y)] = flat[x >> 1][y >> 1]

        return cls(points, col, row)


    def save(self):
        fname = MAP_DATA+"/map/%dx%d.json" % (self.col, self.row)

        f = open(fname, 'wb')
        dump(self.flat(), f)
        f.flush()
        f.close()


