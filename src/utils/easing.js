import { quadtree } from "d3-quadtree";
import { Sprite } from "pixi.js";

export function solveCollision(circles, opts) {
    opts = opts || {};
    var tree = quadtree()
        .x(function(d) {return d.xp;})
        .y(function(d) {return d.yp;});
    if (opts.extent !== undefined) tree.extent(opts.extent);
    var rMax = 0;
    circles.forEach(function(circle) {
        circle.xp = circle.x0;
        circle.yp = circle.y0;
        if (opts.r0 !== undefined) circle.r0 = opts.r0;
        circle.r = circle.r0;
        circle.xMin = circle.x0 - circle.r0;
        circle.xMax = circle.x0 + circle.r0;
        circle.yMin = circle.y0 - circle.r0;
        circle.yMax = circle.y0 + circle.r0;

        function collide(d) {
            function fixCollision(node) {
                var x = d.xp - node.xp;
                var y = d.yp - node.yp;
                var l = x * x + y * y;
                var r = d.r + node.r;
                if (l < r * r) {
                    var c1, c2, lambda1, lambda2, u1, u2;
                    var delta = Math.sqrt(l);
                    if (d.r < node.r) {
                        c1 = node; c2 = d;
                    } else {
                        c1 = d; c2 = node;
                    }
                    var r1 = c1.r;
                    var r2 = c2.r;
                    var alpha = (r1 + r2 + delta) / 4;
                    if (l > 0) {
                        u1 = (c2.xp - c1.xp) / delta;
                        u2 = (c2.yp - c1.yp) / delta;
                    } else {
                        var theta = 2 * Math.PI * Math.random();
                        u1 = Math.cos(theta);
                        u2 = Math.sin(theta);
                    }

                    if (r2 >= alpha) {
                        lambda1 = alpha / r1;
                        lambda2 = alpha / r2;
                    } else {
                        lambda1 = (r1 - r2 + delta) / (2 * r1);
                        if (lambda1 > 1) console.log(lambda1);
                        lambda2 = 1;
                    }
                    c1.r *= lambda1;
                    c2.r *= lambda2;
                    c1.xp += (lambda1 - 1) * r1 * u1;
                    c1.yp += (lambda1 - 1) * r1 * u2;
                    c2.xp += (1 - lambda2) * r2 * u1;
                    c2.yp += (1 - lambda2) * r2 * u2;
                    c1.xMin = c1.xp - c1.r;
                    c1.xMax = c1.xp + c1.r;
                    c1.yMin = c1.yp - c1.r;
                    c1.yMax = c1.yp + c1.r;
                    c2.xMin = c2.xp - c2.r;
                    c2.xMax = c2.xp + c2.r;
                    c2.yMin = c2.yp - c2.r;
                    c2.yMax = c2.yp + c2.r;
                }
            }
            return function(quad, x1, y1, x2, y2) {
                if (!quad.length) {
                    do {
                        if (quad.data != d && d.xMax > quad.data.xMin && d.xMin < quad.data.xMax && d.yMax > quad.data.yMin && d.yMin < quad.data.yMax) {
                            fixCollision(quad.data);
                        }
                    } while (quad = quad.next)
                }
                return x1 > d.xMax + rMax || x2 + rMax < d.xMin || y1 > d.yMax + rMax || y2 + rMax < d.yMin;
            };
        }
        tree.visit(collide(circle));
        rMax = Math.max(rMax, circle.r);
        tree.add(circle);
    });
    if (opts.zoom !== undefined) {
        circles.forEach(function(circle) {
            circle.cache = circle.cache || {};
            circle.cache[opts.zoom] = {
                x: circle.xp,
                y: circle.yp,
                r: circle.r
            };
        });
    }
    var ret = quadtree()
        .x(function(d) {return d.xp;})
        .y(function(d) {return d.yp;});
    var rMax2 = 0;
    circles.forEach(function(circle) {
        ret.add(circle);
        rMax2 = Math.max(rMax2, circle.r);
    })
    ret.rMax = rMax2;
    return ret;
}
export function drawPoint(graphics, x, y, r,
                   lineWidth, lineColor, fillColor) {
    graphics.clear();
    graphics.lineStyle(lineWidth, lineColor, 1);
    graphics.beginFill(fillColor, 0.5);
    graphics.x = x;
    graphics.y = y;
    graphics.drawCircle(0, 0, r); // radius
    graphics.endFill();
}

export function rescaleMarker(marker, scale, zoom, redraw) {
    const position = marker.cache[zoom];
    if (!redraw) { // 1st draw
        marker.x = position.x;
        marker.y = position.y;
        marker.scale.set((position.r * scale < 8) ? position.r/8 : scale); // 16
    } else {
        marker.currentX = marker.x;
        marker.currentY = marker.y;
        marker.targetX = position.x;
        marker.targetY = position.y;
        marker.currentScale = marker.scale.x;
        marker.targetScale = (position.r * scale < 8) ? position.r/16 : scale; // 16
    }
}

export function findMarker(layerPoint, quad, zoom) {
    const quadTree = quad[zoom];
    const maxR = quadTree.rMax;
    let marker;
    let found = false;
    quadTree.visit((quad, x1, y1, x2, y2) => {
        if (!quad.length) {
            const dx = quad.data.x - layerPoint.x;
            const dy = quad.data.y - layerPoint.y;
            const r = quad.data.scale.x * 8; // 16;
            if (dx * dx + dy * dy <= r * r) {
                marker = quad.data;
                found = true;
            }
        }
        return found ||
            x1 > layerPoint.x + maxR ||
            x2 + maxR < layerPoint.x ||
            y1 > layerPoint.y + maxR ||
            y2 + maxR < layerPoint.y;
    });
    return marker;
}

export function createMarker(x, y, texture, scale) {
    const sprite = new Sprite(texture);
    sprite.textureIndex = 0;
    sprite.x0 = x;
    sprite.y0 = y;
    sprite.anchor.set(.5, .5);
    sprite.scale.set(scale);
    sprite.currentScale = scale;
    return sprite;
}
