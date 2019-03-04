function pullDown(app,page,options){
    //this.page=page;
    var plugin=this;
    var opts = options || {};
    this.debug=opts.debug?opts.debug:0;
    this.pullDownTimeName=opts.pullDownTimeName?opts.pullDownTimeName:'pullDownTime';//下拉时间绑定的变量名称
    this.pullDownAnimationName=opts.pullDownAnimationName?opts.pullDownAnimationName:'pullDownAnimation';//下拉框动画绑定的变量名称
    this.scrollHeightName=opts.scrollHeightName?opts.scrollHeightName:'scrollHeight';//scroll-view高度绑定的变量名称
    this.scrollContentWrapperId=opts.scrollContentWrapperId?opts.scrollContentWrapperId:'scrollContent';//内容的父元素的id

    this.pullDownAnimationTime=opts.pullDownAnimationTime?parseInt(opts.pullDownAnimationTime):400;//下拉动作的持续时间
    this.pullDownAnimation = wx.createAnimation(opts.pullDownAnimation?opts.pullDownAnimation:{duration:this.pullDownAnimationTime});//下拉动画对象
    this.returnAnimation = wx.createAnimation(opts.returnAnimation?opts.returnAnimation:{duration:200});//回弹动画对象
    this.defaultPullDownWrapperHeigh=opts.defaultPullDownWrapperHeigh?parseInt(opts.defaultPullDownWrapperHeigh):130;//下拉动画的高度
    this.pullDownWrapperHeigh=this.defaultPullDownWrapperHeigh;//下拉框的高度
    var systemInfo=wx.getSystemInfoSync();
    this.scrollHeight=opts.windowHeight?systemInfo.windowHeight*parseInt(opts.windowHeight):systemInfo.windowHeight;//scroll-view的高度
    this.scrollViewTop=opts.scrollViewTop?parseInt(opts.scrollViewTop):0;//scrollview距离视口顶部的距离

    this.isTouchMoveFinished=[];
    this.lastClientY=this.scrollHeight+this.scrollViewTop;
    var setData={};
    setData[plugin.scrollHeightName]=plugin.scrollHeight;
    page.setData(setData);


    this.touchmove=function(e){
        //下拉时
        var distance=e.changedTouches[0].clientY-plugin.lastClientY;
        if(distance>0){
            plugin.log('-------distance-----');
            plugin.log(distance);
            //到顶时
            var setData={};
            plugin.isTouchMoveFinished.push(false);
            wx.createSelectorQuery().select('#'+plugin.scrollContentWrapperId).boundingClientRect(function(rect){
                var timestamp=(new Date()).valueOf();
                if(!plugin.countdown){
                    plugin.log('rect.top:'+rect.top);
                    plugin.log('plugin.scrollViewTop:'+plugin.scrollViewTop);
                    if(rect.top==plugin.scrollViewTop){
                        plugin.log('开始下拉');
                        plugin.countdown=parseInt(timestamp)+plugin.pullDownAnimationTime;
                        plugin.log('countdown:'+plugin.countdown);
                        plugin.showPullDownWrapper();
                    }
                }else{
                    //等待下拉动画结束才能继续下拉
                    if(plugin.countdown<timestamp){
                        plugin.pullDownWrapperHeigh+=distance/2;
                        plugin.showPullDownWrapper();
                        plugin.log('继续下拉');
                    }
                }
                plugin.isTouchMoveFinished[plugin.isTouchMoveFinished.length-1]=true;
            }).exec()
        }
        plugin.lastClientY=e.changedTouches[0].clientY;
    };

    this.touchend=function(e){
        var timestamp=(new Date()).valueOf();
        var func=plugin.touchend;
        plugin.log('timestamp:'+timestamp);
        plugin.lastClientY=plugin.scrollHeight+plugin.scrollViewTop;
        //只对最后一次滑动事件响应
        if(plugin.isTouchMoveFinished.length>0){
            if(plugin.isTouchMoveFinished[plugin.isTouchMoveFinished.length-1]){
                if(plugin.countdown){
                    if(plugin.countdown<timestamp){
                        var setData={};
                        plugin.log('开始刷新');
                        page.data.page=1;
                        page.data.list=[];
                        app.loadMore(page.listApi,page.getListParams?page.getListParams():{},page,{
                            success:function(res){
                                plugin.log('结束刷新');
                                if(page.listCallback&&page.listCallback.beforeSuccess){
                                    page.listCallback.beforeSuccess(res)
                                }
                                app.loadMoreSuccess(page,res.list);
                                plugin.countdown=0;
                                plugin.pullDownWrapperHeigh=plugin.defaultPullDownWrapperHeigh;
                                plugin.isTouchMoveFinished=[];
                                plugin.returnPullDownWrapper();
                            },
                            fail:function(res){
                                plugin.log('结束刷新');
                                if(page.listCallback&&page.listCallback.beforeFail){
                                    page.listCallback.beforeFail(res)
                                }
                                app.loadMoreFail(page,res);
                                plugin.countdown=0;
                                plugin.pullDownWrapperHeigh=plugin.defaultPullDownWrapperHeigh;
                                plugin.isTouchMoveFinished=[];
                                plugin.returnPullDownWrapper();
                            }
                        });
                    }else{
                        //防止动画的延迟(用于下拉时间小于下拉动画的时间导致的动画显示不全的bug)
                        plugin.log('time:'+plugin.pullDownAnimationTime);
                        plugin.log(333);
                        setTimeout(func,plugin.pullDownAnimationTime+100);
                    }
                }
            }else{
                //防止获取节点信息的延迟(用于点触式迅速下拉导致touchend比boundingClientRect先触发的bug)
                plugin.log(444);
                setTimeout(func,100);
            }
        }


    };

    this.log=function (msg){
        if(this.debug){
            console.log(msg)
        }
    }

    this.showPullDownWrapper=function(){
        var setData={};
        this.pullDownAnimation.height(this.pullDownWrapperHeigh+'rpx').step();
        setData[this.pullDownAnimationName]=this.pullDownAnimation.export();
        setData[this.pullDownTimeName]=this.getNowFormatDate();
        page.setData(setData);
    };

    this.returnPullDownWrapper=function(){
        var setData={};
        this.returnAnimation.height(0).step();
        setData[this.pullDownAnimationName]=this.returnAnimation.export();
        page.setData(setData);
    };

    this.getNowFormatDate=function() {
        var date = new Date();
        var sign1 = "-";
        var sign2 = ":";
        var year = date.getFullYear() // 年
        var month = date.getMonth() + 1; // 月
        var day  = date.getDate(); // 日
        var hour = date.getHours(); // 时
        var minutes = date.getMinutes(); // 分
        var seconds = date.getSeconds() //秒
        var weekArr = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'];
        var week = weekArr[date.getDay()];
        // 给一位数数据前面加 “0”
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (day >= 0 && day <= 9) {
            day = "0" + day;
        }
        if (hour >= 0 && hour <= 9) {
            hour = "0" + hour;
        }
        if (minutes >= 0 && minutes <= 9) {
            minutes = "0" + minutes;
        }
        if (seconds >= 0 && seconds <= 9) {
            seconds = "0" + seconds;
        }
        var currentdate = year + sign1 + month + sign1 + day + " " + hour + sign2 + minutes + sign2 + seconds + " " + week;
        return currentdate;
    }

}

module.exports = pullDown;