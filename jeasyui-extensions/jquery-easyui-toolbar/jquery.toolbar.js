﻿/**
* jQuery EasyUI 1.3.4
* Copyright (c) 2009-2013 www.jeasyui.com. All rights reserved.
*
* Licensed under the GPL or commercial licenses
* To use it on other terms please contact us: jeasyui@gmail.com
* http://www.gnu.org/licenses/gpl.txt
* http://www.jeasyui.com/license_commercial.php
*
* jQuery EasyUI toolbar Plugin Extensions 1.0 beta
* jQuery EasyUI toolbar 插件扩展
* jeasyui.plugins.toolbar.js
* 二次开发 陈建伟
* 最近更新：2013-08-31
*
* 依赖项：
*   1、jquery.jdirk.js v1.0 beta late
*   2、jeasyui.extensions.js v1.0 beta late
*
* Copyright (c) 2013 ChenJianwei personal All rights reserved.
* http://www.chenjianwei.org
*/
(function ($, undefined) {

    function initialize(target) {
        var t = $.util.parseJquery(target), isDiv = /^(?:div)$/i.test(target.nodeName),
            toolbar = isDiv ? t : $("<div></div>").insertAfter(t);
        if (!isDiv) {
            toolbar.attr({ "class": t.attr("class"), "style": t.attr("style") }).removeClass("easyui-toolbar");
            t.children().each(function () { toolbar[0].appendChild(this); });
            t.hide();
        }
        var state = $.data(target, "toolbar"), opts = state.options;
        state.toolbar = toolbar;
        t.addClass("toolbar-f");
        toolbar.addClass("dialog-toolbar toolbar");
        wrapItems(target);
        setSize(target, { width: opts.width, height: opts.height });
        toolbar.bind("_resize", function () {
            setSize(target);
        });
    };

    function wrapItems(target) {
        var t = $.util.parseJquery(target), state = $.data(target, "toolbar"),
            toolbar = state.toolbar, opts = state.options,
            cc = toolbar.children();
        state.wrapper = $("<table><tr></tr></table>").attr({ cellspacing: 0, cellpadding: 0 }).addClass("toolbar-wrapper").appendTo(toolbar);
        appendItem(target, cc, true);
    };

    function setSize(target, size) {
        var t = $.util.parseJquery(target), state = $.data(target, "toolbar"),
            toolbar = state.toolbar, opts = state.options;
        size = $.extend({ width: opts.width, height: opts.height }, size || {});
        toolbar.css({
            width: size.width, height: size.height
        });
        $.extend(opts, size);
        $.util.call(function () {
            setAlign(target, opts.align);
            setValign(target, opts.valign);
        });
        opts.onResize.call(target, $.isNumeric(size.width) ? size.width : toolbar.width(), $.isNumeric(size.height) ? size.height : toolbar.height());
    };

    function setAlign(target, align) {
        var t = $.util.parseJquery(target), state = $.data(target, "toolbar"),
            wrapper = state.wrapper, opts = state.options, left = 0;
        opts.align = align;
        wrapper.removeClass("toolbar-align-left toolbar-align-center toolbar-align-right");
        wrapper.addClass("toolbar-align-" + align);
        if (align == "center") {
            var toolbar = state.toolbar, tWidth = toolbar.width(), width = wrapper.width();
            left = Math.max((tWidth - width) / 2, 0);
        }
        wrapper.css("left", left);
    }
    function setValign(target, valign) {
        var t = $.util.parseJquery(target), state = $.data(target, "toolbar"),
            toolbar = state.toolbar, wrapper = state.wrapper, opts = state.options,
            tHeight = toolbar.height(), height = wrapper.height(), top;
        opts.valign = valign;
        switch (valign) {
            case "top": top = 0; break;
            case "middle": top = (tHeight - height) / 2; break;
            case "bottom": top = tHeight - height; break;
        }
        wrapper.css("top", Math.max(top, 0));
    }


    function appendItem(target, item, dontSize) {
        if (!item) { return; }
        var t = $.util.parseJquery(target), state = $.data(target, "toolbar"), opts = state.options;
        if ($.util.isJqueryObject(item) && item.length == 1) {
            buildSeparator(item);
        } else if ($.util.isString(item)) {
            item = item == "-" ? $("<div class='dialog-tool-separator'></div>") : $("<span></span>").text(item);
        } else if (item.nodeType == 1) {
            item = $(item);
            buildSeparator(item);
        } else if ($.isPlainObject(item)) {
            item = $.extend({ plain: true }, item);
            var fn = item.onclick || item.handler;
            item = $("<a></a>").linkbutton(item);
            if ($.isFunction(fn)) { item.click(fn); }
        } else if ($.isFunction(item)) {
            return appendItem(target, item.call(target));
        } else if ($.array.likeArray(item)) {
            var ret = $.each(item, function () { appendItem(target, this, true); });
            doSize();
            return ret;
        }
        var td = $("<td></td>").append(item);
        state.wrapper.find("tr:last").append(td);
        doSize();
        function doSize() { if (!dontSize) { setSize(target); } }
        function buildSeparator(item) {
            if (/^(?:div|span)$/i.test(item[0].nodeName) && item.text() == "-") {
                item.addClass("dialog-tool-separator").text("");
            }
        }
    };


    $.fn.toolbar = function (options, param) {
        if (typeof options == "string") {
            return $.fn.toolbar.methods[options](this, param);
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "toolbar");
            if (state) {
                $.extend(state.options, options);
            } else {
                $.data(this, "toolbar", {
                    options: $.extend({}, $.fn.toolbar.defaults, $.fn.toolbar.parseOptions(this), options)
                });
            }
            initialize(this);
        });
    };

    $.fn.toolbar.parseOptions = function (target) {
        return $.extend({}, $.parser.parseOptions(target));
    };

    $.fn.toolbar.methods = {

        options: function (jq) { return $.data(jq[0], 'toolbar').options; },

        resize: function (jq, size) { return jq.each(function () { setSize(this, size); }); },

        align: function (jq, align) { return jq.each(function () { setAlign(this, align); }); },

        valign: function (jq, valign) { return jq.each(function () { setValign(this, valign); }); },

        append: function (jq, item) { return jq.each(function () { appendItem(this, item); }); },

        wrapper: function (jq) { return $.data(jq[0], "toolbar").wrapper; },

        toolbar: function (jq) { return $.data(jq[0], "toolbar").toolbar; }
    };

    $.fn.toolbar.defaults = {

        //  表示 easyui-toolbar 控件的宽度，Number 类型数值；默认为 auto；
        width: "auto",

        //  表示 easyui-toolbar 控件的高度，Number 类型数值；默认为 auto；
        height: "auto",

        //  表示 easyui-toolbar 控件的横向对齐方式，可选的值为 "left"、"center" 或 "right"；默认为 "left"；
        align: "left",

        //  表示 easyui-toolbar 控件的纵向对齐方式，可选的值为 "top"、"middle" 或 "bottom"；默认为 "middle"；
        valign: "middle",

        //  表示 easyui-toolbar 的尺寸大小重置事件；当控件大小被调整后触发；该事件回调函数定义如下参数：
        //      width: 被设置的新的宽度；
        //      height: 被设置的新的告诉。
        //  回调函数中的 this 表示当前 easyui-toolbar 的 DOM 对象。
        onResize: function (width, height) { }
    };



    $.parser.plugins.push("toolbar");


    var css =
        ".toolbar-f {}" +
        ".toolbar { width: auto; height: auto; min-height: 26px; overflow: hidden; }" +
        ".toolbar-wrapper { position: relative; }" +
        ".toolbar-wrapper td>div, .toolbar-wrapper td>span { height: 26px; line-height: 26px; }" +
        ".toolbar-wrapper td .dialog-tool-separator { height: 22px; }"
        ".toolbar-align-left { float: left; }" +
        ".toolbar-align-center {}" +
        ".toolbar-align-right { float: right; }";
    $.util.addCss(css);

})(jQuery);