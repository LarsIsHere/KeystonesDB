const fs = require("fs"),
    {
        Worker: e
    } = require("worker_threads");
class KeystonesDB {
    constructor(e, t) {
        this.filePath = e, this.beautify = t, fs.existsSync(e) || fs.writeFileSync(e, "{}"), this.listeners = {
            beforeSet: [],
            afterSet: [],
            beforeRemove: [],
            afterRemove: []
        }
    }
    on(e, t) {
        this.listeners[e] && this.listeners[e].push(t)
    }
    emit(e, t) {
        this.listeners[e] && this.listeners[e].forEach(e => {
            e(t)
        })
    }
    set(e, t, r = !0) {
        let i = JSON.parse(fs.readFileSync(this.filePath)),
            s = i;
        if (this.emit("beforeSet", {
                pathOrKey: e,
                value: t
            }), "string" == typeof e) s[e] = t;
        else if (Array.isArray(e)) {
            for (let f = 0; f < e.length - 1; f++) {
                if (!s[e[f]]) {
                    if (!r) return;
                    s[e[f]] = {}
                }
                s = s[e[f]]
            }
            s[e[e.length - 1]] = t
        }
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(i, null, 2) : JSON.stringify(i)), this.emit("afterSet", {
            pathOrKey: e,
            value: t
        })
    }
    get(e) {
        let t = JSON.parse(fs.readFileSync(this.filePath));
        if ("string" == typeof e) return t[e];
        if (Array.isArray(e)) {
            for (let r = 0; r < e.length; r++) {
                if (!t[e[r]]) return;
                t = t[e[r]]
            }
            return t
        }
    }
    backup(t, r = !1) {
        if (r) {
            let i = new e(`
              const fs = require('fs');
              const path = require('path');
              const { parentPort, workerData } = require('worker_threads');

              const backupFilePath = workerData.backupFilePath;
              const filePath = workerData.filePath;

              fs.copyFileSync(filePath, backupFilePath);
              parentPort.postMessage('Backup completed');
          `, {
                eval: !0,
                workerData: {
                    backupFilePath: t,
                    filePath: this.filePath
                }
            });
            i.on("message", e => {
                console.log(e)
            }), i.on("error", e => {
                console.error(`Error during backup: ${e.message}`)
            }), i.on("exit", e => {
                0 !== e && console.error(`Worker stopped with exit code ${e}`)
            })
        } else {
            let s = fs.readFileSync(this.filePath);
            fs.writeFileSync(t, s)
        }
    }
    contains(e) {
        let t = JSON.parse(fs.readFileSync(this.filePath));
        if ("string" == typeof e) return t.hasOwnProperty(e);
        if (Array.isArray(e)) {
            for (let r = 0; r < e.length; r++) {
                if (!t[e[r]]) return !1;
                t = t[e[r]]
            }
            return !0
        }
        return !1
    }
    remove(e) {
        let t = JSON.parse(fs.readFileSync(this.filePath)),
            r = t;
        if (this.emit("beforeRemove", {
                pathOrKey: e
            }), "string" == typeof e) delete r[e];
        else if (Array.isArray(e)) {
            for (let i = 0; i < e.length - 1; i++) {
                if (!r[e[i]]) return;
                r = r[e[i]]
            }
            delete r[e[e.length - 1]]
        }
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(t, null, 2) : JSON.stringify(t)), this.emit("afterRemove", {
            pathOrKey: e
        })
    }
    push(e, t, r = !0) {
        let i = JSON.parse(fs.readFileSync(this.filePath)),
            s = i;
        if ("string" == typeof e) {
            if (!s[e]) {
                if (!r) return;
                s[e] = []
            }
            s[e].push(t)
        } else if (Array.isArray(e)) {
            for (let f = 0; f < e.length - 1; f++) {
                if (!s[e[f]]) {
                    if (!r) return;
                    s[e[f]] = {}
                }
                s = s[e[f]]
            }
            if (!s[e[e.length - 1]]) {
                if (!r) return;
                s[e[e.length - 1]] = []
            }
            s[e[e.length - 1]].push(t)
        }
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(i, null, 2) : JSON.stringify(i))
    }
    removeFromArray(e, t) {
        let r = JSON.parse(fs.readFileSync(this.filePath)),
            i = r;
        if ("string" == typeof e) {
            if (!i[e] || !Array.isArray(i[e])) return;
            i[e] = i[e].filter(e => e !== t)
        } else if (Array.isArray(e)) {
            for (let s = 0; s < e.length - 1; s++) {
                if (!i[e[s]]) return;
                i = i[e[s]]
            }
            if (!i[e[e.length - 1]] || !Array.isArray(i[e[e.length - 1]])) return;
            i[e[e.length - 1]] = i[e[e.length - 1]].filter(e => e !== t)
        }
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(r, null, 2) : JSON.stringify(r))
    }
    arrayLength(e) {
        let t = JSON.parse(fs.readFileSync(this.filePath));
        if ("string" == typeof e) return t[e] && Array.isArray(t[e]) ? t[e].length : 0;
        if (Array.isArray(e)) {
            for (let r = 0; r < e.length; r++) {
                if (!t[e[r]]) return 0;
                t = t[e[r]]
            }
            return Array.isArray(t) ? t.length : 0
        }
        return 0
    }
    getItemFromArray(e, t) {
        let r = JSON.parse(fs.readFileSync(this.filePath));
        if ("string" == typeof e) return r[e] && Array.isArray(r[e]) ? r[e][t] : void 0;
        if (Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (!r[e[i]]) return;
                r = r[e[i]]
            }
            return Array.isArray(r) ? r[t] : void 0
        }
    }
    updateItemInArray(e, t, r) {
        let i = JSON.parse(fs.readFileSync(this.filePath)),
            s = i;
        if ("string" == typeof e) s[e] && Array.isArray(s[e]) && void 0 !== s[e][t] && (s[e][t] = r);
        else if (Array.isArray(e)) {
            for (let f = 0; f < e.length; f++) {
                if (!s[e[f]]) return;
                s = s[e[f]]
            }
            Array.isArray(s) && void 0 !== s[t] && (s[t] = r)
        }
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(i, null, 2) : JSON.stringify(i))
    }
    containsItemInArray(e, t) {
        let r = JSON.parse(fs.readFileSync(this.filePath));
        if ("string" == typeof e) return !!(r[e] && Array.isArray(r[e])) && r[e].includes(t);
        if (Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (!r[e[i]]) return !1;
                r = r[e[i]]
            }
            return !!Array.isArray(r) && r.includes(t)
        }
        return !1
    }
    clearArray(e) {
        let t = JSON.parse(fs.readFileSync(this.filePath)),
            r = t;
        if ("string" == typeof e) r[e] && Array.isArray(r[e]) && (r[e] = []);
        else if (Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (!r[e[i]]) return;
                r = r[e[i]]
            }
            Array.isArray(r) && (r = [])
        }
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(t, null, 2) : JSON.stringify(t))
    }
    addValue(e, t) {
        let r = JSON.parse(fs.readFileSync(this.filePath)),
            i = r;
        if ("string" == typeof e) "number" == typeof i[e] && (i[e] += t);
        else if (Array.isArray(e)) {
            for (let s = 0; s < e.length - 1; s++) {
                if (!i[e[s]]) return;
                i = i[e[s]]
            }
            "number" == typeof i[e[e.length - 1]] && (i[e[e.length - 1]] += t)
        }
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(r, null, 2) : JSON.stringify(r))
    }
    subtractValue(e, t) {
        let r = JSON.parse(fs.readFileSync(this.filePath)),
            i = r;
        if ("string" == typeof e) "number" == typeof i[e] && (i[e] -= t);
        else if (Array.isArray(e)) {
            for (let s = 0; s < e.length - 1; s++) {
                if (!i[e[s]]) return;
                i = i[e[s]]
            }
            "number" == typeof i[e[e.length - 1]] && (i[e[e.length - 1]] -= t)
        }
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(r, null, 2) : JSON.stringify(r))
    }
    all() {
        return JSON.parse(fs.readFileSync(this.filePath))
    }
    renameKey(e, t) {
        let r = JSON.parse(fs.readFileSync(this.filePath));
        return !!r.hasOwnProperty(e) && (r[t] = r[e], delete r[e], fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(r, null, 2) : JSON.stringify(r)), !0)
    }
    matchesCondition(e, t) {
        JSON.parse(fs.readFileSync(this.filePath));
        let r = this.get(e);
        return void 0 !== r && t(r)
    }
    filterArray(e, t) {
        let r = JSON.parse(fs.readFileSync(this.filePath)),
            i = r;
        if ("string" == typeof e) {
            if (!i[e] || !Array.isArray(i[e])) return [];
            i[e] = i[e].filter(t)
        } else if (Array.isArray(e)) {
            for (let s = 0; s < e.length - 1; s++) {
                if (!i[e[s]]) return [];
                i = i[e[s]]
            }
            if (!i[e[e.length - 1]] || !Array.isArray(i[e[e.length - 1]])) return [];
            i[e[e.length - 1]] = i[e[e.length - 1]].filter(t)
        }
        return fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(r, null, 2) : JSON.stringify(r)), i[e]
    }
    isOfType(e, t) {
        let r = JSON.parse(fs.readFileSync(this.filePath));
        if ("string" == typeof e) return typeof r[e] === t;
        if (Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (!r[e[i]]) return !1;
                r = r[e[i]]
            }
            return typeof r === t
        }
        return !1
    }
    restore(e) {
        try {
            let t = fs.readFileSync(e, "utf-8"),
                r = JSON.parse(t);
            fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(r, null, 2) : JSON.stringify(r)), console.log("Database restored successfully from backup.")
        } catch (i) {
            console.error("Error restoring database from backup:", i.message)
        }
    }
    import(e) {
        try {
            let t = fs.readFileSync(e, "utf-8"),
                r = JSON.parse(t);
            fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(r, null, 2) : JSON.stringify(r)), console.log("Data imported successfully.")
        } catch (i) {
            console.error("Error importing data:", i.message)
        }
    }
}
module.exports = KeystonesDB;