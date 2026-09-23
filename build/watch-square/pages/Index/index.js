let $style$1740532647 = {
  "@info": {
    "styleObjectId": 1740532647
  }
};
const $app_style$1740532647 = $style$1740532647;
const storage = $app_require$("@app-module/system.storage");
const VS = {
  2: ["#0e2436", "#2f86c9", "#bfe3ff"],
  4: ["#0f3050", "#35a6e8", "#d8f1ff"],
  8: ["#0c2e28", "#2ec4a0", "#b8ffe9"],
  16: ["#0f3a20", "#3ddc68", "#c9ffdb"],
  32: ["#3a2c0c", "#e8b83a", "#ffe9ad"],
  64: ["#3a1e0c", "#f08c2e", "#ffd6ad"],
  128: ["#3a1414", "#ef5350", "#ffcccc"],
  256: ["#330f2c", "#d943b8", "#ffc4ee"],
  512: ["#221040", "#9c5cff", "#e2ccff"],
  1024: ["#0e1740", "#4a7dff", "#ccdcff"],
  2048: ["#050914", "#ffffff", "#ffffff"],
  4096: ["#101318", "#7fd8ff", "#7fd8ff"],
  8192: ["#101318", "#7fd8ff", "#7fd8ff"]
};
function vs(v) {
  return VS[v] || ["#101318", "#7fd8ff", "#7fd8ff"];
}
const CW = 340;
const PAD = 6, GAP = 6, CELL = 77;
const $app_script$1740532647 = {
  data: function dataFun() {
    return {
      g: [],
      score: 0,
      best: 0,
      board: [],
      over: false,
      showBoard: false,
      newRecord: false,
      sx: 0,
      sy: 0,
      swiped: false,
      dir: ""
    };
  },
  onInit() {
    this.g = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    this._ctx = null;
    const that = this;
    storage.get({
      key: "g2048_best",
      success: function(r) {
        const v = parseInt(r && r.value !== void 0 ? r.value : r, 10);
        if (v > 0) that.best = v;
      },
      fail: function() {
      }
    });
    storage.get({
      key: "g2048_board",
      success: function(r) {
        try {
          const v = r && r.value !== void 0 ? r.value : r;
          const arr = typeof v === "string" ? JSON.parse(v) : v;
          if (arr && arr.length) that.board = arr;
        } catch (e) {
        }
      },
      fail: function() {
      }
    });
    setTimeout(function() {
      that.restart();
    }, 150);
  },
  onReady() {
    try {
      const el = this.$element("cv");
      this._ctx = el ? el.getContext("2d") : null;
    } catch (e) {
      this._ctx = null;
    }
    this.draw();
  },
  ts(e) {
    try {
      const t = e.changedTouches && e.changedTouches[0] || e.touches && e.touches[0] || e;
      this.sx = t.clientX !== void 0 ? t.clientX : 0;
      this.sy = t.clientY !== void 0 ? t.clientY : 0;
      this.dir = "";
      this.swiped = false;
    } catch (err) {
    }
  },
  tm(e) {
    if (this.dir || this.over || this.showBoard) return;
    try {
      const t = e.changedTouches && e.changedTouches[0] || e.touches && e.touches[0] || e;
      const x = t.clientX !== void 0 ? t.clientX : 0;
      const y = t.clientY !== void 0 ? t.clientY : 0;
      const dx = x - this.sx, dy = y - this.sy;
      const ax = Math.abs(dx), ay = Math.abs(dy);
      if (ax < 24 && ay < 24) return;
      if (ax > ay * 1.3) this.dir = dx > 0 ? "R" : "L";
      else if (ay > ax * 1.3) this.dir = dy > 0 ? "D" : "U";
      else this.dir = ax > ay ? dx > 0 ? "R" : "L" : dy > 0 ? "D" : "U";
    } catch (err) {
    }
  },
  te(e) {
    try {
      if (this.dir && !this.over && !this.showBoard) this.move(this.dir);
      this.dir = "";
    } catch (err) {
    }
  },
  computeMove(dir) {
    const g = this.g;
    const moves = [];
    const final = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    let gained = 0;
    for (let i = 0; i < 4; i++) {
      const line = [];
      for (let j = 0; j < 4; j++) {
        let r = i, c = j;
        if (dir === "R") c = 3 - j;
        else if (dir === "U") {
          r = j;
          c = i;
        } else if (dir === "D") {
          r = 3 - j;
          c = i;
        }
        if (g[r][c]) line.push({
          v: g[r][c],
          r0: r,
          c0: c
        });
      }
      const placed = [];
      let k = 0;
      while (k < line.length) {
        const t = line[k];
        const nx = line[k + 1];
        if (nx && nx.v === t.v) {
          placed.push({
            v: t.v * 2,
            r1: k,
            src: [t, nx],
            merged: true
          });
          gained += t.v * 2;
          k += 2;
        } else {
          placed.push({
            v: t.v,
            r1: k,
            src: [t],
            merged: false
          });
          k++;
        }
      }
      for (let p = 0; p < placed.length; p++) {
        const it = placed[p];
        let r1 = i, c1 = p;
        if (dir === "R") c1 = 3 - p;
        else if (dir === "U") {
          r1 = p;
          c1 = i;
        } else if (dir === "D") {
          r1 = 3 - p;
          c1 = i;
        }
        final[r1][c1] = it.v;
        for (let s = 0; s < it.src.length; s++) {
          moves.push({
            v: it.src[s].v,
            r0: it.src[s].r0,
            c0: it.src[s].c0,
            r1,
            c1,
            m: s === 0 && it.merged
          });
        }
      }
    }
    let changed = false;
    for (let r = 0; r < 4 && !changed; r++) for (let c = 0; c < 4; c++) {
      if (final[r][c] !== g[r][c]) {
        changed = true;
        break;
      }
    }
    return {
      changed,
      gained,
      moves,
      final
    };
  },
  move(dir) {
    if (this.over || this.showBoard) return;
    const r = this.computeMove(dir);
    if (!r.changed) return;
    const g = r.final;
    this.spawn(g);
    this.g = g;
    if (r.gained > 0) {
      this.score += r.gained;
    }
    if (this.score > this.best) {
      this.best = this.score;
      this.newRecord = true;
      try {
        storage.set({
          key: "g2048_best",
          value: String(this.best),
          success: function() {
          },
          fail: function() {
          }
        });
      } catch (e) {
      }
    }
    this.draw();
    if (this.isOver(g)) this.gameOver();
  },
  spawn(g) {
    const empties = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!g[r][c]) empties.push([r, c]);
    if (!empties.length) return;
    const pick = empties[Math.floor(Math.random() * empties.length)];
    g[pick[0]][pick[1]] = Math.random() < 0.9 ? 2 : 4;
  },
  isOver(g) {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      if (!g[r][c]) return false;
      if (c < 3 && g[r][c] === g[r][c + 1]) return false;
      if (r < 3 && g[r][c] === g[r + 1][c]) return false;
    }
    return true;
  },
  gameOver() {
    this.over = true;
    this.recordScore();
  },
  restart() {
    if (this.over) this.recordScore();
    this.score = 0;
    this.over = false;
    this.newRecord = false;
    const g = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    this.spawn(g);
    this.spawn(g);
    this.g = g;
    this.draw();
  },
  cellXY(r, c) {
    return {
      x: PAD + c * (CELL + GAP),
      y: PAD + r * (CELL + GAP)
    };
  },
  rr(x, y, w, h, rad) {
    const c = this._ctx;
    c.beginPath();
    c.moveTo(x + rad, y);
    c.lineTo(x + w - rad, y);
    c.arc(x + w - rad, y + rad, rad, -1.5708, 0);
    c.lineTo(x + w, y + h - rad);
    c.arc(x + w - rad, y + h - rad, rad, 0, 1.5708);
    c.lineTo(x + rad, y + h);
    c.arc(x + rad, y + h - rad, rad, 1.5708, 3.1416);
    c.lineTo(x, y + rad);
    c.arc(x + rad, y + rad, rad, 3.1416, 4.7124);
    c.closePath();
  },
  drawTile(x, y, v, scale) {
    const c = this._ctx;
    const st = vs(v);
    const s = Math.round(CELL * (scale || 1));
    const off = Math.round((CELL - s) / 2);
    const X = x + off, Y = y + off;
    c.fillStyle = st[0];
    this.rr(X + 2, Y + 2, s - 4, s - 4, 10);
    c.fill();
    c.strokeStyle = st[1];
    c.lineWidth = 2;
    this.rr(X + 2, Y + 2, s - 4, s - 4, 10);
    c.stroke();
    const str = String(v);
    const fs = str.length <= 2 ? 28 : str.length === 3 ? 22 : 17;
    c.fillStyle = st[2];
    c.font = "bold " + Math.round(fs * (scale || 1)) + "px sans-serif";
    c.textAlign = "center";
    c.fillText(str, X + s / 2, Y + s / 2 + fs * 0.36);
  },
  draw() {
    const c = this._ctx;
    if (!c) return;
    const g = this.g;
    c.fillStyle = "#081018";
    c.fillRect(0, 0, CW, CW);
    for (let r = 0; r < 4; r++) for (let cc = 0; cc < 4; cc++) {
      const p = this.cellXY(r, cc);
      c.fillStyle = "#0c1524";
      this.rr(p.x, p.y, CELL, CELL, 10);
      c.fill();
      c.strokeStyle = "#14243a";
      c.lineWidth = 1;
      this.rr(p.x, p.y, CELL, CELL, 10);
      c.stroke();
    }
    for (let r = 0; r < 4; r++) for (let cc = 0; cc < 4; cc++) {
      if (g[r][cc]) {
        const p = this.cellXY(r, cc);
        this.drawTile(p.x, p.y, g[r][cc], 1);
      }
    }
  },
  recordScore() {
    const d = /* @__PURE__ */ new Date();
    const rec = {
      s: this.score,
      d: d.getMonth() + 1 + "-" + d.getDate() + " " + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes()
    };
    const arr = (this.board || []).slice();
    arr.push(rec);
    arr.sort(function(a, b) {
      return b.s - a.s;
    });
    this.board = arr.slice(0, 5);
    try {
      storage.set({
        key: "g2048_board",
        value: JSON.stringify(this.board),
        success: function() {
        },
        fail: function() {
        }
      });
    } catch (e) {
    }
  },
  openBoard() {
    if (this.over) this.recordScore();
    this.showBoard = true;
  },
  closeBoard() {
    this.showBoard = false;
  }
};
$app_define$("@app-component/index", [], function($app_require$2, $app_exports$, $app_module$) {
  $app_module$.exports = $app_script$1740532647.default || $app_script$1740532647;
  $app_module$.exports.style = $app_style$1740532647;
});
$app_bootstrap$("@app-component/index");
//# debugId=961cbaa1-a00f-4b42-940f-b1f3a143244e
//# sourceMappingURL=index.js.map
