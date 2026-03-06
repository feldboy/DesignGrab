const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./auth-jQZeegj1.js","./env-sw2aQK8W.js"])))=>i.map(i=>d[i]);
import { g as getSupabase, s as storage, c as checkLimit, r as recordUsage, a as getAuthState, b as getUsageSummary, d as signInWithGoogle, _ as __vitePreload } from "./auth-jQZeegj1.js";
import { S as SUPABASE_URL } from "./env-sw2aQK8W.js";
var n, l$1, u$2, i$1, r$1, o$1, e$1, f$2, c$1, s$1, a$1, p$1 = {}, v$1 = [], y$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, d$1 = Array.isArray;
function w$1(n2, l2) {
  for (var u2 in l2) n2[u2] = l2[u2];
  return n2;
}
function g(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _(l2, u2, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
  return m$1(l2, e2, i2, r2, null);
}
function m$1(n2, t2, i2, r2, o2) {
  var e2 = { type: n2, props: t2, key: i2, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o2 ? ++u$2 : o2, __i: -1, __u: 0 };
  return null == o2 && null != l$1.vnode && l$1.vnode(e2), e2;
}
function k$1(n2) {
  return n2.children;
}
function x(n2, l2) {
  this.props = n2, this.context = l2;
}
function S(n2, l2) {
  if (null == l2) return n2.__ ? S(n2.__, n2.__i + 1) : null;
  for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
  return "function" == typeof n2.type ? S(n2) : null;
}
function C$1(n2) {
  if (n2.__P && n2.__d) {
    var u2 = n2.__v, t2 = u2.__e, i2 = [], r2 = [], o2 = w$1({}, u2);
    o2.__v = u2.__v + 1, l$1.vnode && l$1.vnode(o2), z$1(n2.__P, o2, u2, n2.__n, n2.__P.namespaceURI, 32 & u2.__u ? [t2] : null, i2, null == t2 ? S(u2) : t2, !!(32 & u2.__u), r2), o2.__v = u2.__v, o2.__.__k[o2.__i] = o2, V(i2, o2, r2), u2.__e = u2.__ = null, o2.__e != t2 && M(o2);
  }
}
function M(n2) {
  if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l2) {
    if (null != l2 && null != l2.__e) return n2.__e = n2.__c.base = l2.__e;
  }), M(n2);
}
function $(n2) {
  (!n2.__d && (n2.__d = true) && i$1.push(n2) && !I.__r++ || r$1 != l$1.debounceRendering) && ((r$1 = l$1.debounceRendering) || o$1)(I);
}
function I() {
  for (var n2, l2 = 1; i$1.length; ) i$1.length > l2 && i$1.sort(e$1), n2 = i$1.shift(), l2 = i$1.length, C$1(n2);
  I.__r = 0;
}
function P(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, y2, d2, w2, g2, _2, m2 = t2 && t2.__k || v$1, b = l2.length;
  for (f2 = A$1(u2, l2, m2, f2, b), a2 = 0; a2 < b; a2++) null != (y2 = u2.__k[a2]) && (h2 = -1 != y2.__i && m2[y2.__i] || p$1, y2.__i = a2, g2 = z$1(n2, y2, h2, i2, r2, o2, e2, f2, c2, s2), d2 = y2.__e, y2.ref && h2.ref != y2.ref && (h2.ref && D$1(h2.ref, null, y2), s2.push(y2.ref, y2.__c || d2, y2)), null == w2 && null != d2 && (w2 = d2), (_2 = !!(4 & y2.__u)) || h2.__k === y2.__k ? f2 = H(y2, f2, n2, _2) : "function" == typeof y2.type && void 0 !== g2 ? f2 = g2 : d2 && (f2 = d2.nextSibling), y2.__u &= -7);
  return u2.__e = w2, f2;
}
function A$1(n2, l2, u2, t2, i2) {
  var r2, o2, e2, f2, c2, s2 = u2.length, a2 = s2, h2 = 0;
  for (n2.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? ("string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? o2 = n2.__k[r2] = m$1(null, o2, null, null, null) : d$1(o2) ? o2 = n2.__k[r2] = m$1(k$1, { children: o2 }, null, null, null) : void 0 === o2.constructor && o2.__b > 0 ? o2 = n2.__k[r2] = m$1(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : n2.__k[r2] = o2, f2 = r2 + h2, o2.__ = n2, o2.__b = n2.__b + 1, e2 = null, -1 != (c2 = o2.__i = T$1(o2, u2, f2, a2)) && (a2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > s2 ? h2-- : i2 < s2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (a2) for (r2 = 0; r2 < s2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = S(e2)), E(e2, e2));
  return t2;
}
function H(n2, l2, u2, t2) {
  var i2, r2;
  if ("function" == typeof n2.type) {
    for (i2 = n2.__k, r2 = 0; i2 && r2 < i2.length; r2++) i2[r2] && (i2[r2].__ = n2, l2 = H(i2[r2], l2, u2, t2));
    return l2;
  }
  n2.__e != l2 && (t2 && (l2 && n2.type && !l2.parentNode && (l2 = S(n2)), u2.insertBefore(n2.__e, l2 || null)), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 == l2.nodeType);
  return l2;
}
function T$1(n2, l2, u2, t2) {
  var i2, r2, o2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], s2 = null != c2 && 0 == (2 & c2.__u);
  if (null === c2 && null == e2 || s2 && e2 == c2.key && f2 == c2.type) return u2;
  if (t2 > (s2 ? 1 : 0)) {
    for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length; ) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
  }
  return -1;
}
function j$1(n2, l2, u2) {
  "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || y$1.test(l2) ? u2 : u2 + "px";
}
function F(n2, l2, u2, t2, i2) {
  var r2, o2;
  n: if ("style" == l2) if ("string" == typeof u2) n2.style.cssText = u2;
  else {
    if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || j$1(n2.style, l2, "");
    if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || j$1(n2.style, l2, u2[l2]);
  }
  else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(f$2, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2.u = t2.u : (u2.u = c$1, n2.addEventListener(l2, r2 ? a$1 : s$1, r2)) : n2.removeEventListener(l2, r2 ? a$1 : s$1, r2);
  else {
    if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u2 ? "" : u2;
      break n;
    } catch (n3) {
    }
    "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
  }
}
function O(n2) {
  return function(u2) {
    if (this.l) {
      var t2 = this.l[u2.type + n2];
      if (null == u2.t) u2.t = c$1++;
      else if (u2.t < t2.u) return;
      return t2(l$1.event ? l$1.event(u2) : u2);
    }
  };
}
function z$1(n2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, p2, y2, _2, m2, b, S2, C2, M2, $2, I2, A2, H2, L, T2 = u2.type;
  if (void 0 !== u2.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (a2 = l$1.__b) && a2(u2);
  n: if ("function" == typeof T2) try {
    if (S2 = u2.props, C2 = "prototype" in T2 && T2.prototype.render, M2 = (a2 = T2.contextType) && i2[a2.__c], $2 = a2 ? M2 ? M2.props.value : a2.__ : i2, t2.__c ? b = (h2 = u2.__c = t2.__c).__ = h2.__E : (C2 ? u2.__c = h2 = new T2(S2, $2) : (u2.__c = h2 = new x(S2, $2), h2.constructor = T2, h2.render = G), M2 && M2.sub(h2), h2.state || (h2.state = {}), h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), C2 && null == h2.__s && (h2.__s = h2.state), C2 && null != T2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = w$1({}, h2.__s)), w$1(h2.__s, T2.getDerivedStateFromProps(S2, h2.__s))), y2 = h2.props, _2 = h2.state, h2.__v = u2, p2) C2 && null == T2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), C2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
    else {
      if (C2 && null == T2.getDerivedStateFromProps && S2 !== y2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(S2, $2), u2.__v == t2.__v || !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(S2, h2.__s, $2)) {
        u2.__v != t2.__v && (h2.props = S2, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
          n3 && (n3.__ = u2);
        }), v$1.push.apply(h2.__h, h2._sb), h2._sb = [], h2.__h.length && e2.push(h2);
        break n;
      }
      null != h2.componentWillUpdate && h2.componentWillUpdate(S2, h2.__s, $2), C2 && null != h2.componentDidUpdate && h2.__h.push(function() {
        h2.componentDidUpdate(y2, _2, m2);
      });
    }
    if (h2.context = $2, h2.props = S2, h2.__P = n2, h2.__e = false, I2 = l$1.__r, A2 = 0, C2) h2.state = h2.__s, h2.__d = false, I2 && I2(u2), a2 = h2.render(h2.props, h2.state, h2.context), v$1.push.apply(h2.__h, h2._sb), h2._sb = [];
    else do {
      h2.__d = false, I2 && I2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
    } while (h2.__d && ++A2 < 25);
    h2.state = h2.__s, null != h2.getChildContext && (i2 = w$1(w$1({}, i2), h2.getChildContext())), C2 && !p2 && null != h2.getSnapshotBeforeUpdate && (m2 = h2.getSnapshotBeforeUpdate(y2, _2)), H2 = null != a2 && a2.type === k$1 && null == a2.key ? q(a2.props.children) : a2, f2 = P(n2, d$1(H2) ? H2 : [H2], u2, t2, i2, r2, o2, e2, f2, c2, s2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), b && (h2.__E = h2.__ = null);
  } catch (n3) {
    if (u2.__v = null, c2 || null != o2) if (n3.then) {
      for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
      o2[o2.indexOf(f2)] = null, u2.__e = f2;
    } else {
      for (L = o2.length; L--; ) g(o2[L]);
      N(u2);
    }
    else u2.__e = t2.__e, u2.__k = t2.__k, n3.then || N(u2);
    l$1.__e(n3, u2, t2);
  }
  else null == o2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = B$1(t2.__e, u2, t2, i2, r2, o2, e2, c2, s2);
  return (a2 = l$1.diffed) && a2(u2), 128 & u2.__u ? void 0 : f2;
}
function N(n2) {
  n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(N));
}
function V(n2, u2, t2) {
  for (var i2 = 0; i2 < t2.length; i2++) D$1(t2[i2], t2[++i2], t2[++i2]);
  l$1.__c && l$1.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l$1.__e(n3, u3.__v);
    }
  });
}
function q(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : d$1(n2) ? n2.map(q) : w$1({}, n2);
}
function B$1(u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, v2, y2, w2, _2, m2, b = i2.props || p$1, k2 = t2.props, x2 = t2.type;
  if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
    for (a2 = 0; a2 < e2.length; a2++) if ((w2 = e2[a2]) && "setAttribute" in w2 == !!x2 && (x2 ? w2.localName == x2 : 3 == w2.nodeType)) {
      u2 = w2, e2[a2] = null;
      break;
    }
  }
  if (null == u2) {
    if (null == x2) return document.createTextNode(k2);
    u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l$1.__m && l$1.__m(t2, e2), c2 = false), e2 = null;
  }
  if (null == x2) b === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = e2 && n.call(u2.childNodes), !c2 && null != e2) for (b = {}, a2 = 0; a2 < u2.attributes.length; a2++) b[(w2 = u2.attributes[a2]).name] = w2.value;
    for (a2 in b) w2 = b[a2], "dangerouslySetInnerHTML" == a2 ? v2 = w2 : "children" == a2 || a2 in k2 || "value" == a2 && "defaultValue" in k2 || "checked" == a2 && "defaultChecked" in k2 || F(u2, a2, null, w2, o2);
    for (a2 in k2) w2 = k2[a2], "children" == a2 ? y2 = w2 : "dangerouslySetInnerHTML" == a2 ? h2 = w2 : "value" == a2 ? _2 = w2 : "checked" == a2 ? m2 = w2 : c2 && "function" != typeof w2 || b[a2] === w2 || F(u2, a2, w2, b[a2], o2);
    if (h2) c2 || v2 && (h2.__html == v2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
    else if (v2 && (u2.innerHTML = ""), P("template" == t2.type ? u2.content : u2, d$1(y2) ? y2 : [y2], t2, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && S(i2, 0), c2, s2), null != e2) for (a2 = e2.length; a2--; ) g(e2[a2]);
    c2 || (a2 = "value", "progress" == x2 && null == _2 ? u2.removeAttribute("value") : null != _2 && (_2 !== u2[a2] || "progress" == x2 && !_2 || "option" == x2 && _2 != b[a2]) && F(u2, a2, _2, b[a2], o2), a2 = "checked", null != m2 && m2 != u2[a2] && F(u2, a2, m2, b[a2], o2));
  }
  return u2;
}
function D$1(n2, u2, t2) {
  try {
    if ("function" == typeof n2) {
      var i2 = "function" == typeof n2.__u;
      i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
    } else n2.current = u2;
  } catch (n3) {
    l$1.__e(n3, t2);
  }
}
function E(n2, u2, t2) {
  var i2, r2;
  if (l$1.unmount && l$1.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || D$1(i2, null, u2)), null != (i2 = n2.__c)) {
    if (i2.componentWillUnmount) try {
      i2.componentWillUnmount();
    } catch (n3) {
      l$1.__e(n3, u2);
    }
    i2.base = i2.__P = null;
  }
  if (i2 = n2.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && E(i2[r2], u2, t2 || "function" != typeof n2.type);
  t2 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function G(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function J(u2, t2, i2) {
  var r2, o2, e2, f2;
  t2 == document && (t2 = document.documentElement), l$1.__ && l$1.__(u2, t2), o2 = (r2 = false) ? null : t2.__k, e2 = [], f2 = [], z$1(t2, u2 = t2.__k = _(k$1, null, [u2]), o2 || p$1, p$1, t2.namespaceURI, o2 ? null : t2.firstChild ? n.call(t2.childNodes) : null, e2, o2 ? o2.__e : t2.firstChild, r2, f2), V(e2, u2, f2);
}
n = v$1.slice, l$1 = { __e: function(n2, l2, u2, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, u$2 = 0, x.prototype.setState = function(n2, l2) {
  var u2;
  u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = w$1({}, this.state), "function" == typeof n2 && (n2 = n2(w$1({}, u2), this.props)), n2 && w$1(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), $(this));
}, x.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), $(this));
}, x.prototype.render = k$1, i$1 = [], o$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$1 = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, I.__r = 0, f$2 = /(PointerCapture)$|Capture$/i, c$1 = 0, s$1 = O(false), a$1 = O(true);
var f$1 = 0;
function u$1(e2, t2, n2, o2, i2, u2) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f$1, __i: -1, __u: 0, __source: i2, __self: u2 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l$1.vnode && l$1.vnode(l2), l2;
}
var t, r, u, i, o = 0, f = [], c = l$1, e = c.__b, a = c.__r, v = c.diffed, l = c.__c, m = c.unmount, s = c.__;
function p(n2, t2) {
  c.__h && c.__h(r, n2, o || t2), o = 0;
  var u2 = r.__H || (r.__H = { __: [], __h: [] });
  return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
}
function d(n2) {
  return o = 1, h(D, n2);
}
function h(n2, u2, i2) {
  var o2 = p(t++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [D(void 0, u2), function(n3) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r, !r.__f)) {
    var f2 = function(n3, t2, r2) {
      if (!o2.__c.__H) return true;
      var u3 = o2.__c.__H.__.filter(function(n4) {
        return n4.__c;
      });
      if (u3.every(function(n4) {
        return !n4.__N;
      })) return !c2 || c2.call(this, n3, t2, r2);
      var i3 = o2.__c.props !== n3;
      return u3.some(function(n4) {
        if (n4.__N) {
          var t3 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
        }
      }), c2 && c2.call(this, n3, t2, r2) || i3;
    };
    r.__f = true;
    var c2 = r.shouldComponentUpdate, e2 = r.componentWillUpdate;
    r.componentWillUpdate = function(n3, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n3, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n3, t2, r2);
    }, r.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function y(n2, u2) {
  var i2 = p(t++, 3);
  !c.__s && C(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r.__H.__h.push(i2));
}
function A(n2) {
  return o = 5, T(function() {
    return { current: n2 };
  }, []);
}
function T(n2, r2) {
  var u2 = p(t++, 7);
  return C(u2.__H, r2) && (u2.__ = n2(), u2.__H = r2, u2.__h = n2), u2.__;
}
function j() {
  for (var n2; n2 = f.shift(); ) {
    var t2 = n2.__H;
    if (n2.__P && t2) try {
      t2.__h.some(z), t2.__h.some(B), t2.__h = [];
    } catch (r2) {
      t2.__h = [], c.__e(r2, n2.__v);
    }
  }
}
c.__b = function(n2) {
  r = null, e && e(n2);
}, c.__ = function(n2, t2) {
  n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), s && s(n2, t2);
}, c.__r = function(n2) {
  a && a(n2), t = 0;
  var i2 = (r = n2.__c).__H;
  i2 && (u === r ? (i2.__h = [], r.__h = [], i2.__.some(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i2.__h.some(z), i2.__h.some(B), i2.__h = [], t = 0)), u = r;
}, c.diffed = function(n2) {
  v && v(n2);
  var t2 = n2.__c;
  t2 && t2.__H && (t2.__H.__h.length && (1 !== f.push(t2) && i === c.requestAnimationFrame || ((i = c.requestAnimationFrame) || w)(j)), t2.__H.__.some(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = void 0;
  })), u = r = null;
}, c.__c = function(n2, t2) {
  t2.some(function(n3) {
    try {
      n3.__h.some(z), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B(n4);
      });
    } catch (r2) {
      t2.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t2 = [], c.__e(r2, n3.__v);
    }
  }), l && l(n2, t2);
}, c.unmount = function(n2) {
  m && m(n2);
  var t2, r2 = n2.__c;
  r2 && r2.__H && (r2.__H.__.some(function(n3) {
    try {
      z(n3);
    } catch (n4) {
      t2 = n4;
    }
  }), r2.__H = void 0, t2 && c.__e(t2, r2.__v));
};
var k = "function" == typeof requestAnimationFrame;
function w(n2) {
  var t2, r2 = function() {
    clearTimeout(u2), k && cancelAnimationFrame(t2), setTimeout(n2);
  }, u2 = setTimeout(r2, 35);
  k && (t2 = requestAnimationFrame(r2));
}
function z(n2) {
  var t2 = r, u2 = n2.__c;
  "function" == typeof u2 && (n2.__c = void 0, u2()), r = t2;
}
function B(n2) {
  var t2 = r;
  n2.__c = n2.__(), r = t2;
}
function C(n2, t2) {
  return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n2[r2];
  });
}
function D(n2, t2) {
  return "function" == typeof t2 ? t2(n2) : t2;
}
function InspectorTab({ element, isInspecting, onStartInspect, onSelectPage }) {
  const [copiedKey, setCopiedKey] = d(null);
  if (!element && !isInspecting) {
    return /* @__PURE__ */ u$1("div", { class: "inspector-empty", children: [
      /* @__PURE__ */ u$1("div", { class: "empty-icon", children: /* @__PURE__ */ u$1("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", children: [
        /* @__PURE__ */ u$1("circle", { cx: "24", cy: "24", r: "20", stroke: "#3f3f46", "stroke-width": "2", "stroke-dasharray": "4 4" }),
        /* @__PURE__ */ u$1("circle", { cx: "20", cy: "20", r: "8", stroke: "#6366f1", "stroke-width": "2" }),
        /* @__PURE__ */ u$1("line", { x1: "26", y1: "26", x2: "34", y2: "34", stroke: "#6366f1", "stroke-width": "2", "stroke-linecap": "round" })
      ] }) }),
      /* @__PURE__ */ u$1("h3", { class: "empty-title", children: "No element selected" }),
      /* @__PURE__ */ u$1("p", { class: "empty-text", children: 'Click "Inspect" and hover over any element on the page, then click to pin it.' }),
      /* @__PURE__ */ u$1("div", { class: "empty-actions", children: [
        /* @__PURE__ */ u$1("button", { class: "empty-btn", onClick: onStartInspect, children: "🔍 Start Inspecting" }),
        /* @__PURE__ */ u$1("button", { class: "empty-btn secondary", onClick: onSelectPage, children: "📄 Select Page" })
      ] })
    ] });
  }
  if (isInspecting && !element) {
    return /* @__PURE__ */ u$1("div", { class: "inspector-active", children: [
      /* @__PURE__ */ u$1("div", { class: "pulse-ring" }),
      /* @__PURE__ */ u$1("p", { class: "active-text", children: "Inspect mode active" }),
      /* @__PURE__ */ u$1("p", { class: "active-sub", children: "Hover over any element and click to inspect it" })
    ] });
  }
  const copyValue = (key, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  };
  const renderSection = (title, items) => {
    if (!items || Object.keys(items).length === 0) return null;
    return /* @__PURE__ */ u$1("div", { class: "inspector-section", children: [
      /* @__PURE__ */ u$1("h4", { class: "section-title", children: title }),
      /* @__PURE__ */ u$1("div", { class: "section-props", children: Object.entries(items).map(([key, value]) => {
        if (value === null || value === void 0 || value === "" || value === "none" || value === "normal") return null;
        const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value);
        const isCopied = copiedKey === `${title}-${key}`;
        return /* @__PURE__ */ u$1(
          "div",
          {
            class: `prop-row ${isCopied ? "copied" : ""}`,
            onClick: () => copyValue(`${title}-${key}`, displayValue),
            title: "Click to copy",
            children: [
              /* @__PURE__ */ u$1("span", { class: "prop-key", children: formatKey(key) }),
              /* @__PURE__ */ u$1("span", { class: "prop-value", children: [
                isColorValue(key, displayValue) && /* @__PURE__ */ u$1("span", { class: "color-swatch", style: { backgroundColor: displayValue } }),
                isCopied ? "✓ Copied!" : truncate(displayValue, 40)
              ] })
            ]
          },
          key
        );
      }) })
    ] });
  };
  return /* @__PURE__ */ u$1("div", { class: "inspector-content", children: [
    /* @__PURE__ */ u$1("div", { class: "inspector-element-header", children: [
      /* @__PURE__ */ u$1("code", { class: "element-tag", children: [
        "<",
        element.tagName,
        element.id && /* @__PURE__ */ u$1("span", { class: "tag-id", children: [
          "#",
          element.id
        ] }),
        element.classList?.length > 0 && /* @__PURE__ */ u$1("span", { class: "tag-class", children: [
          ".",
          element.classList.slice(0, 3).join(".")
        ] }),
        ">"
      ] }),
      /* @__PURE__ */ u$1("span", { class: "element-dims", children: [
        element.dimensions?.width,
        " × ",
        element.dimensions?.height
      ] }),
      /* @__PURE__ */ u$1("button", { class: "select-page-btn", onClick: onSelectPage, title: "Select entire page", children: "📄 Page" })
    ] }),
    element.selectorPath && /* @__PURE__ */ u$1("div", { class: "inspector-selector", onClick: () => copyValue("selector", element.selectorPath), children: [
      /* @__PURE__ */ u$1("span", { class: "selector-label", children: "Selector" }),
      /* @__PURE__ */ u$1("code", { class: "selector-value", children: element.selectorPath })
    ] }),
    /* @__PURE__ */ u$1("div", { class: "box-model-visual", children: [
      /* @__PURE__ */ u$1("div", { class: "box-margin-label", children: "margin" }),
      /* @__PURE__ */ u$1("div", { class: "box-margin", children: [
        /* @__PURE__ */ u$1("span", { class: "box-val top", children: element.box?.margin?.top || 0 }),
        /* @__PURE__ */ u$1("div", { class: "box-border", children: [
          /* @__PURE__ */ u$1("span", { class: "box-val left-outer", children: element.box?.margin?.left || 0 }),
          /* @__PURE__ */ u$1("div", { class: "box-border-label", children: "border" }),
          /* @__PURE__ */ u$1("div", { class: "box-padding", children: [
            /* @__PURE__ */ u$1("span", { class: "box-val top", children: element.box?.padding?.top || 0 }),
            /* @__PURE__ */ u$1("div", { class: "box-content", children: [
              /* @__PURE__ */ u$1("span", { class: "box-val left-inner", children: element.box?.padding?.left || 0 }),
              /* @__PURE__ */ u$1("span", { class: "box-content-size", children: [
                element.dimensions?.width,
                " × ",
                element.dimensions?.height
              ] }),
              /* @__PURE__ */ u$1("span", { class: "box-val right-inner", children: element.box?.padding?.right || 0 })
            ] }),
            /* @__PURE__ */ u$1("span", { class: "box-val bottom", children: element.box?.padding?.bottom || 0 })
          ] }),
          /* @__PURE__ */ u$1("span", { class: "box-val right-outer", children: element.box?.margin?.right || 0 })
        ] }),
        /* @__PURE__ */ u$1("span", { class: "box-val bottom", children: element.box?.margin?.bottom || 0 })
      ] })
    ] }),
    renderSection("Typography", element.typography),
    renderSection("Visual", element.visual),
    renderSection("Layout", element.layout),
    renderSection("Position", element.position),
    element.rawCSS && /* @__PURE__ */ u$1("div", { class: "inspector-section", children: [
      /* @__PURE__ */ u$1("h4", { class: "section-title", children: [
        "Raw CSS",
        /* @__PURE__ */ u$1("button", { class: "copy-all-btn", onClick: () => copyValue("rawCSS", element.rawCSS), children: [
          copiedKey === "rawCSS" ? "✓" : "📋",
          " Copy All"
        ] })
      ] }),
      /* @__PURE__ */ u$1("pre", { class: "raw-css", children: element.rawCSS })
    ] })
  ] });
}
function formatKey(key) {
  return key.replace(/([A-Z])/g, "-$1").toLowerCase();
}
function isColorValue(key, value) {
  const colorKeys = ["color", "backgroundColor", "borderColor", "background"];
  return colorKeys.some((k2) => key.toLowerCase().includes(k2.toLowerCase())) && (value.startsWith("#") || value.startsWith("rgb"));
}
function truncate(str, max) {
  if (str.length <= max) return str;
  return str.substring(0, max - 3) + "...";
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;left:-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}
function downloadTextFile(content, filename, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a2 = document.createElement("a");
  a2.href = url;
  a2.download = filename;
  a2.style.display = "none";
  document.body.appendChild(a2);
  a2.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a2.remove();
  }, 100);
}
async function pushItem(item) {
  const supabase = await getSupabase();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  try {
    const { error } = await supabase.from("saved_items").upsert({
      id: item.id,
      user_id: user.id,
      type: item.type,
      name: item.name || "",
      data: item.data,
      source_url: item.sourceUrl || "",
      created_at: item.savedAt || (/* @__PURE__ */ new Date()).toISOString()
    }, { onConflict: "id" });
    if (error) {
      console.warn("[DesignGrab] Sync push error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[DesignGrab] Sync push failed:", err.message);
    return false;
  }
}
async function removeRemoteItem(itemId) {
  const supabase = await getSupabase();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  try {
    await supabase.from("saved_items").delete().eq("id", itemId).eq("user_id", user.id);
    return true;
  } catch {
    return false;
  }
}
async function syncLibrary() {
  const supabase = await getSupabase();
  if (!supabase) return { merged: 0, pulled: 0, pushed: 0 };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { merged: 0, pulled: 0, pushed: 0 };
  try {
    const { data: remoteItems, error } = await supabase.from("saved_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) {
      console.warn("[DesignGrab] Sync pull error:", error.message);
      return { merged: 0, pulled: 0, pushed: 0 };
    }
    const storeData = await storage.get(["library"]);
    const localItems = storeData.library || [];
    const localMap = new Map(localItems.map((i2) => [i2.id, i2]));
    const remoteMap = new Map((remoteItems || []).map((r2) => [r2.id, r2]));
    let pulled = 0;
    let pushed = 0;
    for (const remote of remoteItems || []) {
      if (!localMap.has(remote.id)) {
        localItems.unshift({
          id: remote.id,
          type: remote.type,
          name: remote.name,
          data: remote.data,
          sourceUrl: remote.source_url,
          savedAt: remote.created_at
        });
        pulled++;
      }
    }
    const toPush = localItems.filter((l2) => !remoteMap.has(l2.id));
    for (const item of toPush) {
      const ok = await pushItem(item);
      if (ok) pushed++;
    }
    await storage.set({ library: localItems });
    await storage.set({ lastLibrarySync: (/* @__PURE__ */ new Date()).toISOString() });
    return { merged: localItems.length, pulled, pushed };
  } catch (err) {
    console.warn("[DesignGrab] Sync failed:", err.message);
    return { merged: 0, pulled: 0, pushed: 0 };
  }
}
function LibraryTab() {
  const [items, setItems] = d([]);
  const [filter, setFilter] = d("all");
  const [copiedId, setCopiedId] = d(null);
  const [syncing, setSyncing] = d(false);
  const [syncResult, setSyncResult] = d(null);
  const loadLibrary = () => {
    chrome.storage.local.get(["library"], (data) => {
      setItems(data.library || []);
    });
  };
  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncLibrary();
      if (result.pulled > 0 || result.pushed > 0) {
        loadLibrary();
        setSyncResult(`Synced: ${result.pulled} pulled, ${result.pushed} pushed`);
      } else if (result.merged > 0) {
        setSyncResult("Already in sync");
      } else {
        setSyncResult("Sign in to sync");
      }
    } catch {
      setSyncResult("Sync failed");
    }
    setSyncing(false);
    setTimeout(() => setSyncResult(null), 3e3);
  };
  y(() => {
    loadLibrary();
    handleSync();
    const listener = (changes) => {
      if (changes.library) loadLibrary();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);
  const removeItem = (id) => {
    const updated = items.filter((i2) => i2.id !== id);
    chrome.storage.local.set({ library: updated });
    setItems(updated);
    removeRemoteItem(id);
  };
  const handleCopy = (item) => {
    let text = "";
    if (item.type === "color") text = item.data.hex;
    else if (item.type === "font") text = item.data.family;
    else if (item.type === "svg") text = item.data.code;
    else if (item.type === "image") text = item.data.src;
    copyToClipboard(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  const filtered = filter === "all" ? items : items.filter((i2) => i2.type === filter);
  const counts = {
    all: items.length,
    color: items.filter((i2) => i2.type === "color").length,
    font: items.filter((i2) => i2.type === "font").length,
    svg: items.filter((i2) => i2.type === "svg").length,
    image: items.filter((i2) => i2.type === "image").length
  };
  if (items.length === 0) {
    return /* @__PURE__ */ u$1("div", { className: "library-empty fade-in", children: [
      /* @__PURE__ */ u$1("div", { className: "empty-icon", children: /* @__PURE__ */ u$1("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", children: [
        /* @__PURE__ */ u$1("path", { d: "M12 8h24a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z", stroke: "#3f3f46", "stroke-width": "2" }),
        /* @__PURE__ */ u$1("path", { d: "M16 20h16M16 28h10", stroke: "#6366f1", "stroke-width": "2", "stroke-linecap": "round" }),
        /* @__PURE__ */ u$1("circle", { cx: "34", cy: "34", r: "8", fill: "#0a0a12", stroke: "#6366f1", "stroke-width": "2" }),
        /* @__PURE__ */ u$1("path", { d: "M31 34h6M34 31v6", stroke: "#6366f1", "stroke-width": "2", "stroke-linecap": "round" })
      ] }) }),
      /* @__PURE__ */ u$1("h3", { className: "empty-title", children: "Your Library is Empty" }),
      /* @__PURE__ */ u$1("p", { className: "empty-text", children: "Save colors, fonts, and assets from any website. They'll appear here." })
    ] });
  }
  return /* @__PURE__ */ u$1("div", { className: "library-tab fade-in", children: [
    /* @__PURE__ */ u$1("div", { className: "panel-sticky-header", children: [
      /* @__PURE__ */ u$1("div", { className: "stats-row", children: [
        /* @__PURE__ */ u$1("span", { children: [
          items.length,
          " saved items"
        ] }),
        /* @__PURE__ */ u$1("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          syncResult && /* @__PURE__ */ u$1("span", { style: { fontSize: "11px", color: "#a1a1aa" }, children: syncResult }),
          /* @__PURE__ */ u$1(
            "button",
            {
              className: "icon-btn",
              onClick: handleSync,
              disabled: syncing,
              title: "Sync with cloud",
              style: { opacity: syncing ? 0.5 : 1 },
              children: syncing ? "⟳" : "☁"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { className: "library-filters", children: ["all", "color", "font", "svg", "image"].map((f2) => counts[f2] > 0 || f2 === "all" ? /* @__PURE__ */ u$1(
        "button",
        {
          className: `filter-btn ${filter === f2 ? "active" : ""}`,
          onClick: () => setFilter(f2),
          children: [
            f2 === "all" ? "All" : f2.charAt(0).toUpperCase() + f2.slice(1),
            "s (",
            counts[f2],
            ")"
          ]
        },
        f2
      ) : null) })
    ] }),
    /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: /* @__PURE__ */ u$1("div", { className: "library-grid", children: filtered.map((item) => /* @__PURE__ */ u$1("div", { className: "library-card", children: [
      /* @__PURE__ */ u$1("div", { className: "library-preview", children: [
        item.type === "color" && /* @__PURE__ */ u$1("div", { className: "library-color-swatch", style: { backgroundColor: item.data.hex } }),
        item.type === "font" && /* @__PURE__ */ u$1("div", { className: "library-font-preview", style: { fontFamily: item.data.family }, children: "Aa" }),
        item.type === "svg" && item.data.code && /* @__PURE__ */ u$1("div", { className: "library-svg-preview", dangerouslySetInnerHTML: { __html: item.data.code } }),
        item.type === "image" && /* @__PURE__ */ u$1("img", { src: item.data.src, alt: "", loading: "lazy" })
      ] }),
      /* @__PURE__ */ u$1("div", { className: "library-item-info", children: [
        /* @__PURE__ */ u$1("span", { className: "library-item-name", children: item.name || item.data.hex || item.data.family || "Asset" }),
        /* @__PURE__ */ u$1("span", { className: "library-item-type", children: item.type }),
        item.sourceUrl && /* @__PURE__ */ u$1("span", { className: "library-item-source", title: item.sourceUrl, children: new URL(item.sourceUrl).hostname })
      ] }),
      /* @__PURE__ */ u$1("div", { className: "library-item-actions", children: [
        /* @__PURE__ */ u$1(
          "button",
          {
            className: "asset-btn copy",
            onClick: () => handleCopy(item),
            title: "Copy",
            children: copiedId === item.id ? "✓" : "📋"
          }
        ),
        /* @__PURE__ */ u$1(
          "button",
          {
            className: "asset-btn remove",
            onClick: () => removeItem(item.id),
            title: "Remove",
            children: "✕"
          }
        )
      ] })
    ] }, item.id)) }) })
  ] });
}
function saveToLibrary(item) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["library"], (data) => {
      const library = data.library || [];
      const exists = library.some((existing) => {
        if (existing.type !== item.type) return false;
        if (item.type === "color") return existing.data.hex === item.data.hex;
        if (item.type === "font") return existing.data.family === item.data.family;
        if (item.type === "svg") return existing.data.code === item.data.code;
        if (item.type === "image") return existing.data.src === item.data.src;
        return false;
      });
      if (exists) {
        resolve({ saved: false, reason: "duplicate" });
        return;
      }
      const newItem = {
        id: `lib_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: item.type,
        name: item.name || "",
        data: item.data,
        sourceUrl: item.sourceUrl || "",
        savedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      library.unshift(newItem);
      chrome.storage.local.set({ library }, () => {
        pushItem(newItem).catch(() => {
        });
        resolve({ saved: true, item: newItem });
      });
    });
  });
}
async function startUpgrade(plan) {
  const supabase = await getSupabase();
  if (!supabase) {
    window.open("https://designgrab.app/pricing", "_blank");
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.open("https://designgrab.app/pricing", "_blank");
    return;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        plan,
        successUrl: "https://designgrab.app/success?session_id={CHECKOUT_SESSION_ID}",
        cancelUrl: "https://designgrab.app/pricing"
      })
    });
    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_blank");
    } else {
      console.error("[DesignGrab] Checkout error:", data.error);
      window.open("https://designgrab.app/pricing", "_blank");
    }
  } catch (err) {
    console.error("[DesignGrab] Checkout error:", err);
    window.open("https://designgrab.app/pricing", "_blank");
  }
}
function AssetsTab({ assets, onExtract }) {
  const [filter, setFilter] = d("all");
  const [copiedId, setCopiedId] = d(null);
  const [savedId, setSavedId] = d(null);
  const handleSaveAsset = (item, index) => {
    const saveData = item._type === "svg" ? { type: "svg", name: item.id || `SVG ${index + 1}`, data: { code: item.code, viewBox: item.viewBox } } : { type: "image", name: getFilename(item.src, item._type), data: { src: item.src, width: item.width, height: item.height } };
    saveToLibrary({ ...saveData, sourceUrl: item.src || "" }).then((res) => {
      if (res.saved) {
        setSavedId(`save-${index}`);
        setTimeout(() => setSavedId(null), 1500);
      }
    });
  };
  if (!assets) {
    return /* @__PURE__ */ u$1("div", { class: "assets-empty", children: [
      /* @__PURE__ */ u$1("div", { class: "empty-icon", children: /* @__PURE__ */ u$1("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", children: [
        /* @__PURE__ */ u$1("rect", { x: "6", y: "6", width: "16", height: "16", rx: "3", stroke: "#3f3f46", "stroke-width": "2" }),
        /* @__PURE__ */ u$1("rect", { x: "26", y: "6", width: "16", height: "16", rx: "3", stroke: "#3f3f46", "stroke-width": "2" }),
        /* @__PURE__ */ u$1("rect", { x: "6", y: "26", width: "16", height: "16", rx: "3", stroke: "#3f3f46", "stroke-width": "2" }),
        /* @__PURE__ */ u$1("rect", { x: "26", y: "26", width: "16", height: "16", rx: "3", stroke: "#6366f1", "stroke-width": "2" }),
        /* @__PURE__ */ u$1("path", { d: "M30 32L34 36L38 30", stroke: "#6366f1", "stroke-width": "2", "stroke-linecap": "round" })
      ] }) }),
      /* @__PURE__ */ u$1("h3", { class: "empty-title", children: "No assets extracted" }),
      /* @__PURE__ */ u$1("p", { class: "empty-text", children: 'Click "Extract Assets" to scan the current page for images, SVGs, and videos.' }),
      /* @__PURE__ */ u$1("button", { class: "empty-btn", onClick: onExtract, children: "🖼 Extract Assets" })
    ] });
  }
  const allImages = assets.images || [];
  const allSvgs = assets.svgs || [];
  const allVideos = assets.videos || [];
  const total = allImages.length + allSvgs.length + allVideos.length;
  const filteredItems = filter === "all" ? [...allImages.map((i2) => ({ ...i2, _type: "image" })), ...allSvgs.map((s2) => ({ ...s2, _type: "svg" })), ...allVideos.map((v2) => ({ ...v2, _type: "video" }))] : filter === "images" ? allImages.map((i2) => ({ ...i2, _type: "image" })) : filter === "svgs" ? allSvgs.map((s2) => ({ ...s2, _type: "svg" })) : allVideos.map((v2) => ({ ...v2, _type: "video" }));
  const [downloadBlock, setDownloadBlock] = d(null);
  const handleDownload = async (item) => {
    const limit = await checkLimit("download");
    if (!limit.allowed) {
      setDownloadBlock(limit);
      return;
    }
    setDownloadBlock(null);
    if (item._type === "svg" && item.code) {
      const blob = new Blob([item.code], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      chrome.runtime.sendMessage({
        type: "DOWNLOAD_FILE",
        payload: { url, filename: `${item.id || "icon"}.svg` }
      });
      URL.revokeObjectURL(url);
    } else if (item.src) {
      const filename = getFilename(item.src, item._type);
      chrome.runtime.sendMessage({
        type: "DOWNLOAD_FILE",
        payload: { url: item.src, filename }
      });
    }
    await recordUsage("download");
  };
  const handleCopySVG = (svg, index) => {
    navigator.clipboard.writeText(svg.code).then(() => {
      setCopiedId(`svg-${index}`);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };
  return /* @__PURE__ */ u$1("div", { class: "assets-content", children: [
    /* @__PURE__ */ u$1("div", { class: "assets-stats", children: [
      /* @__PURE__ */ u$1("span", { class: "stats-total", children: [
        total,
        " assets found"
      ] }),
      /* @__PURE__ */ u$1("button", { class: "refresh-btn", onClick: onExtract, title: "Re-scan page", children: "🔄" })
    ] }),
    /* @__PURE__ */ u$1("div", { class: "assets-filters", children: [
      /* @__PURE__ */ u$1("button", { class: `filter-btn ${filter === "all" ? "active" : ""}`, onClick: () => setFilter("all"), children: [
        "All (",
        total,
        ")"
      ] }),
      /* @__PURE__ */ u$1("button", { class: `filter-btn ${filter === "images" ? "active" : ""}`, onClick: () => setFilter("images"), children: [
        "Images (",
        allImages.length,
        ")"
      ] }),
      /* @__PURE__ */ u$1("button", { class: `filter-btn ${filter === "svgs" ? "active" : ""}`, onClick: () => setFilter("svgs"), children: [
        "SVGs (",
        allSvgs.length,
        ")"
      ] }),
      allVideos.length > 0 && /* @__PURE__ */ u$1("button", { class: `filter-btn ${filter === "videos" ? "active" : ""}`, onClick: () => setFilter("videos"), children: [
        "Videos (",
        allVideos.length,
        ")"
      ] })
    ] }),
    downloadBlock && /* @__PURE__ */ u$1("div", { class: "usage-limit-banner", children: [
      /* @__PURE__ */ u$1("div", { class: "usage-limit-text", children: downloadBlock.requiresAuth ? "Sign in with Google in Settings to download assets" : /* @__PURE__ */ u$1(k$1, { children: [
        "You've used ",
        /* @__PURE__ */ u$1("strong", { children: [
          downloadBlock.current,
          "/",
          downloadBlock.limit
        ] }),
        " free downloads this month"
      ] }) }),
      !downloadBlock.requiresAuth && /* @__PURE__ */ u$1("button", { class: "upgrade-btn", onClick: () => startUpgrade("pro"), children: "Upgrade to Pro" })
    ] }),
    /* @__PURE__ */ u$1("div", { class: "assets-grid", children: filteredItems.map((item, i2) => /* @__PURE__ */ u$1("div", { class: "asset-card", children: [
      /* @__PURE__ */ u$1("div", { class: "asset-preview", children: [
        item._type === "image" && /* @__PURE__ */ u$1("img", { src: item.src, alt: item.alt || "", loading: "lazy" }),
        item._type === "svg" && item.code && /* @__PURE__ */ u$1("div", { class: "svg-preview", dangerouslySetInnerHTML: { __html: item.code } }),
        item._type === "svg" && !item.code && item.src && /* @__PURE__ */ u$1("img", { src: item.src, alt: "", loading: "lazy" }),
        item._type === "video" && /* @__PURE__ */ u$1("div", { class: "video-preview", children: item.poster ? /* @__PURE__ */ u$1("img", { src: item.poster, alt: "" }) : /* @__PURE__ */ u$1("span", { class: "video-icon", children: "🎬" }) }),
        /* @__PURE__ */ u$1("span", { class: "asset-type-badge", children: item._type.toUpperCase() })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "asset-info", children: [
        item.width > 0 && item.height > 0 && /* @__PURE__ */ u$1("span", { class: "asset-dims", children: [
          item.width,
          "×",
          item.height
        ] }),
        item.format && item.format !== "unknown" && /* @__PURE__ */ u$1("span", { class: "asset-format", children: item.format }),
        item.size && item.size !== "—" && /* @__PURE__ */ u$1("span", { class: "asset-size", children: item.size }),
        /* @__PURE__ */ u$1("span", { class: "asset-location", children: item.location })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "asset-actions", children: [
        /* @__PURE__ */ u$1("button", { class: "asset-btn download", onClick: () => handleDownload(item), title: "Download", children: "⬇" }),
        item._type === "svg" && item.code && /* @__PURE__ */ u$1(
          "button",
          {
            class: "asset-btn copy",
            onClick: () => handleCopySVG(item, i2),
            title: "Copy SVG code",
            children: copiedId === `svg-${i2}` ? "✓" : "📋"
          }
        ),
        /* @__PURE__ */ u$1(
          "button",
          {
            class: "asset-btn save",
            onClick: () => handleSaveAsset(item, i2),
            title: "Save to Library",
            children: savedId === `save-${i2}` ? "✓" : "♡"
          }
        ),
        item.src && /* @__PURE__ */ u$1(
          "button",
          {
            class: "asset-btn open",
            onClick: () => window.open(item.src, "_blank"),
            title: "Open in new tab",
            children: "↗"
          }
        )
      ] })
    ] }, i2)) }),
    filteredItems.length === 0 && /* @__PURE__ */ u$1("div", { class: "assets-no-results", children: /* @__PURE__ */ u$1("p", { children: [
      "No ",
      filter,
      " found on this page."
    ] }) })
  ] });
}
function getFilename(url, type) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/");
    const name = parts[parts.length - 1];
    return name || `asset.${type === "image" ? "png" : type}`;
  } catch {
    return `asset.${type === "image" ? "png" : type}`;
  }
}
function ColorsTab() {
  const [data, setData] = d(null);
  const [isLoading, setIsLoading] = d(false);
  const [error, setError] = d(null);
  const [copiedHex, setCopiedHex] = d(null);
  const [savedHex, setSavedHex] = d(null);
  const analyzeColors = () => {
    setIsLoading(true);
    setError(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "ANALYZE_COLORS" }, (response) => {
        setIsLoading(false);
        if (chrome.runtime.lastError) {
          setError("Could not connect to page. Try refreshing.");
        } else if (response && response.success) {
          setData(response.data);
        } else {
          setError(response?.error || "Failed to analyze colors.");
        }
      });
    });
  };
  y(() => {
    analyzeColors();
  }, []);
  const handleCopy = (hex) => {
    copyToClipboard(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };
  if (isLoading) {
    return /* @__PURE__ */ u$1("div", { className: "panel-loading", children: [
      /* @__PURE__ */ u$1("div", { className: "spinner" }),
      /* @__PURE__ */ u$1("p", { children: "Analyzing page colors..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ u$1("div", { className: "panel-error", children: [
      /* @__PURE__ */ u$1("p", { children: error }),
      /* @__PURE__ */ u$1("button", { className: "panel-btn", onClick: analyzeColors, children: "Retry" })
    ] });
  }
  if (!data) return null;
  const handleSaveColor = (hex, name) => {
    saveToLibrary({
      type: "color",
      name: name || hex,
      data: { hex },
      sourceUrl: ""
    }).then((res) => {
      if (res.saved) {
        setSavedHex(hex);
        setTimeout(() => setSavedHex(null), 1500);
      }
    });
  };
  const ColorSwatch = ({ hex, name }) => /* @__PURE__ */ u$1("div", { className: "color-card", children: [
    /* @__PURE__ */ u$1("div", { className: "color-card-swatch", style: { backgroundColor: hex }, onClick: () => handleCopy(hex), children: copiedHex === hex && /* @__PURE__ */ u$1("span", { className: "copy-feedback", children: "Copied" }) }),
    /* @__PURE__ */ u$1("div", { className: "color-card-info", onClick: () => handleCopy(hex), children: [
      /* @__PURE__ */ u$1("span", { className: "color-hex", children: hex }),
      /* @__PURE__ */ u$1("span", { className: "color-name", children: name || "Color" })
    ] }),
    /* @__PURE__ */ u$1(
      "button",
      {
        className: "save-btn",
        onClick: (e2) => {
          e2.stopPropagation();
          handleSaveColor(hex, name);
        },
        title: "Save to Library",
        children: savedHex === hex ? "✓" : "♡"
      }
    )
  ] });
  return /* @__PURE__ */ u$1("div", { className: "colors-tab fade-in", children: [
    /* @__PURE__ */ u$1("div", { className: "panel-sticky-header", children: /* @__PURE__ */ u$1("div", { className: "stats-row", children: [
      /* @__PURE__ */ u$1("span", { children: [
        data.uniqueColors,
        " unique colors"
      ] }),
      /* @__PURE__ */ u$1("button", { className: "icon-btn", onClick: analyzeColors, title: "Refresh", children: "↻" })
    ] }) }),
    /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: [
      data.backgrounds.length > 0 && /* @__PURE__ */ u$1("div", { className: "color-section", children: [
        /* @__PURE__ */ u$1("h3", { className: "section-title", children: "Backgrounds" }),
        /* @__PURE__ */ u$1("div", { className: "color-grid", children: data.backgrounds.map((hex) => /* @__PURE__ */ u$1(ColorSwatch, { hex, name: "Background" }, hex)) })
      ] }),
      data.textColors.length > 0 && /* @__PURE__ */ u$1("div", { className: "color-section", children: [
        /* @__PURE__ */ u$1("h3", { className: "section-title", children: "Text Colors" }),
        /* @__PURE__ */ u$1("div", { className: "color-grid", children: data.textColors.map((hex) => /* @__PURE__ */ u$1(ColorSwatch, { hex, name: "Text" }, hex)) })
      ] }),
      data.accentColors.length > 0 && /* @__PURE__ */ u$1("div", { className: "color-section", children: [
        /* @__PURE__ */ u$1("h3", { className: "section-title", children: "Accents" }),
        /* @__PURE__ */ u$1("div", { className: "color-grid", children: data.accentColors.map((hex) => /* @__PURE__ */ u$1(ColorSwatch, { hex, name: "Accent" }, hex)) })
      ] }),
      data.contrastIssues.length > 0 && /* @__PURE__ */ u$1("div", { className: "color-section", children: [
        /* @__PURE__ */ u$1("h3", { className: "section-title text-orange", children: [
          "Accessibility Issues (",
          data.contrastIssues.length,
          ")"
        ] }),
        /* @__PURE__ */ u$1("div", { className: "contrast-list", children: data.contrastIssues.map((issue, i2) => /* @__PURE__ */ u$1("div", { className: "contrast-card", children: [
          /* @__PURE__ */ u$1("div", { className: "contrast-preview", style: { backgroundColor: issue.bg, color: issue.fg }, children: "Aa" }),
          /* @__PURE__ */ u$1("div", { className: "contrast-info", children: [
            /* @__PURE__ */ u$1("div", { className: "contrast-ratio", children: [
              /* @__PURE__ */ u$1("span", { className: "text-red", children: "Fail" }),
              " — Ratio: ",
              issue.ratio,
              ":1"
            ] }),
            /* @__PURE__ */ u$1("div", { className: "contrast-hexes", children: [
              issue.fg,
              " on ",
              issue.bg
            ] })
          ] })
        ] }, i2)) })
      ] }),
      /* @__PURE__ */ u$1("div", { className: "color-section", children: [
        /* @__PURE__ */ u$1("h3", { className: "section-title", children: "Full Palette" }),
        /* @__PURE__ */ u$1("div", { className: "palette-grid", children: data.palette.map(({ hex, count }) => /* @__PURE__ */ u$1(
          "div",
          {
            className: "palette-swatch",
            style: { backgroundColor: hex },
            title: `${hex} (${count} uses)`,
            onClick: () => handleCopy(hex)
          },
          hex
        )) })
      ] })
    ] })
  ] });
}
function FontsTab() {
  const [data, setData] = d(null);
  const [isLoading, setIsLoading] = d(false);
  const [error, setError] = d(null);
  const [savedFont, setSavedFont] = d(null);
  const analyzeFonts = () => {
    setIsLoading(true);
    setError(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "ANALYZE_FONTS" }, (response) => {
        setIsLoading(false);
        if (chrome.runtime.lastError) {
          setError("Could not connect to page. Try refreshing.");
        } else if (response && response.success) {
          setData(response.data);
        } else {
          setError(response?.error || "Failed to analyze fonts.");
        }
      });
    });
  };
  y(() => {
    analyzeFonts();
  }, []);
  if (isLoading) {
    return /* @__PURE__ */ u$1("div", { className: "panel-loading", children: [
      /* @__PURE__ */ u$1("div", { className: "spinner" }),
      /* @__PURE__ */ u$1("p", { children: "Scanning typography..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ u$1("div", { className: "panel-error", children: [
      /* @__PURE__ */ u$1("p", { children: error }),
      /* @__PURE__ */ u$1("button", { className: "panel-btn", onClick: analyzeFonts, children: "Retry" })
    ] });
  }
  const handleSaveFont = (font) => {
    saveToLibrary({
      type: "font",
      name: font.family,
      data: { family: font.family, weights: font.weights, source: font.source },
      sourceUrl: ""
    }).then((res) => {
      if (res.saved) {
        setSavedFont(font.family);
        setTimeout(() => setSavedFont(null), 1500);
      }
    });
  };
  if (!data) return null;
  return /* @__PURE__ */ u$1("div", { className: "fonts-tab fade-in", children: [
    /* @__PURE__ */ u$1("div", { className: "panel-sticky-header", children: /* @__PURE__ */ u$1("div", { className: "stats-row", children: [
      /* @__PURE__ */ u$1("span", { children: [
        data.fonts.length,
        " font families detected"
      ] }),
      /* @__PURE__ */ u$1("button", { className: "icon-btn", onClick: analyzeFonts, title: "Refresh", children: "↻" })
    ] }) }),
    /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: [
      /* @__PURE__ */ u$1("div", { className: "font-section", children: [
        /* @__PURE__ */ u$1("h3", { className: "section-title", children: "Font Families" }),
        /* @__PURE__ */ u$1("div", { className: "font-list", children: data.fonts.map((font, i2) => /* @__PURE__ */ u$1("div", { className: "font-card", children: [
          /* @__PURE__ */ u$1("div", { className: "font-header", children: [
            /* @__PURE__ */ u$1("span", { className: "font-name", style: { fontFamily: font.family }, children: font.family }),
            /* @__PURE__ */ u$1("div", { className: "font-header-actions", children: [
              /* @__PURE__ */ u$1("span", { className: `font-badge tag-${font.source}`, children: font.source }),
              /* @__PURE__ */ u$1(
                "button",
                {
                  className: "save-btn",
                  onClick: () => handleSaveFont(font),
                  title: "Save to Library",
                  children: savedFont === font.family ? "✓" : "♡"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ u$1("div", { className: "font-metrics", children: [
            /* @__PURE__ */ u$1("div", { className: "metric-group", children: [
              /* @__PURE__ */ u$1("span", { className: "metric-label", children: "Weights" }),
              /* @__PURE__ */ u$1("span", { className: "metric-value", children: font.weights.join(", ") })
            ] }),
            /* @__PURE__ */ u$1("div", { className: "metric-group", children: [
              /* @__PURE__ */ u$1("span", { className: "metric-label", children: "Usage" }),
              /* @__PURE__ */ u$1("span", { className: "metric-value", children: [
                [
                  font.usage.headings && "Headings",
                  font.usage.body && "Body",
                  font.usage.code && "Code"
                ].filter(Boolean).join(", ") || "Various",
                " (",
                font.usage.count,
                " elements)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ u$1(
            "div",
            {
              className: "font-preview-text",
              style: {
                fontFamily: font.family,
                fontWeight: font.weights.includes(400) ? 400 : font.weights[0]
              },
              children: "The quick brown fox jumps over the lazy dog"
            }
          )
        ] }, i2)) })
      ] }),
      Object.keys(data.fontScale).length > 0 && /* @__PURE__ */ u$1("div", { className: "font-section", children: [
        /* @__PURE__ */ u$1("h3", { className: "section-title", children: "Typography Scale" }),
        /* @__PURE__ */ u$1("div", { className: "scale-list", children: ["h1", "h2", "h3", "h4", "body", "small", "code"].map((tag) => {
          if (!data.fontScale[tag]) return null;
          const [size, weight] = data.fontScale[tag].split(" / ");
          return /* @__PURE__ */ u$1("div", { className: "scale-row", children: [
            /* @__PURE__ */ u$1("span", { className: "scale-tag", children: tag }),
            /* @__PURE__ */ u$1("span", { className: "scale-size", children: size }),
            /* @__PURE__ */ u$1("span", { className: "scale-weight", children: weight })
          ] }, tag);
        }) })
      ] })
    ] })
  ] });
}
function buildUltraPrompt(context) {
  let prompt = `I want to recreate this web component/page exactly 1:1. Here is the complete extracted context from the original site:

`;
  if (context.html) {
    prompt += `## 1. Structure (HTML)
\`\`\`html
${context.html}
\`\`\`

`;
  }
  if (context.css) {
    prompt += `## 2. Styling (CSS)
\`\`\`css
${context.css}
\`\`\`

`;
  }
  if (context.colors || context.fonts) {
    prompt += `## 3. Design Tokens
`;
    if (context.colors) {
      prompt += `### Colors
`;
      if (context.colors.backgrounds?.length) prompt += `- Backgrounds: ${context.colors.backgrounds.join(", ")}
`;
      if (context.colors.textColors?.length) prompt += `- Text Colors: ${context.colors.textColors.join(", ")}
`;
      if (context.colors.accentColors?.length) prompt += `- Accent Colors: ${context.colors.accentColors.join(", ")}
`;
      prompt += `
`;
    }
    if (context.fonts?.fonts?.length) {
      prompt += `### Typography
`;
      context.fonts.fonts.forEach((f2) => {
        prompt += `- ${f2.family} (Weights: ${f2.weights.join(", ")})
`;
      });
      prompt += `
`;
    }
  }
  if (context.animations) {
    prompt += `## 4. Animations
`;
    if (context.animations.keyframesCSS) prompt += `\`\`\`css
${context.animations.keyframesCSS}
\`\`\`
`;
    if (context.animations.items?.length) {
      context.animations.items.forEach((a2) => {
        prompt += `- [${a2.type}] on \`${a2.element}\`: ${a2.transition || a2.name}
`;
      });
      prompt += `
`;
    }
  }
  if (context.assets) {
    prompt += `## 5. Assets (SVGs & Images)
`;
    if (context.assets.svgs?.length) {
      prompt += `### SVGs
`;
      context.assets.svgs.forEach((svg, i2) => {
        prompt += `SVG ${i2 + 1}:
\`\`\`html
${svg.html}
\`\`\`

`;
      });
    }
    if (context.assets.images?.length) {
      prompt += `### Images
`;
      context.assets.images.forEach((img) => {
        prompt += `- URL: ${img.url} (Type: ${img.type}, Size: ${img.size || "unknown"})
`;
      });
      prompt += `
`;
    }
  }
  prompt += `Please perfectly recreate this component. Focus on 1:1 pixel perfection for structure, colors, fonts, SVGs, and animations. Use React and Tailwind CSS (or whichever tool/framework applies).`;
  return prompt;
}
function CodeTab({ pinnedElement, initialMode = "html-css" }) {
  const [data, setData] = d(null);
  const [isLoading, setIsLoading] = d(false);
  const [error, setError] = d(null);
  const [mode, setMode] = d(initialMode);
  const [figmaSubMode, setFigmaSubMode] = d("svg");
  const [copied, setCopied] = d(false);
  const [usageBlock, setUsageBlock] = d(null);
  const [childElements, setChildElements] = d([]);
  const [selectedDiv, setSelectedDiv] = d("root");
  const [isLoggedIn, setIsLoggedIn] = d(false);
  const codeRef = A(null);
  const isAIMode = mode === "react" || mode === "vue";
  const isFigmaMode = mode === "figma";
  const isAIPromptSubMode = isFigmaMode && figmaSubMode === "ai-prompt";
  y(() => {
    getAuthState().then((state) => setIsLoggedIn(state.isLoggedIn)).catch(() => {
    });
  }, []);
  y(() => {
    if (isFigmaMode) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_CHILD_ELEMENTS" }, (response) => {
          if (chrome.runtime.lastError || !response?.success) return;
          setChildElements(response.children || []);
          setSelectedDiv("root");
        });
      });
    }
  }, [isFigmaMode, pinnedElement]);
  const exportElement = async () => {
    if (isAIMode || isAIPromptSubMode) {
      if (!isLoggedIn) {
        setError("Sign in with Google in the Settings tab to use AI exports.");
        return;
      }
      const limit = await checkLimit("ai_export");
      if (!limit.allowed) {
        setUsageBlock(limit);
        return;
      }
    } else if (!isFigmaMode) {
      const limit = await checkLimit("code_export");
      if (!limit.allowed) {
        setUsageBlock(limit);
        return;
      }
    }
    setIsLoading(true);
    setError(null);
    setUsageBlock(null);
    if (isFigmaMode && figmaSubMode === "svg") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "EXPORT_FIGMA_SVG",
          payload: { childIndex: selectedDiv === "root" ? null : parseInt(selectedDiv) }
        }, async (response) => {
          setIsLoading(false);
          if (chrome.runtime.lastError) {
            setError("Could not connect to page. Try pinning an element first.");
          } else if (response && response.success) {
            setData(response.data);
          } else {
            setError(response?.error || "Failed to export SVG for Figma.");
          }
        });
      });
    } else if (isFigmaMode && figmaSubMode === "responsive") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "EXPORT_RESPONSIVE_HTML",
          payload: { childIndex: selectedDiv === "root" ? null : parseInt(selectedDiv) }
        }, async (response) => {
          setIsLoading(false);
          if (chrome.runtime.lastError) {
            setError("Could not connect to page. Try pinning an element first.");
          } else if (response && response.success) {
            setData(response.data);
          } else {
            setError(response?.error || "Failed to export responsive HTML.");
          }
        });
      });
    } else if (isFigmaMode && figmaSubMode === "ai-prompt") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
          setIsLoading(false);
          setError("No active tab found. Try again.");
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { type: "EXPORT_FULL_CONTEXT" }, async (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            setIsLoading(false);
            setError("Could not connect to page. Try pinning an element first.");
            return;
          }
          let didRespond = false;
          const timeoutId = setTimeout(() => {
            if (!didRespond) {
              didRespond = true;
              setIsLoading(false);
              setError("AI description timed out. Please try again.");
            }
          }, 6e4);
          chrome.runtime.sendMessage({
            type: "AI_DESCRIBE_COMPONENT",
            payload: { context: response.context }
          }, async (aiData) => {
            if (didRespond) return;
            didRespond = true;
            clearTimeout(timeoutId);
            setIsLoading(false);
            if (chrome.runtime.lastError) {
              setError("AI description failed: could not reach service worker.");
              return;
            }
            if (aiData?.error) {
              setError(aiData.error);
            } else {
              setData({ mode: "ai-prompt", description: aiData.description });
              await recordUsage("ai_export");
            }
          });
        });
      });
    } else if (mode === "ultra") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "EXPORT_FULL_CONTEXT" }, async (response) => {
          setIsLoading(false);
          if (chrome.runtime.lastError || !response?.success) {
            setError("Could not connect to page. Try pinning an element first.");
            return;
          }
          const prompt = buildUltraPrompt(response.context);
          setData({ mode: "ultra", prompt });
          await recordUsage("code_export");
        });
      });
    } else if (isAIMode) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
          setIsLoading(false);
          setError("No active tab found. Try again.");
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { type: "EXPORT_FULL_CONTEXT" }, async (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            setIsLoading(false);
            setError("Could not connect to page. Try pinning an element first.");
            return;
          }
          let didRespond = false;
          const timeoutId = setTimeout(() => {
            if (!didRespond) {
              didRespond = true;
              setIsLoading(false);
              setError("AI export timed out. Please try again.");
            }
          }, 6e4);
          chrome.runtime.sendMessage({
            type: "AI_EXPORT",
            payload: { context: response.context, framework: mode }
          }, async (aiData) => {
            if (didRespond) return;
            didRespond = true;
            clearTimeout(timeoutId);
            setIsLoading(false);
            if (chrome.runtime.lastError) {
              setError("AI export failed: could not reach service worker.");
              return;
            }
            if (aiData?.error) {
              setError(aiData.error);
            } else {
              setData({ mode: `ai-${mode}`, code: aiData.code, framework: aiData.framework });
              await recordUsage("ai_export");
            }
          });
        });
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "EXPORT_CODE", payload: { mode } }, async (response) => {
          setIsLoading(false);
          if (chrome.runtime.lastError) {
            setError("Could not connect to page. Try pinning an element first.");
          } else if (response && response.success) {
            setData(response.data);
            await recordUsage("code_export");
          } else {
            setError(response?.error || "Failed to export code.");
          }
        });
      });
    }
  };
  const generateTailwindConfig = () => {
    setIsLoading(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "GENERATE_TAILWIND" }, (response) => {
        setIsLoading(false);
        if (response && response.success) {
          setData({ mode: "tailwind-config", config: response.data });
        } else {
          setError(response?.error || "Failed to generate config.");
        }
      });
    });
  };
  const handleCopy = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2e3);
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };
  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (e2) {
    }
    textarea.remove();
  };
  const handleSelectAll = () => {
    const el = codeRef.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  const switchMode = (newMode) => {
    setMode(newMode);
    setData(null);
    setError(null);
    setUsageBlock(null);
    setChildElements([]);
    setSelectedDiv("root");
  };
  const switchFigmaSubMode = (subMode) => {
    setFigmaSubMode(subMode);
    setData(null);
    setError(null);
    setUsageBlock(null);
  };
  const getExportLabel = () => {
    if (isLoading) {
      if (isAIMode || isAIPromptSubMode) return "AI generating...";
      return "Exporting...";
    }
    if (isFigmaMode) {
      if (figmaSubMode === "svg") return pinnedElement ? `Export SVG <${pinnedElement.tagName}>` : "Export SVG";
      if (figmaSubMode === "responsive") return pinnedElement ? `Export HTML <${pinnedElement.tagName}>` : "Export HTML+CSS";
      if (figmaSubMode === "ai-prompt") return pinnedElement ? `Describe <${pinnedElement.tagName}>` : "AI Describe";
    }
    if (pinnedElement) return `${isAIMode ? "AI " : ""}Export <${pinnedElement.tagName}>`;
    if (isAIMode) return "AI Export";
    if (mode === "ultra") return "Generate Mega-Prompt";
    return "Export Code";
  };
  return /* @__PURE__ */ u$1("div", { className: "code-tab fade-in", children: [
    /* @__PURE__ */ u$1("div", { className: "panel-sticky-header", children: [
      /* @__PURE__ */ u$1("div", { className: "code-actions-row", children: /* @__PURE__ */ u$1("div", { className: "segmented-control", children: [
        /* @__PURE__ */ u$1("button", { className: mode === "html-css" ? "active" : "", onClick: () => switchMode("html-css"), children: "HTML+CSS" }),
        /* @__PURE__ */ u$1("button", { className: mode === "html-tailwind" ? "active" : "", onClick: () => switchMode("html-tailwind"), children: "Tailwind" }),
        /* @__PURE__ */ u$1("button", { className: mode === "react" ? "active" : "", onClick: () => switchMode("react"), children: "React" }),
        /* @__PURE__ */ u$1("button", { className: mode === "vue" ? "active" : "", onClick: () => switchMode("vue"), children: "Vue" }),
        /* @__PURE__ */ u$1("button", { className: mode === "figma" ? "active" : "", onClick: () => switchMode("figma"), children: "Figma" }),
        /* @__PURE__ */ u$1("button", { className: mode === "ultra" ? "active" : "", onClick: () => switchMode("ultra"), children: "Ultra ⚡️" })
      ] }) }),
      isFigmaMode && /* @__PURE__ */ u$1("div", { className: "code-actions-row", style: { paddingTop: "4px" }, children: /* @__PURE__ */ u$1("div", { className: "segmented-control figma-sub-control", style: { fontSize: "11px" }, children: [
        /* @__PURE__ */ u$1("button", { className: figmaSubMode === "svg" ? "active" : "", onClick: () => switchFigmaSubMode("svg"), children: "SVG" }),
        /* @__PURE__ */ u$1("button", { className: figmaSubMode === "responsive" ? "active" : "", onClick: () => switchFigmaSubMode("responsive"), children: "HTML+CSS" }),
        /* @__PURE__ */ u$1("button", { className: figmaSubMode === "ai-prompt" ? "active" : "", onClick: () => switchFigmaSubMode("ai-prompt"), children: "AI Prompt" })
      ] }) }),
      isFigmaMode && figmaSubMode !== "ai-prompt" && childElements.length > 0 && /* @__PURE__ */ u$1("div", { className: "code-actions-row", style: { paddingTop: "4px" }, children: [
        /* @__PURE__ */ u$1("label", { style: { fontSize: "11px", opacity: 0.8, marginRight: "6px", whiteSpace: "nowrap" }, children: "Target:" }),
        /* @__PURE__ */ u$1(
          "select",
          {
            value: selectedDiv,
            onChange: (e2) => setSelectedDiv(e2.target.value),
            style: {
              flex: 1,
              padding: "4px 8px",
              fontSize: "11px",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              cursor: "pointer"
            },
            children: [
              /* @__PURE__ */ u$1("option", { value: "root", children: "Entire pinned element" }),
              childElements.map((child, i2) => /* @__PURE__ */ u$1("option", { value: i2, children: [
                child.tag,
                child.id ? `#${child.id}` : "",
                child.classes ? `.${child.classes}` : "",
                " — ",
                child.text || `${child.childCount} children`
              ] }, i2))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ u$1("div", { className: "code-actions-row", children: [
        /* @__PURE__ */ u$1("button", { className: "export-btn", onClick: exportElement, disabled: isLoading, children: getExportLabel() }),
        !isAIMode && !isFigmaMode && mode !== "ultra" && /* @__PURE__ */ u$1("button", { className: "panel-btn outline", onClick: generateTailwindConfig, style: { flexShrink: 0 }, children: "Config" })
      ] }),
      isAIMode && /* @__PURE__ */ u$1("div", { className: `ai-mode-hint ${!isLoggedIn ? "ai-mode-warning" : ""}`, children: isLoggedIn ? `Powered by Gemini — generates a ${mode === "react" ? "React TSX" : "Vue SFC"} component with Tailwind` : "Sign in with Google in Settings to use AI exports" }),
      isAIPromptSubMode && /* @__PURE__ */ u$1("div", { className: `ai-mode-hint ${!isLoggedIn ? "ai-mode-warning" : ""}`, children: isLoggedIn ? "Powered by Gemini — generates a detailed recreation prompt for this component" : "Sign in with Google in Settings to use AI features" }),
      isFigmaMode && figmaSubMode === "responsive" && /* @__PURE__ */ u$1("div", { className: "ai-mode-hint", children: "Generates responsive HTML+CSS with flexbox/grid, relative units, and design tokens" })
    ] }),
    /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: [
      usageBlock && /* @__PURE__ */ u$1("div", { className: "usage-limit-banner", children: [
        /* @__PURE__ */ u$1("div", { className: "usage-limit-text", children: usageBlock.requiresAuth ? "Sign in with Google in Settings to use exports" : /* @__PURE__ */ u$1(k$1, { children: [
          "You've used ",
          /* @__PURE__ */ u$1("strong", { children: [
            usageBlock.current,
            "/",
            usageBlock.limit
          ] }),
          " free ",
          isAIMode || isAIPromptSubMode ? "AI" : "code",
          " exports this month"
        ] }) }),
        !usageBlock.requiresAuth && /* @__PURE__ */ u$1("button", { className: "upgrade-btn", onClick: () => startUpgrade("pro"), children: "Upgrade to Pro" })
      ] }),
      error && /* @__PURE__ */ u$1("div", { className: "panel-error", children: /* @__PURE__ */ u$1("p", { children: error }) }),
      isLoading && (isAIMode || isAIPromptSubMode) && /* @__PURE__ */ u$1("div", { className: "panel-loading", children: [
        /* @__PURE__ */ u$1("div", { className: "spinner" }),
        /* @__PURE__ */ u$1("p", { children: isAIPromptSubMode ? "Generating component description..." : `Generating ${mode === "react" ? "React" : "Vue"} component...` }),
        /* @__PURE__ */ u$1("p", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" }, children: "This may take 10-20 seconds" })
      ] }),
      !data && !error && !isLoading && /* @__PURE__ */ u$1("div", { className: "code-empty-state", children: [
        /* @__PURE__ */ u$1("div", { className: "empty-icon", children: "</>" }),
        /* @__PURE__ */ u$1("p", { className: "empty-text", children: "Pin an element on the page using the Inspector, then click Export." })
      ] }),
      data?.mode === "html-css" && /* @__PURE__ */ u$1("div", { className: "code-blocks", children: [
        /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", children: [
          /* @__PURE__ */ u$1("div", { className: "code-header", children: [
            /* @__PURE__ */ u$1("span", { children: "HTML" }),
            /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.html), children: copied ? "Copied!" : "Copy" })
          ] }),
          /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: data.html }) })
        ] }),
        /* @__PURE__ */ u$1("div", { className: "code-block-wrapper mt-3", children: [
          /* @__PURE__ */ u$1("div", { className: "code-header", children: [
            /* @__PURE__ */ u$1("span", { children: "CSS" }),
            /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.css), children: copied ? "Copied!" : "Copy" })
          ] }),
          /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: data.css }) })
        ] })
      ] }),
      data?.mode === "html-tailwind" && /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: [
          /* @__PURE__ */ u$1("span", { children: "Tailwind HTML" }),
          /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.html), children: copied ? "Copied!" : "Copy" })
        ] }),
        /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: data.html }) })
      ] }),
      (data?.mode === "ai-react" || data?.mode === "ai-vue") && /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: [
          /* @__PURE__ */ u$1("span", { children: [
            data.framework === "react" ? "Component.tsx" : "Component.vue",
            /* @__PURE__ */ u$1("span", { className: "code-badge", children: "AI Generated" })
          ] }),
          /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.code), children: copied ? "Copied!" : "Copy" })
        ] }),
        /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: data.code }) })
      ] }),
      data?.mode === "figma-svg" && /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: [
          /* @__PURE__ */ u$1("span", { children: [
            "Figma SVG",
            /* @__PURE__ */ u$1("span", { className: "code-badge", children: [
              data.width,
              "x",
              data.height
            ] })
          ] }),
          /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "6px" }, children: [
            /* @__PURE__ */ u$1("button", { onClick: handleSelectAll, children: "Select All" }),
            /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.svg), children: copied ? "Copied!" : "Copy" })
          ] })
        ] }),
        /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { ref: codeRef, children: data.svg }) }),
        /* @__PURE__ */ u$1("div", { style: { padding: "8px 12px", fontSize: "11px", opacity: 0.7, lineHeight: 1.5, borderTop: "1px solid var(--border)" }, children: "Copy the SVG above, then paste into Figma (Cmd+V / Ctrl+V). Figma will convert it to native layers, text, and frames. Hover/focus/active states are embedded as CSS in the SVG." })
      ] }),
      data?.mode === "figma-svg" && data.interactions && (data.interactions.states.length > 0 || data.interactions.transitions.length > 0) && /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", style: { marginTop: "10px" }, children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: /* @__PURE__ */ u$1("span", { children: [
          "Interactions",
          /* @__PURE__ */ u$1("span", { className: "code-badge", children: [
            data.interactions.states.length,
            " state",
            data.interactions.states.length !== 1 ? "s" : ""
          ] })
        ] }) }),
        /* @__PURE__ */ u$1("div", { style: { padding: "8px 12px", fontSize: "11px", lineHeight: 1.6 }, children: [
          data.interactions.transitions.length > 0 && /* @__PURE__ */ u$1("div", { style: { marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }, children: [
            /* @__PURE__ */ u$1("div", { style: { fontWeight: 600, opacity: 0.6, marginBottom: "3px", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.05em" }, children: "Transitions" }),
            data.interactions.transitions.map((t2, i2) => /* @__PURE__ */ u$1("div", { style: { fontFamily: "monospace", opacity: 0.85, marginBottom: "2px" }, children: t2 }, i2))
          ] }),
          data.interactions.states.map((item, i2) => /* @__PURE__ */ u$1("div", { style: { marginBottom: "10px" }, children: [
            /* @__PURE__ */ u$1("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }, children: [
              /* @__PURE__ */ u$1("span", { style: {
                background: item.state === "Hover" ? "#3b82f6" : item.state === "Active" ? "#ef4444" : "#8b5cf6",
                color: "#fff",
                borderRadius: "3px",
                padding: "1px 6px",
                fontSize: "10px",
                fontWeight: 600
              }, children: item.state }),
              /* @__PURE__ */ u$1("span", { style: { opacity: 0.5, fontFamily: "monospace", fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: item.selector })
            ] }),
            Object.entries(item.properties).map(([prop, val]) => /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "8px", paddingLeft: "8px", marginBottom: "2px" }, children: [
              /* @__PURE__ */ u$1("span", { style: { opacity: 0.55, minWidth: "120px", fontFamily: "monospace" }, children: prop }),
              /* @__PURE__ */ u$1("span", { style: { fontFamily: "monospace", opacity: 0.9 }, children: [
                (prop.includes("color") || prop === "box-shadow") && /* @__PURE__ */ u$1("span", { style: {
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  background: val,
                  borderRadius: "2px",
                  border: "1px solid rgba(128,128,128,0.3)",
                  marginRight: "4px",
                  verticalAlign: "middle"
                } }),
                val
              ] })
            ] }, prop))
          ] }, i2))
        ] })
      ] }),
      data?.mode === "responsive-html" && /* @__PURE__ */ u$1("div", { className: "code-blocks", children: [
        /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", children: [
          /* @__PURE__ */ u$1("div", { className: "code-header", children: [
            /* @__PURE__ */ u$1("span", { children: [
              "Responsive HTML",
              /* @__PURE__ */ u$1("span", { className: "code-badge", children: "Flexbox/Grid" })
            ] }),
            /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.html), children: copied ? "Copied!" : "Copy" })
          ] }),
          /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: data.html }) })
        ] }),
        /* @__PURE__ */ u$1("div", { className: "code-block-wrapper mt-3", children: [
          /* @__PURE__ */ u$1("div", { className: "code-header", children: [
            /* @__PURE__ */ u$1("span", { children: [
              "CSS",
              /* @__PURE__ */ u$1("span", { className: "code-badge", children: [
                data.tokensUsed?.colors?.length || 0,
                " colors, ",
                data.tokensUsed?.fonts?.length || 0,
                " fonts"
              ] })
            ] }),
            /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.css), children: copied ? "Copied!" : "Copy" })
          ] }),
          /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: data.css }) })
        ] }),
        /* @__PURE__ */ u$1("div", { style: { padding: "8px 12px", fontSize: "11px", opacity: 0.7, lineHeight: 1.5, borderTop: "1px solid var(--border)" }, children: "Self-contained responsive HTML+CSS snippet. Preserves flexbox/grid layout, exact colors, and responsive units." })
      ] }),
      data?.mode === "ai-prompt" && /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: [
          /* @__PURE__ */ u$1("span", { children: [
            "Component Description",
            /* @__PURE__ */ u$1("span", { className: "code-badge", children: "AI Generated" })
          ] }),
          /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.description), children: copied ? "Copied!" : "Copy" })
        ] }),
        /* @__PURE__ */ u$1("div", { className: "code-content", style: { padding: "12px 16px", fontSize: "12px", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }, children: data.description }),
        /* @__PURE__ */ u$1("div", { style: { padding: "8px 12px", fontSize: "11px", opacity: 0.7, lineHeight: 1.5, borderTop: "1px solid var(--border)" }, children: "Copy this description and use it as a prompt for any AI or designer to recreate this component." })
      ] }),
      data?.mode === "tailwind-config" && /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: [
          /* @__PURE__ */ u$1("span", { children: [
            "tailwind.config.js",
            /* @__PURE__ */ u$1("span", { className: "code-badge", children: "Auto-generated" })
          ] }),
          /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.config), children: copied ? "Copied!" : "Copy" })
        ] }),
        /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: data.config }) })
      ] }),
      data?.mode === "ultra" && /* @__PURE__ */ u$1("div", { className: "code-block-wrapper", children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: [
          /* @__PURE__ */ u$1("span", { children: [
            "AI Mega-Prompt ⚡️",
            /* @__PURE__ */ u$1("span", { className: "code-badge", children: "Copy All Ultra" })
          ] }),
          /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "8px" }, children: [
            /* @__PURE__ */ u$1("button", { onClick: () => downloadTextFile(data.prompt, "designgrab-ultra-prompt.md", "text/markdown"), children: "Download .md" }),
            /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.prompt), children: copied ? "Copied!" : "Copy Prompt" })
          ] })
        ] }),
        /* @__PURE__ */ u$1("div", { className: "code-content", style: { padding: "12px 16px", fontSize: "11px", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: "400px", overflowY: "auto" }, children: data.prompt }),
        /* @__PURE__ */ u$1("div", { style: { padding: "8px 12px", fontSize: "11px", opacity: 0.7, lineHeight: 1.5, borderTop: "1px solid var(--border)" }, children: "Paste this massive prompt into any AI coding assistant (Antigravity, Cursor, Lovable) to reconstruct the entire component 1:1. It includes HTML, CSS, fonts, exact colors, extracted animations, and inline SVG assets." })
      ] })
    ] })
  ] });
}
function LayoutTab({ pinnedElement }) {
  const [data, setData] = d(null);
  const [isLoading, setIsLoading] = d(false);
  const [error, setError] = d(null);
  const [copied, setCopied] = d(false);
  const analyzeLayout = () => {
    setIsLoading(true);
    setError(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "ANALYZE_LAYOUT" }, (response) => {
        setIsLoading(false);
        if (chrome.runtime.lastError) {
          setError("Could not connect to page. Try pinning an element first.");
        } else if (response && response.success) {
          setData(response.data);
        } else {
          setError(response?.error || "Failed to analyze layout.");
        }
      });
    });
  };
  y(() => {
    if (pinnedElement) {
      analyzeLayout();
    }
  }, [pinnedElement]);
  const handleCopy = (text) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  if (isLoading) {
    return /* @__PURE__ */ u$1("div", { className: "panel-loading", children: [
      /* @__PURE__ */ u$1("div", { className: "spinner" }),
      /* @__PURE__ */ u$1("p", { children: "Analyzing structure..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ u$1("div", { className: "panel-error", children: [
      /* @__PURE__ */ u$1("p", { children: error }),
      /* @__PURE__ */ u$1("button", { className: "panel-btn", onClick: analyzeLayout, children: "Retry" })
    ] });
  }
  if (!data) {
    return /* @__PURE__ */ u$1("div", { className: "code-empty-state", children: [
      /* @__PURE__ */ u$1("div", { className: "empty-icon", children: "⬚" }),
      /* @__PURE__ */ u$1("p", { className: "empty-text", children: "Pin an element to reverse-engineer its Flex/Grid layout DNA." }),
      /* @__PURE__ */ u$1("button", { className: "panel-btn", onClick: analyzeLayout, children: "Analyze Current Page" })
    ] });
  }
  return /* @__PURE__ */ u$1("div", { className: "layout-tab fade-in", children: [
    /* @__PURE__ */ u$1("div", { className: "panel-sticky-header", children: /* @__PURE__ */ u$1("div", { className: "stats-row", children: [
      /* @__PURE__ */ u$1("span", { children: "Layout DNA Analyzer" }),
      /* @__PURE__ */ u$1("button", { className: "icon-btn", onClick: analyzeLayout, title: "Refresh", children: "↻" })
    ] }) }),
    /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: [
      /* @__PURE__ */ u$1("div", { className: "layout-summary", children: [
        /* @__PURE__ */ u$1("div", { className: "layout-badge", children: [
          "Root: ",
          data.tree?.type.toUpperCase() || "BLOCK"
        ] }),
        /* @__PURE__ */ u$1("div", { className: "layout-desc", children: [
          data.tree?.type === "flex" ? `Flex ${data.tree?.direction || "row"} • ${data.tree?.align || ""} • ${data.tree?.justify || ""}` : "",
          data.tree?.type === "grid" ? `Grid ${data.tree?.columns ? "columns" : "rows"} • gap: ${data.tree?.gap || "0"}` : ""
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { className: "code-block-wrapper mt-3", children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: [
          /* @__PURE__ */ u$1("span", { children: "Tailwind Structural HTML" }),
          /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.structuralHTML), children: copied ? "Copied!" : "Copy" })
        ] }),
        /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: data.structuralHTML }) })
      ] }),
      /* @__PURE__ */ u$1("div", { className: "code-block-wrapper mt-3", children: [
        /* @__PURE__ */ u$1("div", { className: "code-header", children: [
          /* @__PURE__ */ u$1("span", { children: "ASCII Layout Tree" }),
          /* @__PURE__ */ u$1("button", { onClick: () => handleCopy(data.ascii), children: "Copy" })
        ] }),
        /* @__PURE__ */ u$1("pre", { className: "code-content ascii-tree", children: /* @__PURE__ */ u$1("code", { children: data.ascii }) })
      ] })
    ] })
  ] });
}
function getAnimationSuggestions(element) {
  if (!element) return [];
  const suggestions = [];
  const tag = (element.tagName || "").toLowerCase();
  const classes = (element.className || "").toLowerCase();
  const styles = element.computedStyles || {};
  parseFloat(styles.width) || 0;
  parseFloat(styles.height) || 0;
  if (["h1", "h2"].includes(tag) || classes.includes("hero") || classes.includes("headline") || classes.includes("title")) {
    suggestions.push({
      id: "fade-up-title",
      name: "Fade Up",
      desc: "כותרת ראשית – אנימציית כניסה מלמטה עם שקיפות, נותנת הרגשה של חשיפה הדרגתית.",
      css: `@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animated { animation: fadeUp 0.6s ease-out both; }`,
      badge: "entrance"
    });
    suggestions.push({
      id: "typewriter",
      name: "Typewriter",
      desc: "אפקט הקלדה – הטקסט מופיע אות-אות, מושלם לכותרות דינמיות.",
      css: `@keyframes typing {
  from { width: 0; }
  to   { width: 100%; }
}

.animated {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid;
  animation: typing 2s steps(30) both,
             blink 0.7s step-end infinite;
}

@keyframes blink {
  50% { border-color: transparent; }
}`,
      badge: "text"
    });
  }
  if (classes.includes("card") || classes.includes("panel") || classes.includes("item") || styles.borderRadius && parseFloat(styles.borderRadius) >= 8 && styles.boxShadow && styles.boxShadow !== "none") {
    suggestions.push({
      id: "scale-in-card",
      name: "Scale In",
      desc: 'כרטיס – כניסה עם הגדלה קלה ושקיפות, מרגיש כאילו הכרטיס "צץ" אל המסך.',
      css: `@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

.animated { animation: scaleIn 0.4s ease-out both; }`,
      badge: "entrance"
    });
    suggestions.push({
      id: "hover-lift",
      name: "Hover Lift",
      desc: "אפקט ריחוף – הכרטיס עולה מעט ומטיל צל חזק יותר. מושלם ל-hover interactivity.",
      css: `.animated {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.animated:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}`,
      badge: "hover"
    });
  }
  if (tag === "button" || tag === "a" || classes.includes("btn") || classes.includes("button") || classes.includes("cta")) {
    suggestions.push({
      id: "pulse-btn",
      name: "Pulse",
      desc: "כפתור CTA – פעימה קלה שמושכת תשומת לב בלי להפריע. מעולה לפעולה ראשית.",
      css: `@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}

.animated { animation: pulse 2s ease-in-out infinite; }`,
      badge: "attention"
    });
    suggestions.push({
      id: "hover-btn-glow",
      name: "Hover Glow",
      desc: "אפקט זוהר ב-hover – מוסיף הילה זוהרת סביב הכפתון. מתאים לעיצוב כהה.",
      css: `.animated {
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.animated:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}`,
      badge: "hover"
    });
  }
  if (tag === "img" || tag === "picture" || tag === "video" || tag === "svg" || classes.includes("image") || classes.includes("photo") || classes.includes("media")) {
    suggestions.push({
      id: "zoom-in-img",
      name: "Zoom Reveal",
      desc: "תמונה – זום עדין מ-scale גדול יותר אל הגודל הנכון, עם שקיפות.",
      css: `@keyframes zoomReveal {
  from { opacity: 0; transform: scale(1.08); }
  to   { opacity: 1; transform: scale(1); }
}

.animated { animation: zoomReveal 0.5s ease-out both; }`,
      badge: "entrance"
    });
    suggestions.push({
      id: "hover-zoom",
      name: "Hover Zoom",
      desc: "זום חלק ב-hover – התמונה מתקרבת בעדינות. מעולה לגלריות ו-thumbnails.",
      css: `.animated {
  overflow: hidden;
}

.animated img {
  transition: transform 0.4s ease;
}

.animated:hover img {
  transform: scale(1.06);
}`,
      badge: "hover"
    });
  }
  if (tag === "nav" || tag === "header" || classes.includes("nav") || classes.includes("header") || classes.includes("toolbar") || classes.includes("menu")) {
    suggestions.push({
      id: "slide-down-nav",
      name: "Slide Down",
      desc: "תפריט ניווט – כניסה מלמעלה עם שקיפות. מרגיש טבעי עבור רכיב עליון.",
      css: `@keyframes slideDown {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}

.animated { animation: slideDown 0.35s ease-out both; }`,
      badge: "entrance"
    });
  }
  if (tag === "section" || tag === "div" || tag === "article" || tag === "main") {
    suggestions.push({
      id: "fade-in-section",
      name: "Fade In",
      desc: "אזור תוכן – שקיפות חלקה. מתאים לכל div או section שצריך כניסה צנועה.",
      css: `@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.animated { animation: fadeIn 0.5s ease-out both; }`,
      badge: "entrance"
    });
    suggestions.push({
      id: "slide-in-left",
      name: "Slide In Left",
      desc: "כניסה מצד שמאל – מושכת את העין לתוכן. מתאים לגריד, רשימות, ויזואלים.",
      css: `@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}

.animated { animation: slideInLeft 0.5s ease-out both; }`,
      badge: "entrance"
    });
  }
  if (tag === "li" || tag === "ul" || tag === "ol" || classes.includes("list")) {
    suggestions.push({
      id: "stagger-list",
      name: "Stagger List",
      desc: "פריטי רשימה – כל פריט נכנס ב-delay עולה, נותן תחושה זורמת.",
      css: `@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animated li {
  animation: fadeUp 0.35s ease-out both;
}

.animated li:nth-child(1) { animation-delay: 0s; }
.animated li:nth-child(2) { animation-delay: 0.06s; }
.animated li:nth-child(3) { animation-delay: 0.12s; }
.animated li:nth-child(4) { animation-delay: 0.18s; }
.animated li:nth-child(5) { animation-delay: 0.24s; }`,
      badge: "entrance"
    });
  }
  if (tag === "input" || tag === "textarea" || tag === "form" || tag === "select" || classes.includes("form") || classes.includes("input")) {
    suggestions.push({
      id: "focus-glow",
      name: "Focus Glow",
      desc: "שדה קלט – זוהר עדין בזמן focus. מוסיף מגע פרימיום לטפסים.",
      css: `.animated {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.animated:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  outline: none;
}`,
      badge: "interaction"
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      id: "generic-fade",
      name: "Fade In",
      desc: "אנימציית כניסה בסיסית – שקיפות חלקה, מתאימה לכל אלמנט.",
      css: `@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.animated { animation: fadeIn 0.4s ease-out both; }`,
      badge: "entrance"
    });
    suggestions.push({
      id: "generic-slide-up",
      name: "Slide Up",
      desc: "כניסה מלמטה – כניסה עדינה למעלה עם שקיפות.",
      css: `@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animated { animation: slideUp 0.45s ease-out both; }`,
      badge: "entrance"
    });
  }
  return suggestions;
}
const BADGE_COLORS = {
  entrance: { bg: "rgba(74, 222, 128, 0.12)", color: "#4ade80" },
  hover: { bg: "rgba(96, 165, 250, 0.12)", color: "#60a5fa" },
  attention: { bg: "rgba(251, 146, 60, 0.12)", color: "#fb923c" },
  text: { bg: "rgba(167, 139, 250, 0.12)", color: "#a78bfa" },
  interaction: { bg: "rgba(244, 114, 182, 0.12)", color: "#f472b6" }
};
function AnimationsTab({ assets, onExtract, pinnedElement, onStartInspect }) {
  const [copiedId, setCopiedId] = d(null);
  const [filter, setFilter] = d("all");
  const [expandedSuggestion, setExpandedSuggestion] = d(null);
  const lotties = assets?.lotties || [];
  const animations = assets?.animations || [];
  const keyframes = animations.filter((a2) => a2.type === "keyframe");
  const transitions = animations.filter((a2) => a2.type === "transition");
  const scrollAnims = animations.filter((a2) => a2.type === "scroll-library");
  const total = lotties.length + animations.length;
  const suggestions = getAnimationSuggestions(pinnedElement);
  const handleCopy = (text, id) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  const handleCopyAll = () => {
    const parts = [];
    if ((filter === "all" || filter === "lottie") && lotties.length > 0) {
      parts.push("/* Lottie / Rive Animations */");
      lotties.forEach((l2) => parts.push(l2.src));
    }
    if ((filter === "all" || filter === "keyframe") && keyframes.length > 0) {
      parts.push("/* CSS Keyframe Animations */");
      keyframes.forEach((a2) => {
        if (a2.keyframeCSS) parts.push(a2.keyframeCSS);
      });
    }
    if ((filter === "all" || filter === "scroll") && scrollAnims.length > 0) {
      parts.push("/* Scroll-Triggered Animations */");
      scrollAnims.forEach((a2) => parts.push(`/* ${a2.name} (${a2.library}) on ${a2.element} */`));
    }
    if ((filter === "all" || filter === "transition") && transitions.length > 0) {
      parts.push("/* CSS Transitions */");
      transitions.forEach((a2) => parts.push(`transition: ${a2.transition};`));
    }
    handleCopy(parts.join("\n\n"), "copy-all");
  };
  const handleDownloadLottie = (lottie) => {
    chrome.runtime.sendMessage({
      type: "DOWNLOAD_FILE",
      payload: { url: lottie.src, filename: `${lottie.name || "animation"}.json` }
    });
  };
  const [showExportModal, setShowExportModal] = d(false);
  const [exportedFormat, setExportedFormat] = d(null);
  const buildCSSExport = () => {
    const lines = [];
    const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace("T", " ");
    lines.push(`/* DesignGrab — Extracted Animations`);
    lines.push(`   Date: ${now} */`);
    lines.push("");
    if (keyframes.length > 0) {
      lines.push("/* ═══════════════════════════════════════");
      lines.push("   CSS Keyframe Animations");
      lines.push("   ═══════════════════════════════════════ */");
      lines.push("");
      keyframes.forEach((a2) => {
        if (a2.keyframeCSS) {
          lines.push(a2.keyframeCSS);
          lines.push("");
          lines.push(`/* Applied on: ${a2.element}`);
          lines.push(`   Duration: ${a2.duration} | Timing: ${a2.timingFunction}`);
          if (a2.iterationCount === "infinite") lines.push("   Loop: infinite");
          if (a2.delay && a2.delay !== "0s") lines.push(`   Delay: ${a2.delay}`);
          lines.push("*/");
          lines.push("");
        }
      });
    }
    if (transitions.length > 0) {
      lines.push("/* ═══════════════════════════════════════");
      lines.push("   CSS Transitions");
      lines.push("   ═══════════════════════════════════════ */");
      lines.push("");
      transitions.forEach((a2) => {
        lines.push(`/* On: ${a2.element} */`);
        lines.push(`.element {`);
        lines.push(`  transition-property: ${a2.transitionProperty || "all"};`);
        lines.push(`  transition-duration: ${a2.transitionDuration || "0s"};`);
        lines.push(`  transition-timing-function: ${a2.transitionTimingFunction || "ease"};`);
        lines.push(`  transition-delay: ${a2.transitionDelay || "0s"};`);
        lines.push(`  /* Shorthand: transition: ${a2.transition}; */`);
        lines.push("}");
        lines.push("");
      });
    }
    if (suggestions.length > 0) {
      lines.push("/* ═══════════════════════════════════════");
      lines.push("   Suggested Animations");
      lines.push("   ═══════════════════════════════════════ */");
      lines.push("");
      suggestions.forEach((s2) => {
        lines.push(`/* ${s2.name} (${s2.badge}) */`);
        lines.push(s2.css);
        lines.push("");
      });
    }
    if (lotties.length > 0) {
      lines.push("/* ═══════════════════════════════════════");
      lines.push("   Lottie / Rive Animation URLs");
      lines.push("   ═══════════════════════════════════════ */");
      lines.push("");
      lotties.forEach((l2) => {
        lines.push(`/* ${l2.name} — ${l2.playerType} */`);
        lines.push(`/* URL: ${l2.src} */`);
        lines.push("");
      });
    }
    return lines.join("\n");
  };
  const buildJSONExport = () => {
    const data = {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      generator: "DesignGrab",
      keyframes: keyframes.map((a2) => ({
        name: a2.name,
        css: a2.keyframeCSS || null,
        duration: a2.duration,
        timingFunction: a2.timingFunction,
        iterationCount: a2.iterationCount,
        delay: a2.delay,
        element: a2.element,
        frames: a2.frames || []
      })),
      transitions: transitions.map((a2) => ({
        property: a2.transitionProperty || "all",
        duration: a2.transitionDuration || "0s",
        timingFunction: a2.transitionTimingFunction || "ease",
        delay: a2.transitionDelay || "0s",
        shorthand: a2.transition,
        element: a2.element
      })),
      scrollAnimations: scrollAnims.map((a2) => ({
        name: a2.name,
        library: a2.library,
        element: a2.element,
        duration: a2.duration || null,
        delay: a2.delay || null
      })),
      lotties: lotties.map((l2) => ({
        name: l2.name,
        url: l2.src,
        playerType: l2.playerType,
        width: l2.width,
        height: l2.height,
        loop: l2.loop,
        autoplay: l2.autoplay
      })),
      suggestions: suggestions.map((s2) => ({
        name: s2.name,
        type: s2.badge,
        css: s2.css,
        description: s2.desc
      }))
    };
    return JSON.stringify(data, null, 2);
  };
  const buildAIPromptExport = () => {
    const parts = [];
    parts.push("I extracted these CSS animations from a website using DesignGrab. Please use them in my project:\n");
    if (keyframes.length > 0) {
      parts.push("## Keyframe Animations\n");
      keyframes.forEach((a2) => {
        parts.push(`### ${a2.name}`);
        parts.push(`Applied on: \`${a2.element}\``);
        parts.push(`Duration: ${a2.duration} | Timing: ${a2.timingFunction}${a2.iterationCount === "infinite" ? " | Loop: infinite" : ""}${a2.delay && a2.delay !== "0s" ? ` | Delay: ${a2.delay}` : ""}
`);
        if (a2.keyframeCSS) {
          parts.push("```css");
          parts.push(a2.keyframeCSS);
          parts.push("```\n");
        }
      });
    }
    if (transitions.length > 0) {
      parts.push("## CSS Transitions\n");
      transitions.forEach((a2) => {
        parts.push(`- **${a2.element}**: \`transition: ${a2.transition};\``);
      });
      parts.push("");
    }
    if (scrollAnims.length > 0) {
      parts.push("## Scroll-Triggered Animations\n");
      scrollAnims.forEach((a2) => {
        parts.push(`- **${a2.name}** (${a2.library}) on \`${a2.element}\``);
      });
      parts.push("");
    }
    if (lotties.length > 0) {
      parts.push("## Lottie Animations\n");
      lotties.forEach((l2) => {
        parts.push(`- **${l2.name}** (${l2.playerType}): ${l2.src}`);
      });
      parts.push("");
    }
    if (suggestions.length > 0) {
      parts.push("## Suggested Animations\n");
      suggestions.forEach((s2) => {
        parts.push(`### ${s2.name} (${s2.badge})`);
        parts.push("```css");
        parts.push(s2.css);
        parts.push("```\n");
      });
    }
    parts.push("Please integrate these animations into my component. Keep the exact timing values and easing functions.");
    return parts.join("\n");
  };
  const handleExportCSS = () => {
    const css = buildCSSExport();
    downloadTextFile(css, "designgrab-animations.css", "text/css");
    setExportedFormat("css");
    setTimeout(() => setExportedFormat(null), 2e3);
  };
  const handleExportJSON = () => {
    const json = buildJSONExport();
    downloadTextFile(json, "designgrab-animations.json", "application/json");
    setExportedFormat("json");
    setTimeout(() => setExportedFormat(null), 2e3);
  };
  const handleExportAIPrompt = () => {
    const prompt = buildAIPromptExport();
    copyToClipboard(prompt);
    setExportedFormat("ai");
    setTimeout(() => setExportedFormat(null), 2e3);
  };
  const hasExportableContent = total > 0 || suggestions.length > 0;
  const renderExportModal = () => {
    if (!showExportModal) return null;
    return /* @__PURE__ */ u$1("div", { className: "export-modal-overlay", onClick: () => setShowExportModal(false), children: /* @__PURE__ */ u$1("div", { className: "export-modal", onClick: (e2) => e2.stopPropagation(), children: [
      /* @__PURE__ */ u$1("div", { className: "export-modal-header", children: [
        /* @__PURE__ */ u$1("h3", { children: "Export Animations" }),
        /* @__PURE__ */ u$1("button", { className: "export-modal-close", onClick: () => setShowExportModal(false), children: "✕" })
      ] }),
      /* @__PURE__ */ u$1("p", { className: "export-modal-desc", children: "בחר פורמט ייצוא — CSS לעורך קוד, JSON לכלי AI, או Prompt מוכן להדבקה" }),
      /* @__PURE__ */ u$1("div", { className: "export-format-grid", children: [
        /* @__PURE__ */ u$1("button", { className: "export-format-card", onClick: handleExportCSS, children: [
          /* @__PURE__ */ u$1("div", { className: "export-format-icon", children: "📄" }),
          /* @__PURE__ */ u$1("div", { className: "export-format-info", children: [
            /* @__PURE__ */ u$1("span", { className: "export-format-name", children: "CSS File" }),
            /* @__PURE__ */ u$1("span", { className: "export-format-desc", children: "קובץ .css מוכן — VS Code, Cursor, כל עורך קוד" })
          ] }),
          /* @__PURE__ */ u$1("span", { className: "export-format-action", children: exportedFormat === "css" ? "✓ Downloaded" : "Download" })
        ] }),
        /* @__PURE__ */ u$1("button", { className: "export-format-card", onClick: handleExportJSON, children: [
          /* @__PURE__ */ u$1("div", { className: "export-format-icon", children: "{}" }),
          /* @__PURE__ */ u$1("div", { className: "export-format-info", children: [
            /* @__PURE__ */ u$1("span", { className: "export-format-name", children: "JSON" }),
            /* @__PURE__ */ u$1("span", { className: "export-format-desc", children: "מבנה נתונים — Base44, Lovable, כלי AI" })
          ] }),
          /* @__PURE__ */ u$1("span", { className: "export-format-action", children: exportedFormat === "json" ? "✓ Downloaded" : "Download" })
        ] }),
        /* @__PURE__ */ u$1("button", { className: "export-format-card", onClick: handleExportAIPrompt, children: [
          /* @__PURE__ */ u$1("div", { className: "export-format-icon", children: "🤖" }),
          /* @__PURE__ */ u$1("div", { className: "export-format-info", children: [
            /* @__PURE__ */ u$1("span", { className: "export-format-name", children: "AI Prompt" }),
            /* @__PURE__ */ u$1("span", { className: "export-format-desc", children: "פרומפט מוכן — Antigravity, Cursor, ChatGPT" })
          ] }),
          /* @__PURE__ */ u$1("span", { className: "export-format-action", children: exportedFormat === "ai" ? "✓ Copied!" : "Copy" })
        ] })
      ] })
    ] }) });
  };
  const renderSuggestions = () => {
    if (!pinnedElement) {
      return /* @__PURE__ */ u$1("div", { className: "suggest-empty", children: [
        /* @__PURE__ */ u$1("div", { className: "suggest-empty-icon", children: /* @__PURE__ */ u$1("svg", { width: "36", height: "36", viewBox: "0 0 36 36", fill: "none", children: [
          /* @__PURE__ */ u$1("circle", { cx: "18", cy: "18", r: "14", stroke: "#3f3f46", "stroke-width": "1.5", "stroke-dasharray": "4 3" }),
          /* @__PURE__ */ u$1("path", { d: "M13 18l3.5 3.5L23 14", stroke: "#6366f1", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round" })
        ] }) }),
        /* @__PURE__ */ u$1("p", { className: "suggest-empty-text", children: "בחר אלמנט בעמוד כדי לקבל הצעות אנימציה מותאמות" }),
        /* @__PURE__ */ u$1("button", { className: "panel-btn primary", onClick: onStartInspect, children: "🔍 Inspect Element" })
      ] });
    }
    const elTag = (pinnedElement.tagName || "div").toLowerCase();
    const elClass = pinnedElement.className ? `.${pinnedElement.className.split(" ").filter(Boolean).slice(0, 2).join(".")}` : "";
    const selector = `<${elTag}${elClass}>`;
    return /* @__PURE__ */ u$1("div", { className: "suggest-panel fade-in", children: [
      /* @__PURE__ */ u$1("div", { className: "suggest-header", children: [
        /* @__PURE__ */ u$1("div", { className: "suggest-header-info", children: [
          /* @__PURE__ */ u$1("span", { className: "suggest-label", children: "הצעות אנימציה עבור:" }),
          /* @__PURE__ */ u$1("code", { className: "suggest-selector", children: selector })
        ] }),
        /* @__PURE__ */ u$1("span", { className: "suggest-count", children: [
          suggestions.length,
          " הצעות"
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { className: "suggest-list", children: suggestions.map((s2, i2) => {
        const isExpanded = expandedSuggestion === s2.id;
        const badgeStyle = BADGE_COLORS[s2.badge] || BADGE_COLORS.entrance;
        return /* @__PURE__ */ u$1("div", { className: `suggest-card ${isExpanded ? "expanded" : ""}`, children: [
          /* @__PURE__ */ u$1(
            "div",
            {
              className: "suggest-card-top",
              onClick: () => setExpandedSuggestion(isExpanded ? null : s2.id),
              children: [
                /* @__PURE__ */ u$1("div", { className: "suggest-card-left", children: [
                  /* @__PURE__ */ u$1("span", { className: "suggest-card-name", children: s2.name }),
                  /* @__PURE__ */ u$1(
                    "span",
                    {
                      className: "suggest-card-badge",
                      style: { background: badgeStyle.bg, color: badgeStyle.color },
                      children: s2.badge
                    }
                  )
                ] }),
                /* @__PURE__ */ u$1(
                  "button",
                  {
                    className: "suggest-copy-btn",
                    onClick: (e2) => {
                      e2.stopPropagation();
                      handleCopy(s2.css, s2.id);
                    },
                    children: copiedId === s2.id ? "✓ הועתק" : "📋 העתק CSS"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ u$1("p", { className: "suggest-card-desc", children: s2.desc }),
          isExpanded && /* @__PURE__ */ u$1("div", { className: "suggest-card-code fade-in", children: /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: s2.css }) }) })
        ] }, s2.id);
      }) })
    ] });
  };
  if (!assets) {
    return /* @__PURE__ */ u$1("div", { className: "animations-tab fade-in", children: [
      renderExportModal(),
      /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: [
        renderSuggestions(),
        hasExportableContent && /* @__PURE__ */ u$1("div", { style: { display: "flex", justifyContent: "center", padding: "8px 0" }, children: /* @__PURE__ */ u$1("button", { className: "panel-btn primary small", onClick: () => setShowExportModal(true), children: "↗ Export Animations" }) }),
        /* @__PURE__ */ u$1("div", { className: "anim-divider" }),
        /* @__PURE__ */ u$1("div", { className: "code-empty-state", children: [
          /* @__PURE__ */ u$1("div", { className: "empty-icon", children: /* @__PURE__ */ u$1("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", children: [
            /* @__PURE__ */ u$1("circle", { cx: "24", cy: "24", r: "18", stroke: "#3f3f46", "stroke-width": "2", "stroke-dasharray": "4 4" }),
            /* @__PURE__ */ u$1("path", { d: "M18 24l4 4 8-8", stroke: "#6366f1", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
          ] }) }),
          /* @__PURE__ */ u$1("p", { className: "empty-text", children: "Extract assets first to detect Lottie animations, CSS keyframes, and scroll-triggered effects." }),
          /* @__PURE__ */ u$1("button", { className: "empty-btn", onClick: onExtract, children: "Scan Page" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ u$1("div", { className: "animations-tab fade-in", children: [
    renderExportModal(),
    /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: renderSuggestions() }),
    total > 0 && /* @__PURE__ */ u$1("div", { className: "anim-divider" }),
    total > 0 && /* @__PURE__ */ u$1(k$1, { children: [
      /* @__PURE__ */ u$1("div", { className: "panel-sticky-header", children: [
        /* @__PURE__ */ u$1("div", { className: "stats-row", children: [
          /* @__PURE__ */ u$1("span", { children: [
            total,
            " animations found"
          ] }),
          /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "6px", alignItems: "center" }, children: [
            /* @__PURE__ */ u$1("button", { className: "panel-btn primary small", onClick: () => setShowExportModal(true), children: "↗ Export" }),
            /* @__PURE__ */ u$1("button", { className: "panel-btn outline small", onClick: handleCopyAll, children: copiedId === "copy-all" ? "✓ Copied" : "Copy All" }),
            /* @__PURE__ */ u$1("button", { className: "icon-btn", onClick: onExtract, title: "Re-scan", children: "↻" })
          ] })
        ] }),
        /* @__PURE__ */ u$1("div", { className: "assets-filters", children: [
          /* @__PURE__ */ u$1("button", { className: `filter-btn ${filter === "all" ? "active" : ""}`, onClick: () => setFilter("all"), children: [
            "All (",
            total,
            ")"
          ] }),
          lotties.length > 0 && /* @__PURE__ */ u$1("button", { className: `filter-btn ${filter === "lottie" ? "active" : ""}`, onClick: () => setFilter("lottie"), children: [
            "Lottie (",
            lotties.length,
            ")"
          ] }),
          keyframes.length > 0 && /* @__PURE__ */ u$1("button", { className: `filter-btn ${filter === "keyframe" ? "active" : ""}`, onClick: () => setFilter("keyframe"), children: [
            "Keyframes (",
            keyframes.length,
            ")"
          ] }),
          scrollAnims.length > 0 && /* @__PURE__ */ u$1("button", { className: `filter-btn ${filter === "scroll" ? "active" : ""}`, onClick: () => setFilter("scroll"), children: [
            "Scroll (",
            scrollAnims.length,
            ")"
          ] }),
          transitions.length > 0 && /* @__PURE__ */ u$1("button", { className: `filter-btn ${filter === "transition" ? "active" : ""}`, onClick: () => setFilter("transition"), children: [
            "Transitions (",
            transitions.length,
            ")"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: [
        (filter === "all" || filter === "lottie") && lotties.length > 0 && /* @__PURE__ */ u$1("div", { className: "anim-section", children: [
          filter === "all" && /* @__PURE__ */ u$1("h3", { className: "section-title", children: "Lottie / Rive Animations" }),
          /* @__PURE__ */ u$1("div", { className: "anim-list", children: lotties.map((lottie, i2) => /* @__PURE__ */ u$1("div", { className: "anim-card", children: [
            /* @__PURE__ */ u$1("div", { className: "anim-card-header", children: [
              /* @__PURE__ */ u$1("span", { className: "anim-card-name", children: lottie.name }),
              /* @__PURE__ */ u$1("span", { className: "anim-card-badge lottie", children: lottie.playerType })
            ] }),
            /* @__PURE__ */ u$1("div", { className: "anim-card-meta", children: [
              lottie.width > 0 && /* @__PURE__ */ u$1("span", { children: [
                lottie.width,
                "x",
                lottie.height
              ] }),
              lottie.loop && /* @__PURE__ */ u$1("span", { children: "Loop" }),
              lottie.autoplay && /* @__PURE__ */ u$1("span", { children: "Autoplay" })
            ] }),
            /* @__PURE__ */ u$1("div", { className: "anim-card-url", title: lottie.src, children: lottie.src }),
            /* @__PURE__ */ u$1("div", { className: "anim-card-actions", children: [
              /* @__PURE__ */ u$1("button", { className: "asset-btn download", onClick: () => handleDownloadLottie(lottie), children: "Download JSON" }),
              /* @__PURE__ */ u$1("button", { className: "asset-btn copy", onClick: () => handleCopy(lottie.src, `lottie-${i2}`), children: copiedId === `lottie-${i2}` ? "✓ Copied" : "Copy URL" })
            ] })
          ] }, `l-${i2}`)) })
        ] }),
        (filter === "all" || filter === "keyframe") && keyframes.length > 0 && /* @__PURE__ */ u$1("div", { className: "anim-section", children: [
          filter === "all" && /* @__PURE__ */ u$1("h3", { className: "section-title", children: "CSS Keyframe Animations" }),
          /* @__PURE__ */ u$1("div", { className: "anim-list", children: keyframes.map((anim, i2) => /* @__PURE__ */ u$1("div", { className: "anim-card", children: [
            /* @__PURE__ */ u$1("div", { className: "anim-card-header", children: [
              /* @__PURE__ */ u$1("span", { className: "anim-card-name", children: anim.name }),
              /* @__PURE__ */ u$1("span", { className: "anim-card-badge keyframe", children: "@keyframes" })
            ] }),
            /* @__PURE__ */ u$1("div", { className: "anim-card-meta", children: [
              /* @__PURE__ */ u$1("span", { children: anim.duration }),
              /* @__PURE__ */ u$1("span", { children: anim.timingFunction }),
              anim.iterationCount === "infinite" && /* @__PURE__ */ u$1("span", { children: "Infinite" }),
              anim.delay !== "0s" && /* @__PURE__ */ u$1("span", { children: [
                "Delay: ",
                anim.delay
              ] })
            ] }),
            /* @__PURE__ */ u$1("div", { className: "anim-card-element", children: [
              "On: ",
              /* @__PURE__ */ u$1("code", { children: anim.element })
            ] }),
            anim.keyframeCSS && /* @__PURE__ */ u$1("div", { className: "anim-card-code", children: [
              /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: anim.keyframeCSS }) }),
              /* @__PURE__ */ u$1(
                "button",
                {
                  className: "anim-copy-btn",
                  onClick: () => handleCopy(anim.keyframeCSS, `kf-${i2}`),
                  children: copiedId === `kf-${i2}` ? "✓" : "Copy"
                }
              )
            ] })
          ] }, `k-${i2}`)) })
        ] }),
        (filter === "all" || filter === "scroll") && scrollAnims.length > 0 && /* @__PURE__ */ u$1("div", { className: "anim-section", children: [
          filter === "all" && /* @__PURE__ */ u$1("h3", { className: "section-title", children: "Scroll-Triggered Animations" }),
          /* @__PURE__ */ u$1("div", { className: "anim-list", children: scrollAnims.map((anim, i2) => /* @__PURE__ */ u$1("div", { className: "anim-card", children: [
            /* @__PURE__ */ u$1("div", { className: "anim-card-header", children: [
              /* @__PURE__ */ u$1("span", { className: "anim-card-name", children: anim.name }),
              /* @__PURE__ */ u$1("span", { className: "anim-card-badge scroll", children: anim.library })
            ] }),
            /* @__PURE__ */ u$1("div", { className: "anim-card-meta", children: [
              anim.duration && /* @__PURE__ */ u$1("span", { children: [
                anim.duration,
                "ms"
              ] }),
              anim.delay && /* @__PURE__ */ u$1("span", { children: [
                "Delay: ",
                anim.delay,
                "ms"
              ] })
            ] }),
            /* @__PURE__ */ u$1("div", { className: "anim-card-element", children: [
              "On: ",
              /* @__PURE__ */ u$1("code", { children: anim.element })
            ] })
          ] }, `s-${i2}`)) })
        ] }),
        (filter === "all" || filter === "transition") && transitions.length > 0 && /* @__PURE__ */ u$1("div", { className: "anim-section", children: [
          filter === "all" && /* @__PURE__ */ u$1("h3", { className: "section-title", children: "CSS Transitions" }),
          /* @__PURE__ */ u$1("div", { className: "anim-list", children: transitions.map((anim, i2) => {
            const fullCSS = [
              `transition-property: ${anim.transitionProperty || "all"};`,
              `transition-duration: ${anim.transitionDuration || "0s"};`,
              `transition-timing-function: ${anim.transitionTimingFunction || "ease"};`,
              `transition-delay: ${anim.transitionDelay || "0s"};`
            ].join("\n");
            const shorthand = `transition: ${anim.transition};`;
            return /* @__PURE__ */ u$1("div", { className: "anim-card", children: [
              /* @__PURE__ */ u$1("div", { className: "anim-card-header", children: [
                /* @__PURE__ */ u$1("span", { className: "anim-card-name", children: "transition" }),
                /* @__PURE__ */ u$1("span", { className: "anim-card-badge transition", children: "CSS" })
              ] }),
              /* @__PURE__ */ u$1("div", { className: "anim-card-meta", children: [
                /* @__PURE__ */ u$1("span", { children: anim.transitionProperty || "all" }),
                /* @__PURE__ */ u$1("span", { children: anim.transitionDuration || "0s" }),
                /* @__PURE__ */ u$1("span", { children: anim.transitionTimingFunction || "ease" }),
                anim.transitionDelay && anim.transitionDelay !== "0s" && /* @__PURE__ */ u$1("span", { children: [
                  "Delay: ",
                  anim.transitionDelay
                ] })
              ] }),
              /* @__PURE__ */ u$1("div", { className: "anim-card-element", children: [
                "On: ",
                /* @__PURE__ */ u$1("code", { children: anim.element })
              ] }),
              /* @__PURE__ */ u$1("div", { className: "anim-card-code", children: [
                /* @__PURE__ */ u$1("pre", { className: "code-content", children: /* @__PURE__ */ u$1("code", { children: fullCSS }) }),
                /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "4px" }, children: [
                  /* @__PURE__ */ u$1(
                    "button",
                    {
                      className: "anim-copy-btn",
                      onClick: () => handleCopy(fullCSS, `tr-full-${i2}`),
                      children: copiedId === `tr-full-${i2}` ? "✓" : "Copy"
                    }
                  ),
                  /* @__PURE__ */ u$1(
                    "button",
                    {
                      className: "anim-copy-btn",
                      onClick: () => handleCopy(shorthand, `tr-short-${i2}`),
                      children: copiedId === `tr-short-${i2}` ? "✓" : "Shorthand"
                    }
                  )
                ] })
              ] })
            ] }, `t-${i2}`);
          }) })
        ] })
      ] })
    ] }),
    total === 0 && assets && /* @__PURE__ */ u$1("div", { className: "panel-scroll-content", children: /* @__PURE__ */ u$1("div", { className: "code-empty-state", children: [
      /* @__PURE__ */ u$1("p", { className: "empty-text", children: "No animations detected on this page." }),
      /* @__PURE__ */ u$1("button", { className: "panel-btn outline", onClick: onExtract, children: "Re-scan" })
    ] }) })
  ] });
}
function SettingsTab({ authState: parentAuthState, onSignIn, onSignOut, authLoading: parentAuthLoading }) {
  const [loaded, setLoaded] = d(false);
  const authState = parentAuthState || { user: null, plan: "free", isLoggedIn: false };
  const [authError, setAuthError] = d("");
  const [usage, setUsage] = d(null);
  y(() => {
    setLoaded(true);
    if (authState.isLoggedIn) {
      getUsageSummary().then(setUsage).catch(() => {
      });
    }
  }, [authState.isLoggedIn]);
  const handleGoogleSignIn = async () => {
    setAuthError("");
    if (onSignIn) {
      await onSignIn();
    }
  };
  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut();
    }
    setUsage(null);
  };
  const planLabels = { free: "Free", pro: "Pro", lifetime: "Lifetime" };
  if (!loaded) return null;
  return /* @__PURE__ */ u$1("div", { className: "settings-tab fade-in", children: [
    /* @__PURE__ */ u$1("div", { className: "settings-section", children: [
      /* @__PURE__ */ u$1("h3", { className: "settings-heading", children: "Account" }),
      authState.isLoggedIn ? /* @__PURE__ */ u$1("div", { className: "settings-account", children: [
        /* @__PURE__ */ u$1("div", { className: "settings-account-row", children: [
          /* @__PURE__ */ u$1("span", { className: "settings-account-email", children: authState.user?.email }),
          /* @__PURE__ */ u$1("span", { className: `settings-plan-badge ${authState.plan}`, children: planLabels[authState.plan] || "Free" })
        ] }),
        authState.plan === "free" && /* @__PURE__ */ u$1("button", { className: "panel-btn primary", style: { marginTop: "8px" }, onClick: () => startUpgrade("pro"), children: "Upgrade to Pro" }),
        /* @__PURE__ */ u$1("button", { className: "panel-btn outline", style: { marginTop: "8px" }, onClick: handleSignOut, children: "Sign Out" })
      ] }) : /* @__PURE__ */ u$1("div", { children: [
        /* @__PURE__ */ u$1("p", { className: "settings-description", children: "Sign in with Google to sync your library and unlock AI exports." }),
        authError && /* @__PURE__ */ u$1("p", { className: "settings-auth-error", children: authError }),
        /* @__PURE__ */ u$1(
          "button",
          {
            className: "panel-btn google-signin-btn",
            onClick: handleGoogleSignIn,
            disabled: parentAuthLoading,
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "10px 16px",
              marginTop: "8px",
              background: "#fff",
              color: "#3c4043",
              border: "1px solid #dadce0",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: parentAuthLoading ? "wait" : "pointer",
              opacity: parentAuthLoading ? 0.7 : 1
            },
            children: [
              /* @__PURE__ */ u$1("svg", { width: "18", height: "18", viewBox: "0 0 48 48", children: [
                /* @__PURE__ */ u$1("path", { fill: "#EA4335", d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" }),
                /* @__PURE__ */ u$1("path", { fill: "#4285F4", d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" }),
                /* @__PURE__ */ u$1("path", { fill: "#FBBC05", d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" }),
                /* @__PURE__ */ u$1("path", { fill: "#34A853", d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" })
              ] }),
              parentAuthLoading ? "Signing in..." : "Sign in with Google"
            ]
          }
        )
      ] })
    ] }),
    authState.isLoggedIn && usage && /* @__PURE__ */ u$1("div", { className: "settings-section", children: [
      /* @__PURE__ */ u$1("h3", { className: "settings-heading", children: "Usage This Month" }),
      /* @__PURE__ */ u$1("div", { className: "settings-usage-grid", children: usage.items.map((item) => /* @__PURE__ */ u$1("div", { className: "settings-usage-item", children: [
        /* @__PURE__ */ u$1("div", { className: "settings-usage-label", children: item.label }),
        /* @__PURE__ */ u$1("div", { className: "settings-usage-bar", children: /* @__PURE__ */ u$1(
          "div",
          {
            className: "settings-usage-fill",
            style: {
              width: item.unlimited ? "10%" : `${Math.min(100, item.current / item.limit * 100)}%`,
              background: item.unlimited || item.current < item.limit * 0.8 ? "#6366f1" : "#f87171"
            }
          }
        ) }),
        /* @__PURE__ */ u$1("div", { className: "settings-usage-count", children: [
          item.current,
          " / ",
          item.unlimited ? "∞" : item.limit
        ] })
      ] }, item.action)) }),
      usage.plan === "free" && /* @__PURE__ */ u$1("button", { className: "panel-btn primary", style: { marginTop: "12px", width: "100%" }, onClick: () => startUpgrade("pro"), children: "Upgrade for More" })
    ] }),
    /* @__PURE__ */ u$1("div", { className: "settings-section", children: [
      /* @__PURE__ */ u$1("h3", { className: "settings-heading", children: "About" }),
      /* @__PURE__ */ u$1("p", { className: "settings-description", children: "DesignGrab v1.0.0 — Inspect, extract, and export design tokens from any website." }),
      /* @__PURE__ */ u$1("div", { className: "settings-about-links", children: [
        /* @__PURE__ */ u$1("a", { href: "https://designgrab.app", target: "_blank", rel: "noopener noreferrer", className: "settings-link", children: "Website" }),
        /* @__PURE__ */ u$1("a", { href: "https://designgrab.app/privacy", target: "_blank", rel: "noopener noreferrer", className: "settings-link", children: "Privacy Policy" })
      ] })
    ] })
  ] });
}
async function ensureContentScript() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "PING" });
  } catch (e2) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    } catch (e22) {
    }
  }
}
const TABS = [
  { id: "figma", label: "Figma", icon: "🎯", highlight: true },
  { id: "inspector", label: "Inspector", icon: "🔍" },
  { id: "assets", label: "Assets", icon: "🖼" },
  { id: "colors", label: "Colors", icon: "🎨" },
  { id: "fonts", label: "Fonts", icon: "🔤" },
  { id: "code", label: "Code", icon: "⟨/⟩" },
  { id: "layout", label: "Layout", icon: "⊞" },
  { id: "anims", label: "Anims", icon: "✦" },
  { id: "library", label: "Library", icon: "♡" },
  { id: "settings", label: "Settings", icon: "⚙" }
];
function App() {
  const [activeTab, setActiveTab] = d("figma");
  const [pinnedElement, setPinnedElement] = d(null);
  const [assets, setAssets] = d(null);
  const [isInspecting, setIsInspecting] = d(false);
  const [isLoggedIn, setIsLoggedIn] = d(false);
  const [authChecked, setAuthChecked] = d(false);
  const [authLoading, setAuthLoading] = d(false);
  const [authState, setAuthState] = d({ user: null, plan: "free", isLoggedIn: false });
  y(() => {
    ensureContentScript();
  }, []);
  y(() => {
    chrome.storage.local.get(["openTab"], (data) => {
      if (data.openTab) {
        setActiveTab(data.openTab);
        chrome.storage.local.remove(["openTab"]);
      }
    });
  }, []);
  y(() => {
    getAuthState().then((state) => {
      setIsLoggedIn(state.isLoggedIn);
      setAuthState(state);
      setAuthChecked(true);
      console.log("[DesignGrab] Plan:", state.plan);
    }).catch(() => {
      setAuthChecked(true);
    });
  }, []);
  y(() => {
    const listener = (changes) => {
      if (changes.userId) {
        getAuthState().then((state) => {
          setIsLoggedIn(state.isLoggedIn);
          setAuthState(state);
        }).catch(() => {
        });
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);
  y(() => {
    const handleMessage = (message) => {
      const { type, payload } = message;
      switch (type) {
        case "ELEMENT_PINNED":
          setPinnedElement(payload);
          setActiveTab("inspector");
          break;
        case "INSPECT_MODE_CHANGED":
          setIsInspecting(payload.active);
          break;
        case "ASSETS_EXTRACTED":
          setAssets(payload);
          setActiveTab("assets");
          break;
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.storage.local.get(["lastExtractedAssets"], (data) => {
      if (data.lastExtractedAssets) {
        setAssets(data.lastExtractedAssets);
        chrome.storage.local.remove(["lastExtractedAssets"]);
      }
    });
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);
  const handleStartInspect = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: "START_INSPECT" }, (res) => {
        if (chrome.runtime.lastError) return;
        if (res?.active) setIsInspecting(true);
      });
    });
  };
  const handleStopInspect = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_INSPECT" }, () => {
        setIsInspecting(false);
      });
    });
  };
  const handleExtractAssets = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: "EXTRACT_ASSETS" }, (res) => {
        if (chrome.runtime.lastError) return;
        if (res?.success) {
          setAssets(res.assets);
          setActiveTab("assets");
        }
      });
    });
  };
  const handleSelectPage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: "SELECT_PAGE" }, (res) => {
        if (chrome.runtime.lastError) return;
      });
    });
  };
  const handleSignIn = async () => {
    setAuthLoading(true);
    const result = await signInWithGoogle();
    setAuthLoading(false);
    if (!result.error) {
      const state = await getAuthState();
      setIsLoggedIn(state.isLoggedIn);
      setAuthState(state);
    }
  };
  const handleSignOut = async () => {
    const { signOut } = await __vitePreload(async () => {
      const { signOut: signOut2 } = await import("./auth-jQZeegj1.js").then((n2) => n2.e);
      return { signOut: signOut2 };
    }, true ? __vite__mapDeps([0,1]) : void 0, import.meta.url);
    await signOut();
    const clearedState = { user: null, plan: "free", isLoggedIn: false };
    setIsLoggedIn(false);
    setAuthState(clearedState);
  };
  const requiresAuth = authChecked && !isLoggedIn && activeTab !== "settings";
  return /* @__PURE__ */ u$1("div", { class: "panel", children: [
    /* @__PURE__ */ u$1("div", { class: "panel-header", children: [
      /* @__PURE__ */ u$1("div", { class: "panel-logo", children: [
        /* @__PURE__ */ u$1("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", children: [
          /* @__PURE__ */ u$1("rect", { width: "20", height: "20", rx: "5", fill: "url(#grad)" }),
          /* @__PURE__ */ u$1("path", { d: "M6 7L10 10L6 13", stroke: "white", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round" }),
          /* @__PURE__ */ u$1("line", { x1: "11", y1: "13", x2: "15", y2: "13", stroke: "white", "stroke-width": "1.5", "stroke-linecap": "round" }),
          /* @__PURE__ */ u$1("defs", { children: /* @__PURE__ */ u$1("linearGradient", { id: "grad", x1: "0", y1: "0", x2: "20", y2: "20", children: [
            /* @__PURE__ */ u$1("stop", { "stop-color": "#6366f1" }),
            /* @__PURE__ */ u$1("stop", { offset: "1", "stop-color": "#8b5cf6" })
          ] }) })
        ] }),
        /* @__PURE__ */ u$1("span", { class: "panel-title", children: "DesignGrab" })
      ] }),
      /* @__PURE__ */ u$1("div", { class: "panel-actions", children: /* @__PURE__ */ u$1(
        "button",
        {
          class: `panel-inspect-btn ${isInspecting ? "active" : ""}`,
          onClick: isInspecting ? handleStopInspect : handleStartInspect,
          children: isInspecting ? "⬛ Stop" : "🔍 Inspect"
        }
      ) })
    ] }),
    /* @__PURE__ */ u$1("div", { class: "panel-tabs", children: TABS.map((tab) => /* @__PURE__ */ u$1(
      "button",
      {
        class: `panel-tab ${activeTab === tab.id ? "active" : ""} ${tab.highlight ? "figma-tab" : ""}`,
        onClick: () => setActiveTab(tab.id),
        title: tab.label,
        children: [
          /* @__PURE__ */ u$1("span", { class: "tab-icon", children: tab.icon }),
          /* @__PURE__ */ u$1("span", { class: "tab-label", children: tab.label })
        ]
      },
      tab.id
    )) }),
    /* @__PURE__ */ u$1("div", { class: "panel-content", children: requiresAuth ? /* @__PURE__ */ u$1("div", { className: "auth-wall fade-in", children: /* @__PURE__ */ u$1("div", { style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      padding: "32px 24px",
      textAlign: "center"
    }, children: [
      /* @__PURE__ */ u$1("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", style: { marginBottom: "16px", opacity: 0.6 }, children: [
        /* @__PURE__ */ u$1("rect", { x: "12", y: "20", width: "24", height: "20", rx: "3", stroke: "#6366f1", "stroke-width": "2" }),
        /* @__PURE__ */ u$1("path", { d: "M18 20V14C18 10.686 20.686 8 24 8C27.314 8 30 10.686 30 14V20", stroke: "#6366f1", "stroke-width": "2", "stroke-linecap": "round" }),
        /* @__PURE__ */ u$1("circle", { cx: "24", cy: "30", r: "2", fill: "#6366f1" })
      ] }),
      /* @__PURE__ */ u$1("h3", { style: { margin: "0 0 8px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }, children: "Sign in to continue" }),
      /* @__PURE__ */ u$1("p", { style: { margin: "0 0 20px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }, children: "Sign in with Google to use DesignGrab features and track your usage." }),
      /* @__PURE__ */ u$1(
        "button",
        {
          className: "panel-btn google-signin-btn",
          onClick: handleSignIn,
          disabled: authLoading,
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            maxWidth: "260px",
            padding: "10px 16px",
            background: "#fff",
            color: "#3c4043",
            border: "1px solid #dadce0",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: authLoading ? "wait" : "pointer",
            opacity: authLoading ? 0.7 : 1
          },
          children: [
            /* @__PURE__ */ u$1("svg", { width: "18", height: "18", viewBox: "0 0 48 48", children: [
              /* @__PURE__ */ u$1("path", { fill: "#EA4335", d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" }),
              /* @__PURE__ */ u$1("path", { fill: "#4285F4", d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" }),
              /* @__PURE__ */ u$1("path", { fill: "#FBBC05", d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" }),
              /* @__PURE__ */ u$1("path", { fill: "#34A853", d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" })
            ] }),
            authLoading ? "Signing in..." : "Sign in with Google"
          ]
        }
      ),
      /* @__PURE__ */ u$1(
        "button",
        {
          className: "panel-btn outline",
          onClick: () => setActiveTab("settings"),
          style: { marginTop: "8px", maxWidth: "260px", width: "100%" },
          children: "Go to Settings"
        }
      )
    ] }) }) : /* @__PURE__ */ u$1(k$1, { children: [
      activeTab === "figma" && /* @__PURE__ */ u$1(CodeTab, { pinnedElement, initialMode: "figma" }),
      activeTab === "inspector" && /* @__PURE__ */ u$1(
        InspectorTab,
        {
          element: pinnedElement,
          isInspecting,
          onStartInspect: handleStartInspect,
          onSelectPage: handleSelectPage
        }
      ),
      activeTab === "assets" && /* @__PURE__ */ u$1(
        AssetsTab,
        {
          assets,
          onExtract: handleExtractAssets
        }
      ),
      activeTab === "colors" && /* @__PURE__ */ u$1(ColorsTab, {}),
      activeTab === "fonts" && /* @__PURE__ */ u$1(FontsTab, {}),
      activeTab === "layout" && /* @__PURE__ */ u$1(LayoutTab, { pinnedElement }),
      activeTab === "code" && /* @__PURE__ */ u$1(CodeTab, { pinnedElement }),
      activeTab === "anims" && /* @__PURE__ */ u$1(
        AnimationsTab,
        {
          assets,
          onExtract: handleExtractAssets,
          pinnedElement,
          onStartInspect: handleStartInspect
        }
      ),
      activeTab === "library" && /* @__PURE__ */ u$1(LibraryTab, {}),
      activeTab === "settings" && /* @__PURE__ */ u$1(
        SettingsTab,
        {
          authState,
          onSignIn: handleSignIn,
          onSignOut: handleSignOut,
          authLoading
        }
      )
    ] }) })
  ] });
}
J(/* @__PURE__ */ u$1(App, {}), document.getElementById("app"));
