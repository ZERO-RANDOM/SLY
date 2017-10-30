function G() {
    var me = this;
    me.baseUrl = "http://192.168.14.233:8003";
    document.addEventListener('plusready',function(){
    	me.token=plus.storage.getItem("token");
    },false);
    me.setToken = function(token){
    	me.token = token;
    	plus.storage.setItem( "token", token );
    }
    me.clearToken = function(){
    	me.token = "";
    	plus.storage.setItem( "token", "" );
    }
    // get方式网络访问
    me.get = function (url, param, cb) {
    	param = param||{};
    	if ( me.token ){
    		param.token = me.token;
    	}
        $.get(me.baseUrl+url, param||{}, function (data) {
            cb(data.err, data.data,data.msg);
        });
    }
    // post方式网络访问
    me.post = function (url, data, cb) {
    	if ( me.token ){
    		if ( url.indexOf("?")!= -1 ){
    			url += "&";
    		}else{
    			url += "?";
    		}
    		url += "token="+me.token;
    	}
        $.post(me.baseUrl+url, data, function (data,err) {
        	console.log(err)
            cb(data.err, data.data,data.msg);
        });
    }
    // put方式网络访问
    me.put = function (url, data, cb) {
    	if ( me.token ){
    		if ( url.indexOf("?")!= -1 ){
    			url += "&";
    		}else{
    			url += "?";
    		}
    		url += "token="+me.token;
    	}
        $.put(me.baseUrl+url, data, function (data) {
            cb(data.err, data.data,data.msg);
        });
    }
}
window.g = window.g || {};
window.g.tools = new G();
