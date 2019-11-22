function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

// 保存图片验证码编号
var imageCodeId = "";

function generateUUID() {
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function generateImageCode() {
    // 形成图片验证码的后端地址, 设置到页面中, 让浏览器请求验证码图片
    // 1. 生成图片验证码编号
    imageCodeId = generateUUID();
    // 图片url
    var url = '/api/v1.0/image_codes/' + imageCodeId;
    $('.image-code img').attr('src', url);
}

function sendSMSCode() {
    $(".phonecode-a").removeAttr("onclick");
    var mobile = $("#mobile").val();
    var mobileReg=/^[1][3,4,5,7,8][0-9]{9}$/;
    if (!mobileReg.test(mobile)) {
        $("#mobile-err span").html("请填写正确的手机号！");
        $("#mobile-err").show();
        $(".phonecode-a").attr("onclick", "sendSMSCode();");
        return;
    } 
    var imageCode = $("#imagecode").val();
    if (!imageCode || imageCode.length != 4) {
        $("#image-code-err span").html("请填写正确验证码！");
        $("#image-code-err").show();
        $(".phonecode-a").attr("onclick", "sendSMSCode();");
        return;
    }
    var req_data = {
        "image_code":imageCode,  // 图片验证码值
        "image_code_id":imageCodeId  // 验证码编号
    }
    $.get("/api/v1.0/sms_codes/" + mobile, req_data, 
        function(data){
            if ('0' == data.errno) {
                var $time = $(".phonecode-a");
                generateImageCode();  // 刷新验证码
                var duration = 60;
                var intervalid = setInterval(function(){
                    $time.html(duration + "秒"); 
                    if(duration === 1){
                        clearInterval(intervalid);
                        $time.html('获取验证码'); 
                        $(".phonecode-a").attr("onclick", "sendSMSCode();");
                    }
                    duration = duration - 1;
                }, 1000, 60); 
            }
            else {
                $("#image-code-err span").html(data.errmsg); 
                $("#image-code-err").show();
                if ('4004' == data.errno || '4201' == data.errno || '4003' == data.errno || '4301' == data.errno) {
                    generateImageCode();  // 刷新验证码
                }
                $(".phonecode-a").attr("onclick", "sendSMSCode();");
            }   
    }, 'json'); 
}

$(document).ready(function() {
    generateImageCode();
    $("#mobile").focus(function(){
        $("#mobile-err").hide();
    });
    $("#imagecode").focus(function(){
        $("#image-code-err").hide();
    });
    $("#phonecode").focus(function(){
        $("#phone-code-err").hide();
    });
    $("#password").focus(function(){
        $("#password-err").hide();
        $("#password2-err").hide();
    });
    $("#password2").focus(function(){
        $("#password2-err").hide();
    });
    $(".form-register").submit(function(e){
        e.preventDefault();
        mobile = $("#mobile").val();
        phoneCode = $("#phonecode").val();
        passwd = $("#password").val();
        passwd2 = $("#password2").val();
        if (!mobile) {
            $("#mobile-err span").html("请填写正确的手机号！");
            $("#mobile-err").show();
            return;
        } 
        if (!phoneCode) {
            $("#phone-code-err span").html("请填写短信验证码！");
            $("#phone-code-err").show();
            return;
        }
        if (!passwd) {
            $("#password-err span").html("请填写密码!");
            $("#password-err").show();
            return;
        }
        if (passwd != passwd2) {
            $("#password2-err span").html("两次密码不一致!");
            $("#password2-err").show();
            return;
        }
    });
})