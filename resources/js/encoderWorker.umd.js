(function OpusMediaWorkerUMD(root, factory) {
	if (typeof WorkerGlobalScope !== 'undefined' &&
		self instanceof WorkerGlobalScope) {
		var initWorker = factory();
		initWorker();
	} else if (typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if (typeof define === 'function' && define.amd)
		define([], factory);
	else if (typeof exports === 'object')
		exports["encoderWorker"] = factory();
	else
		root["encoderWorker"] = factory();
})(typeof OpusMediaRecorder !== 'undefined' ? OpusMediaRecorder : typeof self !== 'undefined' ? self : this, function() {
	return function() {
		! function(e) {
			var t = {};

			function n(r) {
				if (t[r]) return t[r].exports;
				var o = t[r] = {
					i: r,
					l: !1,
					exports: {}
				};
				return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
			}
			n.m = e, n.c = t, n.d = function(e, t, r) {
				n.o(e, t) || Object.defineProperty(e, t, {
					enumerable: !0,
					get: r
				})
			}, n.r = function(e) {
				"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
					value: "Module"
				}), Object.defineProperty(e, "__esModule", {
					value: !0
				})
			}, n.t = function(e, t) {
				if (1 & t && (e = n(e)), 8 & t) return e;
				if (4 & t && "object" == typeof e && e && e.__esModule) return e;
				var r = Object.create(null);
				if (n.r(r), Object.defineProperty(r, "default", {
						enumerable: !0,
						value: e
					}), 2 & t && "string" != typeof e)
					for (var o in e) n.d(r, o, function(t) {
						return e[t]
					}.bind(null, o));
				return r
			}, n.n = function(e) {
				var t = e && e.__esModule ? function() {
					return e.default
				} : function() {
					return e
				};
				return n.d(t, "a", t), t
			}, n.o = function(e, t) {
				return Object.prototype.hasOwnProperty.call(e, t)
			}, n.p = "", n(n.s = 5)
		}([function(e, t, n) {
			(function(e) {
				function n(e, t) {
					for (var n = 0, r = e.length - 1; r >= 0; r--) {
						var o = e[r];
						"." === o ? e.splice(r, 1) : ".." === o ? (e.splice(r, 1), n++) : n && (e.splice(r, 1), n--)
					}
					if (t)
						for (; n--; n) e.unshift("..");
					return e
				}

				function r(e, t) {
					if (e.filter) return e.filter(t);
					for (var n = [], r = 0; r < e.length; r++) t(e[r], r, e) && n.push(e[r]);
					return n
				}
				t.resolve = function() {
					for (var t = "", o = !1, i = arguments.length - 1; i >= -1 && !o; i--) {
						var u = i >= 0 ? arguments[i] : e.cwd();
						if ("string" != typeof u) throw new TypeError("Arguments to path.resolve must be strings");
						u && (t = u + "/" + t, o = "/" === u.charAt(0))
					}
					return (o ? "/" : "") + (t = n(r(t.split("/"), (function(e) {
						return !!e
					})), !o).join("/")) || "."
				}, t.normalize = function(e) {
					var i = t.isAbsolute(e),
						u = "/" === o(e, -1);
					return (e = n(r(e.split("/"), (function(e) {
						return !!e
					})), !i).join("/")) || i || (e = "."), e && u && (e += "/"), (i ? "/" : "") + e
				}, t.isAbsolute = function(e) {
					return "/" === e.charAt(0)
				}, t.join = function() {
					var e = Array.prototype.slice.call(arguments, 0);
					return t.normalize(r(e, (function(e, t) {
						if ("string" != typeof e) throw new TypeError("Arguments to path.join must be strings");
						return e
					})).join("/"))
				}, t.relative = function(e, n) {
					function r(e) {
						for (var t = 0; t < e.length && "" === e[t]; t++);
						for (var n = e.length - 1; n >= 0 && "" === e[n]; n--);
						return t > n ? [] : e.slice(t, n - t + 1)
					}
					e = t.resolve(e).substr(1), n = t.resolve(n).substr(1);
					for (var o = r(e.split("/")), i = r(n.split("/")), u = Math.min(o.length, i.length), a = u, s = 0; s < u; s++)
						if (o[s] !== i[s]) {
							a = s;
							break
						} var c = [];
					for (s = a; s < o.length; s++) c.push("..");
					return (c = c.concat(i.slice(a))).join("/")
				}, t.sep = "/", t.delimiter = ":", t.dirname = function(e) {
					if ("string" != typeof e && (e += ""), 0 === e.length) return ".";
					for (var t = e.charCodeAt(0), n = 47 === t, r = -1, o = !0, i = e.length - 1; i >= 1; --i)
						if (47 === (t = e.charCodeAt(i))) {
							if (!o) {
								r = i;
								break
							}
						} else o = !1;
					return -1 === r ? n ? "/" : "." : n && 1 === r ? "/" : e.slice(0, r)
				}, t.basename = function(e, t) {
					var n = function(e) {
						"string" != typeof e && (e += "");
						var t, n = 0,
							r = -1,
							o = !0;
						for (t = e.length - 1; t >= 0; --t)
							if (47 === e.charCodeAt(t)) {
								if (!o) {
									n = t + 1;
									break
								}
							} else -1 === r && (o = !1, r = t + 1);
						return -1 === r ? "" : e.slice(n, r)
					}(e);
					return t && n.substr(-1 * t.length) === t && (n = n.substr(0, n.length - t.length)), n
				}, t.extname = function(e) {
					"string" != typeof e && (e += "");
					for (var t = -1, n = 0, r = -1, o = !0, i = 0, u = e.length - 1; u >= 0; --u) {
						var a = e.charCodeAt(u);
						if (47 !== a) - 1 === r && (o = !1, r = u + 1), 46 === a ? -1 === t ? t = u : 1 !== i && (i = 1) : -1 !== t && (i = -1);
						else if (!o) {
							n = u + 1;
							break
						}
					}
					return -1 === t || -1 === r || 0 === i || 1 === i && t === r - 1 && t === n + 1 ? "" : e.slice(t, r)
				};
				var o = "b" === "ab".substr(-1) ? function(e, t, n) {
					return e.substr(t, n)
				} : function(e, t, n) {
					return t < 0 && (t = e.length + t), e.substr(t, n)
				}
			}).call(this, n(2))
		}, function(e, t) {
			function n(e) {
				return (n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
					return typeof e
				} : function(e) {
					return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
				})(e)
			}

			function r(e, t) {
				if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
				e.prototype = Object.create(t && t.prototype, {
					constructor: {
						value: e,
						writable: !0,
						configurable: !0
					}
				}), t && o(e, t)
			}

			function o(e, t) {
				return (o = Object.setPrototypeOf || function(e, t) {
					return e.__proto__ = t, e
				})(e, t)
			}

			function i(e) {
				var t = function() {
					if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
					if (Reflect.construct.sham) return !1;
					if ("function" == typeof Proxy) return !0;
					try {
						return Date.prototype.toString.call(Reflect.construct(Date, [], (function() {}))), !0
					} catch (e) {
						return !1
					}
				}();
				return function() {
					var n, r = a(e);
					if (t) {
						var o = a(this).constructor;
						n = Reflect.construct(r, arguments, o)
					} else n = r.apply(this, arguments);
					return u(this, n)
				}
			}

			function u(e, t) {
				return !t || "object" !== n(t) && "function" != typeof t ? function(e) {
					if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
					return e
				}(e) : t
			}

			function a(e) {
				return (a = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
					return e.__proto__ || Object.getPrototypeOf(e)
				})(e)
			}

			function s(e, t) {
				if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
			}

			function c(e, t) {
				for (var n = 0; n < t.length; n++) {
					var r = t[n];
					r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
				}
			}

			function f(e, t, n) {
				return t && c(e.prototype, t), n && c(e, n), e
			}
			var l = function() {
					function e(t, n, r, o) {
						switch (s(this, e), this._size = n, this._module = t, this._size) {
							case 1:
								this._heapArray = r ? this._module.HEAP8 : this._module.HEAPU8;
								break;
							case 2:
								this._heapArray = r ? this._module.HEAP16 : this._module.HEAPU16;
								break;
							case 4:
								this._heapArray = r ? this._module.HEAP32 : this._module.HEAPU32;
								break;
							default:
								this._heapArray = this._module.HEAPU8
						}
						o && (this._size = 4, this._heapArray = this._module.HEAPF32), this._pointer = this._module._malloc(n)
					}
					return f(e, [{
						key: "free",
						value: function() {
							this._module._free(this.pointer)
						}
					}, {
						key: "pointer",
						get: function() {
							return this._pointer
						}
					}, {
						key: "value",
						get: function() {
							var e = 0;
							switch (this._size) {
								case 2:
									e = 1;
									break;
								case 4:
									e = 2;
									break;
								default:
									throw new Error("Pointer can be only deferenced as integer-sized")
							}
							return this._heapArray[this.pointer >> e]
						},
						set: function(e) {
							var t = 0;
							switch (this._size) {
								case 2:
									t = 1;
									break;
								case 4:
									t = 2;
									break;
								default:
									throw new Error("Pointer can be only deferenced as integer-sized")
							}
							this._heapArray[this.pointer >> t] = e
						}
					}]), e
				}(),
				p = function(e) {
					r(n, e);
					var t = i(n);

					function n(e, r) {
						var o;
						return s(this, n), o = t.call(this, e, 4, !0, !1), void 0 !== r && (o.value = r), o
					}
					return n
				}(l),
				_ = function(e) {
					r(n, e);
					var t = i(n);

					function n(e, r) {
						var o;
						return s(this, n), o = t.call(this, e, 4, !1, !1), void 0 !== r && (o.value = r), o
					}
					return n
				}(l),
				d = function(e) {
					r(n, e);
					var t = i(n);

					function n(e, r, o, i, u) {
						var a;
						s(this, n), a = t.call(this, e, r * o, i, u);
						var c = 0;
						switch (o) {
							case 1:
								a._heapArray = i ? a._module.HEAP8 : a._module.HEAPU8, c = 0;
								break;
							case 2:
								a._heapArray = i ? a._module.HEAP16 : a._module.HEAPU16, c = 1;
								break;
							case 4:
								a._heapArray = i ? a._module.HEAP32 : a._module.HEAPU32, c = 2;
								break;
							default:
								throw new Error("Unit size must be an integer-size")
						}
						u && (a._heapArray = a._module.HEAPF32, c = 2);
						var f = a._pointer >> c;
						return a._buffer = a._heapArray.subarray(f, f + r), a._length = r, a
					}
					return f(n, [{
						key: "set",
						value: function(e, t) {
							this._buffer.set(e, t)
						}
					}, {
						key: "subarray",
						value: function(e, t) {
							return this._buffer.subarray(e, t)
						}
					}, {
						key: "length",
						get: function() {
							return this._length
						}
					}]), n
				}(l),
				h = function(e) {
					r(n, e);
					var t = i(n);

					function n(e, r) {
						return s(this, n), t.call(this, e, r, 4, !0, !0)
					}
					return n
				}(d),
				m = function(e) {
					r(n, e);
					var t = i(n);

					function n(e, r) {
						return s(this, n), t.call(this, e, r, 1, !1, !1)
					}
					return n
				}(d),
				y = function() {
					function e(t) {
						s(this, e), this._module = t
					}
					return f(e, [{
						key: "mallocInt32",
						value: function(e) {
							return new p(this._module, e)
						}
					}, {
						key: "mallocUint32",
						value: function(e) {
							return new _(this._module, e)
						}
					}, {
						key: "mallocUint8Buffer",
						value: function(e) {
							return new m(this._module, e)
						}
					}, {
						key: "mallocFloat32Buffer",
						value: function(e) {
							return new h(this._module, e)
						}
					}]), e
				}();
			e.exports = {
				writeString: function(e, t, n) {
					for (var r = 0; r < n.length; r++) e.setUint8(t + r, n.charCodeAt(r))
				},
				EmscriptenMemoryAllocator: y
			}
		}, function(e, t) {
			var n, r, o = e.exports = {};

			function i() {
				throw new Error("setTimeout has not been defined")
			}

			function u() {
				throw new Error("clearTimeout has not been defined")
			}

			function a(e) {
				if (n === setTimeout) return setTimeout(e, 0);
				if ((n === i || !n) && setTimeout) return n = setTimeout, setTimeout(e, 0);
				try {
					return n(e, 0)
				} catch (t) {
					try {
						return n.call(null, e, 0)
					} catch (t) {
						return n.call(this, e, 0)
					}
				}
			}! function() {
				try {
					n = "function" == typeof setTimeout ? setTimeout : i
				} catch (e) {
					n = i
				}
				try {
					r = "function" == typeof clearTimeout ? clearTimeout : u
				} catch (e) {
					r = u
				}
			}();
			var s, c = [],
				f = !1,
				l = -1;

			function p() {
				f && s && (f = !1, s.length ? c = s.concat(c) : l = -1, c.length && _())
			}

			function _() {
				if (!f) {
					var e = a(p);
					f = !0;
					for (var t = c.length; t;) {
						for (s = c, c = []; ++l < t;) s && s[l].run();
						l = -1, t = c.length
					}
					s = null, f = !1,
						function(e) {
							if (r === clearTimeout) return clearTimeout(e);
							if ((r === u || !r) && clearTimeout) return r = clearTimeout, clearTimeout(e);
							try {
								r(e)
							} catch (t) {
								try {
									return r.call(null, e)
								} catch (t) {
									return r.call(this, e)
								}
							}
						}(e)
				}
			}

			function d(e, t) {
				this.fun = e, this.array = t
			}

			function h() {}
			o.nextTick = function(e) {
				var t = new Array(arguments.length - 1);
				if (arguments.length > 1)
					for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
				c.push(new d(e, t)), 1 !== c.length || f || a(_)
			}, d.prototype.run = function() {
				this.fun.apply(null, this.array)
			}, o.title = "browser", o.browser = !0, o.env = {}, o.argv = [], o.version = "", o.versions = {}, o.on = h, o.addListener = h, o.once = h, o.off = h, o.removeListener = h, o.removeAllListeners = h, o.emit = h, o.prependListener = h, o.prependOnceListener = h, o.listeners = function(e) {
				return []
			}, o.binding = function(e) {
				throw new Error("process.binding is not supported")
			}, o.cwd = function() {
				return "/"
			}, o.chdir = function(e) {
				throw new Error("process.chdir is not supported")
			}, o.umask = function() {
				return 0
			}
		}, function(e, t) {
			e.exports = function(e) {
				return e.webpackPolyfill || (e.deprecate = function() {}, e.paths = [], e.children || (e.children = []), Object.defineProperty(e, "loaded", {
					enumerable: !0,
					get: function() {
						return e.l
					}
				}), Object.defineProperty(e, "id", {
					enumerable: !0,
					get: function() {
						return e.i
					}
				}), e.webpackPolyfill = 1), e
			}
		}, function(e, t) {}, function(e, t, n) {
			function r(e) {
				var t, r = n(6),
					o = n(7),
					i = n(8);
				e.onmessage = function(e) {
					var n = e.data.command;
					switch (n) {
						case "loadEncoder":
							var u, a = e.data,
								s = a.mimeType,
								c = a.wasmPath;
							switch (s) {
								case "audio/wav":
								case "audio/wave":
									u = r;
									break;
								case "audio/webm":
									u = o;
									break;
								case "audio/ogg":
									u = i
							}
							var f = {};
							c && (f.locateFile = function(e, t) {
								return e.match(/.wasm/) ? c : t + e
							}), u(f).then((function(e) {
								t = e, self.postMessage({
									command: "readyToInit"
								})
							}));
							break;
						case "init":
							var l = e.data,
								p = l.sampleRate,
								_ = l.channelCount,
								d = l.bitsPerSecond;
							t.init(p, _, d);
							break;
						case "pushInputData":
							for (var h = e.data, m = h.channelBuffers, y = (h.length, h.duration, 0); y < m.length; y++) m[y] = new Float32Array(m[y].buffer);
							t.encode(m);
							break;
						case "getEncodedData":
						case "done":
							"done" === n && t.close();
							var v = t.flush();
							self.postMessage({
								command: "done" === n ? "lastEncodedData" : "encodedData",
								buffers: v
							}, v), "done" === n && self.close()
					}
				}
			}
			"undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && r(self), e.exports = r
		}, function(e, t, n) {
			function r(e) {
				return function(e) {
					if (Array.isArray(e)) return o(e)
				}(e) || function(e) {
					if ("undefined" != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e)
				}(e) || function(e, t) {
					if (!e) return;
					if ("string" == typeof e) return o(e, t);
					var n = Object.prototype.toString.call(e).slice(8, -1);
					"Object" === n && e.constructor && (n = e.constructor.name);
					if ("Map" === n || "Set" === n) return Array.from(e);
					if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return o(e, t)
				}(e) || function() {
					throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
				}()
			}

			function o(e, t) {
				(null == t || t > e.length) && (t = e.length);
				for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
				return r
			}

			function i(e, t) {
				for (var n = 0; n < t.length; n++) {
					var r = t[n];
					r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
				}
			}
			var u = n(1).writeString,
				a = 3,
				s = function() {
					function e(t, n, r) {
						! function(e, t) {
							if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
						}(this, e), this.config = {
							inputSampleRate: t,
							channelCount: n
						}, this.encodedBuffers = []
					}
					var t, n, r;
					return t = e, (n = [{
						key: "encode",
						value: function(e) {
							for (var t = e[0].length, n = new ArrayBuffer(t * a * this.config.channelCount), r = new DataView(n), o = 0; o < this.config.channelCount; o++)
								for (var i = e[o], u = 0; u < t; u++) {
									var s = 8388607  * i[u] | 0;
									s > 8388607 ? s = 8388607 : s < -8388608  && (s = -8388608 );
									var c = (u * this.config.channelCount + o) * a;
									var valz = 0 | s; 
									var uinx  = valz & 0xff;
                                    r.setUint8(c, uinx);
									var uiny  =(valz & 0xff00) >> 8;
									r.setUint8(c+1, uiny);
									var uinz  =(valz & 0xff0000) >> 16;
									r.setUint8(c+2, uinz);
								}
							this.encodedBuffers.push(n)
						}
					}, {
						key: "getHeader",
						value: function() {
							var e = this.encodedBuffers.reduce((function(e, t) {
									return e + t.byteLength
								}), 0),
								t = new ArrayBuffer(44),
								n = new DataView(t);
							return u(n, 0, "RIFF"), n.setUint32(4, 36 + e, !0), u(n, 8, "WAVE"), u(n, 12, "fmt "), n.setUint32(16, 16, !0), n.setUint16(20, 1, !0), n.setUint16(22, this.config.channelCount, !0), n.setUint32(24, this.config.inputSampleRate, !0), n.setUint32(28, this.config.inputSampleRate * a * this.config.channelCount, !0), n.setUint16(32, a * this.config.channelCount, !0), n.setUint16(34, 8 * a, !0), u(n, 36, "data"), n.setUint32(40, e, !0), t
						}
					}]) && i(t.prototype, n), r && i(t, r), e
				}();
			e.exports = function(e) {
				return new Promise((function(t, n) {
					(e = void 0 !== e && e || {}).init = function(t, n, r) {
						e.encoder = new s(t, n, r)
					}, e.encode = function(t) {
						e.encoder.encode(t)
					}, e.flush = function() {
						var t = e.encoder.getHeader(),
							n = e.encoder.encodedBuffers.splice(0, e.encoder.encodedBuffers.length);
						return [t].concat(r(n))
					}, e.close = function() {}, t(e)
				}))
			}
		}, function(e, t, n) {
			(function(e, r, o, i) {
				var u;

				function a(e) {
					return (a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
						return typeof e
					} : function(e) {
						return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
					})(e)
				}

				function s(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}

				function c(e, t) {
					for (var n = 0; n < t.length; n++) {
						var r = t[n];
						r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
					}
				}

				function f(e, t, n) {
					return t && c(e.prototype, t), n && c(e, n), e
				}
				var l, p = (l = (l = "undefined" != typeof document && document.currentScript ? document.currentScript.src : void 0) || e, function(e) {
					e = void 0 !== (e = e || {}) ? e : {};
					var t = n(1),
						i = t.EmscriptenMemoryAllocator,
						u = 2049,
						c = 48e3,
						p = 4e3,
						_ = 20,
						d = 6,
						h = 4096,
						m = 0,
						y = 4002,
						v = 0,
						b = function() {
							function t(n, r) {
								var o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0;
								s(this, t), this.config = {
									inputSampleRate: n,
									channelCount: r
								}, this.memory = new i(e), this._opus_encoder_create = e._opus_encoder_create, this._opus_encoder_ctl = e._opus_encoder_ctl, this._opus_encode_float = e._opus_encode_float, this._opus_encoder_destroy = e._opus_encoder_destroy, this._speex_resampler_init = e._speex_resampler_init, this._speex_resampler_process_interleaved_float = e._speex_resampler_process_interleaved_float, this._speex_resampler_destroy = e._speex_resampler_destroy, this._container = new e.Container, this._container.init(c, r, Math.floor(4294967295 * Math.random())), this.OpusInitCodec(c, r, o), this.SpeexInitResampler(n, c, r), this.inputSamplesPerChannel = n * _ / 1e3, this.outputSamplePerChannel = c * _ / 1e3, this.inputBufferIndex = 0, this.mInputBuffer = this.memory.mallocFloat32Buffer(this.inputSamplesPerChannel * r), this.mResampledBuffer = this.memory.mallocFloat32Buffer(this.outputSamplePerChannel * r), this.mOutputBuffer = this.memory.mallocUint8Buffer(p), this.interleavedBuffers = 1 !== r ? new Float32Array(h * r) : void 0
							}
							return f(t, [{
								key: "encode",
								value: function(e) {
									for (var t = this.interleave(e), n = 0; n < t.length;) {
										var r = Math.min(this.mInputBuffer.length - this.inputBufferIndex, t.length - n);
										if (this.mInputBuffer.set(t.subarray(n, n + r), this.inputBufferIndex), this.inputBufferIndex += r, this.inputBufferIndex >= this.mInputBuffer.length) {
											var o = this.memory.mallocUint32(this.inputSamplesPerChannel),
												i = this.memory.mallocUint32(this.outputSamplePerChannel),
												u = this._speex_resampler_process_interleaved_float(this.resampler, this.mInputBuffer.pointer, o.pointer, this.mResampledBuffer.pointer, i.pointer);
											if (o.free(), i.free(), u !== v) throw new Error("Resampling error.");
											var a = this._opus_encode_float(this.encoder, this.mResampledBuffer.pointer, this.outputSamplePerChannel, this.mOutputBuffer.pointer, this.mOutputBuffer.length);
											if (a < 0) throw new Error("Opus encoding error.");
											this._container.writeFrame(this.mOutputBuffer.pointer, a, this.outputSamplePerChannel), this.inputBufferIndex = 0
										}
										n += r
									}
								}
							}, {
								key: "close",
								value: function() {
									for (var t = this.config.channelCount, n = [], r = 0; r < t; ++r) n.push(new Float32Array(h - this.inputBufferIndex / t));
									this.encode(n), e.destroy(this._container), this.mInputBuffer.free(), this.mResampledBuffer.free(), this.mOutputBuffer.free(), this._opus_encoder_destroy(this.encoder), this._speex_resampler_destroy(this.resampler)
								}
							}, {
								key: "interleave",
								value: function(e) {
									var t = e.length;
									if (1 === t) return e[0];
									for (var n = 0; n < t; n++)
										for (var r = e[n], o = 0; o < r.length; o++) this.interleavedBuffers[o * t + n] = r[o];
									return this.interleavedBuffers
								}
							}, {
								key: "OpusInitCodec",
								value: function(e, t) {
									var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0,
										r = this.memory.mallocUint32(void 0);
									this.encoder = this._opus_encoder_create(e, t, u, r.pointer);
									var o = r.value;
									if (r.free(), o !== m) throw new Error("Opus encodor initialization failed.");
									n && this.OpusSetOpusControl(y, n)
								}
							}, {
								key: "OpusSetOpusControl",
								value: function(e, t) {
									var n = this.memory.mallocInt32(t);
									this._opus_encoder_ctl(this.encoder, e, n.pointer), n.free()
								}
							}, {
								key: "SpeexInitResampler",
								value: function(e, t, n) {
									var r = this.memory.mallocUint32(void 0);
									this.resampler = this._speex_resampler_init(n, e, t, d, r.pointer);
									var o = r.value;
									if (r.free(), o !== v) throw new Error("Initializing resampler failed.")
								}
							}]), t
						}();
					e.init = function(t, n, r) {
						e.encodedBuffers = [], e.encoder = new b(t, n, r)
					}, e.encode = function(t) {
						e.encoder.encode(t)
					}, e.flush = function() {
						return e.encodedBuffers.splice(0, e.encodedBuffers.length)
					}, e.close = function() {
						e.encoder.close()
					};
					var g, w = {};
					for (g in e) e.hasOwnProperty(g) && (w[g] = e[g]);
					var A = [],
						C = !1,
						S = !1,
						x = !1,
						P = !1;
					C = "object" === ("undefined" == typeof window ? "undefined" : a(window)), S = "function" == typeof importScripts, x = "object" === (void 0 === r ? "undefined" : a(r)) && "object" === a(r.versions) && "string" == typeof r.versions.node, P = !C && !x && !S;
					var E, B, I, R, O = "";

					function j(t) {
						return e.locateFile ? e.locateFile(t, O) : O + t
					}
					x ? (O = S ? n(0).dirname(O) + "/" : o + "/", E = function(e, t) {
						return I || (I = n(4)), R || (R = n(0)), e = R.normalize(e), I.readFileSync(e, t ? null : "utf8")
					}, B = function(e) {
						var t = E(e, !0);
						return t.buffer || (t = new Uint8Array(t)), W(t.buffer), t
					}, r.argv.length > 1 && r.argv[1].replace(/\\/g, "/"), A = r.argv.slice(2), r.on("uncaughtException", (function(e) {
						if (!(e instanceof qe)) throw e
					})), r.on("unhandledRejection", _e), e.inspect = function() {
						return "[Emscripten Module object]"
					}) : P ? ("undefined" != typeof read && (E = function(e) {
						return read(e)
					}), B = function(e) {
						var t;
						return "function" == typeof readbuffer ? new Uint8Array(readbuffer(e)) : (W("object" === a(t = read(e, "binary"))), t)
					}, "undefined" != typeof scriptArgs ? A = scriptArgs : void 0 !== arguments && (A = arguments), "undefined" != typeof print && ("undefined" == typeof console && (console = {}), console.log = print, console.warn = console.error = "undefined" != typeof printErr ? printErr : print)) : (C || S) && (S ? O = self.location.href : document.currentScript && (O = document.currentScript.src), l && (O = l), O = 0 !== O.indexOf("blob:") ? O.substr(0, O.lastIndexOf("/") + 1) : "", E = function(e) {
						var t = new XMLHttpRequest;
						return t.open("GET", e, !1), t.send(null), t.responseText
					}, S && (B = function(e) {
						var t = new XMLHttpRequest;
						return t.open("GET", e, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response)
					}));
					var k, U, T = e.print || console.log.bind(console),
						F = e.printErr || console.warn.bind(console);
					for (g in w) w.hasOwnProperty(g) && (e[g] = w[g]);
					w = null, e.arguments && (A = e.arguments), e.thisProgram && e.thisProgram, e.quit && e.quit, e.wasmBinary && (k = e.wasmBinary), e.noExitRuntime && e.noExitRuntime, "object" !== ("undefined" == typeof WebAssembly ? "undefined" : a(WebAssembly)) && F("no native wasm support detected");
					var H = new WebAssembly.Table({
							initial: 60,
							maximum: 60,
							element: "anyfunc"
						}),
						M = !1;

					function W(e, t) {
						e || _e("Assertion failed: " + t)
					}
					var D = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;

					function z(e, t, n) {
						for (var r = t + n, o = t; e[o] && !(o >= r);) ++o;
						if (o - t > 16 && e.subarray && D) return D.decode(e.subarray(t, o));
						for (var i = ""; t < o;) {
							var u = e[t++];
							if (128 & u) {
								var a = 63 & e[t++];
								if (192 != (224 & u)) {
									var s = 63 & e[t++];
									if ((u = 224 == (240 & u) ? (15 & u) << 12 | a << 6 | s : (7 & u) << 18 | a << 12 | s << 6 | 63 & e[t++]) < 65536) i += String.fromCharCode(u);
									else {
										var c = u - 65536;
										i += String.fromCharCode(55296 | c >> 10, 56320 | 1023 & c)
									}
								} else i += String.fromCharCode((31 & u) << 6 | a)
							} else i += String.fromCharCode(u)
						}
						return i
					}

					function L(e, t) {
						return e ? z(q, e, t) : ""
					}
					"undefined" != typeof TextDecoder && new TextDecoder("utf-16le");
					var V, q, N, G = 65536;

					function X(t) {
						V = t, e.HEAP8 = new Int8Array(t), e.HEAP16 = new Int16Array(t), e.HEAP32 = N = new Int32Array(t), e.HEAPU8 = q = new Uint8Array(t), e.HEAPU16 = new Uint16Array(t), e.HEAPU32 = new Uint32Array(t), e.HEAPF32 = new Float32Array(t), e.HEAPF64 = new Float64Array(t)
					}
					var Y = 5289024,
						$ = 45984,
						J = e.INITIAL_MEMORY || 16777216;

					function K(t) {
						for (; t.length > 0;) {
							var n = t.shift();
							if ("function" != typeof n) {
								var r = n.func;
								"number" == typeof r ? void 0 === n.arg ? e.dynCall_v(r) : e.dynCall_vi(r, n.arg) : r(void 0 === n.arg ? null : n.arg)
							} else n()
						}
					}(U = e.wasmMemory ? e.wasmMemory : new WebAssembly.Memory({
						initial: J / G,
						maximum: J / G
					})) && (V = U.buffer), J = V.byteLength, X(V), N[$ >> 2] = Y;
					var Q = [],
						Z = [],
						ee = [],
						te = [];

					function ne() {
						if (e.preRun)
							for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length;) ue(e.preRun.shift());
						K(Q)
					}

					function re() {
						K(Z)
					}

					function oe() {
						K(ee)
					}

					function ie() {
						if (e.postRun)
							for ("function" == typeof e.postRun && (e.postRun = [e.postRun]); e.postRun.length;) ae(e.postRun.shift());
						K(te)
					}

					function ue(e) {
						Q.unshift(e)
					}

					function ae(e) {
						te.unshift(e)
					}
					var se = 0,
						ce = null,
						fe = null;

					function le(t) {
						se++, e.monitorRunDependencies && e.monitorRunDependencies(se)
					}

					function pe(t) {
						if (se--, e.monitorRunDependencies && e.monitorRunDependencies(se), 0 == se && (null !== ce && (clearInterval(ce), ce = null), fe)) {
							var n = fe;
							fe = null, n()
						}
					}

					function _e(t) {
						throw e.onAbort && e.onAbort(t), T(t += ""), F(t), M = !0, t = "abort(" + t + "). Build with -s ASSERTIONS=1 for more info.", new WebAssembly.RuntimeError(t)
					}
					e.preloadedImages = {}, e.preloadedAudios = {};
					var de = "data:application/octet-stream;base64,";

					function he(e) {
						return String.prototype.startsWith ? e.startsWith(de) : 0 === e.indexOf(de)
					}
					var me = "WebMOpusEncoder.wasm";

					function ye() {
						try {
							if (k) return new Uint8Array(k);
							if (B) return B(me);
							throw "both async and sync fetching of the wasm failed"
						} catch (e) {
							_e(e)
						}
					}

					function ve() {
						return k || !C && !S || "function" != typeof fetch ? new Promise((function(e, t) {
							e(ye())
						})) : fetch(me, {
							credentials: "same-origin"
						}).then((function(e) {
							if (!e.ok) throw "failed to load wasm binary file at '" + me + "'";
							return e.arrayBuffer()
						})).catch((function() {
							return ye()
						}))
					}

					function be() {
						var t = {
							a: Te
						};

						function n(t, n) {
							var r = t.exports;
							e.asm = r, pe()
						}

						function r(e) {
							n(e.instance)
						}

						function o(e) {
							return ve().then((function(e) {
								return WebAssembly.instantiate(e, t)
							})).then(e, (function(e) {
								F("failed to asynchronously prepare wasm: " + e), _e(e)
							}))
						}
						if (le(), e.instantiateWasm) try {
							return e.instantiateWasm(t, n)
						} catch (e) {
							return F("Module.instantiateWasm callback failed with error: " + e), !1
						}
						return function() {
							if (k || "function" != typeof WebAssembly.instantiateStreaming || he(me) || "function" != typeof fetch) return o(r);
							fetch(me, {
								credentials: "same-origin"
							}).then((function(e) {
								return WebAssembly.instantiateStreaming(e, t).then(r, (function(e) {
									F("wasm streaming compile failed: " + e), F("falling back to ArrayBuffer instantiation"), o(r)
								}))
							}))
						}(), {}
					}

					function ge(t, n) {
						var r = new Uint8Array(e.HEAPU8.buffer, t, n);
						e.encodedBuffers.push(new Uint8Array(r).buffer)
					}

					function we(e, t, n, r) {
						_e("Assertion failed: " + L(e) + ", at: " + [t ? L(t) : "unknown filename", n, r ? L(r) : "unknown function"])
					}
					he(me) || (me = j(me)), Z.push({
						func: function() {
							Me()
						}
					});
					var Ae = {
						mappings: {},
						buffers: [null, [],
							[]
						],
						printChar: function(e, t) {
							var n = Ae.buffers[e];
							0 === t || 10 === t ? ((1 === e ? T : F)(z(n, 0)), n.length = 0) : n.push(t)
						},
						varargs: void 0,
						get: function() {
							return Ae.varargs += 4, N[Ae.varargs - 4 >> 2]
						},
						getStr: function(e) {
							return L(e)
						},
						get64: function(e, t) {
							return e
						}
					};

					function Ce(e, t, n) {
						return Ae.varargs = n, 0
					}

					function Se(e, t, n) {
						Ae.varargs = n
					}

					function xe(e, t, n) {
						return Ae.varargs = n, 0
					}

					function Pe() {
						_e()
					}

					function Ee(e, t, n) {
						q.copyWithin(e, t, t + n)
					}

					function Be(e) {
						_e("OOM")
					}

					function Ie(e) {
						Be()
					}

					function Re(e) {
						return 0
					}

					function Oe(e, t, n, r) {
						var o = Ae.getStreamFromFD(e),
							i = Ae.doReadv(o, t, n);
						return N[r >> 2] = i, 0
					}

					function je(e, t, n, r, o) {}

					function ke(e, t, n, r) {
						for (var o = 0, i = 0; i < n; i++) {
							for (var u = N[t + 8 * i >> 2], a = N[t + (8 * i + 4) >> 2], s = 0; s < a; s++) Ae.printChar(e, q[u + s]);
							o += a
						}
						return N[r >> 2] = o, 0
					}

					function Ue(e) {
						var t = Date.now() / 1e3 | 0;
						return e && (N[e >> 2] = t), t
					}
					var Te = {
							a: we,
							e: Ce,
							h: Se,
							g: xe,
							b: Pe,
							m: ge,
							k: Ee,
							l: Ie,
							c: Re,
							f: Oe,
							j: je,
							d: ke,
							memory: U,
							table: H,
							i: Ue
						},
						Fe = be();
					e.asm = Fe;
					var He, Me = e.___wasm_call_ctors = function() {
							return (Me = e.___wasm_call_ctors = e.asm.n).apply(null, arguments)
						},
						We = (e.___em_js__emscriptenPushBuffer = function() {
							return (e.___em_js__emscriptenPushBuffer = e.asm.o).apply(null, arguments)
						}, e._emscripten_bind_VoidPtr___destroy___0 = function() {
							return (We = e._emscripten_bind_VoidPtr___destroy___0 = e.asm.p).apply(null, arguments)
						}),
						De = e._emscripten_bind_Container_Container_0 = function() {
							return (De = e._emscripten_bind_Container_Container_0 = e.asm.q).apply(null, arguments)
						},
						ze = e._emscripten_bind_Container_init_3 = function() {
							return (ze = e._emscripten_bind_Container_init_3 = e.asm.r).apply(null, arguments)
						},
						Le = e._emscripten_bind_Container_writeFrame_3 = function() {
							return (Le = e._emscripten_bind_Container_writeFrame_3 = e.asm.s).apply(null, arguments)
						},
						Ve = e._emscripten_bind_Container___destroy___0 = function() {
							return (Ve = e._emscripten_bind_Container___destroy___0 = e.asm.t).apply(null, arguments)
						};

					function qe(e) {
						this.name = "ExitStatus", this.message = "Program terminated with exit(" + e + ")", this.status = e
					}

					function Ne(t) {
						function n() {
							He || (He = !0, e.calledRun = !0, M || (re(), oe(), e.onRuntimeInitialized && e.onRuntimeInitialized(), ie()))
						}
						t = t || A, se > 0 || (ne(), se > 0 || (e.setStatus ? (e.setStatus("Running..."), setTimeout((function() {
							setTimeout((function() {
								e.setStatus("")
							}), 1), n()
						}), 1)) : n()))
					}
					if (e._opus_encoder_create = function() {
							return (e._opus_encoder_create = e.asm.u).apply(null, arguments)
						}, e._opus_encode_float = function() {
							return (e._opus_encode_float = e.asm.v).apply(null, arguments)
						}, e._opus_encoder_ctl = function() {
							return (e._opus_encoder_ctl = e.asm.w).apply(null, arguments)
						}, e._opus_encoder_destroy = function() {
							return (e._opus_encoder_destroy = e.asm.x).apply(null, arguments)
						}, e._speex_resampler_init = function() {
							return (e._speex_resampler_init = e.asm.y).apply(null, arguments)
						}, e._speex_resampler_destroy = function() {
							return (e._speex_resampler_destroy = e.asm.z).apply(null, arguments)
						}, e._speex_resampler_process_interleaved_float = function() {
							return (e._speex_resampler_process_interleaved_float = e.asm.A).apply(null, arguments)
						}, e._free = function() {
							return (e._free = e.asm.B).apply(null, arguments)
						}, e._malloc = function() {
							return (e._malloc = e.asm.C).apply(null, arguments)
						}, e.dynCall_vi = function() {
							return (e.dynCall_vi = e.asm.D).apply(null, arguments)
						}, e.dynCall_v = function() {
							return (e.dynCall_v = e.asm.E).apply(null, arguments)
						}, e.asm = Fe, e.then = function(t) {
							if (He) t(e);
							else {
								var n = e.onRuntimeInitialized;
								e.onRuntimeInitialized = function() {
									n && n(), t(e)
								}
							}
							return e
						}, fe = function e() {
							He || Ne(), He || (fe = e)
						}, e.run = Ne, e.preInit)
						for ("function" == typeof e.preInit && (e.preInit = [e.preInit]); e.preInit.length > 0;) e.preInit.pop()();

					function Ge() {}

					function Xe(e) {
						return (e || Ge).__cache__
					}

					function Ye(e, t) {
						var n = Xe(t),
							r = n[e];
						return r || ((r = Object.create((t || Ge).prototype)).ptr = e, n[e] = r)
					}

					function $e(e, t) {
						return Ye(e.ptr, t)
					}

					function Je(e) {
						if (!e.__destroy__) throw "Error: Cannot destroy object. (Did you create it yourself?)";
						e.__destroy__(), delete Xe(e.__class__)[e.ptr]
					}

					function Ke(e, t) {
						return e.ptr === t.ptr
					}

					function Qe(e) {
						return e.ptr
					}

					function Ze(e) {
						return e.__class__
					}

					function et() {
						throw "cannot construct a VoidPtr, no constructor in IDL"
					}

					function tt() {
						this.ptr = De(), Xe(tt)[this.ptr] = this
					}
					return Ne(), Ge.prototype = Object.create(Ge.prototype), Ge.prototype.constructor = Ge, Ge.prototype.__class__ = Ge, Ge.__cache__ = {}, e.WrapperObject = Ge, e.getCache = Xe, e.wrapPointer = Ye, e.castObject = $e, e.NULL = Ye(0), e.destroy = Je, e.compare = Ke, e.getPointer = Qe, e.getClass = Ze, et.prototype = Object.create(Ge.prototype), et.prototype.constructor = et, et.prototype.__class__ = et, et.__cache__ = {}, e.VoidPtr = et, et.prototype.__destroy__ = et.prototype.__destroy__ = function() {
						var e = this.ptr;
						We(e)
					}, tt.prototype = Object.create(Ge.prototype), tt.prototype.constructor = tt, tt.prototype.__class__ = tt, tt.__cache__ = {}, e.Container = tt, tt.prototype.init = tt.prototype.init = function(e, t, n) {
						var r = this.ptr;
						e && "object" === a(e) && (e = e.ptr), t && "object" === a(t) && (t = t.ptr), n && "object" === a(n) && (n = n.ptr), ze(r, e, t, n)
					}, tt.prototype.writeFrame = tt.prototype.writeFrame = function(e, t, n) {
						var r = this.ptr;
						e && "object" === a(e) && (e = e.ptr), t && "object" === a(t) && (t = t.ptr), n && "object" === a(n) && (n = n.ptr), Le(r, e, t, n)
					}, tt.prototype.__destroy__ = tt.prototype.__destroy__ = function() {
						var e = this.ptr;
						Ve(e)
					}, e
				});
				"object" === a(t) && "object" === a(i) ? i.exports = p : void 0 === (u = function() {
					return p
				}.apply(t, [])) || (i.exports = u)
			}).call(this, "/index.js", n(2), "/", n(3)(e))
		}, function(e, t, n) {
			(function(e, r, o, i) {
				var u;

				function a(e) {
					return (a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
						return typeof e
					} : function(e) {
						return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
					})(e)
				}

				function s(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}

				function c(e, t) {
					for (var n = 0; n < t.length; n++) {
						var r = t[n];
						r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
					}
				}

				function f(e, t, n) {
					return t && c(e.prototype, t), n && c(e, n), e
				}
				var l, p = (l = (l = "undefined" != typeof document && document.currentScript ? document.currentScript.src : void 0) || e, function(e) {
					e = void 0 !== (e = e || {}) ? e : {};
					var t = n(1),
						i = t.EmscriptenMemoryAllocator,
						u = 2049,
						c = 48e3,
						p = 4e3,
						_ = 20,
						d = 6,
						h = 4096,
						m = 0,
						y = 4002,
						v = 0,
						b = function() {
							function t(n, r) {
								var o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0;
								s(this, t), this.config = {
									inputSampleRate: n,
									channelCount: r
								}, this.memory = new i(e), this._opus_encoder_create = e._opus_encoder_create, this._opus_encoder_ctl = e._opus_encoder_ctl, this._opus_encode_float = e._opus_encode_float, this._opus_encoder_destroy = e._opus_encoder_destroy, this._speex_resampler_init = e._speex_resampler_init, this._speex_resampler_process_interleaved_float = e._speex_resampler_process_interleaved_float, this._speex_resampler_destroy = e._speex_resampler_destroy, this._container = new e.Container, this._container.init(c, r, Math.floor(4294967295 * Math.random())), this.OpusInitCodec(c, r, o), this.SpeexInitResampler(n, c, r), this.inputSamplesPerChannel = n * _ / 1e3, this.outputSamplePerChannel = c * _ / 1e3, this.inputBufferIndex = 0, this.mInputBuffer = this.memory.mallocFloat32Buffer(this.inputSamplesPerChannel * r), this.mResampledBuffer = this.memory.mallocFloat32Buffer(this.outputSamplePerChannel * r), this.mOutputBuffer = this.memory.mallocUint8Buffer(p), this.interleavedBuffers = 1 !== r ? new Float32Array(h * r) : void 0
							}
							return f(t, [{
								key: "encode",
								value: function(e) {
									for (var t = this.interleave(e), n = 0; n < t.length;) {
										var r = Math.min(this.mInputBuffer.length - this.inputBufferIndex, t.length - n);
										if (this.mInputBuffer.set(t.subarray(n, n + r), this.inputBufferIndex), this.inputBufferIndex += r, this.inputBufferIndex >= this.mInputBuffer.length) {
											var o = this.memory.mallocUint32(this.inputSamplesPerChannel),
												i = this.memory.mallocUint32(this.outputSamplePerChannel),
												u = this._speex_resampler_process_interleaved_float(this.resampler, this.mInputBuffer.pointer, o.pointer, this.mResampledBuffer.pointer, i.pointer);
											if (o.free(), i.free(), u !== v) throw new Error("Resampling error.");
											var a = this._opus_encode_float(this.encoder, this.mResampledBuffer.pointer, this.outputSamplePerChannel, this.mOutputBuffer.pointer, this.mOutputBuffer.length);
											if (a < 0) throw new Error("Opus encoding error.");
											this._container.writeFrame(this.mOutputBuffer.pointer, a, this.outputSamplePerChannel), this.inputBufferIndex = 0
										}
										n += r
									}
								}
							}, {
								key: "close",
								value: function() {
									for (var t = this.config.channelCount, n = [], r = 0; r < t; ++r) n.push(new Float32Array(h - this.inputBufferIndex / t));
									this.encode(n), e.destroy(this._container), this.mInputBuffer.free(), this.mResampledBuffer.free(), this.mOutputBuffer.free(), this._opus_encoder_destroy(this.encoder), this._speex_resampler_destroy(this.resampler)
								}
							}, {
								key: "interleave",
								value: function(e) {
									var t = e.length;
									if (1 === t) return e[0];
									for (var n = 0; n < t; n++)
										for (var r = e[n], o = 0; o < r.length; o++) this.interleavedBuffers[o * t + n] = r[o];
									return this.interleavedBuffers
								}
							}, {
								key: "OpusInitCodec",
								value: function(e, t) {
									var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0,
										r = this.memory.mallocUint32(void 0);
									this.encoder = this._opus_encoder_create(e, t, u, r.pointer);
									var o = r.value;
									if (r.free(), o !== m) throw new Error("Opus encodor initialization failed.");
									n && this.OpusSetOpusControl(y, n)
								}
							}, {
								key: "OpusSetOpusControl",
								value: function(e, t) {
									var n = this.memory.mallocInt32(t);
									this._opus_encoder_ctl(this.encoder, e, n.pointer), n.free()
								}
							}, {
								key: "SpeexInitResampler",
								value: function(e, t, n) {
									var r = this.memory.mallocUint32(void 0);
									this.resampler = this._speex_resampler_init(n, e, t, d, r.pointer);
									var o = r.value;
									if (r.free(), o !== v) throw new Error("Initializing resampler failed.")
								}
							}]), t
						}();
					e.init = function(t, n, r) {
						e.encodedBuffers = [], e.encoder = new b(t, n, r)
					}, e.encode = function(t) {
						e.encoder.encode(t)
					}, e.flush = function() {
						return e.encodedBuffers.splice(0, e.encodedBuffers.length)
					}, e.close = function() {
						e.encoder.close()
					};
					var g, w = {};
					for (g in e) e.hasOwnProperty(g) && (w[g] = e[g]);
					var A = [],
						C = !1,
						S = !1,
						x = !1,
						P = !1;
					C = "object" === ("undefined" == typeof window ? "undefined" : a(window)), S = "function" == typeof importScripts, x = "object" === (void 0 === r ? "undefined" : a(r)) && "object" === a(r.versions) && "string" == typeof r.versions.node, P = !C && !x && !S;
					var E, B, I, R, O = "";

					function j(t) {
						return e.locateFile ? e.locateFile(t, O) : O + t
					}
					x ? (O = S ? n(0).dirname(O) + "/" : o + "/", E = function(e, t) {
						return I || (I = n(4)), R || (R = n(0)), e = R.normalize(e), I.readFileSync(e, t ? null : "utf8")
					}, B = function(e) {
						var t = E(e, !0);
						return t.buffer || (t = new Uint8Array(t)), W(t.buffer), t
					}, r.argv.length > 1 && r.argv[1].replace(/\\/g, "/"), A = r.argv.slice(2), r.on("uncaughtException", (function(e) {
						if (!(e instanceof We)) throw e
					})), r.on("unhandledRejection", _e), e.inspect = function() {
						return "[Emscripten Module object]"
					}) : P ? ("undefined" != typeof read && (E = function(e) {
						return read(e)
					}), B = function(e) {
						var t;
						return "function" == typeof readbuffer ? new Uint8Array(readbuffer(e)) : (W("object" === a(t = read(e, "binary"))), t)
					}, "undefined" != typeof scriptArgs ? A = scriptArgs : void 0 !== arguments && (A = arguments), "undefined" != typeof print && ("undefined" == typeof console && (console = {}), console.log = print, console.warn = console.error = "undefined" != typeof printErr ? printErr : print)) : (C || S) && (S ? O = self.location.href : document.currentScript && (O = document.currentScript.src), l && (O = l), O = 0 !== O.indexOf("blob:") ? O.substr(0, O.lastIndexOf("/") + 1) : "", E = function(e) {
						var t = new XMLHttpRequest;
						return t.open("GET", e, !1), t.send(null), t.responseText
					}, S && (B = function(e) {
						var t = new XMLHttpRequest;
						return t.open("GET", e, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response)
					}));
					var k, U, T = e.print || console.log.bind(console),
						F = e.printErr || console.warn.bind(console);
					for (g in w) w.hasOwnProperty(g) && (e[g] = w[g]);
					w = null, e.arguments && (A = e.arguments), e.thisProgram && e.thisProgram, e.quit && e.quit, e.wasmBinary && (k = e.wasmBinary), e.noExitRuntime && e.noExitRuntime, "object" !== ("undefined" == typeof WebAssembly ? "undefined" : a(WebAssembly)) && F("no native wasm support detected");
					var H = new WebAssembly.Table({
							initial: 36,
							maximum: 36,
							element: "anyfunc"
						}),
						M = !1;

					function W(e, t) {
						e || _e("Assertion failed: " + t)
					}
					var D = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;

					function z(e, t, n) {
						for (var r = t + n, o = t; e[o] && !(o >= r);) ++o;
						if (o - t > 16 && e.subarray && D) return D.decode(e.subarray(t, o));
						for (var i = ""; t < o;) {
							var u = e[t++];
							if (128 & u) {
								var a = 63 & e[t++];
								if (192 != (224 & u)) {
									var s = 63 & e[t++];
									if ((u = 224 == (240 & u) ? (15 & u) << 12 | a << 6 | s : (7 & u) << 18 | a << 12 | s << 6 | 63 & e[t++]) < 65536) i += String.fromCharCode(u);
									else {
										var c = u - 65536;
										i += String.fromCharCode(55296 | c >> 10, 56320 | 1023 & c)
									}
								} else i += String.fromCharCode((31 & u) << 6 | a)
							} else i += String.fromCharCode(u)
						}
						return i
					}

					function L(e, t) {
						return e ? z(q, e, t) : ""
					}
					"undefined" != typeof TextDecoder && new TextDecoder("utf-16le");
					var V, q, N, G = 65536;

					function X(t) {
						V = t, e.HEAP8 = new Int8Array(t), e.HEAP16 = new Int16Array(t), e.HEAP32 = N = new Int32Array(t), e.HEAPU8 = q = new Uint8Array(t), e.HEAPU16 = new Uint16Array(t), e.HEAPU32 = new Uint32Array(t), e.HEAPF32 = new Float32Array(t), e.HEAPF64 = new Float64Array(t)
					}
					var Y = 5289728,
						$ = 46688,
						J = e.INITIAL_MEMORY || 16777216;

					function K(t) {
						for (; t.length > 0;) {
							var n = t.shift();
							if ("function" != typeof n) {
								var r = n.func;
								"number" == typeof r ? void 0 === n.arg ? e.dynCall_v(r) : e.dynCall_vi(r, n.arg) : r(void 0 === n.arg ? null : n.arg)
							} else n()
						}
					}(U = e.wasmMemory ? e.wasmMemory : new WebAssembly.Memory({
						initial: J / G,
						maximum: J / G
					})) && (V = U.buffer), J = V.byteLength, X(V), N[$ >> 2] = Y;
					var Q = [],
						Z = [],
						ee = [],
						te = [];

					function ne() {
						if (e.preRun)
							for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length;) ue(e.preRun.shift());
						K(Q)
					}

					function re() {
						K(Z)
					}

					function oe() {
						K(ee)
					}

					function ie() {
						if (e.postRun)
							for ("function" == typeof e.postRun && (e.postRun = [e.postRun]); e.postRun.length;) ae(e.postRun.shift());
						K(te)
					}

					function ue(e) {
						Q.unshift(e)
					}

					function ae(e) {
						te.unshift(e)
					}
					var se = 0,
						ce = null,
						fe = null;

					function le(t) {
						se++, e.monitorRunDependencies && e.monitorRunDependencies(se)
					}

					function pe(t) {
						if (se--, e.monitorRunDependencies && e.monitorRunDependencies(se), 0 == se && (null !== ce && (clearInterval(ce), ce = null), fe)) {
							var n = fe;
							fe = null, n()
						}
					}

					function _e(t) {
						throw e.onAbort && e.onAbort(t), T(t += ""), F(t), M = !0, t = "abort(" + t + "). Build with -s ASSERTIONS=1 for more info.", new WebAssembly.RuntimeError(t)
					}
					e.preloadedImages = {}, e.preloadedAudios = {};
					var de = "data:application/octet-stream;base64,";

					function he(e) {
						return String.prototype.startsWith ? e.startsWith(de) : 0 === e.indexOf(de)
					}
					var me = "OggOpusEncoder.wasm";

					function ye() {
						try {
							if (k) return new Uint8Array(k);
							if (B) return B(me);
							throw "both async and sync fetching of the wasm failed"
						} catch (e) {
							_e(e)
						}
					}

					function ve() {
						return k || !C && !S || "function" != typeof fetch ? new Promise((function(e, t) {
							e(ye())
						})) : fetch(me, {
							credentials: "same-origin"
						}).then((function(e) {
							if (!e.ok) throw "failed to load wasm binary file at '" + me + "'";
							return e.arrayBuffer()
						})).catch((function() {
							return ye()
						}))
					}

					function be() {
						var t = {
							a: Re
						};

						function n(t, n) {
							var r = t.exports;
							e.asm = r, pe()
						}

						function r(e) {
							n(e.instance)
						}

						function o(e) {
							return ve().then((function(e) {
								return WebAssembly.instantiate(e, t)
							})).then(e, (function(e) {
								F("failed to asynchronously prepare wasm: " + e), _e(e)
							}))
						}
						if (le(), e.instantiateWasm) try {
							return e.instantiateWasm(t, n)
						} catch (e) {
							return F("Module.instantiateWasm callback failed with error: " + e), !1
						}
						return function() {
							if (k || "function" != typeof WebAssembly.instantiateStreaming || he(me) || "function" != typeof fetch) return o(r);
							fetch(me, {
								credentials: "same-origin"
							}).then((function(e) {
								return WebAssembly.instantiateStreaming(e, t).then(r, (function(e) {
									F("wasm streaming compile failed: " + e), F("falling back to ArrayBuffer instantiation"), o(r)
								}))
							}))
						}(), {}
					}

					function ge(t, n) {
						var r = new Uint8Array(e.HEAPU8.buffer, t, n);
						e.encodedBuffers.push(new Uint8Array(r).buffer)
					}

					function we(e, t, n, r) {
						_e("Assertion failed: " + L(e) + ", at: " + [t ? L(t) : "unknown filename", n, r ? L(r) : "unknown function"])
					}

					function Ae() {
						_e()
					}

					function Ce(e, t, n) {
						q.copyWithin(e, t, t + n)
					}

					function Se(e) {
						_e("OOM")
					}

					function xe(e) {
						Se()
					}
					he(me) || (me = j(me)), Z.push({
						func: function() {
							ke()
						}
					});
					var Pe = {
						mappings: {},
						buffers: [null, [],
							[]
						],
						printChar: function(e, t) {
							var n = Pe.buffers[e];
							0 === t || 10 === t ? ((1 === e ? T : F)(z(n, 0)), n.length = 0) : n.push(t)
						},
						varargs: void 0,
						get: function() {
							return Pe.varargs += 4, N[Pe.varargs - 4 >> 2]
						},
						getStr: function(e) {
							return L(e)
						},
						get64: function(e, t) {
							return e
						}
					};

					function Ee(e) {
						return 0
					}

					function Be(e, t, n, r, o) {}

					function Ie(e, t, n, r) {
						for (var o = 0, i = 0; i < n; i++) {
							for (var u = N[t + 8 * i >> 2], a = N[t + (8 * i + 4) >> 2], s = 0; s < a; s++) Pe.printChar(e, q[u + s]);
							o += a
						}
						return N[r >> 2] = o, 0
					}
					var Re = {
							a: we,
							c: Ae,
							d: ge,
							f: Ce,
							g: xe,
							h: Ee,
							e: Be,
							b: Ie,
							memory: U,
							table: H
						},
						Oe = be();
					e.asm = Oe;
					var je, ke = e.___wasm_call_ctors = function() {
							return (ke = e.___wasm_call_ctors = e.asm.i).apply(null, arguments)
						},
						Ue = (e.___em_js__emscriptenPushBuffer = function() {
							return (e.___em_js__emscriptenPushBuffer = e.asm.j).apply(null, arguments)
						}, e._emscripten_bind_VoidPtr___destroy___0 = function() {
							return (Ue = e._emscripten_bind_VoidPtr___destroy___0 = e.asm.k).apply(null, arguments)
						}),
						Te = e._emscripten_bind_Container_Container_0 = function() {
							return (Te = e._emscripten_bind_Container_Container_0 = e.asm.l).apply(null, arguments)
						},
						Fe = e._emscripten_bind_Container_init_3 = function() {
							return (Fe = e._emscripten_bind_Container_init_3 = e.asm.m).apply(null, arguments)
						},
						He = e._emscripten_bind_Container_writeFrame_3 = function() {
							return (He = e._emscripten_bind_Container_writeFrame_3 = e.asm.n).apply(null, arguments)
						},
						Me = e._emscripten_bind_Container___destroy___0 = function() {
							return (Me = e._emscripten_bind_Container___destroy___0 = e.asm.o).apply(null, arguments)
						};

					function We(e) {
						this.name = "ExitStatus", this.message = "Program terminated with exit(" + e + ")", this.status = e
					}

					function De(t) {
						function n() {
							je || (je = !0, e.calledRun = !0, M || (re(), oe(), e.onRuntimeInitialized && e.onRuntimeInitialized(), ie()))
						}
						t = t || A, se > 0 || (ne(), se > 0 || (e.setStatus ? (e.setStatus("Running..."), setTimeout((function() {
							setTimeout((function() {
								e.setStatus("")
							}), 1), n()
						}), 1)) : n()))
					}
					if (e._opus_encoder_create = function() {
							return (e._opus_encoder_create = e.asm.p).apply(null, arguments)
						}, e._opus_encode_float = function() {
							return (e._opus_encode_float = e.asm.q).apply(null, arguments)
						}, e._opus_encoder_ctl = function() {
							return (e._opus_encoder_ctl = e.asm.r).apply(null, arguments)
						}, e._opus_encoder_destroy = function() {
							return (e._opus_encoder_destroy = e.asm.s).apply(null, arguments)
						}, e._malloc = function() {
							return (e._malloc = e.asm.t).apply(null, arguments)
						}, e._free = function() {
							return (e._free = e.asm.u).apply(null, arguments)
						}, e._speex_resampler_init = function() {
							return (e._speex_resampler_init = e.asm.v).apply(null, arguments)
						}, e._speex_resampler_destroy = function() {
							return (e._speex_resampler_destroy = e.asm.w).apply(null, arguments)
						}, e._speex_resampler_process_interleaved_float = function() {
							return (e._speex_resampler_process_interleaved_float = e.asm.x).apply(null, arguments)
						}, e.dynCall_vi = function() {
							return (e.dynCall_vi = e.asm.y).apply(null, arguments)
						}, e.dynCall_v = function() {
							return (e.dynCall_v = e.asm.z).apply(null, arguments)
						}, e.asm = Oe, e.then = function(t) {
							if (je) t(e);
							else {
								var n = e.onRuntimeInitialized;
								e.onRuntimeInitialized = function() {
									n && n(), t(e)
								}
							}
							return e
						}, fe = function e() {
							je || De(), je || (fe = e)
						}, e.run = De, e.preInit)
						for ("function" == typeof e.preInit && (e.preInit = [e.preInit]); e.preInit.length > 0;) e.preInit.pop()();

					function ze() {}

					function Le(e) {
						return (e || ze).__cache__
					}

					function Ve(e, t) {
						var n = Le(t),
							r = n[e];
						return r || ((r = Object.create((t || ze).prototype)).ptr = e, n[e] = r)
					}

					function qe(e, t) {
						return Ve(e.ptr, t)
					}

					function Ne(e) {
						if (!e.__destroy__) throw "Error: Cannot destroy object. (Did you create it yourself?)";
						e.__destroy__(), delete Le(e.__class__)[e.ptr]
					}

					function Ge(e, t) {
						return e.ptr === t.ptr
					}

					function Xe(e) {
						return e.ptr
					}

					function Ye(e) {
						return e.__class__
					}

					function $e() {
						throw "cannot construct a VoidPtr, no constructor in IDL"
					}

					function Je() {
						this.ptr = Te(), Le(Je)[this.ptr] = this
					}
					return De(), ze.prototype = Object.create(ze.prototype), ze.prototype.constructor = ze, ze.prototype.__class__ = ze, ze.__cache__ = {}, e.WrapperObject = ze, e.getCache = Le, e.wrapPointer = Ve, e.castObject = qe, e.NULL = Ve(0), e.destroy = Ne, e.compare = Ge, e.getPointer = Xe, e.getClass = Ye, $e.prototype = Object.create(ze.prototype), $e.prototype.constructor = $e, $e.prototype.__class__ = $e, $e.__cache__ = {}, e.VoidPtr = $e, $e.prototype.__destroy__ = $e.prototype.__destroy__ = function() {
						var e = this.ptr;
						Ue(e)
					}, Je.prototype = Object.create(ze.prototype), Je.prototype.constructor = Je, Je.prototype.__class__ = Je, Je.__cache__ = {}, e.Container = Je, Je.prototype.init = Je.prototype.init = function(e, t, n) {
						var r = this.ptr;
						e && "object" === a(e) && (e = e.ptr), t && "object" === a(t) && (t = t.ptr), n && "object" === a(n) && (n = n.ptr), Fe(r, e, t, n)
					}, Je.prototype.writeFrame = Je.prototype.writeFrame = function(e, t, n) {
						var r = this.ptr;
						e && "object" === a(e) && (e = e.ptr), t && "object" === a(t) && (t = t.ptr), n && "object" === a(n) && (n = n.ptr), He(r, e, t, n)
					}, Je.prototype.__destroy__ = Je.prototype.__destroy__ = function() {
						var e = this.ptr;
						Me(e)
					}, e
				});
				"object" === a(t) && "object" === a(i) ? i.exports = p : void 0 === (u = function() {
					return p
				}.apply(t, [])) || (i.exports = u)
			}).call(this, "/index.js", n(2), "/", n(3)(e))
		}]);
	}
});