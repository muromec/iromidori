from PIL import Image
from Polygon import Polygon
import sys


HEX_HEIGH = 24

f1,f2 = 19, 25

fname = sys.argv[1]

img = Image.open(fname)
img.putalpha(0xFFFFFF)

poly = Polygon()
poly.addContour([
    (0,HEX_HEIGH),

        (f1,HEX_HEIGH*2),
        (f1+f2,HEX_HEIGH*2),

    (f1+f1+f2,HEX_HEIGH),

        (f1+f2,0),
        (f1,0)
])


w,h = img.size

for x in range(w):
    for y in range(h):
        if poly.isInside(x,y):
            continue
        
        img.putpixel((x, y), 0)


name, ext = fname.rsplit('.', 1)

img.save("%s_hex.%s" % (name, ext))

