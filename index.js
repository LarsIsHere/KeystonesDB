const fs = require("fs"),
    {
        Worker: e
    } = require("worker_threads");
class KeystonesDB {
    constructor(e, r, t = {}) {
        if (this.filePath = e, this.beautify = r, this.caching = t.caching || "none", this.cache = "{}", fs.existsSync(e) || fs.writeFileSync(e, "{}"), "none" !== this.caching) try {
            let i = fs.readFileSync(e, "utf8");
            this.cache = i
        } catch (s) {
            console.error("Error reading file:", s)
        }
        this.listeners = {
            beforeSet: [],
            afterSet: [],
            beforeRemove: [],
            afterRemove: []
        }
    }
    CachingParseFile() {
        switch (this.caching) {
            case "none":
                return JSON.parse(fs.readFileSync(this.filePath));
            case "write-through":
                return JSON.parse(this.cache);
            default:
                throw Error('"' + this.caching + '" is an invalid caching option. Usable options are "none" and "write-through".')
        }
    }
    CachingWriteFile(e) {
        switch (this.caching) {
            case "none":
                fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(e, null, 2) : JSON.stringify(e));
                break;
            case "write-through":
                this.cache = this.beautify ? JSON.stringify(e, null, 2) : JSON.stringify(e), fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(e, null, 2) : JSON.stringify(e));
                break;
            default:
                throw Error('"' + this.caching + '" is an invalid caching option. Usable options are "none" and "write-through".')
        }
    }
    on(e, r) {
        this.listeners[e] && this.listeners[e].push(r)
    }
    emit(e, r) {
        this.listeners[e] && this.listeners[e].forEach(e => {
            e(r)
        })
    }
    set(e, r, t = !0) {
        let i = this.CachingParseFile(),
            s = i;
        if (this.emit("beforeSet", {
                pathOrKey: e,
                value: r
            }), "string" == typeof e) s[e] = r;
        else if (Array.isArray(e)) {
            for (let n = 0; n < e.length - 1; n++) {
                if (!s[e[n]]) {
                    if (!t) return;
                    s[e[n]] = {}
                }
                s = s[e[n]]
            }
            s[e[e.length - 1]] = r
        }
        this.CachingWriteFile(i), this.emit("afterSet", {
            pathOrKey: e,
            value: r
        })
    }
    get(e) {
        let r = this.CachingParseFile();
        if ("string" == typeof e) return r[e];
        if (Array.isArray(e)) {
            for (let t = 0; t < e.length; t++) {
                if (!r[e[t]]) return;
                r = r[e[t]]
            }
            return r
        }
    }
    backup(r, t = !1) {
        if (t) {
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
                    backupFilePath: r,
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
            fs.writeFileSync(r, s)
        }
    }
    contains(e) {
        let r = this.CachingParseFile();
        if ("string" == typeof e) return r.hasOwnProperty(e);
        if (Array.isArray(e)) {
            for (let t = 0; t < e.length; t++) {
                if (!r[e[t]]) return !1;
                r = r[e[t]]
            }
            return !0
        }
        return !1
    }
    remove(e) {
        let r = this.CachingParseFile(),
            t = r;
        if (this.emit("beforeRemove", {
                pathOrKey: e
            }), "string" == typeof e) delete t[e];
        else if (Array.isArray(e)) {
            for (let i = 0; i < e.length - 1; i++) {
                if (!t[e[i]]) return;
                t = t[e[i]]
            }
            delete t[e[e.length - 1]]
        }
        this.CachingWriteFile(r), this.emit("afterRemove", {
            pathOrKey: e
        })
    }
    push(e, r, t = !0) {
        let i = this.CachingParseFile(),
            s = i;
        if ("string" == typeof e) {
            if (!s[e]) {
                if (!t) return;
                s[e] = []
            }
            s[e].push(r)
        } else if (Array.isArray(e)) {
            for (let n = 0; n < e.length - 1; n++) {
                if (!s[e[n]]) {
                    if (!t) return;
                    s[e[n]] = {}
                }
                s = s[e[n]]
            }
            if (!s[e[e.length - 1]]) {
                if (!t) return;
                s[e[e.length - 1]] = []
            }
            s[e[e.length - 1]].push(r)
        }
        this.CachingWriteFile(i)
    }
    removeFromArray(e, r) {
        let t = this.CachingParseFile(),
            i = t;
        if ("string" == typeof e) {
            if (!i[e] || !Array.isArray(i[e])) return;
            i[e] = i[e].filter(e => e !== r)
        } else if (Array.isArray(e)) {
            for (let s = 0; s < e.length - 1; s++) {
                if (!i[e[s]]) return;
                i = i[e[s]]
            }
            if (!i[e[e.length - 1]] || !Array.isArray(i[e[e.length - 1]])) return;
            i[e[e.length - 1]] = i[e[e.length - 1]].filter(e => e !== r)
        }
        this.CachingWriteFile(t)
    }
    arrayLength(e) {
        let r = this.CachingParseFile();
        if ("string" == typeof e) return r[e] && Array.isArray(r[e]) ? r[e].length : 0;
        if (Array.isArray(e)) {
            for (let t = 0; t < e.length; t++) {
                if (!r[e[t]]) return 0;
                r = r[e[t]]
            }
            return Array.isArray(r) ? r.length : 0
        }
        return 0
    }
    getItemFromArray(e, r) {
        let t = this.CachingParseFile();
        if ("string" == typeof e) return t[e] && Array.isArray(t[e]) ? t[e][r] : void 0;
        if (Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (!t[e[i]]) return;
                t = t[e[i]]
            }
            return Array.isArray(t) ? t[r] : void 0
        }
    }
    updateItemInArray(e, r, t) {
        let i = this.CachingParseFile(),
            s = i;
        if ("string" == typeof e) s[e] && Array.isArray(s[e]) && void 0 !== s[e][r] && (s[e][r] = t);
        else if (Array.isArray(e)) {
            for (let n = 0; n < e.length; n++) {
                if (!s[e[n]]) return;
                s = s[e[n]]
            }
            Array.isArray(s) && void 0 !== s[r] && (s[r] = t)
        }
        this.CachingWriteFile(i)
    }
    containsItemInArray(e, r) {
        let t = this.CachingParseFile();
        if ("string" == typeof e) return !!(t[e] && Array.isArray(t[e])) && t[e].includes(r);
        if (Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (!t[e[i]]) return !1;
                t = t[e[i]]
            }
            return !!Array.isArray(t) && t.includes(r)
        }
        return !1
    }
    clearArray(e) {
        let r = this.CachingParseFile(),
            t = r;
        if ("string" == typeof e) t[e] && Array.isArray(t[e]) && (t[e] = []);
        else if (Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (!t[e[i]]) return;
                t = t[e[i]]
            }
            Array.isArray(t) && (t = [])
        }
        this.CachingWriteFile(r)
    }
    addValue(e, r) {
        let t = this.CachingParseFile(),
            i = t;
        if ("string" == typeof e) "number" == typeof i[e] && (i[e] += r);
        else if (Array.isArray(e)) {
            for (let s = 0; s < e.length - 1; s++) {
                if (!i[e[s]]) return;
                i = i[e[s]]
            }
            "number" == typeof i[e[e.length - 1]] && (i[e[e.length - 1]] += r)
        }
        this.CachingWriteFile(t)
    }
    subtractValue(e, r) {
        let t = this.CachingParseFile(),
            i = t;
        if ("string" == typeof e) "number" == typeof i[e] && (i[e] -= r);
        else if (Array.isArray(e)) {
            for (let s = 0; s < e.length - 1; s++) {
                if (!i[e[s]]) return;
                i = i[e[s]]
            }
            "number" == typeof i[e[e.length - 1]] && (i[e[e.length - 1]] -= r)
        }
        this.CachingWriteFile(t)
    }
    all() {
        return JSON.parse(fs.readFileSync(this.filePath))
    }
    renameKey(e, r) {
        let t = this.CachingParseFile();
        return !!t.hasOwnProperty(e) && (t[r] = t[e], delete t[e], this.CachingWriteFile(t), !0)
    }
    matchesCondition(e, r) {
        this.CachingParseFile();
        let t = this.get(e);
        return void 0 !== t && r(t)
    }
    filterArray(e, r) {
        let t = this.CachingParseFile(),
            i = t;
        if ("string" == typeof e) {
            if (!i[e] || !Array.isArray(i[e])) return [];
            i[e] = i[e].filter(r)
        } else if (Array.isArray(e)) {
            for (let s = 0; s < e.length - 1; s++) {
                if (!i[e[s]]) return [];
                i = i[e[s]]
            }
            if (!i[e[e.length - 1]] || !Array.isArray(i[e[e.length - 1]])) return [];
            i[e[e.length - 1]] = i[e[e.length - 1]].filter(r)
        }
        return this.CachingWriteFile(t), i[e]
    }
    isOfType(e, r) {
        let t = this.CachingParseFile();
        if ("string" == typeof e) return typeof t[e] === r;
        if (Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (!t[e[i]]) return !1;
                t = t[e[i]]
            }
            return typeof t === r
        }
        return !1
    }
    restore(e) {
        try {
            let r = fs.readFileSync(e, "utf-8"),
                t = JSON.parse(r);
            this.CachingWriteFile(t), console.log("Database restored successfully from backup.")
        } catch (i) {
            console.error("Error restoring database from backup:", i.message)
        }
    }
    import(e) {
        try {
            let r = fs.readFileSync(e, "utf-8"),
                t = JSON.parse(r);
            this.CachingWriteFile(t), console.log("Data imported successfully.")
        } catch (i) {
            console.error("Error importing data:", i.message)
        }
    }
}
module.exports = KeystonesDB;