/**
 * Created by linxiaojie on 2015/10/14.
 * 客户端提供版本功能
 */
var Event = require('./Event'),
    Params = require('./Params'),
    Util = require('./Util'),
    //Dialog = require('./Dialog'),
    Config = require('./Config');
var slice = [].slice,
    versionUtil = {
        act: {
            b: 'batchdownload', //批量下载
            dl: 'download', //单应用下载
            d: 'detail' //详情
        },
        ls: {
            /*"MM": {},
            "MMLITE": {}*/
            "MIGUHUI": {}
        },
        init: function() {
            var me = this;
            //MIGU正式版本，版本功能：
            me.ls["MIGUHUI"][me.act.d] = 100;

            //MM正式版本，版本功能：
/*            me.ls["MM"][me.act.b] = 510;
            me.ls["MM"][me.act.dl] = 501;
            me.ls["MM"][me.act.d] = 500;*/

            //MMLite版本，版本功能：
/*            me.ls["MMLITE"][me.act.b] = 200;
            me.ls["MMLITE"][me.act.dl] = 200;
            me.ls["MMLITE"][me.act.d] = 200;*/
        },
        support: function(type) {
            var me = this,
                v = Util.getCookie(Params.version),
                vtype = Util.getCookie(Params.version_type),
                rs = false;
            if (!!type) {
                if (Util.s(v) && v.length > 0) {
                    v = parseInt(v, 10);
                    //debug.log(vtype)
                    var base = me.ls[vtype][type];
                    if (base && v >= base) { //高于或等于指定功能版本则支持
                        rs = true;
                    }
                }
            }
            return rs;
        },
        /**
         * 高于指定版本返回ture,否则返回false;
         */
        checkVersion: function(b) {
            var me = this,
                v = Util.getCookie(Params.version),
                rs = false;
            if (Util.s(v) && v.length > 0) {
                v = parseInt(v, 10);
                if (v > b) {
                    rs = true;
                }
            }
            return rs;
        }
    },
    browserUtil = {
        ua: navigator.userAgent.toLowerCase(),
        isChrome: function() {
            var ua = this.ua;
            return ua.match(/360 aphone /i) ? false : (ua.match(/Chrome/i) == "chrome");
        },
//				ua: function() {
//					var a = navigator.userAgent;
//					return a.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ? "ios" : a.match(/Android/i) ? "android" : ""
//				},
        query: function(p) {
            var r = '';
            for (var k in p) r += encodeURIComponent(k) + '=' + encodeURIComponent(p[k]) + '&';
            return r;
        },
        isWechat: function() {
            return this.ua.match(/MicroMessenger/i) == "micromessenger" ? 1 : 0;
        },
        isQq: function() {
            return this.ua.match(/MQQBrowser/i) ? 1 : 0;
        },
        bs: function() {
            var appname = '',
                ua = this.ua;
            var browser = {
                whatchar: ua.match(/MicroMessenger/i) ? '微信' : '',
                uc: ua.match(/(UCBrowser)|(UCWEB)/i) ? 'UC浏览器' : '',
                qq: ua.match(/MQQBrowser/i) ? 'QQ浏览器' : '',
                op: ua.match(/oupeng/i) ? '欧朋浏览器' : '',
                ay: ua.match(/MxBrowser/i) ? '遨游浏览器' : '',
                lb: ua.match(/LieBao/i) ? '猎豹浏览器' : '',
                xm: ua.match(/MiuiBrowser/i) ? '小米浏览器' : '',
                bd: ua.match(/baidubrowser/i) ? '百度浏览器' : '',
                b360: ua.match(/360 aphone/i) ? '360浏览器' : '',
                sg: ua.match(/sogoumobilebrowser/i) ? '搜狗浏览器' : ''
            };
            for (var b in browser) {
                if (browser[b] != '') {
                    appname = browser[b];
                    break;
                }
            }
            return appname;
        },
        longFileNameAccept: function() {
            var result = false,
                ua = this.ua;
            var browser = {
                //			whatchar:ua.match(/MicroMessenger/i)?'微信':'',
                //			uc:ua.match(/(UCBrowser)|(UCWEB)/i)?'UC浏览器':'',
                qq: ua.match(/MQQBrowser/i) ? 'QQ浏览器' : '',
                //			op:ua.match(/oupeng/i)?'欧朋浏览器':'',
                ay: ua.match(/MxBrowser/i) ? '遨游浏览器' : '',
                lb: ua.match(/LieBao/i) ? '猎豹浏览器' : '',
                //			xm:ua.match(/MiuiBrowser/i)?'小米浏览器':'',
                bd: ua.match(/baidubrowser/i) ? '百度浏览器' : '',
                //			b360:ua.match(/360 aphone browser/i)?'360浏览器':'',
                //			sg:ua.match(/sogoumobilebrowser/i)?'搜狗浏览器':''
            };
            for (var b in browser) {
                if (browser[b] != '') {
                    result = true;
                    break;
                }
            }
            return result;
        },
        getCurrentBs: function() {
            var me = this,
                bsName = this.bs();
            return bsName != '' ? bsName : '浏览器';
        }
    },
    client = {
        reqUrl: {//odp.mmarket.com => zjw.mmarket.com
            index: "miguhui://index",
            launch: "miguhui://launchbrowser?url=",
            appdetail: "mm://appdetail?requestid=app_info_forward&contentid=",
            //downloadUri: "http://zjw.mmarket.com/t.do?requestid=app_order&goodsid=999100008100930100001752138{contentid}&payMode=1",
            //wetchartmm: "http://a.app.qq.com/o/simple.jsp?pkgname=com.aspire.mm",
            //mmrelaapp: "http://zjw.mmarket.com/mmapk/{channelid}/mmarket-999100008100930100001752138{contentid}-180.apk",
            //batchmmrelaapp: "http://zjw.mmarket.com/mmapk/{channelid}/mmarket-{contentid}-180.apk",
            //MM_CONTENT_ID: "300000863435"
        },
        reqMethod: {
            queryapp: 'queryapp&appname=', //查询应用是否下载
            querydownprogress: 'querydownprogress&contentid=', //查询应用下载进度
            download: 'download&url=', //调起MM下载
            jump: 'jump&url=', //跳转指定页面 &appname=''
            batchdownload: 'batchdownload&contentids='
        },
        run: function(app, isOpen) {
            var me = this;
            if (isOpen && me.isChrome()) me.chrome(app);
            else me.iframe(app);
        },
        isChrome: function() {
            var ua = navigator.userAgent.toLowerCase();
            return ua.match(/360 aphone /i) ? false : (ua.match(/Chrome/i) == "chrome");
        },
        downloadApp: function(installUrl) {
            window.location.href = installUrl
        },
        chrome: function(url) {
            var b = url.split("://"),
                scheme = b[0],
                url = b[1],
                url1 = "intent://" + url + "#Intent;scheme=" + scheme + (scheme == "mm" ? ";package=" + Params.mmpkg : "") + ";end";
            window.location.href = url1;
        },
        iframe: function(url) {
            var e = document.createElement("iframe");
            e.style.display = "none";
            e.src = url;
            document.body.appendChild(e);
            setTimeout(function() {
                document.body.removeChild(e);
            }, 2000);
        },
        open: function(url, showtitle) {
            var me = this,
                v = versionUtil,
                b = browserUtil,
                showtitle = showtitle || Config.showtitle,
                reqUrl = me.reqUrl,
                reqMethod = me.reqMethod,
                mmap = reqUrl.launch + encodeURIComponent(url),
                baseUrl = Params.getBaseUrl();
            if (v.support(v.act.d)) {
                mmap = baseUrl + reqMethod.jump +
                    encodeURIComponent(url) + (showtitle ? ("&appname=" + b.getCurrentBs()) : '');
                me.iframe(mmap);
            } else {
                me.run(mmap, true);
            }
        },
/*        batchDownload: function(id) {
            //debug.log(id);
            this.download(id, versionUtil.act.b)
        },
        download: function(id, type) {
            var me = this,
                v = versionUtil,
                type = type || v.act.dl,
                reqUrl = me.reqUrl,
                reqMethod = me.reqMethod,
                mmap = reqUrl.appdetail + encodeURIComponent(id),
                baseUrl = Params.getBaseUrl();
            //debug.log("download "+type+" is support "+v.support(type))
            if (v.support(type)) {
                switch (type) {
                    case v.act.dl:
                        mmap = baseUrl + reqMethod.download +
                            encodeURIComponent(reqUrl.downloadUri.replace("{contentid}", id));
                        me.iframe(mmap);
                        //debug.log(mmap);
                        break;
                    case v.act.b:
                        mmap = baseUrl + reqMethod.batchdownload + id;
                        me.iframe(mmap);
                        //debug.log(mmap);
                        break;
                    default:
                        break;
                }
            } else {
                if (v.act.dl === type) {
                    me.run(mmap, true);
                } else if (v.act.b == type) {
                    var dl = function() {
                        //						debug.log("Dialog save -------------"+Date.now())
                        if (v.support(v.act.d)) {
                            var mmap = baseUrl + reqMethod.jump +
                                encodeURIComponent(reqUrl.appdetail + reqUrl.MM_CONTENT_ID) + (Config["showtitle"] ? ("&appname=" + browserUtil.getCurrentBs()) : '');
                            me.iframe(mmap);
                        } else {
                            var mmap = reqUrl.appdetail + encodeURIComponent(reqUrl.MM_CONTENT_ID);
                            me.run(mmap, true);
                        }
                    };
                    Dialog.one("dialog.after.show", function() {
                        Dialog.one("dialog.res.save", dl)
                    });
                    Dialog.show({
                        type: "alert",
                        info: Config["lowVersionAlert"]
                    })
                }
            }
        },
        detail: function(id, showtitle) {
            var me = this,
                v = versionUtil,
                b = browserUtil,
                reqUrl = me.reqUrl,
                showtitle = showtitle || Config.showtitle,
                reqMethod = me.reqMethod,
                mmap = reqUrl.appdetail + encodeURIComponent(id),
                baseUrl = Params.getBaseUrl();
            //debug.log(v.act.d)
            if (v.support(v.act.d)) {
                mmap = baseUrl + reqMethod.jump +
                    encodeURIComponent(reqUrl.appdetail + id) + (showtitle ? ("&appname=" + b.getCurrentBs()) : '');
                me.iframe(mmap);
            } else {
                me.run(mmap, true);
            }
        },
        */
        error: function() {
            var me = this,
                canIntent = Config["onIntent"],
                reqUrl = me.reqUrl,
                b = browserUtil,
                isUc = b.ua.match(/(UCBrowser)|(UCWEB)/i),
                isQq =  b.isQq() ?  1 : 0,
                timeout = isUc ?  2000 : 900,
                args = slice.call(arguments);
            var m = args[0];
            var is_alert = m === 'open' && !args[2];
            var cb = function(evtName){
                var n = evtName == undefined ? "server.check.start" : evtName;
                args.unshift("downloadmm");
                args.unshift(n);
                Event.trigger.apply(Event,args);
            };
            if (b.isWechat()) {
                /*
                注：MIGUHUI1.0.0 只有调起功能，微信也不做提示
                var dl = function() {
                    me.downloadApp(reqUrl.wetchartmm);
                };
                Dialog.one("dialog.after.show", function() {
                    Dialog.one("dialog.res.save", dl)
                });
                var flag = args[0] === 'detail' ? 'detail' : 'download';
                Dialog.show({
                    type: "weixin",
                    flag: flag
                })*/
                cb('server.check.error')
            } else {
                var t = Date.now(),
                    needCheckAgain = m != 'open' && m != 'detail';
                //args = slice.call(arguments);
                if(m === 'open'){
                    var url = args[1];
                    !!url && !isQq ? me.iframe(reqUrl.launch + encodeURIComponent(url)) : me.iframe(reqUrl.index);
                }else if(m === 'detail'){
                    var id = args[1];
                    !!id && !isQq ? me.iframe(reqUrl.appdetail + id ) : me.iframe(reqUrl.index);
                } else{
                    me.iframe(reqUrl.index);
                }
                //var d = Date.now();

                /*
                 UC浏览器走轮训流程
                 */
                /*if(b.ua.match(/(UCBrowser)|(UCWEB)/i)){
                 args.unshift("downloadmm")
                 args.unshift("server.longcheck.start");
                 Event.trigger.apply(Event,args);
                 }else{*/
                /*var cb = function(evtName){
                    var n = evtName == undefined ? "server.check.start" : evtName;
                    args.unshift("downloadmm");
                    args.unshift(n);
                    Event.trigger.apply(Event,args);
                };*/
                setTimeout(function() {
                    var e = Date.now();
                    //					debug.log(e - t);
                    //时间判断方法个别浏览器无效，如UC，基本js不挂起
                    /*
                     open / detail scheme直接传url/contentid跳到指定页面，所以不需要做二次校验，
                     直接判断为未下载： me.downloadmm
                     二次校验流程：args.unshift("downloadmm")
                     */
                    if(isQq){// QQ走二次激活流程
                        cb();
                    }else{
                        if (!t || e - t < timeout + 200) {//是打开页面的，判断调起失败，直接下载MM,排除不需要下载MM的（is_alert)
                            needCheckAgain ?  (
                                cb()
                            ) : (!is_alert && me.downloadmm.apply(me, args),cb('server.check.error'));

                        }else if(needCheckAgain){//成功调起，如果是非详情的，需要做二次调起，因为scheme的方式没有直接下载应用
                            cb();
                        }
                    }
                }, timeout);
                /*}*/
            }
        },
        downloadmm: function(){}
/*
 注：MIGUHUI1.0.0 只有调起功能，不做MM下载功能
         downloadmm: function(method) {
            var me = this,
                v = versionUtil,
                b = browserUtil,
                args = slice.call(arguments, 1),
                ids = args && args[0] || '',
                bs = b.bs(),
                longFileNameAccept = b.longFileNameAccept();
            if (!!method) {
                var type = (function() {
                    var t = "";
                    switch (method) {
                        case "download":
                            t = v.act.dl;
                            break;
                        case "batchDownload":
                            t = v.act.b;
                            break;
                        default:
                            t = v.act.d;
                            break;

                    }

                    return t;
                })();
                var url = me.getMMUrl(type);
                if (bs == '' || (!longFileNameAccept && type == v.act.b) || type == v.act.d) {
                    me.downloadApp(url.replace('{contentid}', ""))
                } else {
                    me.downloadApp(url.replace('{contentid}', ids))
                }
/!*                if (type != v.act.d) {
                    var gargs = slice.call(arguments);
                    gargs.unshift("server.check.start");
                    var save = function() {
                        Event.trigger.apply(Event, gargs);
                    };
                    setTimeout(function() {
                        Dialog.one("dialog.after.show", function() {
                            Dialog.one("dialog.res.save", save)
                        });
                        Dialog.show({
                            type: "guid",
                            flag: "download"
                        })
                    }, 1000)
                }*!/
                var flag = type != v.act.d ? 'download' : 'detail';
                var gargs = slice.call(arguments);
                gargs.unshift("server.check.start");
                var save = function() {
                    Event.trigger.apply(Event, gargs);
                };
                setTimeout(function() {
                    Dialog.one("dialog.after.show", function() {
                        Dialog.one("dialog.res.save", save)
                    });
                    Dialog.show({
                        type: "guid",
                        flag: flag
                    })
                }, 1000)
            }
        },
        getMMUrl: function(type) {
            var me = this,
                v = versionUtil,
                reqUrl = me.reqUrl;
            //批量下载应用 mm下载路径
            if (typeof type != "undefined" && type == v.act.b) {
                return reqUrl.batchmmrelaapp.replace("{channelid}", Config["channelid"]);
            } else { //单应用下载 mm下载路径
                return reqUrl.mmrelaapp.replace("{channelid}", Config["channelid"]);
            }
        }*/

    };

versionUtil.init();

module.exports = {
    execute: function(method) {
        var me = client;
        return me[method] && me[method].apply(me, slice.call(arguments, 1))
    }
};