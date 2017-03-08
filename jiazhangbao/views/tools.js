import React from 'react';
import {
    RefreshControl,
    View,
    Text,
    AsyncStorage,
    Platform,
    NetInfo,
    Dimensions
} from 'react-native';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
const AppPlugin = require('react-native').NativeModules.PluginList;
var ImagePickerManager = require('NativeModules').ImagePickerManager;
import Toast from './tools/Toast'
import {cgRoute} from "./constStr"
var  screenWidth=Dimensions.get('window').width;
var  screenHeight=Dimensions.get('window').height;
var chnNumChar = ["零","一","二","三","四","五","六","七","八","九"];
var chnUnitSection = ["","万","亿","万亿","亿亿"];
var chnUnitChar = ["","十","百","千"];

var Tools = {
    /**
     * 阿拉伯数字转成汉字
     */
    NumberToChinese: function (num) {
        var unitPos = 0;
        var strIns = '', chnStr = '';
        var needZero = false;

        if (num === 0) {
            return chnNumChar[0];
        }

        while (num > 0) {
            var section = num % 10000;
            if (needZero) {
                chnStr = chnNumChar[0] + chnStr;
            }
            strIns = this.SectionToChinese(section);
            strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
            chnStr = strIns + chnStr;
            needZero = (section < 1000) && (section > 0);
            num = Math.floor(num / 10000);
            unitPos++;
        }

        return chnStr;
    },
    SectionToChinese: function (section) {
        var strIns = '', chnStr = '';
        var unitPos = 0;
        var zero = true;
        while (section > 0) {
            var v = section % 10;
            if (v === 0) {
                if (!zero) {
                    zero = true;
                    chnStr = chnNumChar[v] + chnStr;
                }
            } else {
                zero = false;
                strIns = chnNumChar[v];
                strIns += chnUnitChar[unitPos];
                chnStr = strIns + chnStr;
            }
            unitPos++;
            section = Math.floor(section / 10);
        }
        return chnStr;
    },

    timeFormat:function(time,space,callback){
      console.log("time=="+time)
      if(!this.isDataValid(time)){
        callback(4,0)
        return;
      }
      var date = new Date(Date.parse(time.replace(/-/g, "/")))
        , curDate = new Date()
        , year = parseInt(date.getFullYear())
        , month = parseInt(date.getMonth() + 1)
        , day = parseInt(date.getDate())
        , hour = parseInt(date.getHours())
        , minute = parseInt(date.getMinutes())
        , curYear = parseInt(curDate.getFullYear())
        , curmonth = parseInt(curDate.getMonth() + 1)
        , curday = parseInt(curDate.getDate())
        , curHour = parseInt(curDate.getHours())
        , curminute = parseInt(curDate.getMinutes())
        ,timeStr;
          var haveTime = date - curDate;
          haveTime = parseInt(haveTime/1000);
            var h = haveTime / 3600;
            var m = Math.ceil(haveTime / 60 % 60);
            var s = Math.floor(haveTime % 60);
              // console.log("haveTime=="+haveTime)
              // console.log("h=="+h+"===m=="+m+"===s=="+s)
          if(h > 1){
            console.log("(h)=="+h)
            callback(1,haveTime)
          }else if(m > parseInt(space)){//大于space按分倒计时小于按秒
            callback(2,haveTime)//返回
          }else if(m > 0){
            callback(3,haveTime)
          }else{
            callback(4,0)
          }
    },
    /**
    * 处理日期显示的数据
    * @ pDate 接收到的日期字符串
    */
    getDateData:function(pDate,returntime){
        let date = "";
        let today = new Date();
        let yestoday = new Date();
        yestoday.setDate(yestoday.getDate()-1);
        try{
            let dateArr = pDate.split("-");
            let itemDateStr = dateArr[1].toString()+dateArr[2].substr(0,2);
            let todayStr = (today.getMonth()+1).toString()+today.getDate().toString(); //12-1 
            let todayStr01 = (today.getMonth()+1).toString()+(today.getDate().toString().length==1?("0"+today.getDate().toString()):today.getDate().toString());//12-01
            let yestodayStr = (yestoday.getMonth()+1).toString()+yestoday.getDate().toString();
            let yestodayStr01 = (yestoday.getMonth()+1).toString()+(yestoday.getDate().toString().length==1?("0"+yestoday.getDate().toString()):yestoday.getDate().toString());

            console.log(itemDateStr+"===date=="+todayStr+"=today=="+todayStr01)
            console.log("======yestodayStr=="+yestodayStr)
            if(itemDateStr == todayStr||itemDateStr==todayStr01){
                date = "今天";
            }else if(itemDateStr == yestodayStr||itemDateStr==yestodayStr01){
                date = "昨天";
            }else{
                date = dateArr[1]+"-"+dateArr[2].substr(0,2);
            }
            if(returntime){
                return {date:date,time:this.getStrTime(pDate)}
            }
            return date;
        }catch(e){
            return pDate?pDate:"";
        }
    },
    /**
    *  截取操作时间
    */
    getStrTime:function(time){
        if(this.isDataValid(time)){
            if(time.indexOf(" ")>0){
               var res = time.split(" ");
                var time = res&&res.length>1?res[1]:time; 
                return time.substr(0,time.lastIndexOf(":"))
            }
            return time;
        }
        return "";
    },
    splitTime:function (time) {
        if(this.isDataValid(time)){
            if(time.indexOf(" ")>0){
               var res = time.split(" ");
                return res&&res.length>0?res[0]:time; 
            }
            return time;
        }
        return "";
    },
    //获取资讯评论时间
    getNewsCommentTime:function(pDate,returntime){
        var returnMsg = "";
        var nowDate = new Date();
        var date = pDate.replace(" ","-");
        var inDate = date.replace(/:/g,"-");
        console.log("zixun===="+nowDate.getHours());
        var dateArr = inDate.split("-");
        console.log("zixun===="+nowDate.getFullYear()-dateArr[0]>1)
        try{
            if(nowDate.getFullYear()-dateArr[0]>1){
                resultmsg = nowDate.getFullYear()-dateArr[0]+"年前";
            }else if (nowDate.getFullYear()-dateArr[0]==1){
                if (nowDate.getMonth()+1>=dateArr[1]){
                    resultmsg = "1年前"
                }else{
                    resultmsg = 12-dateArr[1]+nowDate.getMonth()+1+"个月前";
                }
            }else{
                if(nowDate.getMonth()+1-dateArr[1]>1){
                    resultmsg = nowDate.getMonth()+1-dateArr[1]+"个月前";
                }else if(nowDate.getMonth()+1-dateArr[1]==1){
                    if (nowDate.getDate()>=dateArr[2]){
                        resultmsg = "1个月前";
                    }else{
                        resultmsg = new Date(dateArr[0],dateArr[1],0).getDate()-dateArr[2]+nowDate.getDate()+"天前";
                    }
                }else{
                    if(nowDate.getDate()-dateArr[2]>1){
                        resultmsg = nowDate.getDate()-dateArr[2]+"天前";
                    }else if(nowDate.getDate()-dateArr[2]==1){
                        if (nowDate.getHours()>=dateArr[3]){
                            resultmsg = "1天前";
                        }else{
                            resultmsg =(24-dateArr[3]+nowDate.getHours())+"小时前";
                        }
                    }else{
                        if(nowDate.getHours()-dateArr[3]>1){
                            resultmsg = nowDate.getHours()-dateArr[3] + "小时前"
                        }else if(nowDate.getHours()-dateArr[3]==1){
                            if (nowDate.getMinutes()>=dateArr[4]){
                                resultmsg = "1小时前";
                            }else{
                               resultmsg = 60 - dateArr[4]+nowDate.getMinutes()+"分钟前"; 
                            }
                        }else{
                            if(nowDate.getMinutes()-dateArr[4]>=1){
                                resultmsg = nowDate.getMinutes()-dateArr[4]+"分钟前";
                            }else {
                                resultmsg = "刚刚";
                            }
                        }
                    }
                }
            }
            console.log("zixun===="+resultmsg);
            return resultmsg;
        }catch(e){
            return pDate?pDate:null;
        }

    },
    //上报
    toReport:function(label){
        Tools.getStorage("maincfg",(resData)=>{
               if(Tools.isDataValid(resData)){
                resData=eval("("+resData+")")
                   var posturl = resData.other&&resData.other.newixtoken?resData.other.newixtoken:"";
                    AppPlugin.getPushToken((ixtoken,xgtoken)=>{
                        if(!this.isDataValid(ixtoken)){
                            return;
                        }
                        var PostData = {
                            data:{
                                ixtoken:ixtoken,
                                type:label,
                                tokentype:Platform.OS
                            }
                        }
                        console.log("===toReport=postdata="+JSON.stringify(PostData));
                        console.log("==toReport==url="+posturl);
                        Tools.postNotBase64(posturl,PostData,(ret)=>{
                            console.log("===toReport==resdata=="+JSON.stringify(ret));
                        },(ret)=>{
                            console.log("ret=="+ret);
                        })
                    })
               }
           })
    },
    toQueryString: function (obj) {
        return obj ? Object.keys(obj).sort().map(function (key) {
            var val = obj[key];
            if (Array.isArray(val)) {
                return val.sort().map(function (val2) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                }).join('&');
            }

            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
    },
    isDataValid: function (data) {
        if (data != null && data != "" && data != "undefined"&&data!="null") {
            return true;
        } else {
            return false;
        }
    },
    dopost:function(url, data, successCallBaack, errCallBack,showokMsg){        
        var fetchOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: data
        };
        //判断url是否是正确
        console.log("url==="+url)
        if(!this.isDataValid(url)||url.indexOf("undefined")==0||url.indexOf("http://")!=0){
            errCallBack("url请求地址错误");
            return
        }
        fetch(url, fetchOptions)
            .then((response) => response.text())
            .then((responseText) => {
                this.doResult(responseText,successCallBaack, errCallBack,showokMsg)
            })
            .catch((error) => {
                errCallBack("服务器访问失败"+error);
            })
            .done();
    },
    postNotBase64:function(url, data, successCallBaack, errCallBack,showokMsg){
        NetInfo.isConnected.fetch().done((isConnected) => {
            // if(!isConnected){
            //     errCallBack("网络连接不可用")
            // }else
            {
                this.dopost(url,JSON.stringify(data),successCallBaack, errCallBack,showokMsg)
            }
        }); 
    },
    post: function (url, data, successCallBaack, errCallBack,showokMsg) {
        data = JSON.stringify(data);
        data = this.base64encode(data);
        NetInfo.isConnected.fetch().done((isConnected) => {
            // if(!isConnected){
            //     errCallBack("网络连接不可用")
            // }else
            {
                this.dopost(url,encodeURIComponent(data),successCallBaack, errCallBack,showokMsg)
            }
        });       
    },
    /*
    * 统一处理返回结果
    */
    doResult:function(responseText,successCallBaack, errCallBack,showokMsg){
       console.log("====responseText==="+responseText)
       if(!responseText){
            return;
       }
        var responseData=eval("(" + responseText + ")")
        if(responseText=="Not Found"){
            if(errCallBack){
                errCallBack("服务器访问失败，请稍后重试");
            }
        }else if (responseData.resultcode >= 0) {
             if(showokMsg){
                Toast.show(responseData.resultmsg)
            }
             successCallBaack(responseData.data);
        } else if(responseData.resultcode==-2){
            //token验证失败
            this.clearuserInfo();
            if(errCallBack){
                errCallBack("登录失效,请重新登录");
            }
        }else {
            if(errCallBack){
                if(this.isDataValid(responseData.resultmsg)){
                    errCallBack(responseData.resultmsg);
                }else{
                    errCallBack("数据解析错误");
                }
           }
        }
    },
    doGet:function(url, successCallBack, errCallBack,returnType,showokMsg){
        console.log("url==="+url)
        NetInfo.isConnected.fetch().done((isConnected) => {
            // if(!isConnected){
            //     errCallBack("网络连接不可用")
            // }else
            {
                if(!this.isDataValid(url)||url.indexOf("undefined")==0||url.indexOf("null")==0||url.indexOf("http://")!=0){
                    errCallBack("url请求地址错误");
                    return
                }
                fetch(url).then((response) => response.text())
                .then((responseText) => {
                    if(returnType==-1){
                        successCallBack(eval("(" + responseText + ")"));
                    }else{
                        this.doResult(responseText,successCallBack, errCallBack,showokMsg)
                    }                    
                }).catch((err)=> {
                    if(errCallBack){
                        errCallBack('服务器请求错误'+err);
                    }               
                }).done();
            }
        }); 
    },
    get: function (url, successCallBaack, errCallBack,showokMsg) {
        this.doGet(url, successCallBaack, errCallBack,0,showokMsg)
    },
    get1: function (url, successCallBaack, errCallBack) {
        this.doGet(url, successCallBaack, errCallBack,-1)
    },
    goToLogin:function(navigator){
        if(navigator){
            navigator.push({
                name: "login",
            })
        }
    },
    /**
     * scrollview 下拉刷新控制器
     * @param isRefreshing
     * @param _onRefresh
     * @returns {XML}
     */
    intiRefresh: function (isRefreshing, _onRefresh) {
        return <RefreshControl style={Platform.OS=='ios'?{left:60}:{}}
            refreshing={isRefreshing}
            onRefresh={_onRefresh}
            tintColor="#ff5400"
            title="Loading..."
            colors={['#ff5400','#0db789']}/>
    },
    /**
    *处理html转义字符
    */
    escape2Html: function (str) {
        var arrEntities = {'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"'};
        return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
            return arrEntities[t];
        });
    },
    checkPhone:function(pPhone){
        if(!this.isDataValid(pPhone)){
            return("请输入手机号码");
        }
        pPhone=pPhone.replace(" ","");
        if (!this.isDataValid(pPhone)||pPhone<=0) {
            return("手机号码不能为空!");
        } else{
            var phone=pPhone
            if(pPhone.indexOf("+86")>=0){
                phone =pPhone.split("+86")[1];
            }
            if (phone.length != 11) {
                return("请输入11位手机号码!");
            }else if(!(/^1[3|4|5|7|8][0-9]\d{8}$/.test(phone))){
                return("手机号码格式不正确");
            } else {
                return null;
            }
        }       
    },
    checkLogin:function(callback){
        this.getToken((token)=>{
            if (this.isTokenLogin(token)) {
               callback(true);
            } else {
                callback(false)
            }
        });
    },
    /**
    *验证token是否是游客
    */
    isTokenLogin:function(token){
        if(this.isDataValid(token)&&token!='guest'){
            return true;
        }else{
            return false;
        }
    },
    /**
    *不需要强制登录的情况下获取token，已经登录了则返回登录的token，否则返回guest 表示游客登录
    */
    getToken:function(callback){
        this.getStorage("token",(value)=>{
            // alert(value);
            if (this.isDataValid(value)) {
                callback(value);
            } else {
                callback("guest")
            }
        });
    },
    
    getStorage:function(key, callback){
        AsyncStorage.getItem(key.toLowerCase())
            .then((value) => {
                callback(value);
            })
            .catch((error) => {
                console.log("----get token err----" + error);
                // alert(error)
                callback(null)
            })
            .done();
    },
    setStorage:function(key, value){
        AsyncStorage.setItem(key.toLowerCase(), value)
            .then(()=> {
            })
            .catch((error) => {

            })
            .done();
    },
    removeStorage:function(key){
        AsyncStorage.removeItem(key.toLowerCase())
            .then(()=> {
            })
            .catch((error) => {

            })
            .done();
    },
    showUserPhone:function(phone){
        if(!this.isDataValid(phone)){
            return "";
        }
        var newphone="";
        if(phone.length==11){
            newphone+=phone.substr(0,3);
            newphone+="****";
            newphone+=phone.substr(7,11)
            return newphone;
        }
        return phone  
    },
    /**
     * base64编码
     * @param str
     * @returns {string}
     */
    base64encode:function(str) {
        var out, i, len, base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    },
    /**
     * 格式化日期
     * @param date
     * @returns {string}
     */
    formatNewsTime:function(date){
        var today = new Date();
        var newsDate = new Date(Date.parse(date.replace(/-/g, "/")));
        var newsseconds = (parseInt(newsDate.getSeconds()));
        var newsminutes = (parseInt(newsDate.getMinutes()));
        var newshours = (parseInt(newsDate.getHours()));
        var newsDay = (parseInt(newsDate.getDate()));
        var newsMonth = (parseInt(newsDate.getMonth() + 1));
        var newsYear = (parseInt(newsDate.getFullYear()));
        if (newsYear==today.getFullYear()){
            return ""+ newsMonth + "-" + newsDay;
        }
        var showNewsTime = "" + newsYear + "-" + newsMonth + "-" + newsDay + "-" + newshours + "-" + newsminutes + "-" + newsseconds;
        var showNewsTime1 = "" + newsYear + "-" + newsMonth + "-" + newsDay;
        return showNewsTime1;
    },
    /**
     * 列表中简介最多显示的字数
     * @param data
     * @returns {*}
     */
    subNewsInfo:function(data, count){
        console.log("====dadada==="+data)
        if (!count ||count == null || count == "" || count == "undefined" || count == undefined) {
            count = 20;
        }
        if(!this.isDataValid(data)){
            return "";
        }
        var value = data.replace(/<\.+?>/g, ""); //去除html标签，只算汉字长度
        if (value.length > 20) {
            return value.substr(0, 20) + "...";
        } else {
            return value;
        }
    },
    /**
     * 服务器端组合格式更灵活的查询,勿删
     */
     doquery: function (data, obj) {
        var res = data.filter(function (e) {
            var list = e.attribute.filter(function (edata) {
                if (edata&&obj&&edata.label == obj.label && edata.value==obj.value) {
                    return true;
                } else {
                    return false;
                }
            })
            if(list && list.length>0){
                return true;
            }else{
                return false;
            }
        })
        return res;
    },
    doquery0: function (data, obj) {
        var res = data.filter(function (e) {
            if (obj&&e&&obj.label in e && e[obj.label] == obj.value) {
                return true;
            } else {
                return false;
            }
        })
        return res;
    },
    /**
     * 查询json数据
     * @param data json数据
     * @param obj
     * @returns {*|Array.<T>}
     */
    jsonselect: function (data, obj) {
        for (var i = 0; i < obj.length; i++) {
            data = this.doquery(data, obj[i]);
        }
        return data;

    },
    /**
     * 产品的某个属性是否被选中
     * @param data 被选中的属性组合列表
     * @param obj
     * @returns {boolean}
     */
    isSelected: function (data, obj) {
        if (data == null || data.length == 0) {
            return false;
        }
        var res = this.doquery(data, obj)
        if (res != null && res.length > 0) {
            return true;
        } else {
            return false
        }
    },
    filterArray: function (data, obj) {
        var res = data.filter(function (e) {
            if (obj&&e&&obj.label in e && e[obj.label] == obj.value) {
                return true;
            } else {
                return false;
            }
        })
        return res;
    },
    isLabelInArray: function (data, label) {
        var res = data.filter(function (e) {
            if (e&&e.label==label) {
                return true;
            } else {
                return false;
            }
        })
        return res;
    },
     isInArray: function (data, label,value) {
        if(!this.isDataValid(data)){
            return true;
        }
        var res = data.some(function (e) {
            if (e&&e[label]==value) {
                return true;
            } else {
                return false;
            }
        })
        return res;
    },
    clearRoute:function(){
        if(Platform.OS=='ios'){
            return;
        }
        AppPlugin.setLocalStorage("cgRoute","")
        AppPlugin.setLocalStorage("cgRouteJs","")
    },
    saveRoute:function(route,navigator){
        if(Platform.OS=='ios'){
            return;
        }
        cgRoute.route=route;
        cgRoute.navigat=navigator.getCurrentRoutes();
        AppPlugin.setLocalStorage("cgRouteJs",JSON.stringify(cgRoute))
    },
    getRoute:function(callback){
        if(Platform.OS=='ios'){
            return;
        }
        AppPlugin.getLocalStorage("cgRoute",(route)=>{
            callback(route?JSON.parse(route):"")
        })
    },
    chooseImg:function(successCallBack,errCallBack,option,route,navigator) {
        if(route&&navigator){
            this.saveRoute(route,navigator);
        }
        var options = {
            title: '选择图片', // specify null or empty string to remove the title
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: '照相机', // specify null or empty string to remove this button
            chooseFromLibraryButtonTitle: '图库', // specify null or empty string to remove this button
            cameraType: 'back', // 'front' or 'back'
            mediaType: 'photo', // 'photo' or 'video'
            videoQuality: 'medium', // 'low', 'medium', or 'high'
            durationLimit: 10, // video recording max time in seconds
            maxWidth: option&&option.maxWidth?option.maxWidth:parseInt(screenWidth), // photos only
            maxHeight: option&&option.maxHeight?option.maxHeight:parseInt(screenHeight), // photos only
            aspectX: 1, // android only - aspectX:aspectY, the cropping image's ratio of width to height
            aspectY: 1, // android only - aspectX:aspectY, the cropping image's ratio of width to height
            quality: 1, // 0 to 1, photos only
            angle: 0, // android only, photos only
            //allowsEditing:false,
            allowsEditing: option&&(option.allowsEditing==false||option.allowsEditing=="false")?false:true, // Built in functionality to resize/reposition the image after selection
            noData: false, // photos only - disables the base64 `data` field from being generated (greatly improves performance on large photos)
            // storageOptions: { // if this key is provided, the image will get saved in the documents directory on ios, and the pictures directory on android (rather than a temporary directory)
            //     skipBackup: true, // ios only - image will NOT be backed up to icloud
            //     path: 'images' // ios only - will save image at /Documents/images rather than the root
            // }
        };
        ImagePickerManager.showImagePicker(options, (response) => {
            //console.log("**********"+JSON.stringify(response))
            if (response.didCancel) {
               // errCallBack('User cancelled image picker')
            }
            else if (response.error) {
                errCallBack(response.error)
            }
            else {
               // console.log("**********"+JSON.stringify(response))
               if(!option||!option.type||option.type=="base64"){
                if(Platform.OS=='ios'){
                    successCallBack({uri: 'data:image/jpg;base64,' + response.data, path:response.uri.replace('file://', ''),isStatic: true}) 
                }else{
                    successCallBack({uri: 'data:image/jpg;base64,' + response.data, isStatic: true}) 
                }
               }else{
                    if(Platform.OS=='ios'){
                        successCallBack({uri: response.uri.replace('file://', ''), isStatic: true})
                    }else{
                        successCallBack({uri: response.uri, isStatic: true})
                    }
               }
            }
        });
    },
    uploadImg:function(url,imguri,successCannBack,errCallBack){
        var request = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', {uri: imguri, name: 'image', type: 'image/jpeg'});
        request.onreadystatechange = (e) => {
            if (request.readyState !== 4) {
                return;
            }
            if (request.status === 200) {
                var rsponseData=JSON.parse(request.responseText);
                if(rsponseData.resultcode>=0){
                    successCannBack(rsponseData.data)
                }else{
                    errCallBack(rsponseData.resultmsg);
                }
            } else {
                errCallBack('图片上传失败');
            }
        };
        request.open('POST', url);
        request.send(formData);

    },
    clearuserInfo:function(){
        this.removeStorage("token");
        this.removeStorage("iminfo");
        this.removeStorage("duobaotoken");
        this.removeStorage('isIMLogin');
        this.removeStorage("usertype")
        AppPlugin.logoutIM();
        RCTDeviceEventEmitter.emit('IMchange', 0);
    },
    //格式化去除html标签
    htmlformat:function(str){
        return str.replace(/<[^>]+>/g,"")
    },
    html_decode:function(str){   
      var s = "";   
      if (!str||str.length == 0) return "";   
      s = str.replace(/&gt;/g, "&");   
      s = s.replace(/&lt;/g, "<");   
      s = s.replace(/&gt;/g, ">");   
      s = s.replace(/&nbsp;/g, " ");   
      s = s.replace(/&#39;/g, "\'");   
      s = s.replace(/&quot;/g, "\"");   
      s = s.replace(/<br>/g, "\n");   
      return s;   
    },
    setWebHtml:function(content,title,time,back_color){
        var titlehtml=title?`<div id="newsViewTitle">
                <p id="newsDetailTitle">${title}</p>
                <p id="newsTime">${time}</p>
        </div>`:''
        var backcolor=back_color?back_color:title?"#f4f4f4":"#fff"
        content=this.html_decode(content);
        const HTML = `
        <!DOCTYPE html>\n
        <html>
          <head>
            <title>HTML字符串</title>
            <meta http-equiv="content-type" content="text/html; charset=utf-8">
            <style type="text/css">
              html,body {
                margin: 0;
                padding: 0;
                font: 62.5% arial, sans-serif;
                background-color: ${backcolor};
                max-width:100%!important;
              }
              p,ul,ol,li,span,div{
                margin: 0;
                padding: 0;
                font-size:14px !important;
                max-width:100%!important;
            }
              #newsViewTitle{
                text-align:center;
                background-color:${backcolor};
                color:#000000;
                margin-top:10px;
              }
              #newsDetailTitle{
                width:100%;
                text-align:center;
                margin-top:10px;
                font-size:16px !important;
              }
              #newsTime{
               padding-bottom:10px;
               color:#888888;
               margin-top:10px;
              }
              #tml{
                padding-left:10px;
                padding-right:10px;
                font-size:16px,
                max-width:100%
              }
              img{max-width:100%!important;}
              table{width:100%!important;}
              .clearfix:after {clear:both;display:block;height:0;font-size:0;content:".";visibility:hidden;}
            </style>
          </head>
          <body>
            ${titlehtml}
            <div id="tml">
            ${content}
            </div>
          </body>
        </html>
        `;
        return HTML;
    }
};
module.exports = Tools;
