/**
 * Created by linxiaojie on 2015/10/14.
 * 检测客户端服务
 */
var Event = require('./Event'),
    Params = require('./Params'),
    Util = require('./Util');

var isCheck = false,
    port = '',
    mmPort = [9818, 19818, 29818, 39818, 49818, 59818],
    versionUrl = Params.versionUrl,
    errCount = 0,
    version_reg = /^(MIGUHUI)[0-9]+(\.[0-9]*|$)?(\.[0-9]*|$)?/i,
    slice = [].slice,
    check_args = [], //服务端校验传入的参数;
    temp = null ;

/*
    暴露全局方法设置版本信息

 */
window.__MIGU_ZONE_VERSION = null;
if( window['setmiguzoneversion'] == undefined){
    window['setmiguzoneversion'] = function(app){
        window.__MIGU_ZONE_VERSION = app;
    }
}else {
    console.log('mgwap 设置版本方法setmiguzoneversion被占用');
}

/*
    开始检测MM，下载、详情等调用MM功能都会触发次事件，
    evt参数为 method，其他参数；
    检测MM成功会把参数传给success事件回调
    检测MM失败会把参数传给error事件回调
 */
function check(evt) {
    check_args = slice.call(evt.args, 1);
    if (isCheck) return;
    Event.trigger("server.before.check");
    mmPort.forEach(function(p) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.setAttribute("port", p);
        script.setAttribute("class", "__js_load_mm");
        script.onload = script.onerror = load;
        script.src = versionUrl.replace("{port}", p) + "?" + Date.now();
        document.getElementsByTagName("head")[0].appendChild(script)
    })
};

//页面有a变量，需先存起来，避免被覆盖 ----历史预留问题
/*function hasFlag(){
    if(typeof window.a !== 'undefined' && typeof window.a.appname == 'undefined'){
        temp = window.a;
    }
};*/

function beforeCheck() {
    removeAll();
    isCheck = true;
    port = '';
    errCount = 0;
    Util.setCookie(Params.port, null);
    Util.setCookie(Params.version, null);
    Util.setCookie(Params.version_type, null);
};

function afterCheck(evt) {
    var args = evt.args.slice(1),
        e = function() {
            check_args.unshift("server.check.error");
            Event.trigger.apply(Event, check_args);
        };
    removeAll();
    if ("success" === args[0]) {
        Util.setCookie(Params.port, args[1]);
        //历史问题，客户端连接校验直接返回了全局变量a，会有覆盖页面变量的风险
        var a = window.__MIGU_ZONE_VERSION;
        if ( typeof a != 'undefined' &&  !!a && typeof a.appname != 'undefined') {
            setVersion(a);
            window.__MIGU_ZONE_VERSION = null;
            check_args.unshift("server.check.success");
            Event.trigger.apply(Event, check_args);
        } else {
            e();
        }
    } else {
        e();
    }
    isCheck = false;
    port = '';
    errCount = 0;
};

function setVersion(a) {
    var appname = a.appname;
    if (appname && appname.length > 0) {
        var v = appname.match(version_reg);
        if (!!v) {
            //版本标志：lite or normal
            var vtype = v[1] || 'MIGUHUI';
            Util.setCookie(Params.version_type, vtype.toUpperCase());

            v = v[0].replace(/(MIGUHUI)/i, '');
            if (v.length > 0) {
                var vs = v.replace(/\./g, '');
                Util.setCookie(Params.version, vs || 0);
                //debug.log(vtype.toUpperCase()+"  "+vs)
            }
        }
    }
}



function removeAll() {
    var loads = document.getElementsByClassName("__js_load_mm");
    if (loads.length) {
        var els = slice.call(loads);
        els.forEach(function(el) {
            el.onload = el.onerror = null;
            el.remove && (el.remove(), 1) || el.parentNode && (el.parentNode.removeChild(el), 1);
        })
    }
};

function load(e) {
    if (port !== '') return;
    if (e.type == 'load') {
        var target = e.target;
        port = target.getAttribute("port");
        //debug.log("load success :"+port);
        Event.trigger("server.after.check", "success", port);
    } else {
        errCount++;
        if (errCount == mmPort.length) {
            Event.trigger("server.after.check", "error");
        }
    }
};

var init = function (){
    Event.on("server.before.check", beforeCheck.bind(this));
    Event.on("server.after.check", afterCheck.bind(this));
    Event.on("server.check.start", check.bind(this));
}

module.exports = {init: init};
