import svgwrite
import sys
import argparse


from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM

import xml.etree.ElementTree as ET

class const:
    light = svgwrite.rgb(220, 220, 220)
    dark = svgwrite.rgb(20, 20, 20)
    green = svgwrite.rgb(29, 96, 35)
    size = 8
    mult = 100
    stroke_color = svgwrite.rgb(5, 5, 5)
    stroke = 3
    d1 = "ABCDEFGHZ"
    d2 = "123456780"
    directions = [(-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1)]

def parse_input(s):
    a = [s[i:i + 2] for i in range(0, len(s), 2)]
    a = [(const.d1.index(i[0]), const.d2.index(i[1])) for i in a]
    return a

def circ(j, k, c):
    return dwg.circle(((j + 0.5) * const.mult, (k + 0.5) * const.mult), const.mult * 0.4, fill=c, stroke=const.stroke_color, stroke_width=const.stroke)

def raycast(bo, a, b):
    a1, a2 = a
    c = 3 - bo[a1][a2]
    a1 += b[0]
    a2 += b[1]
    o = []

    while a1 >= 0 and a2 >= 0 and a1 < 8 and a2 < 8:
        p = bo[a1][a2]
        if p == c:
            o.append((a1, a2))
            a1 += b[0]
            a2 += b[1]
        elif p == 0:
            return []
        else:
            return o

    return []


# parse args

args = sys.argv[1:]
parser = argparse.ArgumentParser(description="Parses command.")
parser.add_argument("-i", "--input", default="", help="Your input string.")
parser.add_argument("-o", "--output", default="test.svg", help="Your destination output file.")
# parser.add_argument("-s", "--string", help="Output board id string to specified file.")
# parser.add_argument("-v", "--verbose", dest='verbose', action='store_true', help="Verbose mode.")
parser.add_argument("-p", "--png", dest='png', action='store_true', help="Generate png file as well")
parser.add_argument("-l", "--link", dest='link', action='store_true', help="Create links in the svg")
args = parser.parse_args(args)

# draw board

dwg = svgwrite.Drawing(args.output, size=(const.size * const.mult, const.size * const.mult), profile='full')
for i in range(const.size):
    for j in range(const.size):
        dwg.add(dwg.rect((i*const.mult, j*const.mult), (const.mult, const.mult), fill=const.green, stroke=const.stroke_color, stroke_width=const.stroke))

for i in range(const.size):
    dwg.add(dwg.text(const.d1[i], (i * const.mult + 80, 20)))

for i in range(const.size):
    dwg.add(dwg.text(const.d2[i], (10, i * const.mult + 20)))


b = [[0 for _ in range(const.size)] for _ in range(const.size)]
b[3][3] = 1
b[4][3] = 2
b[3][4] = 2
b[4][4] = 1


input = parse_input(args.input)

# simulate game

for i in range(len(input)):
    j, k = input[i]
    c = 1 if i % 2 == 0 else 2
    if j < 8 and k < 8 and b[j][k] == 0:
        b[j][k] = c
        for ii in const.directions:
            r = raycast(b, (j, k), ii)
            for jj in r:
                b[jj[0]][jj[1]] = c


# draw board to svg

for i in range(const.size):
    for j in range(const.size):
        c = b[i][j]
        if c != 0:
            dwg.add(circ(i, j, const.light if c == 1 else const.dark))

cc = [0 for _ in range(3)]
for i in b:
    for j in i:
        cc[j] += 1
cc = " ".join([str(i) for i in cc])

dwg.add(dwg.text(cc, (30, 20)))

dwg.save()

if args.png:
    drawing = svg2rlg(args.output)
    renderPM.drawToFile(drawing, args.output + ".png", fmt='PNG')

if args.link:
    c = []
    f = []
    for i in range(const.size):
        for j in range(const.size):
            f.append((i, j))
            if b[i][j] != 0:
                c.append((i, j))
    tree = ET.parse(args.output)
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    root = tree.getroot()
    root.set('xmlns:ev', "http://www.w3.org/2001/xml-events")
    root.set('xmlns:xlink', "http://www.w3.org/1999/xlink")
    ii = 0
    for i in range(len(root)):
        if root[i].tag.endswith("rect"):
            if len(c) == 0 or f[ii] != c[0]:
                d = root[i]
                aa = ET.Element("a")
                aa.set("xlink:href", "./" + args.input + str(const.d1[f[ii][0]]) + str(const.d2[f[ii][1]]))
                aa.append(d)
                root[i] = aa
            else:
                c = c[1:]
            ii += 1
    tree.write(args.output)