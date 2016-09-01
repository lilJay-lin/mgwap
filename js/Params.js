/**
 * Created by linxiaojie on 2015/10/14.
 * 功能操作相关参数
 * socket方式地址配置，schema方式配置和socket调用的相关参数写在client里面
 */
var Util = require('./Util'),
    url = "http://{adress}:{port}/moversion",
    baseUrl = "http://{adress}:{port}/action=",
    domain = "wx.mm-img.com",
    remoteIp = "127.0.0.1";

if (!!navigator.userAgent.toLowerCase().match(/MicroMessenger|MQQBrowser/i)) {
    url = url.replace("{adress}", domain);
    baseUrl = baseUrl.replace("{adress}", domain);
} else {
    url = url.replace("{adress}", remoteIp);
    baseUrl = baseUrl.replace("{adress}", remoteIp);
}


module.exports = {
    versionUrl: url, //mm激活地址
    baseUrl: baseUrl, //mm功能操作地址
    DAEMON: "mmcd",
    mmpkg: "com.aspire.mm",
    version: "mmversion",
    version_type: "mmversiontype",
    port: "mmport",
    getBaseUrl: function() {
        var me = this,
            port = Util.getCookie(me.port);
        return baseUrl.replace("{port}", port);
    }
};