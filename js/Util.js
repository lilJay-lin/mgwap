/**
 * Created by linxiaojie on 2015/10/14.
 */

var Util = {
    e: Object.prototype.toString,
    f: function(a) {
        return "[object Function]" == this.e.call(a)
    },
    o: function(a) {
        return "[object Object]" == this.e.call(a)
    },
    a: function(a) {
        return "[object Array]" == this.e.call(a)
    },
    s: function(a) {
        return "string" == typeof a
    },
    each: function(list, act) {
        var me = this;
        if (me.f(act)) {
            if (me.o(list)) {
                for (var k in list) {
                    act(k, list[k]);
                }
            } else if (list && list.length > 0) {
                for (var i = 0; i < list.length; i++) act(list[i], i);
            }
        }
    },
    CHATSET: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    encode: function(num) {
        var me = this,
            codeStr = "";
        if (!isNaN(num)) {
            var id = parseInt(num, 10),
                charSet = me.CHATSET,
                len = charSet.length;
            for (; id > 0; id = parseInt(id / len, 10)) {
                codeStr += charSet.charAt(parseInt(id % len, 10));
            }
        }
        return codeStr;
    },
    decode: function(encodeStr) {
        if (typeof encodeStr == 'undefined' || encodeStr.length == 0) {
            return 0;
        }
        var charSet = this.CHATSET,
            len = charSet.length,
            originalnumber = 0;
        for (var i = 0; i < encodeStr.length; i++) {
            var c = encodeStr.charAt(i),
                number = charSet.indexOf(c);
            originalnumber += (number * Math.pow(len, i));
        }
        return originalnumber;
    },
    setCookie: function(name, value, days) {
        var c = name + "=" + encodeURIComponent(value) + ";path=/";
        if (days != null) {
            var exp = new Date();
            exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
            c += ";expires=" + exp.toGMTString();
        }
        document.cookie = c;
    },
    getCookie: function(name) {
        var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (arr != null) return decodeURIComponent(arr[2]);
        return null;
    }
};

module.exports = Util;