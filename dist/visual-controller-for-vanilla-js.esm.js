import e from "ask-for-promise";
//#region src/main.js
function t(t = {}) {
	var n = {}, r = {};
	function i(i, o, s) {
		o ||= {};
		var c = document.getElementById(s), l = e();
		if (!i || !i.start) return console.error("Error: App definition with start function is required"), l.done(!1), l.promise;
		if (!i.destroy) return console.error("Error: App definition with destroy function is required"), l.done(!1), l.promise;
		if (!c) return console.error("Can't find node with id: \"" + s + "\""), l.done(!1), l.promise;
		n[s] && a(s);
		var u = {}, d = {
			id: s,
			container: c,
			dependencies: t,
			data: o,
			setupUpdates: function(e) {
				u = e || {};
			}
		};
		try {
			i.start(d), n[s] = i, r[s] = u;
		} catch (e) {
			return console.error("Error starting app:", e), l.done(!1), l.promise;
		}
		return l.done(u), l.promise;
	}
	function a(e) {
		if (Object.keys(n).indexOf(e) !== -1) {
			var t = n[e];
			if (t && t.destroy) try {
				t.destroy();
			} catch (e) {
				console.error("Error destroying app:", e);
			}
			var i = document.getElementById(e);
			return i && (i.innerHTML = ""), delete n[e], delete r[e], !0;
		}
		return !1;
	}
	function o(e) {
		return r[e] || (console.error("App with id: \"" + e + "\" was not found."), !1);
	}
	function s(e) {
		return !!n[e];
	}
	return {
		publish: i,
		destroy: a,
		getApp: o,
		has: s
	};
}
//#endregion
export { t as default };
