import e from "ask-for-promise";
//#region src/dim.js
function t() {
	let e = {}, t = {};
	function n(n, ...r) {
		let i = document.createTextNode(""), a = document.createTextNode(""), o = n({
			start: i,
			end: a
		}, ...r);
		if (!i.parentNode || !a.parentNode) throw Error("dim.set: callback must attach both \"start\" and \"end\" markers to the DOM");
		let s = document.createRange();
		s.setStartAfter(i), s.setEndBefore(a);
		let c = {
			isEmpty() {
				return !i.isConnected || !a.isConnected ? !0 : (s.setStartAfter(i), s.setEndBefore(a), s.collapsed);
			},
			getContext() {
				return i.isConnected && a.isConnected ? s.commonAncestorContainer : null;
			},
			destroy() {
				i.isConnected && i.parentNode.removeChild(i), a.isConnected && a.parentNode.removeChild(a);
			}
		};
		o && (t[o] = c), e[Object.keys(e).length] = c;
	}
	function r(n) {
		if (!(typeof n != "string" && !Array.isArray(n))) return typeof n == "string" && n.includes(",") && (n = n.split(",").map((e) => e.trim())), Array.isArray(n) ? n.map((n) => t[n] || e[n]) : t[n] || e[n];
	}
	function i() {
		let n = /* @__PURE__ */ new Set();
		for (let t of Object.values(e)) n.add(t);
		for (let e of Object.values(t)) n.add(e);
		for (let e of n) e.destroy();
		for (let t of Object.keys(e)) delete e[t];
		for (let e of Object.keys(t)) delete t[e];
	}
	function a() {
		return Object.keys(t);
	}
	return {
		set: n,
		get: r,
		reset: i,
		aliases: a
	};
}
//#endregion
//#region src/main.js
function n(n = {}) {
	let r = {}, i = /* @__PURE__ */ new Set(), a = {}, o = t();
	function s(e, ...t) {
		let n = null, r = null;
		o.set((t, ...i) => {
			r = t;
			let a = e(t, ...i);
			return typeof a == "string" && (n = a), a;
		}, ...t), n && (i.add(n), a[n] = r);
	}
	function c(t, i, o = {}, s = {}) {
		let c = e();
		if (!i || typeof i.start != "function") return console.error("Error: App definition with start function is required"), c.done(!1), c.promise;
		if (!t || typeof t != "string") return console.error("Error: Alias is missing or invalid"), c.done(!1), c.promise;
		let u = a[t];
		if (!u || !u.start.isConnected || !u.end.isConnected) return console.error(`Error: Region "${t}" was not defined or its markers are orphaned. Call html.set(...) first.`), c.done(!1), c.promise;
		r[t] && l(t);
		let d = [], f = u.start.nextSibling;
		for (; f && f !== u.end;) d.push(f), f = f.nextSibling;
		let p;
		if (d.length === 0) p = document.createElement("div"), u.end.parentNode.insertBefore(p, u.end);
		else if (d.length === 1 && d[0].nodeType === 1) p = d[0];
		else {
			let e = document.createElement("div");
			e.style.display = "contents", u.end.parentNode.insertBefore(e, u.end), d.forEach((t) => e.appendChild(t)), p = e;
		}
		let m = {
			appDef: null,
			mountSpan: p,
			setupUpdates: {}
		};
		r[t] = m;
		let h = {
			alias: t,
			container: p,
			dependencies: n,
			data: o,
			setupUpdates: (e) => {
				m.setupUpdates = e || {};
			}
		};
		try {
			i.start(h), m.appDef = i;
		} catch (e) {
			return console.error("Error starting app:", e), delete r[t], c.done(!1), c.promise;
		}
		return c.done(m.setupUpdates), c.promise;
	}
	function l(e) {
		if (e === void 0) {
			let e = 0;
			for (let t of Object.keys(r)) l(t), e++;
			return e;
		}
		if (Array.isArray(e)) {
			let t = 0;
			for (let n of e) typeof n == "string" && r[n] && (l(n), t++);
			return t;
		}
		if (typeof e != "string") return console.error("Error: destroy() expects a string alias or an array of strings"), !1;
		let t = r[e];
		if (!t) return !1;
		if (t.appDef && typeof t.appDef.destroy == "function") try {
			t.appDef.destroy();
		} catch (e) {
			console.error("Error destroying app:", e);
		}
		return t.mountSpan.parentNode && t.mountSpan.parentNode.removeChild(t.mountSpan), delete r[e], !0;
	}
	function u(e) {
		return !!r[e];
	}
	function d(e) {
		let t = r[e];
		return t ? t.setupUpdates : (console.error(`App with alias: "${e}" was not found.`), !1);
	}
	function f() {
		return Array.from(i);
	}
	function p(e) {
		if (!e || typeof e != "string") {
			console.error("Error: Alias is missing or invalid");
			return;
		}
		let t = o.get(e);
		if (!t) {
			console.error(`Region "${e}" was not defined. Call html.set(...) first.`);
			return;
		}
		return t.isEmpty();
	}
	function m() {
		for (let e of Object.keys(r)) l(e);
		i.clear();
		for (let e of Object.keys(a)) delete a[e];
		o.reset();
	}
	return {
		set: s,
		publish: c,
		destroy: l,
		has: u,
		getApp: d,
		isEmpty: p,
		list: f,
		reset: m
	};
}
//#endregion
export { n as default };
