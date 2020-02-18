function getCookie(d) {
	var co;
	browser.cookies.getAll({domain: d}, function(cookies){
		var co = "";
		for(let c of cookies){
			co += JSON.stringify(c) + ';';
		}
		co = co.slice(0,-1);
		$("#cookies").val(Base64.encode(co));
		$("#getc").attr('disabled','disabled');
		$("#putc").attr('disabled','disabled');
	});
}

function removeCookie(d, w, c){
	var l = 0;
	browser.cookies.getAll({domain: d}, function(cookies){
		for(let e of cookies){
			browser.cookies.remove({
				url: "http" + (e.secure ? "s" : "") + ((w ===1 && e.domain.includes("www") === false) ? "://www" : "://") + (w === 1 ? e.domain : e.domain[0] === "." ? e.domain.slice(1) : e.domain) + e.path,
				name: e.name
			},function(){
				l++;
				if(l===cookies.length){
					setCookie(d,w,c);
				}
			});
		}
	});
}

function setCookie(d, w, c){
	var cookies = c.split(";");
	var l = 0;
	for(let b of cookies){
		var a = JSON.parse(b);
		browser.cookies.set({
			url: "http" + (a.secure ? "s" : "") + ((w ===1 && a.domain.includes("www") === false) ? "://www" : "://") + (w === 1 ? a.domain : a.domain[0] === "." ? a.domain.slice(1) : a.domain) + a.path,
			name: a.name,
			value: a.value,
			domain: a.domain,
			path: a.path,
			secure: a.secure,
			httpOnly: a.httponly,
			sameSite: a.sameSite,
			expirationDate: a.expirationDate
		},function(){
			l++;
			if(l===cookies.length){
        browser.notifications.create({
          type: "basic",
          title: "Success!",
          message: `Please reload ${cookieOrigin} to apply new cookies`,
          iconUrl: "icon.png"
        })
				window.close();
      }
		});
	}
}

var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }
          output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },

    decode: function(input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      output = Base64._utf8_decode(output);
      return output;
    },
    _utf8_encode: function(string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    },
    _utf8_decode: function(utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;
      while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if ((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return string;
    }
}

jQuery(document).ready(function($) {
	var d, w;
	browser.tabs.query({currentWindow: true, active: true}, function(tabs){
		if((tabs[0].url.split("/")[2]).includes(".")){
			var url = new URL(tabs[0].url);
			d = url.hostname;
			if(d.includes("www")){
				d = d.split("www")[1];
				w = 1;
			}
			$("#domain").text(d);
		}else{
			$("#domain").text("Invalid Domain");
			$("#getc").attr('disabled','disabled');
			$("#putc").attr('disabled','disabled');
		}
	});
	$("#getc").click(function() {
		getCookie(d);
	});
	$("#putc").click(function() {
        var c = Base64.decode($("#cookies").val());
        var sameOrigin = false;
		if(c.slice(0,3) === "{\"d" && c.slice(c.length-2,c.length) === "\"}"){
      var cInfo = c.split(";");
      var cookieOrigin = JSON.parse(cInfo[0]).domain;
      for(let b of cInfo){
        var a = JSON.parse(b);
        if(a.domain == d){
          sameOrigin = true;
          break;
        }
      }
      if(sameOrigin){
        removeCookie(d,w,c)
      } else{
        browser.notifications.create({
          type: "basic",
          title: "Error!",
          message: `Please go to ${cookieOrigin} before importing this cookie`,
          iconUrl: "icon.png"
        })
      }
		} else{
			browser.notifications.create({
        type: "basic",
        title: "Error!",
        message: `Invalid Cookies`,
        iconUrl: "icon.png"
      })
			$("#cookies").val("");
		}
	});
});
