var changeStr = '';   //初始化一个

function FillUrls() {
    //获取用户输入的关键字
    var strdomin = $("#searchText").val();

    //如果请求为空的话就不进行请求
    if (strdomin == null || strdomin == "") {
        $("#auto").empty();
        $("#auto").hide();
        return;
    }
    //跟上次请求的关键字相同就返回
    //    if (changeStr == strdomin)
    //        return;

    changeStr = strdomin;
    window.status = "请求中";

    //封装请求百度服务器的参数（只有关键字是动态的，其他几个参数都是固定的）
    var qsData = {'wd': strdomin, 'p': '3', 'cb': 'ShowDiv', 't': new Date().getMilliseconds().toString()};
    //发jsonp（跨域请求js）
    $.ajax({
        async: false,
        url: "http://suggestion.baidu.com/su",
        type: "GET",
        dataType: 'jsonp',
        jsonp: 'jsoncallback',
        data: qsData,
        timeout: 5000,
        success: function (json) {
        },
        error: function (xhr) {
        }
    });
}

function ShowDiv(strurls) {
    autoDisplay(strurls);
    window.status = "请求结束";
}

function autoDisplay(autoStr) {
    var Info = autoStr['s'];   //拿到关键字提示

    var wordText = $("#searchText").val();
    var autoNode = $("#auto");   //缓存对象（弹出框）

    if (Info.length == 0) {
        autoNode.hide();
        return false;
    }

    autoNode.empty();  //清空上次
    for (var i = 0; i < Info.length; i++) {
        var wordNode = Info[i];   //弹出框里的每一条内容

        var newDivNode = $("<div>").attr("id", i);    //设置每个节点的id值
        newDivNode.attr("style", "font:14px/25px arial;height:25px;padding:0 8px;cursor: pointer; text-align:left");

        newDivNode.html(wordNode).appendTo(autoNode);  //追加到弹出框

        //鼠标移入高亮，移开不高亮
        newDivNode.mouseover(function () {
            if (highlightindex != -1) {        //原来高亮的节点要取消高亮（是-1就不需要了）
                autoNode.children("div").eq(highlightindex).css("background-color", "white");
            }
            //记录新的高亮节点索引
            highlightindex = $(this).attr("id");
            $(this).css("background-color", "#ebebeb");
        });
        newDivNode.mouseout(function () {
            $(this).css("background-color", "white");
        });

        //鼠标点击文字上屏
        newDivNode.click(function () {
            //取出高亮节点的文本内容
            var comText = autoNode.hide().children("div").eq(highlightindex).text();
            highlightindex = -1;
            //文本框中的内容变成高亮节点的内容
            $("#searchText").val(comText);
        });
        if (Info.length > 0) {    //如果返回值有内容就显示出来
            autoNode.show();
        } else {               //服务器端无内容返回 那么隐藏弹出框
            autoNode.hide();
            //弹出框隐藏的同时，高亮节点索引值也变成-1
            highlightindex = -1;
        }

    }

}

var timeoutId;   //延迟请求服务器
var highlightindex = -1;   //高亮
$(function () {
    $("#searchText").keyup(function (event) {
        var myEvent = event || window.event;
        var keyCode = myEvent.keyCode;    //键值 不同的值代表不同的键  13是回车等
        //console.log(keyCode);

        //只有按键盘的字母键、退格、删除、空格、ESC等键才进行响应：8退格backspace 46删除delete 空格32
        if (keyCode >= 65 && keyCode <= 90 || keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 111 || keyCode >= 186 && keyCode <= 222 || keyCode == 8 || keyCode == 46 || keyCode == 32 || keyCode == 13) {
            //考虑到请求是百度的服务器，故不需要考虑性能问题，没必要等几秒再请求，直接实时请求。如果延时请求，解开下面代码即可
            //                    clearTimeout(timeoutId);
            //                    timeoutId = setTimeout(function () {
            //                        timeoutId = FillUrls();
            //                    }, 500)
            FillUrls();
            if (highlightindex != -1) {
                highlightindex = -1;
                //autoNodes.eq(highlightindex).css("background-color", "white");
            }
        }

        else if (keyCode == 38 || keyCode == 40) {
            if (keyCode == 38) {       //向上
                var autoNodes = $("#auto").children("div");
                if (highlightindex != -1) {
                    //如果原来存在高亮节点，则将背景色改称白色
                    autoNodes.eq(highlightindex).css("background-color", "white");
                    highlightindex--;
                } else {
                    highlightindex = autoNodes.length - 1;
                }
                if (highlightindex == -1) {
                    //如果修改索引值以后index变成-1，则将索引值指向最后一个元素
                    highlightindex = autoNodes.length - 1;
                }
                //让现在高亮的内容变成红色
                autoNodes.eq(highlightindex).css("background-color", "#ebebeb");

                //取出当前选中的项 赋值到输入框内
                var comText = autoNodes.eq(highlightindex).text();
                $("#searchText").val(comText);
            }
            if (keyCode == 40) {    //向下
                var autoNodes = $("#auto").children("div");
                if (highlightindex != -1) {
                    //如果原来存在高亮节点，则将背景色改称白色
                    autoNodes.eq(highlightindex).css("background-color", "white");
                }
                highlightindex++;
                if (highlightindex == autoNodes.length) {
                    //如果修改索引值以后index变成-1，则将索引值指向最后一个元素
                    highlightindex = 0;
                }
                //让现在高亮的内容变成红色
                autoNodes.eq(highlightindex).css("background-color", "#ebebeb");

                var comText = autoNodes.eq(highlightindex).text();
                $("#searchText").val(comText);
            }
        } else if (keyCode == 13) {     //回车
            //下拉框有高亮内容
            if (highlightindex != -1) {
                //取出高亮节点的文本内容
                var comText = $("#auto").hide().children("div").eq(highlightindex).text();
                highlightindex = -1;
                //文本框中的内容变成高亮节点的内容
                $("#searchText").val(comText);
            } else {
                //下拉框没有高亮内容
                $("#auto").hide();

                //已经提交，让文本框失去焦点（再点提交或者按回车就不会触发keyup事件了）
                $("#searchText").get(0).blur();
            }
        } else if (keyCode == 27) {    //按下Esc 隐藏弹出层
            if ($("#auto").is(":visible")) {
                $("#auto").hide();
            }
        }
    });

    //点击页面隐藏自动补全提示框
    document.onclick = function (e) {
        var e = e ? e : window.event;
        var tar = e.srcElement || e.target;
        if (tar.id != "searchText") {
            if ($("#auto").is(":visible")) {
                $("#auto").css("display", "none")
            }
        }
    }
});


function btn() {
    var v = document.getElementById("searchText").value;
    if (v != '') {
        var url = chooseSerarch()

        if (url == '') {
            search("https://www.baidu.com/s?wd=" + v)
        } else {
            if (url == 0) {
                search("https://www.baidu.com/s?wd=" + v)
            } else if (url == 1) {
                search("https://www.google.com.hk/search?q=" + v)
            } else if (url == 2) {
                search('https://cn.bing.com/search?q=' + v)
            }else if (url == 3) {
                search('https://github.com/search?q=' + v)
            }
        }
        $("#auto").empty();
        $("#auto").hide();

    }


}


function search(url) {
    window.open(url)

}

function chooseSerarch() {
    var radios = document.getElementsByName("check");
    for (radio in radios) {
        if (radios[radio].checked) {
            val = radios[radio].value;
            return val
            break;
        }
    }

}


document.onkeydown = function (e) {
    var theEvent = window.event || e;
    var code = theEvent.keyCode || theEvent.which;
    if (code == "13") {//keyCode=13是回车键
        var v = document.getElementById("searchText").value;
        if (v != '') {
            var url = chooseSerarch()

            if (url == '') {
                search("https://www.baidu.com/s?wd=" + v)
            } else {
                if (url == 0) {
                    search("https://www.baidu.com/s?wd=" + v)
                } else if (url == 1) {
                    search("https://www.google.com.hk/search?q=" + v)
                } else if (url == 2) {
                    search('https://cn.bing.com/search?q=' + v)
                }else if (url == 3) {
                    search('https://github.com/search?q=' + v)
                }
            }
            $("#auto").empty();
            $("#auto").hide();
        }

    }

}


$("document").ready(function () {
    $(".menu li").click(function () {
        $(".menu li").removeClass("nav-current");//首先移除全部的active
        $(this).addClass("nav-current");//选中的添加acrive
    });
});

var today = new Date();
var weeks = ["日", "一", "二", "三", "四", "五", "六"];
$('.showtime').html(today.getFullYear() + "年" + (today.getMonth() + 1) + "月" + today.getDate() + "日 星期" + weeks[today.getDay()]);

