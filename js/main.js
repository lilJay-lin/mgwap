/**
 * Created by linxiaojie on 2015/10/14.
 */
var Event = require('./Event'),
    Util = require('./Util'),
    Client = require('./Client'),
    ServerManager = require('./ServerManager'),
    //Dialog = require('./Dialog'),
    Config = require('./Config'),
    slice = [].slice;



//功能检测
if (!Function.prototype.bind) {
    Function.prototype.bind = function(obj) {
        var slice = [].slice,
            args = slice.call(arguments, 1),
            me = this,
            nop = function() {},
            bound = function() {
                return me.apply(this instanceof nop ? this : (obj || {}),
                    args.concat(slice.call(arguments)))
            };
        nop.prototype = me.prototype;
        bound.prototype = new nop();

        return bound
    }
}

/*
 注册校验服务
 */
ServerManager.init();


/*
 *
 * 注册功能列表
 * MM检测结果会触发success/error事件，
 * evt.arg为触发MM检测的参数，arg[0]为Client.method 名称，
 * 通过Client.execute进行回调
 */
Event.on("server.check.success", function(evt) {
    var args = evt.args.slice(1);
    var method = args&&args[0]||'';
    if(method == "downloadmm"){//二次激活成功时
        args.shift()
    }
    Client.execute.apply(Client, args);
});
Event.on("server.check.error", function(evt) {
    var args = slice.call(evt.args, 1);
    var method = args && args[0] || '';

    if(method !== "downloadmm"){//二次激活失败时，直接下载mm,不走error流程
        args.unshift("error");//调用error方法，走二次激活流程
    }else {//error二次激活失败
        //如果是open方法(type=false)，二次激活失败不走MM下载流程
        var origMethod = args[1];
        if (args.length === 4 && origMethod === 'open' && !args[3] ){
            return;
        }
    }


    Client.execute.apply(Client, args);
});


/*
 *
 * Dialog初始化
 *
 */
/*Util.each(document.querySelectorAll("script"), function(a) {
    var s = a.src;
    if (!!s) {
        var b = s.match(/^(.*)mmapp.js/);
        if (b) {
            Dialog.init(b[1])
        }
    }
});*/

/*
 指定环境上暴露接口:
 MIGUHUI1.0.0 :只提供打开指定页面的调起功能
*/
function init(context){
    context.mg = {
/*        download: function(id) {
            Event.trigger("server.check.start", "download", id);
        },
        detail: function(id) {
            Event.trigger("server.check.start", "detail", id);
        },*/
        /*
            使用MM打开指定url地址
            @param check {boolean} false:调起失败的时候，不跑MM下载流程

            注：MIGUHUI1.00 调起失败默认不跑MIGU下载流程
        */
        open: function(url, check) {
            //check === undefined && (check = true);
            check = false;
            Event.trigger("server.check.start", "open", url, check);
        },
        error: function(fn){
            if(typeof fn === 'function'){
                var cb = function(evt){
                    var args = slice.call(evt.args, 1);
                    var method = args && args[0] || '';
                    if(method == "downloadmm"){//二次激活失败时
                        fn.apply(this, arguments);
                    }
                };
                Event.on.call(Event, "server.check.error", cb);
            }
        }
        /**
         * @param {Object} arg:数组或字符串；字符串用“/”分隔应用ID
         */
/*        batchDownload: function(arg) {
            var me = this;
            if (typeof arg == 'undefined' || arg == "") {
                return;
            }
            var ids = new Array();
            if (Util.s(arg)) {
                if (!/^[\d\/]*$/.test(arg)) {
                    return;
                }
                ids = arg.split("/");
            } else if (Util.a(arg)) {
                if (arg.length == 0) {
                    return;
                }
                ids = arg;
            }
            if (ids.length > 0) {
                var str = "";
                var count = 0;
                ids.forEach(function(item) {
                    if (item && /^(\d)*$/.test(item)) {
                        str === "" ? str = Util.encode(item) : str += "-" + Util.encode(item);
                        count++;
                    }
                });
                if (count > me.get("batchMaxApps")) {
                    Dialog.show({
                        type: "alert",
                        info: me.get("maxAlert")
                    })
                } else if (str != "") {
                    Event.trigger("server.check.start", "batchDownload", str)
                }
            }
        },
        set: function(key, value) {
            var def = Config;
            if (key in def) {
                def[key] = value;
            }
        },
        get: function(key) {
            var def = Config;
            if (key in def) {
                return def[key];
            }
        },
        init: function(params) {
            if (typeof params == 'undefined' || !Util.o(params)) {
                return;
            }
            var def = Config;
            for (var prop in def) {
                if (prop in params) {
                    def[prop] = params[prop]
                }
            }
        }*/
    }
}

module.exports = {
    init: init
};