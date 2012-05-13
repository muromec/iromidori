#!/bin/sh
set -e

NAME="$1"
OUT="$1_sprite.png"

echo $NAME

montage -geometry +0+0 -background transparent -tile 1 \
    "$NAME"_0.png "$NAME"_0_go*.png "$NAME"_0_fire*.png \
    "$NAME"_sheet0.png

convert "$NAME"_sheet0.png -flop "$NAME"_sheet1.png
montage -geometry +0+0 -background transparent -tile 2 "$NAME"_sheet?.png "$OUT"
rm "$NAME"_sheet?.png
