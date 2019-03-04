var app = getApp();
var pullDown=require('./pullDown.js');
Page({
    data: {
        scrollHeight: 0,
        pullDownAnimation: null,
        pullDownTime: '',
    },
    onLoad:function (){
        var page=this;
        page.listApi='xxx';
        page.data.list=[];
        page.data.page=1;
        page.data.pageSize=10;
        app.loadMore(page.listApi,page.getListParams(),page,{
            success:function(res){
                app.loadMoreSuccess(page,res.list);
                page.pullDown=new pullDown(app,page);
            }
        });
    },
    getListParams:function (){
        var page=this;
        return {};
    },
    touchmove:function(e){
        var page=this;
        page.pullDown.touchmove(e);
    },
    touchend:function(e){
        var page=this;
        page.pullDown.touchend(e);
    },
    scrolltolower: function(){
        var page=this;
        app.loadMore(page.listApi,page.getListParams(),page);
    },
})