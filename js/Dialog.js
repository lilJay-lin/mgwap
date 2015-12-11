/**
 * Created by linxiaojie on 2015/10/14.
 */
var Event = require('./Event'),
    Util = require('./Util');

/*
    TODO: 目前弹框杂合了html，模板变化时候不好操作，后期引入webpack，把弹框html模板单独隔离，使用模板渲染
 */
var Dialog = {
    cssloaded: 0,
    el: {},
    options: {
        type: "alert", //"alert|confirm|guid|weixin|"
        info: "",
        base: "",
        flag: "download", //" detail ,download"
        css: "mmapp.css"
    },
    infos:{
        guid: {
          detail: {
              info: "\u5b89\u88c5\u5e76\u542f\u52a8\u004d\u004d\u5546\u57ce" + "<span class=\"__mm-wap-hint-link\" id=\"__mm-wap-success\">" + "\u8bf7\u70b9\u8fd9\u91cc" + "</span>\u5373\u53ef\u6253\u5f00\u76ee\u6807\u9875\u9762"
          },
            download: {
                info: "\u5b89\u88c5\u5e76\u542f\u52a8\u004d\u004d\u5546\u573a\u540e\u5c06\u81ea\u52a8\u5f00\u59cb\u9ad8\u901f\u4e0b\u8f7d\uff0c\u5982\u6ca1\u5f00\u59cb\u9ad8\u901f\u4e0b\u8f7d\uff0c" + "<span class=\"__mm-wap-hint-link\" id=\"__mm-wap-success\">" + "\u8bf7\u70b9\u8fd9\u91cc" + "</span>"
            }
        },
        weixin: {
            detail: {
                tit: '\u64cd\u4f5c\u6307\u5f15',
                tip: '\u8bf7\u6309\u4ee5\u4e0b\u6b65\u9aa4\u64cd\u4f5c',
                //first: '<p>\u7b2c<span class=\"__mm-wap-guid-step-num\">1</span>\u6b65 </p><p>" + "\u4e0b\u8f7d\u5b89\u88c5\u004d\u004d\u5546\u573a\u540e" + "<span class=\"__mm-wap-guid-step-hint\">" + "\u542f\u52a8\u4e00\u6b21</span>\u6216" + "<span class=\"__mm-wap-guid-step-hint\">" + "\u6253\u5f00\u4e00\u6b21" + "</span></p>',
                second: '\u56de\u5230\u5fae\u4fe1\u518d\u6b21\u70b9\u51fb'
            },
            download: {
                tit: '\u9ad8\u901f\u4e0b\u8f7d\u6307\u5f15',
                tip: '\u8bf7\u6309\u4ee5\u4e0b\u6b65\u9aa4\u64cd\u4f5c\u5b8c\u6210\u9ad8\u901f\u4e0b\u8f7d\uff1a',
                //first: '<p>\u7b2c<span class=\"__mm-wap-guid-step-num\">1</span>\u6b65 </p><p>" + "\u4e0b\u8f7d\u5b89\u88c5\u004d\u004d\u5546\u573a\u540e" + "<span class=\"__mm-wap-guid-step-hint\">" + "\u542f\u52a8\u4e00\u6b21</span>\u6216" + "<span class=\"__mm-wap-guid-step-hint\">" + "\u6253\u5f00\u4e00\u6b21" + "</span></p>',
                second: '\u56de\u5230\u5fae\u4fe1\u518d\u6b21\u70b9\u51fb\u201c\u9ad8\u901f\u4e0b\u8f7d\u201d\u3002'
            }
        }
    },
    movePrevent: function(e) {
        this.preventDefault(e);
        this.stopPropagation(e);
    },
    set: function(opts) {
        var me = this;
        for (var i in me.options) {
            typeof opts[i] != "undefined" && (me.options[i] = opts[i])
        }
    },
    view: function() {
        var me = this,
            res = "";
        if (me.options.type === "guid") {
            var data = me.infos.guid[me.options.flag];
            //res = "<div class=\"__mm-wap-hint\"><div class=\"__mm-wap-hint-msg\">" + "\u5b89\u88c5\u5e76\u542f\u52a8\u004d\u004d\u5546\u573a\u540e\u5c06\u81ea\u52a8\u5f00\u59cb\u9ad8\u901f\u4e0b\u8f7d\uff0c\u5982\u6ca1\u5f00\u59cb\u9ad8\u901f\u4e0b\u8f7d\uff0c" + "<span class=\"__mm-wap-hint-link\" id=\"__mm-wap-success\">" + "\u8bf7\u70b9\u8fd9\u91cc" + "</span></div><div class=\"__mm-wap-hint-close\" id=\"__mm-wap-close\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjIwMUY5NTEyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MjIwMUY5NTIyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyMjAxRjk0RjJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyMjAxRjk1MDJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpWGpx8AAAEwSURBVHjavJU9DoJAEEZh9Aja0FtZWHACDdaWFl7AwrvY6Q0sNF7AmHgDEwtbDyDUVib6bcImhPAz+zNs8goC4b0lMIRxHAdYa3AGadDhIrABe3ADww6cA3ABYyU/gqc66CBAia9gDrZK/gazDgK0eAIeYEX5CRUwFQwoi9XOUypckAoFVIr1CxcIBtSKq+Q+AxrFdXIfAa3iJrlLAEvcJrcJYIs5cpMAIzFXzgkoixPOf4IMXqK6gCpxxrlh3/Dz0QG3QsDXRmwjrwoIbMSmj724fvmOi5sIbf7nrpPLehKSozhxmYTkKM5cRjE5ip1GMXkQWweQJ7FVAHkUGweQZ7FRAAmI2QEkJGYFkKC4NYCExY0BWn4QFNcFLHtRFKkTdzACCyGxXh9wAi+w+wswAP5lpcbsuZqsAAAAAElFTkSuQmCC\" /></div></div>";
            res = "<div class=\"__mm-wap-hint\"><div class=\"__mm-wap-hint-msg\">" + data.info + "</div><div class=\"__mm-wap-hint-close\" id=\"__mm-wap-close\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjIwMUY5NTEyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MjIwMUY5NTIyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyMjAxRjk0RjJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyMjAxRjk1MDJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpWGpx8AAAEwSURBVHjavJU9DoJAEEZh9Aja0FtZWHACDdaWFl7AwrvY6Q0sNF7AmHgDEwtbDyDUVib6bcImhPAz+zNs8goC4b0lMIRxHAdYa3AGadDhIrABe3ADww6cA3ABYyU/gqc66CBAia9gDrZK/gazDgK0eAIeYEX5CRUwFQwoi9XOUypckAoFVIr1CxcIBtSKq+Q+AxrFdXIfAa3iJrlLAEvcJrcJYIs5cpMAIzFXzgkoixPOf4IMXqK6gCpxxrlh3/Dz0QG3QsDXRmwjrwoIbMSmj724fvmOi5sIbf7nrpPLehKSozhxmYTkKM5cRjE5ip1GMXkQWweQJ7FVAHkUGweQZ7FRAAmI2QEkJGYFkKC4NYCExY0BWn4QFNcFLHtRFKkTdzACCyGxXh9wAi+w+wswAP5lpcbsuZqsAAAAAElFTkSuQmCC\" /></div></div>";
        } else if (me.options.type === "weixin") {
            //res = "<div class=\"__mm-wap-dialog-mask\"></div><div class=\"__mm-wap-dialog\" id=\"__mm-wap-dialog\"><div class=\"__mm-wap-dialog-close \" id=\"__mm-wap-close\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjIwMUY5NTEyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MjIwMUY5NTIyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyMjAxRjk0RjJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyMjAxRjk1MDJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpWGpx8AAAEwSURBVHjavJU9DoJAEEZh9Aja0FtZWHACDdaWFl7AwrvY6Q0sNF7AmHgDEwtbDyDUVib6bcImhPAz+zNs8goC4b0lMIRxHAdYa3AGadDhIrABe3ADww6cA3ABYyU/gqc66CBAia9gDrZK/gazDgK0eAIeYEX5CRUwFQwoi9XOUypckAoFVIr1CxcIBtSKq+Q+AxrFdXIfAa3iJrlLAEvcJrcJYIs5cpMAIzFXzgkoixPOf4IMXqK6gCpxxrlh3/Dz0QG3QsDXRmwjrwoIbMSmj724fvmOi5sIbf7nrpPLehKSozhxmYTkKM5cRjE5ip1GMXkQWweQJ7FVAHkUGweQZ7FRAAmI2QEkJGYFkKC4NYCExY0BWn4QFNcFLHtRFKkTdzACCyGxXh9wAi+w+wswAP5lpcbsuZqsAAAAAElFTkSuQmCC\" /></div><div class=\"__mm-wap-hd\">" + "\u9ad8\u901f\u4e0b\u8f7d\u6307\u5f15" + "</div><div class=\"__mm-wap-bd\"><p class=\"__mm-wap-guid-tit\">" + "\u8bf7\u6309\u4ee5\u4e0b\u6b65\u9aa4\u64cd\u4f5c\u5b8c\u6210\u9ad8\u901f\u4e0b\u8f7d\uff1a" + "</p><div class=\"__mm-wap-guid-step\"><p>\u7b2c<span class=\"__mm-wap-guid-step-num\">1</span>\u6b65 </p><p>" + "\u4e0b\u8f7d\u5b89\u88c5\u004d\u004d\u5546\u573a\u540e" + "<span class=\"__mm-wap-guid-step-hint\">" + "\u542f\u52a8\u4e00\u6b21</span>\u6216" + "<span class=\"__mm-wap-guid-step-hint\">" + "\u6253\u5f00\u4e00\u6b21" + "</span></p></div><div class=\"__mm-wap-guid-step\"><p>\u7b2c<span class=\"__mm-wap-guid-step-num\">2</span>\u6b65</p><p>" + "\u56de\u5230\u5fae\u4fe1\u518d\u6b21\u70b9\u51fb\u201c\u9ad8\u901f\u4e0b\u8f7d\u201d\u3002" + "</p></div></div><div class=\"__mm-wap-ft\"><div class=\"__mm-wap-btn  \" id=\"__mm-wap-success\">" + "\u524d\u5f80\u4e0b\u8f7d\u004d\u004d\u5546\u573a" + "</div></div></div>";
            var data = me.infos.weixin[me.options.flag];
            res = "<div class=\"__mm-wap-dialog-mask\"></div><div class=\"__mm-wap-dialog\" id=\"__mm-wap-dialog\"><div class=\"__mm-wap-dialog-close \" id=\"__mm-wap-close\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjIwMUY5NTEyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MjIwMUY5NTIyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyMjAxRjk0RjJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyMjAxRjk1MDJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpWGpx8AAAEwSURBVHjavJU9DoJAEEZh9Aja0FtZWHACDdaWFl7AwrvY6Q0sNF7AmHgDEwtbDyDUVib6bcImhPAz+zNs8goC4b0lMIRxHAdYa3AGadDhIrABe3ADww6cA3ABYyU/gqc66CBAia9gDrZK/gazDgK0eAIeYEX5CRUwFQwoi9XOUypckAoFVIr1CxcIBtSKq+Q+AxrFdXIfAa3iJrlLAEvcJrcJYIs5cpMAIzFXzgkoixPOf4IMXqK6gCpxxrlh3/Dz0QG3QsDXRmwjrwoIbMSmj724fvmOi5sIbf7nrpPLehKSozhxmYTkKM5cRjE5ip1GMXkQWweQJ7FVAHkUGweQZ7FRAAmI2QEkJGYFkKC4NYCExY0BWn4QFNcFLHtRFKkTdzACCyGxXh9wAi+w+wswAP5lpcbsuZqsAAAAAElFTkSuQmCC\" /></div><div class=\"__mm-wap-hd\">" + data.tit + "</div><div class=\"__mm-wap-bd\"><p class=\"__mm-wap-guid-tit\">" + data.tip + "</p><div class=\"__mm-wap-guid-step\"><p>\u7b2c<span class=\"__mm-wap-guid-step-num\">1</span>\u6b65 </p><p>" + "\u4e0b\u8f7d\u5b89\u88c5\u004d\u004d\u5546\u573a\u540e" + "<span class=\"__mm-wap-guid-step-hint\">" + "\u542f\u52a8\u4e00\u6b21</span>\u6216" + "<span class=\"__mm-wap-guid-step-hint\">" + "\u6253\u5f00\u4e00\u6b21" + "</span></p></div><div class=\"__mm-wap-guid-step\"><p>\u7b2c<span class=\"__mm-wap-guid-step-num\">2</span>\u6b65</p><p>" + data.second + "</p></div></div><div class=\"__mm-wap-ft\"><div class=\"__mm-wap-btn  \" id=\"__mm-wap-success\">" + "\u524d\u5f80\u4e0b\u8f7d\u004d\u004d\u5546\u573a" + "</div></div></div>";
        } else {
            res = "<div class=\"__mm-wap-dialog-mask\"></div><div class=\"__mm-wap-dialog\" id=\"__mm-wap-dialog\"><div class=\"__mm-wap-dialog-close \" id=\"__mm-wap-close\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjIwMUY5NTEyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MjIwMUY5NTIyQUJCMTFFNTg0MTQ5NzUyMzMyNDY2QjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyMjAxRjk0RjJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyMjAxRjk1MDJBQkIxMUU1ODQxNDk3NTIzMzI0NjZCMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpWGpx8AAAEwSURBVHjavJU9DoJAEEZh9Aja0FtZWHACDdaWFl7AwrvY6Q0sNF7AmHgDEwtbDyDUVib6bcImhPAz+zNs8goC4b0lMIRxHAdYa3AGadDhIrABe3ADww6cA3ABYyU/gqc66CBAia9gDrZK/gazDgK0eAIeYEX5CRUwFQwoi9XOUypckAoFVIr1CxcIBtSKq+Q+AxrFdXIfAa3iJrlLAEvcJrcJYIs5cpMAIzFXzgkoixPOf4IMXqK6gCpxxrlh3/Dz0QG3QsDXRmwjrwoIbMSmj724fvmOi5sIbf7nrpPLehKSozhxmYTkKM5cRjE5ip1GMXkQWweQJ7FVAHkUGweQZ7FRAAmI2QEkJGYFkKC4NYCExY0BWn4QFNcFLHtRFKkTdzACCyGxXh9wAi+w+wswAP5lpcbsuZqsAAAAAElFTkSuQmCC\" /></div><div class=\"__mm-wap-bd\"><div class=\"__mm-wap-bd-info\"><p>" + me.options.info + "</p></div></div><div class=\"__mm-wap-ft\"><div class=\"__mm-wap-btn  \" id=\"__mm-wap-success\">\u786e\u5b9a</div></div></div>";

        }

        return res;
    },
    onload: function(node, callback) {
        var me = this;
        if (node.attachEvent) {
            node.attachEvent('onload', callback);
        } else {
            setTimeout(function() {
                me.poll(node, callback);
            }, 0);
        }
    },
    poll: function(node, callback) {
        var me = this;
        if (callback.isCalled) {
            return;
        }
        //		  debug.log("loadcss---"+node['sheet']);
        if (/webkit/i.test(navigator.userAgent)) { //webkit
            if (node['sheet']) {
                me.cssloaded = !0;
            }
        } else if (node['sheet']) {
            try {
                if (node['sheet'].cssRules) {
                    me.cssloaded = !0;
                }
            } catch (ex) {
                if (ex.code === 1000) {
                    me.cssloaded = !0;
                }
            }
        }

        if (me.cssloaded) {
            setTimeout(function() {
                callback();
                callback.isCalled = !0;
            }, 1);
        } else {
            setTimeout(function() {
                me.poll(node, callback);
            }, 1);
        }
    },
    loadcss: function(href, fn) {
        var me = this;
        var node = document.createElement("link");
        node.setAttribute("rel", "stylesheet");
        node.setAttribute("type", "text/css");
        node.setAttribute("href", href);
        document.body.appendChild(node);
        me.onload(node, fn);
    },
    show: function(opts) {
        var me = this;
        me.destroy();
        me.set(opts);
        me.loaded(me.create.bind(me));
    },
    create: function() {
        var me = this,
            html = me.view(),
            d = document.createElement("div");
        d.setAttribute("id", "__mm-wap-toast");
        d.style.display = "none";
        d.innerHTML = html;

        me.trigger("dialog.before.show");

        document.body.appendChild(d);
        me.el['__mm-wap-toast'] = [d];
        me.refresh();
        me.addHandle();
        me.trigger("dialog.after.show");
    },
    refresh: function() {
        var me = this;
        var d = (me.el['__mm-wap-toast'] || (me.el['__mm-wap-toast'] = [me.query("__mm-wap-toast")]))[0];
        if (d != null) {
            d.style.display = "block";
            var sTop = document.body.scrollTop || document.documentElement.scrollTop;
            if (me.options.type != "guid") {
                d.style.height = Math.max(document.body.scrollHeight, document.body.clientHeight) - 1 + "px";
                d.setAttribute("class", "__mm-wap-toast-cover");
            }
            var sH = document.body.offsetHeight || document.documentElement.offsetHeight;
            var alt = me.query("__mm-wap-dialog");
            alt && (alt.style.top = parseInt(sTop + (window.innerHeight - alt.offsetHeight) / 2, 10) + "px", 1);
        }
    },
    addHandle: function() {
        var me = this,
            t = me.el['__mm-wap-toast'] || (me.el['__mm-wap-toast'] = me.query("__mm-wap-toast"));
        t.push("touchmove");
        t.push(me.movePrevent.bind(me));
        //遮罩不能滑动
        me.addEvent.apply(me, t);
        //window resize 调整弹窗布局
        me.resize = function(e) {
            me.refresh()
        };
        me.addEvent(window, "resize", me.resize);
        me.addEvent(window, "scroll", me.resize);
        //关闭 确定 事件
        var success = me.el['__mm-wap-success'] || (me.el['__mm-wap-success'] = [me.query("__mm-wap-success")]);
        var close = me.el['__mm-wap-close'] || (me.el['__mm-wap-close'] = [me.query("__mm-wap-close")]);
        if (success != null && success.length > 0) {
            success.push("click");
            success.push(function(e) {
                me.preventDefault(e);
                me.stopPropagation(e);
                me.trigger("dialog.res.save");
                me.destroy();
                return false;
            });
            me.addEvent.apply(me, success);
        }
        if (close != null && close.length > 0) {
            close.push("click");
            close.push(function(e) {
                me.preventDefault(e);
                me.stopPropagation(e);
                this.className += " active";
                me.trigger("dialog.res.cancle");
                me.destroy();
                return false;
            });
            me.addEvent.apply(me, close);
        }
    },
    loaded: function(fn) {
        var me = this,
            opts = me.options;
        if (!me.cssloaded) {
            var href = opts.base + opts.css;
            me.loadcss(href, fn)
        } else {
            Util.f(fn) && fn();
        }
    },
    query: function(id) {
        return document.querySelector ? document.querySelector("#" + id) : document.getElementById(id);
    },
    destroy: function() {
        var me = this;
        for (var i in me.el) {
            var e = me.el[i];
            if (!!e) {
                if (!!e[0]) continue;
                if (i === "__mm-wap-toast") e[0].style.display = "none";
                me.removeEvent.apply(me, e);
            }
        }
        me.removeEvent(window, "resize", me.resize);
        me.removeEvent(window, "scroll", me.resize);
        if (typeof me.el["__mm-wap-toast"] != 'undefined') {
            var n = me.el["__mm-wap-toast"][0];
            if (n && n.parentNode) {
                n.parentNode.removeChild(n);
            }
        }
        me.el = {};
        me.off("dialog.res");
    },
    init: function(base) {
        this.options.base = base;
    },
    addEvent: function(el, type, handle) {
        if (el.addEventListener) {
            el.addEventListener(type, handle, false);
        } else if (el.attachEvent) {
            el.attachEvent("on" + type, handle);
        } else {
            el["on" + type] = handle;
        }
    },
    removeEvent: function(el, type, handle) {
        if (el.addEventListener) {
            el.removeEventListener(type, handle, false);
        } else if (el.attachEvent) {
            el.detachEvent("on" + type, handle);
        } else {
            el["on" + type] = null;
        }

    },
    getEvent: function(event) {
        return event ? event : window.event;
    },
    getTarget: function(event) {
        return event.target || event.srcElement;
    },
    stopPropagation: function(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    preventDefault: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    on: function() {
        Event.on.apply(Event, arguments)
    },
    off: function() {
        Event.off.apply(Event, arguments)
    },
    trigger: function() {
        Event.trigger.apply(Event, arguments)
    },
    one: function() {
        Event.one.apply(Event, arguments)
    }

    //		getRelatedTarget:function(Event){
    //			if(Event.relatedTarget){
    //				return Event.relatedTarget
    //			}else if(Event.fromElement){
    //				return Event.fromElement
    //			}else if(Event.toElement){
    //				return Event.toElement
    //			}else{
    //				return null
    //			}
    //		},
    //		getCharCode:function(Event){
    //			if(Event.charCode){
    //				return Event.charCode;
    //			}else if(Event.keyCode){
    //				return Event.keyCode;
    //			}
    //		}
};

module.exports = Dialog;