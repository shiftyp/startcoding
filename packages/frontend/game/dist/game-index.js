"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../types/dist/index.js
  var require_dist = __commonJS({
    "../types/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.INTERNAL = void 0;
      exports.INTERNAL = Symbol("internal");
    }
  });

  // ../../../node_modules/sat/SAT.js
  var require_SAT = __commonJS({
    "../../../node_modules/sat/SAT.js"(exports, module) {
      "use strict";
      (function(root, factory) {
        "use strict";
        if (typeof define === "function" && define["amd"]) {
          define(factory);
        } else if (typeof exports === "object") {
          module["exports"] = factory();
        } else {
          root["SAT"] = factory();
        }
      })(exports, function() {
        "use strict";
        var SAT2 = {};
        function Vector(x, y) {
          this["x"] = x || 0;
          this["y"] = y || 0;
        }
        SAT2["Vector"] = Vector;
        SAT2["V"] = Vector;
        Vector.prototype["copy"] = Vector.prototype.copy = function(other) {
          this["x"] = other["x"];
          this["y"] = other["y"];
          return this;
        };
        Vector.prototype["clone"] = Vector.prototype.clone = function() {
          return new Vector(this["x"], this["y"]);
        };
        Vector.prototype["perp"] = Vector.prototype.perp = function() {
          var x = this["x"];
          this["x"] = this["y"];
          this["y"] = -x;
          return this;
        };
        Vector.prototype["rotate"] = Vector.prototype.rotate = function(angle) {
          var x = this["x"];
          var y = this["y"];
          this["x"] = x * Math.cos(angle) - y * Math.sin(angle);
          this["y"] = x * Math.sin(angle) + y * Math.cos(angle);
          return this;
        };
        Vector.prototype["reverse"] = Vector.prototype.reverse = function() {
          this["x"] = -this["x"];
          this["y"] = -this["y"];
          return this;
        };
        Vector.prototype["normalize"] = Vector.prototype.normalize = function() {
          var d = this.len();
          if (d > 0) {
            this["x"] = this["x"] / d;
            this["y"] = this["y"] / d;
          }
          return this;
        };
        Vector.prototype["add"] = Vector.prototype.add = function(other) {
          this["x"] += other["x"];
          this["y"] += other["y"];
          return this;
        };
        Vector.prototype["sub"] = Vector.prototype.sub = function(other) {
          this["x"] -= other["x"];
          this["y"] -= other["y"];
          return this;
        };
        Vector.prototype["scale"] = Vector.prototype.scale = function(x, y) {
          this["x"] *= x;
          this["y"] *= typeof y != "undefined" ? y : x;
          return this;
        };
        Vector.prototype["project"] = Vector.prototype.project = function(other) {
          var amt = this.dot(other) / other.len2();
          this["x"] = amt * other["x"];
          this["y"] = amt * other["y"];
          return this;
        };
        Vector.prototype["projectN"] = Vector.prototype.projectN = function(other) {
          var amt = this.dot(other);
          this["x"] = amt * other["x"];
          this["y"] = amt * other["y"];
          return this;
        };
        Vector.prototype["reflect"] = Vector.prototype.reflect = function(axis) {
          var x = this["x"];
          var y = this["y"];
          this.project(axis).scale(2);
          this["x"] -= x;
          this["y"] -= y;
          return this;
        };
        Vector.prototype["reflectN"] = Vector.prototype.reflectN = function(axis) {
          var x = this["x"];
          var y = this["y"];
          this.projectN(axis).scale(2);
          this["x"] -= x;
          this["y"] -= y;
          return this;
        };
        Vector.prototype["dot"] = Vector.prototype.dot = function(other) {
          return this["x"] * other["x"] + this["y"] * other["y"];
        };
        Vector.prototype["len2"] = Vector.prototype.len2 = function() {
          return this.dot(this);
        };
        Vector.prototype["len"] = Vector.prototype.len = function() {
          return Math.sqrt(this.len2());
        };
        function Circle(pos, r) {
          this["pos"] = pos || new Vector();
          this["r"] = r || 0;
          this["offset"] = new Vector();
        }
        SAT2["Circle"] = Circle;
        Circle.prototype["getAABBAsBox"] = Circle.prototype.getAABBAsBox = function() {
          var r = this["r"];
          var corner = this["pos"].clone().add(this["offset"]).sub(new Vector(r, r));
          return new Box(corner, r * 2, r * 2);
        };
        Circle.prototype["getAABB"] = Circle.prototype.getAABB = function() {
          return this.getAABBAsBox().toPolygon();
        };
        Circle.prototype["setOffset"] = Circle.prototype.setOffset = function(offset) {
          this["offset"] = offset;
          return this;
        };
        function Polygon(pos, points) {
          this["pos"] = pos || new Vector();
          this["angle"] = 0;
          this["offset"] = new Vector();
          this.setPoints(points || []);
        }
        SAT2["Polygon"] = Polygon;
        Polygon.prototype["setPoints"] = Polygon.prototype.setPoints = function(points) {
          var lengthChanged = !this["points"] || this["points"].length !== points.length;
          if (lengthChanged) {
            var i2;
            var calcPoints = this["calcPoints"] = [];
            var edges = this["edges"] = [];
            var normals = this["normals"] = [];
            for (i2 = 0; i2 < points.length; i2++) {
              var p1 = points[i2];
              var p2 = i2 < points.length - 1 ? points[i2 + 1] : points[0];
              if (p1 !== p2 && p1.x === p2.x && p1.y === p2.y) {
                points.splice(i2, 1);
                i2 -= 1;
                continue;
              }
              calcPoints.push(new Vector());
              edges.push(new Vector());
              normals.push(new Vector());
            }
          }
          this["points"] = points;
          this._recalc();
          return this;
        };
        Polygon.prototype["setAngle"] = Polygon.prototype.setAngle = function(angle) {
          this["angle"] = angle;
          this._recalc();
          return this;
        };
        Polygon.prototype["setOffset"] = Polygon.prototype.setOffset = function(offset) {
          this["offset"] = offset;
          this._recalc();
          return this;
        };
        Polygon.prototype["rotate"] = Polygon.prototype.rotate = function(angle) {
          var points = this["points"];
          var len = points.length;
          for (var i2 = 0; i2 < len; i2++) {
            points[i2].rotate(angle);
          }
          this._recalc();
          return this;
        };
        Polygon.prototype["translate"] = Polygon.prototype.translate = function(x, y) {
          var points = this["points"];
          var len = points.length;
          for (var i2 = 0; i2 < len; i2++) {
            points[i2]["x"] += x;
            points[i2]["y"] += y;
          }
          this._recalc();
          return this;
        };
        Polygon.prototype._recalc = function() {
          var calcPoints = this["calcPoints"];
          var edges = this["edges"];
          var normals = this["normals"];
          var points = this["points"];
          var offset = this["offset"];
          var angle = this["angle"];
          var len = points.length;
          var i2;
          for (i2 = 0; i2 < len; i2++) {
            var calcPoint = calcPoints[i2].copy(points[i2]);
            calcPoint["x"] += offset["x"];
            calcPoint["y"] += offset["y"];
            if (angle !== 0) {
              calcPoint.rotate(angle);
            }
          }
          for (i2 = 0; i2 < len; i2++) {
            var p1 = calcPoints[i2];
            var p2 = i2 < len - 1 ? calcPoints[i2 + 1] : calcPoints[0];
            var e = edges[i2].copy(p2).sub(p1);
            normals[i2].copy(e).perp().normalize();
          }
          return this;
        };
        Polygon.prototype["getAABBAsBox"] = Polygon.prototype.getAABBAsBox = function() {
          var points = this["calcPoints"];
          var len = points.length;
          var xMin = points[0]["x"];
          var yMin = points[0]["y"];
          var xMax = points[0]["x"];
          var yMax = points[0]["y"];
          for (var i2 = 1; i2 < len; i2++) {
            var point = points[i2];
            if (point["x"] < xMin) {
              xMin = point["x"];
            } else if (point["x"] > xMax) {
              xMax = point["x"];
            }
            if (point["y"] < yMin) {
              yMin = point["y"];
            } else if (point["y"] > yMax) {
              yMax = point["y"];
            }
          }
          return new Box(this["pos"].clone().add(new Vector(xMin, yMin)), xMax - xMin, yMax - yMin);
        };
        Polygon.prototype["getAABB"] = Polygon.prototype.getAABB = function() {
          return this.getAABBAsBox().toPolygon();
        };
        Polygon.prototype["getCentroid"] = Polygon.prototype.getCentroid = function() {
          var points = this["calcPoints"];
          var len = points.length;
          var cx = 0;
          var cy = 0;
          var ar = 0;
          for (var i2 = 0; i2 < len; i2++) {
            var p1 = points[i2];
            var p2 = i2 === len - 1 ? points[0] : points[i2 + 1];
            var a = p1["x"] * p2["y"] - p2["x"] * p1["y"];
            cx += (p1["x"] + p2["x"]) * a;
            cy += (p1["y"] + p2["y"]) * a;
            ar += a;
          }
          ar = ar * 3;
          cx = cx / ar;
          cy = cy / ar;
          return new Vector(cx, cy);
        };
        function Box(pos, w, h) {
          this["pos"] = pos || new Vector();
          this["w"] = w || 0;
          this["h"] = h || 0;
        }
        SAT2["Box"] = Box;
        Box.prototype["toPolygon"] = Box.prototype.toPolygon = function() {
          var pos = this["pos"];
          var w = this["w"];
          var h = this["h"];
          return new Polygon(new Vector(pos["x"], pos["y"]), [
            new Vector(),
            new Vector(w, 0),
            new Vector(w, h),
            new Vector(0, h)
          ]);
        };
        function Response() {
          this["a"] = null;
          this["b"] = null;
          this["overlapN"] = new Vector();
          this["overlapV"] = new Vector();
          this.clear();
        }
        SAT2["Response"] = Response;
        Response.prototype["clear"] = Response.prototype.clear = function() {
          this["aInB"] = true;
          this["bInA"] = true;
          this["overlap"] = Number.MAX_VALUE;
          return this;
        };
        var T_VECTORS = [];
        for (var i = 0; i < 10; i++) {
          T_VECTORS.push(new Vector());
        }
        var T_ARRAYS = [];
        for (var i = 0; i < 5; i++) {
          T_ARRAYS.push([]);
        }
        var T_RESPONSE = new Response();
        var TEST_POINT = new Box(new Vector(), 1e-6, 1e-6).toPolygon();
        function flattenPointsOn(points, normal, result) {
          var min = Number.MAX_VALUE;
          var max = -Number.MAX_VALUE;
          var len = points.length;
          for (var i2 = 0; i2 < len; i2++) {
            var dot = points[i2].dot(normal);
            if (dot < min) {
              min = dot;
            }
            if (dot > max) {
              max = dot;
            }
          }
          result[0] = min;
          result[1] = max;
        }
        function isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis, response) {
          var rangeA = T_ARRAYS.pop();
          var rangeB = T_ARRAYS.pop();
          var offsetV = T_VECTORS.pop().copy(bPos).sub(aPos);
          var projectedOffset = offsetV.dot(axis);
          flattenPointsOn(aPoints, axis, rangeA);
          flattenPointsOn(bPoints, axis, rangeB);
          rangeB[0] += projectedOffset;
          rangeB[1] += projectedOffset;
          if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
            T_VECTORS.push(offsetV);
            T_ARRAYS.push(rangeA);
            T_ARRAYS.push(rangeB);
            return true;
          }
          if (response) {
            var overlap = 0;
            if (rangeA[0] < rangeB[0]) {
              response["aInB"] = false;
              if (rangeA[1] < rangeB[1]) {
                overlap = rangeA[1] - rangeB[0];
                response["bInA"] = false;
              } else {
                var option1 = rangeA[1] - rangeB[0];
                var option2 = rangeB[1] - rangeA[0];
                overlap = option1 < option2 ? option1 : -option2;
              }
            } else {
              response["bInA"] = false;
              if (rangeA[1] > rangeB[1]) {
                overlap = rangeA[0] - rangeB[1];
                response["aInB"] = false;
              } else {
                var option1 = rangeA[1] - rangeB[0];
                var option2 = rangeB[1] - rangeA[0];
                overlap = option1 < option2 ? option1 : -option2;
              }
            }
            var absOverlap = Math.abs(overlap);
            if (absOverlap < response["overlap"]) {
              response["overlap"] = absOverlap;
              response["overlapN"].copy(axis);
              if (overlap < 0) {
                response["overlapN"].reverse();
              }
            }
          }
          T_VECTORS.push(offsetV);
          T_ARRAYS.push(rangeA);
          T_ARRAYS.push(rangeB);
          return false;
        }
        SAT2["isSeparatingAxis"] = isSeparatingAxis;
        function voronoiRegion(line, point) {
          var len2 = line.len2();
          var dp = point.dot(line);
          if (dp < 0) {
            return LEFT_VORONOI_REGION;
          } else if (dp > len2) {
            return RIGHT_VORONOI_REGION;
          } else {
            return MIDDLE_VORONOI_REGION;
          }
        }
        var LEFT_VORONOI_REGION = -1;
        var MIDDLE_VORONOI_REGION = 0;
        var RIGHT_VORONOI_REGION = 1;
        function pointInCircle(p, c) {
          var differenceV = T_VECTORS.pop().copy(p).sub(c["pos"]).sub(c["offset"]);
          var radiusSq = c["r"] * c["r"];
          var distanceSq = differenceV.len2();
          T_VECTORS.push(differenceV);
          return distanceSq <= radiusSq;
        }
        SAT2["pointInCircle"] = pointInCircle;
        function pointInPolygon(p, poly) {
          TEST_POINT["pos"].copy(p);
          T_RESPONSE.clear();
          var result = testPolygonPolygon(TEST_POINT, poly, T_RESPONSE);
          if (result) {
            result = T_RESPONSE["aInB"];
          }
          return result;
        }
        SAT2["pointInPolygon"] = pointInPolygon;
        function testCircleCircle(a, b, response) {
          var differenceV = T_VECTORS.pop().copy(b["pos"]).add(b["offset"]).sub(a["pos"]).sub(a["offset"]);
          var totalRadius = a["r"] + b["r"];
          var totalRadiusSq = totalRadius * totalRadius;
          var distanceSq = differenceV.len2();
          if (distanceSq > totalRadiusSq) {
            T_VECTORS.push(differenceV);
            return false;
          }
          if (response) {
            var dist = Math.sqrt(distanceSq);
            response["a"] = a;
            response["b"] = b;
            response["overlap"] = totalRadius - dist;
            response["overlapN"].copy(differenceV.normalize());
            response["overlapV"].copy(differenceV).scale(response["overlap"]);
            response["aInB"] = a["r"] <= b["r"] && dist <= b["r"] - a["r"];
            response["bInA"] = b["r"] <= a["r"] && dist <= a["r"] - b["r"];
          }
          T_VECTORS.push(differenceV);
          return true;
        }
        SAT2["testCircleCircle"] = testCircleCircle;
        function testPolygonCircle(polygon, circle, response) {
          var circlePos = T_VECTORS.pop().copy(circle["pos"]).add(circle["offset"]).sub(polygon["pos"]);
          var radius = circle["r"];
          var radius2 = radius * radius;
          var points = polygon["calcPoints"];
          var len = points.length;
          var edge = T_VECTORS.pop();
          var point = T_VECTORS.pop();
          for (var i2 = 0; i2 < len; i2++) {
            var next = i2 === len - 1 ? 0 : i2 + 1;
            var prev = i2 === 0 ? len - 1 : i2 - 1;
            var overlap = 0;
            var overlapN = null;
            edge.copy(polygon["edges"][i2]);
            point.copy(circlePos).sub(points[i2]);
            if (response && point.len2() > radius2) {
              response["aInB"] = false;
            }
            var region = voronoiRegion(edge, point);
            if (region === LEFT_VORONOI_REGION) {
              edge.copy(polygon["edges"][prev]);
              var point2 = T_VECTORS.pop().copy(circlePos).sub(points[prev]);
              region = voronoiRegion(edge, point2);
              if (region === RIGHT_VORONOI_REGION) {
                var dist = point.len();
                if (dist > radius) {
                  T_VECTORS.push(circlePos);
                  T_VECTORS.push(edge);
                  T_VECTORS.push(point);
                  T_VECTORS.push(point2);
                  return false;
                } else if (response) {
                  response["bInA"] = false;
                  overlapN = point.normalize();
                  overlap = radius - dist;
                }
              }
              T_VECTORS.push(point2);
            } else if (region === RIGHT_VORONOI_REGION) {
              edge.copy(polygon["edges"][next]);
              point.copy(circlePos).sub(points[next]);
              region = voronoiRegion(edge, point);
              if (region === LEFT_VORONOI_REGION) {
                var dist = point.len();
                if (dist > radius) {
                  T_VECTORS.push(circlePos);
                  T_VECTORS.push(edge);
                  T_VECTORS.push(point);
                  return false;
                } else if (response) {
                  response["bInA"] = false;
                  overlapN = point.normalize();
                  overlap = radius - dist;
                }
              }
            } else {
              var normal = edge.perp().normalize();
              var dist = point.dot(normal);
              var distAbs = Math.abs(dist);
              if (dist > 0 && distAbs > radius) {
                T_VECTORS.push(circlePos);
                T_VECTORS.push(normal);
                T_VECTORS.push(point);
                return false;
              } else if (response) {
                overlapN = normal;
                overlap = radius - dist;
                if (dist >= 0 || overlap < 2 * radius) {
                  response["bInA"] = false;
                }
              }
            }
            if (overlapN && response && Math.abs(overlap) < Math.abs(response["overlap"])) {
              response["overlap"] = overlap;
              response["overlapN"].copy(overlapN);
            }
          }
          if (response) {
            response["a"] = polygon;
            response["b"] = circle;
            response["overlapV"].copy(response["overlapN"]).scale(response["overlap"]);
          }
          T_VECTORS.push(circlePos);
          T_VECTORS.push(edge);
          T_VECTORS.push(point);
          return true;
        }
        SAT2["testPolygonCircle"] = testPolygonCircle;
        function testCirclePolygon(circle, polygon, response) {
          var result = testPolygonCircle(polygon, circle, response);
          if (result && response) {
            var a = response["a"];
            var aInB = response["aInB"];
            response["overlapN"].reverse();
            response["overlapV"].reverse();
            response["a"] = response["b"];
            response["b"] = a;
            response["aInB"] = response["bInA"];
            response["bInA"] = aInB;
          }
          return result;
        }
        SAT2["testCirclePolygon"] = testCirclePolygon;
        function testPolygonPolygon(a, b, response) {
          var aPoints = a["calcPoints"];
          var aLen = aPoints.length;
          var bPoints = b["calcPoints"];
          var bLen = bPoints.length;
          for (var i2 = 0; i2 < aLen; i2++) {
            if (isSeparatingAxis(a["pos"], b["pos"], aPoints, bPoints, a["normals"][i2], response)) {
              return false;
            }
          }
          for (var i2 = 0; i2 < bLen; i2++) {
            if (isSeparatingAxis(a["pos"], b["pos"], aPoints, bPoints, b["normals"][i2], response)) {
              return false;
            }
          }
          if (response) {
            response["a"] = a;
            response["b"] = b;
            response["overlapV"].copy(response["overlapN"]).scale(response["overlap"]);
          }
          return true;
        }
        SAT2["testPolygonPolygon"] = testPolygonPolygon;
        return SAT2;
      });
    }
  });

  // ../../../node_modules/rbush/rbush.min.js
  var require_rbush_min = __commonJS({
    "../../../node_modules/rbush/rbush.min.js"(exports, module) {
      "use strict";
      !function(t, i) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = i() : "function" == typeof define && define.amd ? define(i) : (t = t || self).RBush = i();
      }(exports, function() {
        "use strict";
        function t(t2, r2, e2, a2, h2) {
          !function t3(n2, r3, e3, a3, h3) {
            for (; a3 > e3; ) {
              if (a3 - e3 > 600) {
                var o2 = a3 - e3 + 1, s2 = r3 - e3 + 1, l2 = Math.log(o2), f2 = 0.5 * Math.exp(2 * l2 / 3), u2 = 0.5 * Math.sqrt(l2 * f2 * (o2 - f2) / o2) * (s2 - o2 / 2 < 0 ? -1 : 1), m2 = Math.max(e3, Math.floor(r3 - s2 * f2 / o2 + u2)), c2 = Math.min(a3, Math.floor(r3 + (o2 - s2) * f2 / o2 + u2));
                t3(n2, r3, m2, c2, h3);
              }
              var p2 = n2[r3], d2 = e3, x = a3;
              for (i(n2, e3, r3), h3(n2[a3], p2) > 0 && i(n2, e3, a3); d2 < x; ) {
                for (i(n2, d2, x), d2++, x--; h3(n2[d2], p2) < 0; )
                  d2++;
                for (; h3(n2[x], p2) > 0; )
                  x--;
              }
              0 === h3(n2[e3], p2) ? i(n2, e3, x) : i(n2, ++x, a3), x <= r3 && (e3 = x + 1), r3 <= x && (a3 = x - 1);
            }
          }(t2, r2, e2 || 0, a2 || t2.length - 1, h2 || n);
        }
        function i(t2, i2, n2) {
          var r2 = t2[i2];
          t2[i2] = t2[n2], t2[n2] = r2;
        }
        function n(t2, i2) {
          return t2 < i2 ? -1 : t2 > i2 ? 1 : 0;
        }
        var r = function(t2) {
          void 0 === t2 && (t2 = 9), this._maxEntries = Math.max(4, t2), this._minEntries = Math.max(2, Math.ceil(0.4 * this._maxEntries)), this.clear();
        };
        function e(t2, i2, n2) {
          if (!n2)
            return i2.indexOf(t2);
          for (var r2 = 0; r2 < i2.length; r2++)
            if (n2(t2, i2[r2]))
              return r2;
          return -1;
        }
        function a(t2, i2) {
          h(t2, 0, t2.children.length, i2, t2);
        }
        function h(t2, i2, n2, r2, e2) {
          e2 || (e2 = p(null)), e2.minX = 1 / 0, e2.minY = 1 / 0, e2.maxX = -1 / 0, e2.maxY = -1 / 0;
          for (var a2 = i2; a2 < n2; a2++) {
            var h2 = t2.children[a2];
            o(e2, t2.leaf ? r2(h2) : h2);
          }
          return e2;
        }
        function o(t2, i2) {
          return t2.minX = Math.min(t2.minX, i2.minX), t2.minY = Math.min(t2.minY, i2.minY), t2.maxX = Math.max(t2.maxX, i2.maxX), t2.maxY = Math.max(t2.maxY, i2.maxY), t2;
        }
        function s(t2, i2) {
          return t2.minX - i2.minX;
        }
        function l(t2, i2) {
          return t2.minY - i2.minY;
        }
        function f(t2) {
          return (t2.maxX - t2.minX) * (t2.maxY - t2.minY);
        }
        function u(t2) {
          return t2.maxX - t2.minX + (t2.maxY - t2.minY);
        }
        function m(t2, i2) {
          return t2.minX <= i2.minX && t2.minY <= i2.minY && i2.maxX <= t2.maxX && i2.maxY <= t2.maxY;
        }
        function c(t2, i2) {
          return i2.minX <= t2.maxX && i2.minY <= t2.maxY && i2.maxX >= t2.minX && i2.maxY >= t2.minY;
        }
        function p(t2) {
          return { children: t2, height: 1, leaf: true, minX: 1 / 0, minY: 1 / 0, maxX: -1 / 0, maxY: -1 / 0 };
        }
        function d(i2, n2, r2, e2, a2) {
          for (var h2 = [n2, r2]; h2.length; )
            if (!((r2 = h2.pop()) - (n2 = h2.pop()) <= e2)) {
              var o2 = n2 + Math.ceil((r2 - n2) / e2 / 2) * e2;
              t(i2, o2, n2, r2, a2), h2.push(n2, o2, o2, r2);
            }
        }
        return r.prototype.all = function() {
          return this._all(this.data, []);
        }, r.prototype.search = function(t2) {
          var i2 = this.data, n2 = [];
          if (!c(t2, i2))
            return n2;
          for (var r2 = this.toBBox, e2 = []; i2; ) {
            for (var a2 = 0; a2 < i2.children.length; a2++) {
              var h2 = i2.children[a2], o2 = i2.leaf ? r2(h2) : h2;
              c(t2, o2) && (i2.leaf ? n2.push(h2) : m(t2, o2) ? this._all(h2, n2) : e2.push(h2));
            }
            i2 = e2.pop();
          }
          return n2;
        }, r.prototype.collides = function(t2) {
          var i2 = this.data;
          if (!c(t2, i2))
            return false;
          for (var n2 = []; i2; ) {
            for (var r2 = 0; r2 < i2.children.length; r2++) {
              var e2 = i2.children[r2], a2 = i2.leaf ? this.toBBox(e2) : e2;
              if (c(t2, a2)) {
                if (i2.leaf || m(t2, a2))
                  return true;
                n2.push(e2);
              }
            }
            i2 = n2.pop();
          }
          return false;
        }, r.prototype.load = function(t2) {
          if (!t2 || !t2.length)
            return this;
          if (t2.length < this._minEntries) {
            for (var i2 = 0; i2 < t2.length; i2++)
              this.insert(t2[i2]);
            return this;
          }
          var n2 = this._build(t2.slice(), 0, t2.length - 1, 0);
          if (this.data.children.length)
            if (this.data.height === n2.height)
              this._splitRoot(this.data, n2);
            else {
              if (this.data.height < n2.height) {
                var r2 = this.data;
                this.data = n2, n2 = r2;
              }
              this._insert(n2, this.data.height - n2.height - 1, true);
            }
          else
            this.data = n2;
          return this;
        }, r.prototype.insert = function(t2) {
          return t2 && this._insert(t2, this.data.height - 1), this;
        }, r.prototype.clear = function() {
          return this.data = p([]), this;
        }, r.prototype.remove = function(t2, i2) {
          if (!t2)
            return this;
          for (var n2, r2, a2, h2 = this.data, o2 = this.toBBox(t2), s2 = [], l2 = []; h2 || s2.length; ) {
            if (h2 || (h2 = s2.pop(), r2 = s2[s2.length - 1], n2 = l2.pop(), a2 = true), h2.leaf) {
              var f2 = e(t2, h2.children, i2);
              if (-1 !== f2)
                return h2.children.splice(f2, 1), s2.push(h2), this._condense(s2), this;
            }
            a2 || h2.leaf || !m(h2, o2) ? r2 ? (n2++, h2 = r2.children[n2], a2 = false) : h2 = null : (s2.push(h2), l2.push(n2), n2 = 0, r2 = h2, h2 = h2.children[0]);
          }
          return this;
        }, r.prototype.toBBox = function(t2) {
          return t2;
        }, r.prototype.compareMinX = function(t2, i2) {
          return t2.minX - i2.minX;
        }, r.prototype.compareMinY = function(t2, i2) {
          return t2.minY - i2.minY;
        }, r.prototype.toJSON = function() {
          return this.data;
        }, r.prototype.fromJSON = function(t2) {
          return this.data = t2, this;
        }, r.prototype._all = function(t2, i2) {
          for (var n2 = []; t2; )
            t2.leaf ? i2.push.apply(i2, t2.children) : n2.push.apply(n2, t2.children), t2 = n2.pop();
          return i2;
        }, r.prototype._build = function(t2, i2, n2, r2) {
          var e2, h2 = n2 - i2 + 1, o2 = this._maxEntries;
          if (h2 <= o2)
            return a(e2 = p(t2.slice(i2, n2 + 1)), this.toBBox), e2;
          r2 || (r2 = Math.ceil(Math.log(h2) / Math.log(o2)), o2 = Math.ceil(h2 / Math.pow(o2, r2 - 1))), (e2 = p([])).leaf = false, e2.height = r2;
          var s2 = Math.ceil(h2 / o2), l2 = s2 * Math.ceil(Math.sqrt(o2));
          d(t2, i2, n2, l2, this.compareMinX);
          for (var f2 = i2; f2 <= n2; f2 += l2) {
            var u2 = Math.min(f2 + l2 - 1, n2);
            d(t2, f2, u2, s2, this.compareMinY);
            for (var m2 = f2; m2 <= u2; m2 += s2) {
              var c2 = Math.min(m2 + s2 - 1, u2);
              e2.children.push(this._build(t2, m2, c2, r2 - 1));
            }
          }
          return a(e2, this.toBBox), e2;
        }, r.prototype._chooseSubtree = function(t2, i2, n2, r2) {
          for (; r2.push(i2), !i2.leaf && r2.length - 1 !== n2; ) {
            for (var e2 = 1 / 0, a2 = 1 / 0, h2 = void 0, o2 = 0; o2 < i2.children.length; o2++) {
              var s2 = i2.children[o2], l2 = f(s2), u2 = (m2 = t2, c2 = s2, (Math.max(c2.maxX, m2.maxX) - Math.min(c2.minX, m2.minX)) * (Math.max(c2.maxY, m2.maxY) - Math.min(c2.minY, m2.minY)) - l2);
              u2 < a2 ? (a2 = u2, e2 = l2 < e2 ? l2 : e2, h2 = s2) : u2 === a2 && l2 < e2 && (e2 = l2, h2 = s2);
            }
            i2 = h2 || i2.children[0];
          }
          var m2, c2;
          return i2;
        }, r.prototype._insert = function(t2, i2, n2) {
          var r2 = n2 ? t2 : this.toBBox(t2), e2 = [], a2 = this._chooseSubtree(r2, this.data, i2, e2);
          for (a2.children.push(t2), o(a2, r2); i2 >= 0 && e2[i2].children.length > this._maxEntries; )
            this._split(e2, i2), i2--;
          this._adjustParentBBoxes(r2, e2, i2);
        }, r.prototype._split = function(t2, i2) {
          var n2 = t2[i2], r2 = n2.children.length, e2 = this._minEntries;
          this._chooseSplitAxis(n2, e2, r2);
          var h2 = this._chooseSplitIndex(n2, e2, r2), o2 = p(n2.children.splice(h2, n2.children.length - h2));
          o2.height = n2.height, o2.leaf = n2.leaf, a(n2, this.toBBox), a(o2, this.toBBox), i2 ? t2[i2 - 1].children.push(o2) : this._splitRoot(n2, o2);
        }, r.prototype._splitRoot = function(t2, i2) {
          this.data = p([t2, i2]), this.data.height = t2.height + 1, this.data.leaf = false, a(this.data, this.toBBox);
        }, r.prototype._chooseSplitIndex = function(t2, i2, n2) {
          for (var r2, e2, a2, o2, s2, l2, u2, m2 = 1 / 0, c2 = 1 / 0, p2 = i2; p2 <= n2 - i2; p2++) {
            var d2 = h(t2, 0, p2, this.toBBox), x = h(t2, p2, n2, this.toBBox), v = (e2 = d2, a2 = x, o2 = void 0, s2 = void 0, l2 = void 0, u2 = void 0, o2 = Math.max(e2.minX, a2.minX), s2 = Math.max(e2.minY, a2.minY), l2 = Math.min(e2.maxX, a2.maxX), u2 = Math.min(e2.maxY, a2.maxY), Math.max(0, l2 - o2) * Math.max(0, u2 - s2)), M = f(d2) + f(x);
            v < m2 ? (m2 = v, r2 = p2, c2 = M < c2 ? M : c2) : v === m2 && M < c2 && (c2 = M, r2 = p2);
          }
          return r2 || n2 - i2;
        }, r.prototype._chooseSplitAxis = function(t2, i2, n2) {
          var r2 = t2.leaf ? this.compareMinX : s, e2 = t2.leaf ? this.compareMinY : l;
          this._allDistMargin(t2, i2, n2, r2) < this._allDistMargin(t2, i2, n2, e2) && t2.children.sort(r2);
        }, r.prototype._allDistMargin = function(t2, i2, n2, r2) {
          t2.children.sort(r2);
          for (var e2 = this.toBBox, a2 = h(t2, 0, i2, e2), s2 = h(t2, n2 - i2, n2, e2), l2 = u(a2) + u(s2), f2 = i2; f2 < n2 - i2; f2++) {
            var m2 = t2.children[f2];
            o(a2, t2.leaf ? e2(m2) : m2), l2 += u(a2);
          }
          for (var c2 = n2 - i2 - 1; c2 >= i2; c2--) {
            var p2 = t2.children[c2];
            o(s2, t2.leaf ? e2(p2) : p2), l2 += u(s2);
          }
          return l2;
        }, r.prototype._adjustParentBBoxes = function(t2, i2, n2) {
          for (var r2 = n2; r2 >= 0; r2--)
            o(i2[r2], t2);
        }, r.prototype._condense = function(t2) {
          for (var i2 = t2.length - 1, n2 = void 0; i2 >= 0; i2--)
            0 === t2[i2].children.length ? i2 > 0 ? (n2 = t2[i2 - 1].children).splice(n2.indexOf(t2[i2]), 1) : this.clear() : a(t2[i2], this.toBBox);
        }, r;
      });
    }
  });

  // src/game-index.ts
  var import_types = __toESM(require_dist(), 1);
  var import_sat = __toESM(require_SAT(), 1);
  var import_rbush = __toESM(require_rbush_min(), 1);
  (() => {
    let spriteTree = new import_rbush.default();
    const backdropDescriptor = {
      kind: "backdrop",
      url: "",
      style: "cover"
    };
    const update = async (tick) => {
      const serialized = Array.from(layers.entries()).sort(([aIndex], [bIndex]) => aIndex - bIndex).map(([index, layer]) => [index, Array.from(layer)]);
      const buffer = new TextEncoder().encode(JSON.stringify(serialized)).buffer;
      postMessage(["update", buffer, tick], { transfer: [buffer] });
    };
    const updateBackdrop = () => {
      postMessage(["updateBackdrop", backdropDescriptor]);
    };
    onmessage = async (message) => {
      const [action] = message.data;
      if (action === "trigger") {
        const [_, descriptor] = message.data;
        trigger(descriptor);
      } else if (action === "callTick") {
        const [_, tick] = message.data;
        callTick(tick);
      }
    };
    Array.prototype.remove = function(item) {
      this.splice(this.indexOf(item), 1);
    };
    const registeredElements = {};
    const layers = /* @__PURE__ */ new Map([
      [0, /* @__PURE__ */ new Set()]
    ]);
    const registeredDescriptors = {};
    const registeredNodes = /* @__PURE__ */ new Set();
    const tickCallbacks = [];
    const globalListeners = {};
    const elementListeners = [];
    let id = 0;
    const register = (descriptor) => {
      const localId = id++;
      registeredDescriptors[localId] = descriptor;
      return {
        dispose: () => {
          delete registeredDescriptors[localId];
        },
        id: localId
      };
    };
    const removeFromLayer = (descriptor) => {
      layers.get(descriptor.layer)?.delete(descriptor);
      if (layers.get(descriptor.layer)?.size === 0) {
        layers.delete(descriptor.layer);
      }
    };
    const addToLayer = (descriptor) => {
      if (!layers.has(descriptor.layer)) {
        layers.set(descriptor.layer, /* @__PURE__ */ new Set([descriptor]));
      } else {
        layers.get(descriptor.layer).add(descriptor);
      }
    };
    const listenGlobal = (descriptor, callback) => {
      globalListeners[descriptor.kind] = globalListeners[descriptor.kind] || [];
      globalListeners[descriptor.kind].push(callback);
    };
    const listenElement = (descriptor, callback) => {
      elementListeners[descriptor.id] = elementListeners[descriptor.id] || {};
      elementListeners[descriptor.id][descriptor.kind] = elementListeners[descriptor.id][descriptor.kind] || [];
      elementListeners[descriptor.id][descriptor.kind].push(callback);
    };
    let lastHoverIds = /* @__PURE__ */ new Set();
    let currentHoverIds = /* @__PURE__ */ new Set();
    const trigger = (descriptor) => {
      if (descriptor.kind === "mousedown" || descriptor.kind === "mouseup" || descriptor.kind === "mousemove") {
        currentHoverIds.forEach((id2) => {
          const listeners = elementListeners[id2]?.[descriptor.kind];
          if (listeners) {
            listeners.forEach((callback) => {
              callback && callback();
            });
          }
        });
      }
    };
    const addTick = (callback) => {
      tickCallbacks.push(callback);
    };
    let frameNumber = 0;
    const callTick = (tick) => {
      frameNumber++;
      for (const key in tick.globals) {
        globalThis[key] = tick.globals[key];
      }
      tickCallbacks.forEach((callback) => {
        callback(tick);
      });
      update(tick);
    };
    addTick((tick) => {
      const searchPadding = 25;
      const nodes = spriteTree.search({
        minX: mouseX + searchPadding,
        maxX: mouseX + searchPadding,
        minY: mouseY + searchPadding,
        maxY: mouseY + searchPadding
      });
      const collisionPoint = new import_sat.default.Vector(mouseX, mouseY);
      lastHoverIds = currentHoverIds;
      currentHoverIds = new Set(
        nodes.sort((a, b) => {
          return b.id - a.id;
        }).filter((node) => {
          if (node.collider instanceof import_sat.default.Polygon) {
            return import_sat.default.pointInPolygon(collisionPoint, node.collider);
          }
        }).map((node) => node.id)
      );
      const outElementIds = (
        // @ts-ignore
        lastHoverIds.difference(currentHoverIds)
      );
      const overElementIds = (
        // @ts-ignore
        currentHoverIds.difference(lastHoverIds)
      );
      outElementIds.forEach((id2) => {
        const listeners = elementListeners[id2]?.["mouseout"];
        if (listeners) {
          listeners.forEach((callback) => {
            callback && callback();
          });
        }
      });
      overElementIds.forEach((id2) => {
        const listeners = elementListeners[id2]?.["mouseover"];
        if (listeners) {
          listeners.forEach((callback) => {
            callback && callback();
          });
        }
      });
      tick.events.forEach(trigger);
    });
    setInterval(() => {
      const nodes = Array.from(registeredNodes.values());
      spriteTree = new import_rbush.default(50);
      spriteTree.load(nodes);
    }, 10);
    globalThis.randomX = () => {
      return Math.random() * width + minX;
    };
    globalThis.randomY = () => {
      return Math.random() * height + minY;
    };
    globalThis.setBackdropURL = (url) => {
      backdropDescriptor.url = url;
      updateBackdrop();
    };
    globalThis.every = (duration, unit, callback) => {
      let last = 0;
      addTick(({ timing: { deltaTime } }) => {
        last += deltaTime;
        let scale = 1;
        switch (unit) {
          case "seconds":
            scale = 1e3;
            break;
          case "milliseconds":
            scale = 1;
            break;
        }
        if (last / scale >= duration) {
          callback();
          last = 0;
        }
      });
    };
    const InteractiveElement2 = (kind, props, config) => {
      const defaults = {
        x: 0,
        y: 0,
        angle: 0,
        layer: 0,
        hidden: false,
        opacity: 1
      };
      const descriptor = {
        kind,
        ...defaults,
        ...props
      };
      const { dispose, id: id2 } = register(descriptor);
      const internal = {
        node: {
          ...config.makeNode(descriptor),
          id: id2
        },
        descriptor
      };
      const proxy = new Proxy(
        {
          [import_types.INTERNAL]: internal,
          delete: () => {
            delete registeredElements[id2];
            registeredNodes.delete(proxy[import_types.INTERNAL].node);
            removeFromLayer(proxy[import_types.INTERNAL].descriptor);
            delete elementListeners[id2];
            dispose();
          },
          hide: () => {
            proxy.hidden = true;
          },
          show: () => {
            proxy.hidden = false;
          },
          onMouseDown: (callback) => {
            listenElement(
              {
                kind: "mousedown",
                context: "local",
                id: id2
              },
              () => {
                config.events?.onMouseDown();
                callback();
              }
            );
          },
          onMouseUp: (callback) => {
            listenElement(
              {
                kind: "mouseup",
                context: "local",
                id: id2
              },
              () => {
                config.events?.onMouseUp();
                callback();
              }
            );
          },
          onMouseOver: (callback) => {
            listenElement(
              {
                kind: "mouseover",
                context: "local",
                id: id2
              },
              () => {
                config.events?.onMouseUp();
                callback();
              }
            );
          },
          onMouseOut: (callback) => {
            listenElement(
              {
                kind: "mouseout",
                context: "local",
                id: id2
              },
              () => {
                config.events?.onMouseUp();
                callback();
              }
            );
          },
          onMouseMove: (callback) => {
            listenElement(
              {
                kind: "mousemove",
                context: "local",
                id: id2
              },
              () => {
                config.events?.onMouseUp();
                callback();
              }
            );
          },
          touching: (element) => {
            const otherCollider = element[import_types.INTERNAL].node.collider;
            const selfCollider = proxy[import_types.INTERNAL].node.collider;
            if (otherCollider instanceof import_sat.default.Polygon) {
              if (selfCollider instanceof import_sat.default.Polygon) {
                return import_sat.default.testPolygonPolygon(otherCollider, selfCollider);
              } else {
                return import_sat.default.testCirclePolygon(selfCollider, otherCollider);
              }
            } else {
              if (selfCollider instanceof import_sat.default.Polygon) {
                return import_sat.default.testCirclePolygon(otherCollider, selfCollider);
              } else {
                return import_sat.default.testCircleCircle(otherCollider, selfCollider);
              }
            }
          },
          touchingElements: () => {
            const nodes = spriteTree.search(proxy[import_types.INTERNAL].node);
            return nodes.map(({ id: id3 }) => registeredElements[id3]).filter((element) => element).filter((element) => element.touching(proxy));
          },
          distanceTo: (other) => {
            return Math.sqrt(
              (other.x - proxy.x) * (other.x - proxy.x) + (other.y - proxy.y) * (other.y - proxy.y)
            );
          },
          collideWith: (obj2) => {
          },
          get mousedown() {
            return currentHoverIds.has(id2);
          },
          move: (steps) => {
            const rads = (proxy.angle || 0) / 360 * 2 * Math.PI;
            const ratio = steps / Math.sin(Math.PI / 2);
            const xDelta = ratio * Math.sin(Math.PI / 2 - rads);
            const yDelta = ratio * Math.sin(rads);
            proxy.x += xDelta;
            proxy.y += yDelta;
          }
        },
        {
          get: (target, key) => {
            if (key !== "kind" && target[import_types.INTERNAL].descriptor.hasOwnProperty(key)) {
              return target[import_types.INTERNAL].descriptor[key];
            } else {
              return target[key];
            }
          },
          set: (target, key, value) => {
            if (key === "layer") {
              removeFromLayer(target[import_types.INTERNAL].descriptor);
              target[import_types.INTERNAL].descriptor.layer = value;
              addToLayer(target[import_types.INTERNAL].descriptor);
            } else if (key === "opacity") {
              target[import_types.INTERNAL].descriptor.opacity = Math.max(0, Math.min(1, value));
            } else if (target[import_types.INTERNAL].descriptor.hasOwnProperty(key)) {
              target[import_types.INTERNAL].descriptor[key] = value;
              if (typeof key === "string" && [
                "x",
                "y",
                "width",
                "height",
                "angle",
                "radius",
                "size",
                "x1",
                "y1"
              ].indexOf(key) !== -1) {
                registeredNodes.delete(target[import_types.INTERNAL].node);
                const node = config.makeNode(
                  target[import_types.INTERNAL].descriptor
                );
                node.id = id2;
                target[import_types.INTERNAL].node = node;
                registeredNodes.add(node);
              }
            } else {
              target[key] = value;
            }
            return true;
          }
        }
      );
      for (const key of Object.keys(descriptor)) {
        if (key !== "kind")
          proxy[key] = descriptor[key];
      }
      registeredElements[id2] = proxy;
      return proxy;
    };
    globalThis.Image = function(props) {
      const defaults = {
        width: 0,
        height: 0,
        url: ""
      };
      const makeNode = (descriptor) => {
        let node = {};
        const radians = descriptor.angle / 360 * 2 * Math.PI;
        let constrainedAngle = Math.abs(radians % Math.PI);
        let nodeWidth;
        let nodeHeight;
        if (Math.abs(constrainedAngle) < Math.PI / 2) {
          nodeWidth = width * Math.cos(constrainedAngle) + height * Math.sin(constrainedAngle);
          nodeHeight = width * Math.sin(constrainedAngle) + height * Math.cos(constrainedAngle);
        } else {
          const adjustedAngle = constrainedAngle - Math.PI / 2;
          nodeWidth = height * Math.cos(adjustedAngle) + width * Math.sin(adjustedAngle);
          nodeHeight = height * Math.sin(adjustedAngle) + width * Math.cos(adjustedAngle);
        }
        node.minX = descriptor.x - nodeWidth / 2;
        node.maxX = descriptor.x + nodeHeight / 2;
        node.minY = descriptor.y - nodeWidth / 2;
        node.maxY = descriptor.y + nodeHeight / 2;
        node.collider = new import_sat.default.Polygon(
          new import_sat.default.Vector(descriptor.x, descriptor.y),
          [
            new import_sat.default.Vector(-descriptor.width / 2, -descriptor.height / 2),
            new import_sat.default.Vector(descriptor.width, 0),
            new import_sat.default.Vector(0, descriptor.height),
            new import_sat.default.Vector(-descriptor.width, 0)
          ]
        );
        node.collider.rotate(radians);
        return node;
      };
      return InteractiveElement2(
        "image",
        {
          ...defaults,
          ...props
        },
        {
          makeNode
        }
      );
    };
    globalThis.Circle = function(props) {
      const defaults = {
        radius: 0,
        color: "rgb(0,0,0)"
      };
      const makeNode = (descriptor) => {
        const { radius, x, y } = descriptor;
        let node = {};
        node.minX = descriptor.x - radius;
        node.maxX = descriptor.x + radius;
        node.minY = descriptor.y - radius;
        node.maxY = descriptor.y + radius;
        node.collider = new import_sat.default.Circle(new import_sat.default.Vector(x, y), radius);
        return node;
      };
      return InteractiveElement2(
        "circle",
        {
          ...defaults,
          ...props
        },
        {
          makeNode
        }
      );
    };
    globalThis.Line = function(props) {
      const defaults = {
        x1: 0,
        y1: 0,
        color: "rgb(0,0,0)",
        width: 1
      };
      const makeNode = (descriptor) => {
        const { width: width2, x, y, x1, y1 } = descriptor;
        let node = {};
        node.minX = Math.min(x, x1);
        node.maxX = Math.max(x, x1);
        node.minY = Math.min(y, y1);
        node.maxY = Math.max(y, y1);
        node.collider = new import_sat.default.Polygon(new import_sat.default.Vector(x, y), [
          new import_sat.default.Vector(width2 / 2, y),
          new import_sat.default.Vector(x1 - x + width2 / 2, y1),
          new import_sat.default.Vector(x1 - x - width2 / 2, y1),
          new import_sat.default.Vector(-width2 / 2, y)
        ]);
        return node;
      };
      return InteractiveElement2(
        "line",
        {
          ...defaults,
          ...props
        },
        {
          makeNode
        }
      );
    };
    setTimeout(() => execute());
  })();
})();
/*! Bundled license information:

sat/SAT.js:
  (** @preserve SAT.js - Version 0.9.0 - Copyright 2012 - 2021 - Jim Riecken <jimr@jimr.ca> - released under the MIT License. https://github.com/jriecken/sat-js *)
*/
