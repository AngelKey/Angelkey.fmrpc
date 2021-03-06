// Generated by IcedCoffeeScript 108.0.11
(function() {
  var List, Listener, Transport, dbg, iced, log, net, tls, __iced_k, __iced_k_noop;

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  net = require('net');

  tls = require('tls');

  Transport = require('./transport').Transport;

  List = require('./list').List;

  log = require('./log');

  dbg = require('./debug');

  iced = require('./iced').runtime;

  exports.Listener = Listener = (function() {
    function Listener(_arg) {
      var log_obj;
      this.port = _arg.port, this.host = _arg.host, this.path = _arg.path, this.TransportClass = _arg.TransportClass, log_obj = _arg.log_obj, this.tls_opts = _arg.tls_opts;
      if (!this.TransportClass) {
        this.TransportClass = Transport;
      }
      this.set_logger(log_obj);
      this._children = new List;
      this._dbgr = null;
    }

    Listener.prototype._default_logger = function() {
      var h, l;
      l = log.new_default_logger();
      l.set_prefix("RPC-Server");
      h = this.host || "0.0.0.0";
      if (this.port != null) {
        l.set_remote("" + h + ":" + this.port);
      } else if (this.path != null) {
        l.set_remote(this.path);
      }
      return l;
    };

    Listener.prototype.set_debugger = function(d) {
      return this._dbgr = d;
    };

    Listener.prototype.set_debug_flags = function(f, apply_to_children) {
      this.set_debugger(dbg.make_debugger(f, this.log_obj));
      if (apply_to_children) {
        return this.walk_children((function(_this) {
          return function(c) {
            return c.set_debug_flags(f);
          };
        })(this));
      }
    };

    Listener.prototype.set_logger = function(o) {
      if (o == null) {
        o = this._default_logger();
      }
      return this.log_obj = o;
    };

    Listener.prototype.make_new_transport = function(c) {
      var x;
      if (!this.do_tcp_delay) {
        c.setNoDelay(true);
      }
      x = new this.TransportClass({
        net_stream: c,
        host: c.remoteAddress,
        port: c.remotePort,
        parent: this,
        log_obj: this.make_new_log_object(c),
        dbgr: this._dbgr
      });
      this._children.push(x);
      return x;
    };

    Listener.prototype.make_new_log_object = function(c) {
      var a, r;
      a = c.address();
      r = [c.address, c.port].join(":");
      return this.log_obj.make_child({
        prefix: "RPC",
        remote: r
      });
    };

    Listener.prototype.walk_children = function(fn) {
      return this._children.walk(fn);
    };

    Listener.prototype.close_child = function(c) {
      return this._children.remove(c);
    };

    Listener.prototype.set_port = function(p) {
      return this.port = p;
    };

    Listener.prototype._got_new_connection = function(c) {
      var x;
      x = this.make_new_transport(c);
      return this.got_new_connection(x);
    };

    Listener.prototype.got_new_connection = function(x) {
      throw new Error("@got_new_connection() is pure virtual; please implement!");
    };

    Listener.prototype._make_server = function() {
      if (this.tls_opts != null) {
        return this._net_server = tls.createServer(this.tls_opts, (function(_this) {
          return function(c) {
            return _this._got_new_connection(c);
          };
        })(this));
      } else {
        return this._net_server = net.createServer((function(_this) {
          return function(c) {
            return _this._got_new_connection(c);
          };
        })(this));
      }
    };

    Listener.prototype.close = function(cb) {
      var ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          if (_this._net_server) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/joshblum/go/src/github.com/keybase/node-framed-msgpack-rpc/src/listener.iced",
                funcname: "Listener.close"
              });
              _this._net_server.close(__iced_deferrals.defer({
                lineno: 120
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        });
      })(this)((function(_this) {
        return function() {
          _this._net_server = null;
          return cb();
        };
      })(this));
    };

    Listener.prototype.handle_close = function() {
      return this.log_obj.info("listener closing down");
    };

    Listener.prototype.handle_error = function(err) {
      this._net_server = null;
      return this.log_obj.error("error in listener: " + err);
    };

    Listener.prototype._set_hooks = function() {
      this._net_server.on('error', (function(_this) {
        return function(err) {
          return _this.handle_error(err);
        };
      })(this));
      return this._net_server.on('close', (function(_this) {
        return function(err) {
          return _this.handle_close();
        };
      })(this));
    };

    Listener.prototype.listen = function(cb) {
      var ERR, OK, err, rv, which, x, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      this._make_server();
      _ref = [0, 1], OK = _ref[0], ERR = _ref[1];
      rv = new iced.Rendezvous;
      x = this._net_server;
      if (this.port != null) {
        x.listen(this.port, this.host);
      } else {
        x.listen(this.path);
      }
      x.on('error', rv.id(ERR).defer({
        assign_fn: (function(_this) {
          return function() {
            return function() {
              return err = arguments[0];
            };
          };
        })(this)(),
        lineno: 153,
        context: __iced_deferrals
      }));
      x.on('listening', rv.id(OK).defer({
        lineno: 154,
        context: __iced_deferrals
      }));
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/joshblum/go/src/github.com/keybase/node-framed-msgpack-rpc/src/listener.iced",
            funcname: "Listener.listen"
          });
          rv.wait(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return which = arguments[0];
              };
            })(),
            lineno: 156
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (which === OK) {
            err = null;
            _this._set_hooks();
          } else {
            _this.log_obj.error(err);
            _this._net_server = null;
          }
          return cb(err);
        };
      })(this));
    };

    Listener.prototype.listen_retry = function(delay, cb) {
      var err, go, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      go = true;
      err = null;
      (function(_this) {
        return (function(__iced_k) {
          var _while;
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = __iced_k;
            _continue = function() {
              return iced.trampoline(function() {
                return _while(__iced_k);
              });
            };
            _next = _continue;
            if (!go) {
              return _break();
            } else {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/joshblum/go/src/github.com/keybase/node-framed-msgpack-rpc/src/listener.iced",
                  funcname: "Listener.listen_retry"
                });
                _this.listen(__iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return err = arguments[0];
                    };
                  })(),
                  lineno: 174
                }));
                __iced_deferrals._fulfill();
              })(function() {
                (function(__iced_k) {
                  if ((err != null ? err.code : void 0) === 'EADDRINUSE') {
                    _this.log_obj.warn(err);
                    (function(__iced_k) {
                      __iced_deferrals = new iced.Deferrals(__iced_k, {
                        parent: ___iced_passed_deferral,
                        filename: "/Users/joshblum/go/src/github.com/keybase/node-framed-msgpack-rpc/src/listener.iced",
                        funcname: "Listener.listen_retry"
                      });
                      setTimeout(__iced_deferrals.defer({
                        lineno: 177
                      }), delay * 1000);
                      __iced_deferrals._fulfill();
                    })(__iced_k);
                  } else {
                    return __iced_k(go = false);
                  }
                })(_next);
              });
            }
          };
          _while(__iced_k);
        });
      })(this)((function(_this) {
        return function() {
          return cb(err);
        };
      })(this));
    };

    return Listener;

  })();

}).call(this);
