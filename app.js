App({
    tip:function(msg,callback){
        wx.showModal({
            title: '提示',
            content:msg,
            showCancel:false,
            success: function(res) {
                if(callback){
                    callback();
                }
            }
        });
    },
    loadMore: function (api, data, obj, callback) {
        var app = this;
        if (obj.data.isLoading) {
            console.log('阻止重复加载!!');
            return false;
        }
        if (!data.pageNo) {
            data.pageNo = obj.data.page;
        }
        if (!data.pageSize) {
            data.pageSize = obj.data.pageSize;
        }
        obj.data.isLoading = true;
        data.loadingTitle = '正在加载...';
        app.post(api, data, {
            success: function (res) {
                if (callback && callback.success) {
                    callback.success(res);
                } else {
                    app.loadMoreSuccess(obj, res.list)
                }
            },
            fail: function (res) {
                if (callback && callback.fail) {
                    callback.fail(res);
                } else {
                    app.loadMoreFail(obj, res)
                }
            }
        });
    },
    loadMoreSuccess: function (obj, data) {
        var app = this;
        var setData = {};
        if (!data || !data.length) {
            obj.data.isLoading = false;
            obj.setData({
                isLoading: obj.data.isLoading,
                list: obj.data.list
            })
            wx.showToast({
                title: '没有更多数据!',
                icon: 'none'
            });
            return true;
        }
        obj.data.page++;
        obj.data.list = obj.data.list.concat(data);
        obj.data.isLoading = false;
        setData.page = obj.data.page;
        setData.list = obj.data.list;
        setData.isLoading = obj.data.isLoading;
        obj.setData(setData);
    },
    loadMoreFail: function (obj, data) {
        var app = this;
        obj.data.isLoading = false;
        obj.setData({
            isLoading: obj.data.isLoading
        })
        app.tip(data.message);
    }
})