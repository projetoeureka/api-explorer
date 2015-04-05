(function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var j=typeof require=="function"&&require;if(!h&&j)return j(g,!0);if(f)return f(g,!0);var k=new Error("Cannot find module '"+g+"'");throw k.code="MODULE_NOT_FOUND",k}var l=c[g]={exports:{}};b[g][0].call(l.exports,function(a){var c=b[g][1][a];return e(c?c:a)},l,l.exports,a,b,c,d)}return c[g].exports}var f=typeof require=="function"&&require;for(var g=0;g<d.length;g++)e(d[g]);return e})({1:[function(a,b,c){window.Buffer=a("buffer").Buffer},{buffer:2}],2:[function(a,b,c){function i(a,b){var c=this;if(c instanceof i){var d=typeof a,e;if(d==="number")e=+a;else if(d==="string")e=i.byteLength(a,b);else{if(d!=="object"||a===null)throw new TypeError("must start with number, buffer, array or string");a.type==="Buffer"&&f(a.data)&&(a=a.data),e=+a.length}if(e>g)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+g.toString(16)+" bytes");e<0?e=0:e>>>=0,i.TYPED_ARRAY_SUPPORT?c=i._augment(new Uint8Array(e)):(c.length=e,c._isBuffer=!0);var j;if(i.TYPED_ARRAY_SUPPORT&&typeof a.byteLength=="number")c._set(a);else if(H(a))if(i.isBuffer(a))for(j=0;j<e;j++)c[j]=a.readUInt8(j);else for(j=0;j<e;j++)c[j]=(a[j]%256+256)%256;else if(d==="string")c.write(a,0,b);else if(d==="number"&&!i.TYPED_ARRAY_SUPPORT)for(j=0;j<e;j++)c[j]=0;return e>0&&e<=i.poolSize&&(c.parent=h),c}return new i(a,b)}function j(a,b){if(this instanceof j){var c=new i(a,b);return delete c.parent,c}return new j(a,b)}function k(a,b,c,d){c=Number(c)||0;var e=a.length-c;d?(d=Number(d),d>e&&(d=e)):d=e;var f=b.length;if(f%2!==0)throw new Error("Invalid hex string");d>f/2&&(d=f/2);for(var g=0;g<d;g++){var h=parseInt(b.substr(g*2,2),16);if(isNaN(h))throw new Error("Invalid hex string");a[c+g]=h}return g}function l(a,b,c,d){var e=N(J(b,a.length-c),a,c,d);return e}function m(a,b,c,d){var e=N(K(b),a,c,d);return e}function n(a,b,c,d){return m(a,b,c,d)}function o(a,b,c,d){var e=N(M(b),a,c,d);return e}function p(a,b,c,d){var e=N(L(b,a.length-c),a,c,d);return e}function q(a,b,c){return b===0&&c===a.length?d.fromByteArray(a):d.fromByteArray(a.slice(b,c))}function r(a,b,c){var d="",e="";c=Math.min(a.length,c);for(var f=b;f<c;f++)a[f]<=127?(d+=O(e)+String.fromCharCode(a[f]),e=""):e+="%"+a[f].toString(16);return d+O(e)}function s(a,b,c){var d="";c=Math.min(a.length,c);for(var e=b;e<c;e++)d+=String.fromCharCode(a[e]&127);return d}function t(a,b,c){var d="";c=Math.min(a.length,c);for(var e=b;e<c;e++)d+=String.fromCharCode(a[e]);return d}function u(a,b,c){var d=a.length;if(!b||b<0)b=0;if(!c||c<0||c>d)c=d;var e="";for(var f=b;f<c;f++)e+=I(a[f]);return e}function v(a,b,c){var d=a.slice(b,c),e="";for(var f=0;f<d.length;f+=2)e+=String.fromCharCode(d[f]+d[f+1]*256);return e}function w(a,b,c){if(a%1!==0||a<0)throw new RangeError("offset is not uint");if(a+b>c)throw new RangeError("Trying to access beyond buffer length")}function x(a,b,c,d,e,f){if(!i.isBuffer(a))throw new TypeError("buffer must be a Buffer instance");if(b>e||b<f)throw new RangeError("value is out of bounds");if(c+d>a.length)throw new RangeError("index out of range")}function y(a,b,c,d){b<0&&(b=65535+b+1);for(var e=0,f=Math.min(a.length-c,2);e<f;e++)a[c+e]=(b&255<<8*(d?e:1-e))>>>(d?e:1-e)*8}function z(a,b,c,d){b<0&&(b=4294967295+b+1);for(var e=0,f=Math.min(a.length-c,4);e<f;e++)a[c+e]=b>>>(d?e:3-e)*8&255}function A(a,b,c,d,e,f){if(b>e||b<f)throw new RangeError("value is out of bounds");if(c+d>a.length)throw new RangeError("index out of range");if(c<0)throw new RangeError("index out of range")}function B(a,b,c,d,f){return f||A(a,b,c,4,3.4028234663852886e+38,-3.4028234663852886e+38),e.write(a,b,c,d,23,4),c+4}function C(a,b,c,d,f){return f||A(a,b,c,8,1.7976931348623157e+308,-1.7976931348623157e+308),e.write(a,b,c,d,52,8),c+8}function F(a){a=G(a).replace(E,"");if(a.length<2)return"";while(a.length%4!==0)a+="=";return a}function G(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")}function H(a){return f(a)||i.isBuffer(a)||a&&typeof a=="object"&&typeof a.length=="number"}function I(a){return a<16?"0"+a.toString(16):a.toString(16)}function J(a,b){b=b||Infinity;var c,d=a.length,e=null,f=[],g=0;for(;g<d;g++){c=a.charCodeAt(g);if(c>55295&&c<57344){if(!e){if(c>56319){(b-=3)>-1&&f.push(239,191,189);continue}if(g+1===d){(b-=3)>-1&&f.push(239,191,189);continue}e=c;continue}if(c<56320){(b-=3)>-1&&f.push(239,191,189),e=c;continue}c=e-55296<<10|c-56320|65536,e=null}else e&&((b-=3)>-1&&f.push(239,191,189),e=null);if(c<128){if((b-=1)<0)break;f.push(c)}else if(c<2048){if((b-=2)<0)break;f.push(c>>6|192,c&63|128)}else if(c<65536){if((b-=3)<0)break;f.push(c>>12|224,c>>6&63|128,c&63|128)}else{if(!(c<2097152))throw new Error("Invalid code point");if((b-=4)<0)break;f.push(c>>18|240,c>>12&63|128,c>>6&63|128,c&63|128)}}return f}function K(a){var b=[];for(var c=0;c<a.length;c++)b.push(a.charCodeAt(c)&255);return b}function L(a,b){var c,d,e,f=[];for(var g=0;g<a.length;g++){if((b-=2)<0)break;c=a.charCodeAt(g),d=c>>8,e=c%256,f.push(e),f.push(d)}return f}function M(a){return d.toByteArray(F(a))}function N(a,b,c,d){for(var e=0;e<d;e++){if(e+c>=b.length||e>=a.length)break;b[e+c]=a[e]}return e}function O(a){try{return decodeURIComponent(a)}catch(b){return String.fromCharCode(65533)}}var d=a("base64-js"),e=a("ieee754"),f=a("is-array");c.Buffer=i,c.SlowBuffer=j,c.INSPECT_MAX_BYTES=50,i.poolSize=8192;var g=1073741823,h={};i.TYPED_ARRAY_SUPPORT=function(){try{var a=new ArrayBuffer(0),b=new Uint8Array(a);return b.foo=function(){return 42},b.foo()===42&&typeof b.subarray=="function"&&(new Uint8Array(1)).subarray(1,1).byteLength===0}catch(c){return!1}}(),i.isBuffer=function(b){return b!=null&&!!b._isBuffer},i.compare=function(b,c){if(!i.isBuffer(b)||!i.isBuffer(c))throw new TypeError("Arguments must be Buffers");if(b===c)return 0;var d=b.length,e=c.length;for(var f=0,g=Math.min(d,e);f<g&&b[f]===c[f];f++);return f!==g&&(d=b[f],e=c[f]),d<e?-1:e<d?1:0},i.isEncoding=function(b){switch(String(b).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},i.concat=function(b,c){if(!f(b))throw new TypeError("list argument must be an Array of Buffers.");if(b.length===0)return new i(0);if(b.length===1)return b[0];var d;if(c===undefined){c=0;for(d=0;d<b.length;d++)c+=b[d].length}var e=new i(c),g=0;for(d=0;d<b.length;d++){var h=b[d];h.copy(e,g),g+=h.length}return e},i.byteLength=function(b,c){var d;b+="";switch(c||"utf8"){case"ascii":case"binary":case"raw":d=b.length;break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":d=b.length*2;break;case"hex":d=b.length>>>1;break;case"utf8":case"utf-8":d=J(b).length;break;case"base64":d=M(b).length;break;default:d=b.length}return d},i.prototype.length=undefined,i.prototype.parent=undefined,i.prototype.toString=function P(a,b,c){var d=!1;b>>>=0,c=c===undefined||c===Infinity?this.length:c>>>0,a||(a="utf8"),b<0&&(b=0),c>this.length&&(c=this.length);if(c<=b)return"";for(;;)switch(a){case"hex":return u(this,b,c);case"utf8":case"utf-8":return r(this,b,c);case"ascii":return s(this,b,c);case"binary":return t(this,b,c);case"base64":return q(this,b,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return v(this,b,c);default:if(d)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),d=!0}},i.prototype.equals=function(b){if(!i.isBuffer(b))throw new TypeError("Argument must be a Buffer");return this===b?!0:i.compare(this,b)===0},i.prototype.inspect=function(){var b="",d=c.INSPECT_MAX_BYTES;return this.length>0&&(b=this.toString("hex",0,d).match(/.{2}/g).join(" "),this.length>d&&(b+=" ... ")),"<Buffer "+b+">"},i.prototype.compare=function(b){if(!i.isBuffer(b))throw new TypeError("Argument must be a Buffer");return this===b?0:i.compare(this,b)},i.prototype.indexOf=function(b,c){function d(a,b,c){var d=-1;for(var e=0;c+e<a.length;e++)if(a[c+e]===b[d===-1?0:e-d]){d===-1&&(d=e);if(e-d+1===b.length)return c+d}else d=-1;return-1}c>2147483647?c=2147483647:c<-2147483648&&(c=-2147483648),c>>=0;if(this.length===0)return-1;if(c>=this.length)return-1;c<0&&(c=Math.max(this.length+c,0));if(typeof b=="string")return b.length===0?-1:String.prototype.indexOf.call(this,b,c);if(i.isBuffer(b))return d(this,b,c);if(typeof b=="number")return i.TYPED_ARRAY_SUPPORT&&Uint8Array.prototype.indexOf==="function"?Uint8Array.prototype.indexOf.call(this,b,c):d(this,[b],c);throw new TypeError("val must be string, number or Buffer")},i.prototype.get=function(b){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(b)},i.prototype.set=function(b,c){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(b,c)},i.prototype.write=function(b,c,d,e){if(isFinite(c))isFinite(d)||(e=d,d=undefined);else{var f=e;e=c,c=d,d=f}c=Number(c)||0;if(d<0||c<0||c>this.length)throw new RangeError("attempt to write outside buffer bounds");var g=this.length-c;d?(d=Number(d),d>g&&(d=g)):d=g,e=String(e||"utf8").toLowerCase();var h;switch(e){case"hex":h=k(this,b,c,d);break;case"utf8":case"utf-8":h=l(this,b,c,d);break;case"ascii":h=m(this,b,c,d);break;case"binary":h=n(this,b,c,d);break;case"base64":h=o(this,b,c,d);break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":h=p(this,b,c,d);break;default:throw new TypeError("Unknown encoding: "+e)}return h},i.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}},i.prototype.slice=function(b,c){var d=this.length;b=~~b,c=c===undefined?d:~~c,b<0?(b+=d,b<0&&(b=0)):b>d&&(b=d),c<0?(c+=d,c<0&&(c=0)):c>d&&(c=d),c<b&&(c=b);var e;if(i.TYPED_ARRAY_SUPPORT)e=i._augment(this.subarray(b,c));else{var f=c-b;e=new i(f,undefined);for(var g=0;g<f;g++)e[g]=this[g+b]}return e.length&&(e.parent=this.parent||this),e},i.prototype.readUIntLE=function(b,c,d){b>>>=0,c>>>=0,d||w(b,c,this.length);var e=this[b],f=1,g=0;while(++g<c&&(f*=256))e+=this[b+g]*f;return e},i.prototype.readUIntBE=function(b,c,d){b>>>=0,c>>>=0,d||w(b,c,this.length);var e=this[b+ --c],f=1;while(c>0&&(f*=256))e+=this[b+ --c]*f;return e},i.prototype.readUInt8=function(b,c){return c||w(b,1,this.length),this[b]},i.prototype.readUInt16LE=function(b,c){return c||w(b,2,this.length),this[b]|this[b+1]<<8},i.prototype.readUInt16BE=function(b,c){return c||w(b,2,this.length),this[b]<<8|this[b+1]},i.prototype.readUInt32LE=function(b,c){return c||w(b,4,this.length),(this[b]|this[b+1]<<8|this[b+2]<<16)+this[b+3]*16777216},i.prototype.readUInt32BE=function(b,c){return c||w(b,4,this.length),this[b]*16777216+(this[b+1]<<16|this[b+2]<<8|this[b+3])},i.prototype.readIntLE=function(b,c,d){b>>>=0,c>>>=0,d||w(b,c,this.length);var e=this[b],f=1,g=0;while(++g<c&&(f*=256))e+=this[b+g]*f;return f*=128,e>=f&&(e-=Math.pow(2,8*c)),e},i.prototype.readIntBE=function(b,c,d){b>>>=0,c>>>=0,d||w(b,c,this.length);var e=c,f=1,g=this[b+ --e];while(e>0&&(f*=256))g+=this[b+ --e]*f;return f*=128,g>=f&&(g-=Math.pow(2,8*c)),g},i.prototype.readInt8=function(b,c){return c||w(b,1,this.length),this[b]&128?(255-this[b]+1)*-1:this[b]},i.prototype.readInt16LE=function(b,c){c||w(b,2,this.length);var d=this[b]|this[b+1]<<8;return d&32768?d|4294901760:d},i.prototype.readInt16BE=function(b,c){c||w(b,2,this.length);var d=this[b+1]|this[b]<<8;return d&32768?d|4294901760:d},i.prototype.readInt32LE=function(b,c){return c||w(b,4,this.length),this[b]|this[b+1]<<8|this[b+2]<<16|this[b+3]<<24},i.prototype.readInt32BE=function(b,c){return c||w(b,4,this.length),this[b]<<24|this[b+1]<<16|this[b+2]<<8|this[b+3]},i.prototype.readFloatLE=function(b,c){return c||w(b,4,this.length),e.read(this,b,!0,23,4)},i.prototype.readFloatBE=function(b,c){return c||w(b,4,this.length),e.read(this,b,!1,23,4)},i.prototype.readDoubleLE=function(b,c){return c||w(b,8,this.length),e.read(this,b,!0,52,8)},i.prototype.readDoubleBE=function(b,c){return c||w(b,8,this.length),e.read(this,b,!1,52,8)},i.prototype.writeUIntLE=function(b,c,d,e){b=+b,c>>>=0,d>>>=0,e||x(this,b,c,d,Math.pow(2,8*d),0);var f=1,g=0;this[c]=b&255;while(++g<d&&(f*=256))this[c+g]=b/f>>>0&255;return c+d},i.prototype.writeUIntBE=function(b,c,d,e){b=+b,c>>>=0,d>>>=0,e||x(this,b,c,d,Math.pow(2,8*d),0);var f=d-1,g=1;this[c+f]=b&255;while(--f>=0&&(g*=256))this[c+f]=b/g>>>0&255;return c+d},i.prototype.writeUInt8=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,1,255,0),i.TYPED_ARRAY_SUPPORT||(b=Math.floor(b)),this[c]=b,c+1},i.prototype.writeUInt16LE=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,2,65535,0),i.TYPED_ARRAY_SUPPORT?(this[c]=b,this[c+1]=b>>>8):y(this,b,c,!0),c+2},i.prototype.writeUInt16BE=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,2,65535,0),i.TYPED_ARRAY_SUPPORT?(this[c]=b>>>8,this[c+1]=b):y(this,b,c,!1),c+2},i.prototype.writeUInt32LE=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,4,4294967295,0),i.TYPED_ARRAY_SUPPORT?(this[c+3]=b>>>24,this[c+2]=b>>>16,this[c+1]=b>>>8,this[c]=b):z(this,b,c,!0),c+4},i.prototype.writeUInt32BE=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,4,4294967295,0),i.TYPED_ARRAY_SUPPORT?(this[c]=b>>>24,this[c+1]=b>>>16,this[c+2]=b>>>8,this[c+3]=b):z(this,b,c,!1),c+4},i.prototype.writeIntLE=function(b,c,d,e){b=+b,c>>>=0,e||x(this,b,c,d,Math.pow(2,8*d-1)-1,-Math.pow(2,8*d-1));var f=0,g=1,h=b<0?1:0;this[c]=b&255;while(++f<d&&(g*=256))this[c+f]=(b/g>>0)-h&255;return c+d},i.prototype.writeIntBE=function(b,c,d,e){b=+b,c>>>=0,e||x(this,b,c,d,Math.pow(2,8*d-1)-1,-Math.pow(2,8*d-1));var f=d-1,g=1,h=b<0?1:0;this[c+f]=b&255;while(--f>=0&&(g*=256))this[c+f]=(b/g>>0)-h&255;return c+d},i.prototype.writeInt8=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,1,127,-128),i.TYPED_ARRAY_SUPPORT||(b=Math.floor(b)),b<0&&(b=255+b+1),this[c]=b,c+1},i.prototype.writeInt16LE=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,2,32767,-32768),i.TYPED_ARRAY_SUPPORT?(this[c]=b,this[c+1]=b>>>8):y(this,b,c,!0),c+2},i.prototype.writeInt16BE=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,2,32767,-32768),i.TYPED_ARRAY_SUPPORT?(this[c]=b>>>8,this[c+1]=b):y(this,b,c,!1),c+2},i.prototype.writeInt32LE=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,4,2147483647,-2147483648),i.TYPED_ARRAY_SUPPORT?(this[c]=b,this[c+1]=b>>>8,this[c+2]=b>>>16,this[c+3]=b>>>24):z(this,b,c,!0),c+4},i.prototype.writeInt32BE=function(b,c,d){return b=+b,c>>>=0,d||x(this,b,c,4,2147483647,-2147483648),b<0&&(b=4294967295+b+1),i.TYPED_ARRAY_SUPPORT?(this[c]=b>>>24,this[c+1]=b>>>16,this[c+2]=b>>>8,this[c+3]=b):z(this,b,c,!1),c+4},i.prototype.writeFloatLE=function(b,c,d){return B(this,b,c,!0,d)},i.prototype.writeFloatBE=function(b,c,d){return B(this,b,c,!1,d)},i.prototype.writeDoubleLE=function(b,c,d){return C(this,b,c,!0,d)},i.prototype.writeDoubleBE=function(b,c,d){return C(this,b,c,!1,d)},i.prototype.copy=function(b,c,d,e){d||(d=0),!e&&e!==0&&(e=this.length),c>=b.length&&(c=b.length),c||(c=0),e>0&&e<d&&(e=d);if(e===d)return 0;if(b.length===0||this.length===0)return 0;if(c<0)throw new RangeError("targetStart out of bounds");if(d<0||d>=this.length)throw new RangeError("sourceStart out of bounds");if(e<0)throw new RangeError("sourceEnd out of bounds");e>this.length&&(e=this.length),b.length-c<e-d&&(e=b.length-c+d);var f=e-d;if(f<1e3||!i.TYPED_ARRAY_SUPPORT)for(var g=0;g<f;g++)b[g+c]=this[g+d];else b._set(this.subarray(d,d+f),c);return f},i.prototype.fill=function(b,c,d){b||(b=0),c||(c=0),d||(d=this.length);if(d<c)throw new RangeError("end < start");if(d===c)return;if(this.length===0)return;if(c<0||c>=this.length)throw new RangeError("start out of bounds");if(d<0||d>this.length)throw new RangeError("end out of bounds");var e;if(typeof b=="number")for(e=c;e<d;e++)this[e]=b;else{var f=J(b.toString()),g=f.length;for(e=c;e<d;e++)this[e]=f[e%g]}return this},i.prototype.toArrayBuffer=function(){if(typeof Uint8Array!="undefined"){if(i.TYPED_ARRAY_SUPPORT)return(new i(this)).buffer;var b=new Uint8Array(this.length);for(var c=0,d=b.length;c<d;c+=1)b[c]=this[c];return b.buffer}throw new TypeError("Buffer.toArrayBuffer not supported in this browser")};var D=i.prototype;i._augment=function(b){return b.constructor=i,b._isBuffer=!0,b._set=b.set,b.get=D.get,b.set=D.set,b.write=D.write,b.toString=D.toString,b.toLocaleString=D.toString,b.toJSON=D.toJSON,b.equals=D.equals,b.compare=D.compare,b.indexOf=D.indexOf,b.copy=D.copy,b.slice=D.slice,b.readUIntLE=D.readUIntLE,b.readUIntBE=D.readUIntBE,b.readUInt8=D.readUInt8,b.readUInt16LE=D.readUInt16LE,b.readUInt16BE=D.readUInt16BE,b.readUInt32LE=D.readUInt32LE,b.readUInt32BE=D.readUInt32BE,b.readIntLE=D.readIntLE,b.readIntBE=D.readIntBE,b.readInt8=D.readInt8,b.readInt16LE=D.readInt16LE,b.readInt16BE=D.readInt16BE,b.readInt32LE=D.readInt32LE,b.readInt32BE=D.readInt32BE,b.readFloatLE=D.readFloatLE,b.readFloatBE=D.readFloatBE,b.readDoubleLE=D.readDoubleLE,b.readDoubleBE=D.readDoubleBE,b.writeUInt8=D.writeUInt8,b.writeUIntLE=D.writeUIntLE,b.writeUIntBE=D.writeUIntBE,b.writeUInt16LE=D.writeUInt16LE,b.writeUInt16BE=D.writeUInt16BE,b.writeUInt32LE=D.writeUInt32LE,b.writeUInt32BE=D.writeUInt32BE,b.writeIntLE=D.writeIntLE,b.writeIntBE=D.writeIntBE,b.writeInt8=D.writeInt8,b.writeInt16LE=D.writeInt16LE,b.writeInt16BE=D.writeInt16BE,b.writeInt32LE=D.writeInt32LE,b.writeInt32BE=D.writeInt32BE,b.writeFloatLE=D.writeFloatLE,b.writeFloatBE=D.writeFloatBE,b.writeDoubleLE=D.writeDoubleLE,b.writeDoubleBE=D.writeDoubleBE,b.fill=D.fill,b.inspect=D.inspect,b.toArrayBuffer=D.toArrayBuffer,b};var E=/[^+\/0-9A-z\-]/g},{"base64-js":3,ieee754:4,"is-array":5}],3:[function(a,b,c){var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";(function(a){function k(a){var b=a.charCodeAt(0);if(b===c||b===i)return 62;if(b===e||b===j)return 63;if(b<f)return-1;if(b<f+10)return b-f+26+26;if(b<h+26)return b-h;if(b<g+26)return b-g+26}function l(a){function l(a){h[j++]=a}var c,d,e,f,g,h;if(a.length%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var i=a.length;g="="===a.charAt(i-2)?2:"="===a.charAt(i-1)?1:0,h=new b(a.length*3/4-g),e=g>0?a.length-4:a.length;var j=0;for(c=0,d=0;c<e;c+=4,d+=3)f=k(a.charAt(c))<<18|k(a.charAt(c+1))<<12|k(a.charAt(c+2))<<6|k(a.charAt(c+3)),l((f&16711680)>>16),l((f&65280)>>8),l(f&255);return g===2?(f=k(a.charAt(c))<<2|k(a.charAt(c+1))>>4,l(f&255)):g===1&&(f=k(a.charAt(c))<<10|k(a.charAt(c+1))<<4|k(a.charAt(c+2))>>2,l(f>>8&255),l(f&255)),h}function m(a){function h(a){return d.charAt(a)}function i(a){return h(a>>18&63)+h(a>>12&63)+h(a>>6&63)+h(a&63)}var b,c=a.length%3,e="",f,g;for(b=0,g=a.length-c;b<g;b+=3)f=(a[b]<<16)+(a[b+1]<<8)+a[b+2],e+=i(f);switch(c){case 1:f=a[a.length-1],e+=h(f>>2),e+=h(f<<4&63),e+="==";break;case 2:f=(a[a.length-2]<<8)+a[a.length-1],e+=h(f>>10),e+=h(f>>4&63),e+=h(f<<2&63),e+="="}return e}"use strict";var b=typeof Uint8Array!="undefined"?Uint8Array:Array,c="+".charCodeAt(0),e="/".charCodeAt(0),f="0".charCodeAt(0),g="a".charCodeAt(0),h="A".charCodeAt(0),i="-".charCodeAt(0),j="_".charCodeAt(0);a.toByteArray=l,a.fromByteArray=m})(typeof c=="undefined"?this.base64js={}:c)},{}],4:[function(a,b,c){c.read=function(a,b,c,d,e){var f,g,h=e*8-d-1,i=(1<<h)-1,j=i>>1,k=-7,l=c?e-1:0,m=c?-1:1,n=a[b+l];l+=m,f=n&(1<<-k)-1,n>>=-k,k+=h;for(;k>0;f=f*256+a[b+l],l+=m,k-=8);g=f&(1<<-k)-1,f>>=-k,k+=d;for(;k>0;g=g*256+a[b+l],l+=m,k-=8);if(f===0)f=1-j;else{if(f===i)return g?NaN:(n?-1:1)*Infinity;g+=Math.pow(2,d),f-=j}return(n?-1:1)*g*Math.pow(2,f-d)},c.write=function(a,b,c,d,e,f){var g,h,i,j=f*8-e-1,k=(1<<j)-1,l=k>>1,m=e===23?Math.pow(2,-24)-Math.pow(2,-77):0,n=d?0:f-1,o=d?1:-1,p=b<0||b===0&&1/b<0?1:0;b=Math.abs(b),isNaN(b)||b===Infinity?(h=isNaN(b)?1:0,g=k):(g=Math.floor(Math.log(b)/Math.LN2),b*(i=Math.pow(2,-g))<1&&(g--,i*=2),g+l>=1?b+=m/i:b+=m*Math.pow(2,1-l),b*i>=2&&(g++,i/=2),g+l>=k?(h=0,g=k):g+l>=1?(h=(b*i-1)*Math.pow(2,e),g+=l):(h=b*Math.pow(2,l-1)*Math.pow(2,e),g=0));for(;e>=8;a[c+n]=h&255,n+=o,h/=256,e-=8);g=g<<e|h,j+=e;for(;j>0;a[c+n]=g&255,n+=o,g/=256,j-=8);a[c+n-o]|=p*128}},{}],5:[function(a,b,c){var d=Array.isArray,e=Object.prototype.toString;b.exports=d||function(a){return!!a&&"[object Array]"==e.call(a)}},{}]},{},[1]);

/**
Copyright (c) 2013 Jeremy Lainé

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var emulated = {
    'datetime.datetime': function(args) {
        var tmp = new Buffer(args[0], 'binary')
          , year = tmp.readUInt16BE(0)
          , month = tmp.readUInt8(2) - 1
          , day = tmp.readUInt8(3)
          , hour = tmp.readUInt8(4)
          , minute = tmp.readUInt8(5)
          , second = tmp.readUInt8(6)
          , microsecond = tmp.readUInt32BE(6) & 0xffffff;
        if (args[1] == 'UTC') {
            return new Date(Date.UTC(year, month, day, hour, minute, second, microsecond / 1000));
        } else {
            return new Date(year, month, day, hour, minute, second, microsecond / 1000);
        }
    },
    'django.utils.timezone.UTC': function(args) {
        return 'UTC';
    }
};

var Parser = function() {
    this.mark = 'THIS-NEEDS-TO-BE-UNIQUE-TO-SERVE-AS-A-BOUNDARY';
    this.memo = {};
    this.stack = [];
};

Parser.prototype.load = function(pickle) {
    var MARK = '('              // push special markobject on stack
      , STOP = '.'              // every pickle ends with STOP
      , POP = '0'               // discard topmost stack item
      , POP_MARK = '1'          // discard stack top through topmost markobject
      , DUP = '2'               // duplicate top stack item
      , FLOAT = 'F'             // push float object; decimal string argument
      , INT = 'I'               // push integer or bool; decimal string argument
      , BININT = 'J'            // push 4-byte signed int
      , BININT1 = 'K'           // push 1-byte unsigned int
      , LONG = 'L'              // push long; decimal string argument
      , BININT2 = 'M'           // push 2-byte unsigned int
      , NONE = 'N'              // push None
      // missing PERSID
      // missing BINPERSID
      , REDUCE = 'R'            // apply callable to argtuple, both on stack
      , STRING = 'S'            // push string; NL-terminated string argument
      , BINSTRING = 'T'         // push string; counted binary string argument
      , SHORT_BINSTRING = 'U'   //  "     "   ;    "      "       "      " < 256 bytes
      , UNICODE = 'V'           // push Unicode string; raw-unicode-escaped'd argument
      , BINUNICODE = 'X'        //   "     "       "  ; counted UTF-8 string argument
      , APPEND = 'a'            // append stack top to list below it
      , BUILD = 'b'             // build the entire value
      , GLOBAL = 'c'            // push self.find_class(modname, name); 2 string args
      , DICT = 'd'              // build a dict from stack items
      , EMPTY_DICT = '}'        // push empty dict
      , APPENDS = 'e'           // extend list on stack by topmost stack slice
      , GET = 'g'               // push item from memo on stack; index is string arg
      , BINGET = 'h'            //   "    "    "    "   "   "  ;   "    " 1-byte arg
      // missing INST
      , LONG_BINGET = 'j'       // push item from memo on stack; index is 4-byte arg
      , LIST = 'l'              // build list from topmost stack items
      , EMPTY_LIST = ']'        // push empty list
      , OBJ = 'o'               // build a class instance using the objects between here and the mark
      , PUT = 'p'               // store stack top in memo; index is string arg
      , BINPUT = 'q'            //   "     "    "   "   " ;   "    " 1-byte arg
      , LONG_BINPUT = 'r'       //   "     "    "   "   " ;   "    " 4-byte arg
      , SETITEM = 's'           // add key+value pair to dict
      , TUPLE = 't'             // build tuple from topmost stack items
      , EMPTY_TUPLE = ')'       // push empty tuple
      , SETITEMS = 'u'          // modify dict by adding topmost key+value pairs
      , BINFLOAT = 'G'          // push float; arg is 8-byte float encoding
      // protocol 2
      , PROTO = '\x80'          // identify pickle protocol
      , NEWOBJ = '\x81'         // build object by applying cls.__new__ to argtuple
      , TUPLE1 = '\x85'         // build 1-tuple from stack top
      , TUPLE2 = '\x86'         // build 2-tuple from two topmost stack items
      , TUPLE3 = '\x87'         // build 3-tuple from three topmost stack items
      , NEWTRUE = '\x88'        // push True
      , NEWFALSE = '\x89'       // push False
      , LONG1 = '\x8a'          // push long from < 256 bytes
      , LONG4 = '\x8b'          // push really big long
      ;

    var buffer = new Buffer(pickle, 'binary');
    buffer.readLine = function(i) {
        var index = pickle.indexOf('\n', i);
        if (index == -1)
            throw "Could not find end of line";
        return pickle.substr(i, index - i);
    }

    for (var i = 0; i < pickle.length; ) {
        var opindex = i
          , opcode = pickle[i++];
        //console.log('opcode ' + opindex + ' ' + opcode);
        switch (opcode) {
        // protocol 2
        case PROTO:
            var proto = buffer.readUInt8(i++);
            if (proto != 2)
                throw 'Unhandled pickle protocol version: ' + proto;
            break;
        case TUPLE1:
            var a = this.stack.pop();
            this.stack.push([a]);
            break;
        case TUPLE2:
            var b = this.stack.pop()
              , a = this.stack.pop();
            this.stack.push([a, b]);
            break;
        case TUPLE3:
            var c = this.stack.pop()
              , b = this.stack.pop()
              , a = this.stack.pop();
            this.stack.push([a, b, c]);
            break;
        case NEWTRUE:
            this.stack.push(true);
            break;
        case NEWFALSE:
            this.stack.push(false);
            break;
        case LONG1:
            var length = buffer.readUInt8(i++);
            // FIXME: actually decode LONG1
            i += length;
            this.stack.push(0);
            break;
        case LONG4:
            var length = buffer.readUInt32LE(i);
            i += 4;
            // FIXME: actually decode LONG4
            i += length;
            this.stack.push(0);
            break;
        // protocol 0 and protocol 1
        case POP:
            this.stack.pop();
            break;
        case POP_MARK:
            var mark = this.marker();
            this.stack = this.stack.slice(0, mark);
            break;
        case DUP:
            var value = this.stack[this.stack.length-1];
            this.stack.push(value);
            break;
        case EMPTY_DICT:
            this.stack.push({});
            break;
        case EMPTY_LIST:
        case EMPTY_TUPLE:
            this.stack.push([]);
            break;
        case GET:
            var index = buffer.readLine(i);
            i += index.length + 1;
            this.stack.push(this.memo[index]);
            break;
        case BINGET:
            var index = buffer.readUInt8(i++);
            this.stack.push(this.memo[''+index]);
            break;
        case LONG_BINGET:
            var index = buffer.readUInt32LE(i);
            i+=4;
            this.stack.push(this.memo[''+index]);
            break;
        case PUT:
            var index = buffer.readLine(i);
            i += index.length + 1;
            this.memo[index] = this.stack[this.stack.length-1];
            break;
        case BINPUT:
            var index = buffer.readUInt8(i++);
            this.memo['' + index] = this.stack[this.stack.length-1];
            break;
        case LONG_BINPUT:
            var index = buffer.readUInt32LE(i);
            i+=4;
            this.memo['' + index] = this.stack[this.stack.length-1];
            break;
        case GLOBAL:
            var module = buffer.readLine(i);
            i += module.length + 1;
            var name = buffer.readLine(i);
            i += name.length + 1;
            var func = emulated[module + '.' + name];
            if (func === undefined) {
                throw "Cannot emulate global: " + module + " " + name;
            }
            this.stack.push(func);
            break;
        case OBJ:
            var obj = new (this.stack.pop())();
            var mark = this.marker();
            for (var pos = mark + 1; pos < this.stack.length; pos += 2) {
              obj[this.stack[pos]] = this.stack[pos + 1];
            }
            this.stack = this.stack.slice(0, mark);
            this.stack.push(obj);
            break;
        case BUILD:
            var dict = this.stack.pop();
            var obj = this.stack.pop();
            for ( var p in dict ) {
              obj[p] = dict[p];
            }
            this.stack.push(obj);
            break;
        case REDUCE:
            var args = this.stack.pop();
            var func = this.stack[this.stack.length - 1];
            this.stack[this.stack.length - 1] = func(args);
            break;
        case INT:
            var value = buffer.readLine(i);
            i += value.length + 1;
            if (value == '01')
                this.stack.push(true);
            else if (value == '00')
                this.stack.push(false);
            else
                this.stack.push(parseInt(value));
            break;
        case BININT:
            this.stack.push(buffer.readInt32LE(i));
            i += 4;
            break;
        case BININT1:
            this.stack.push(buffer.readUInt8(i));
            i += 1;
            break;
        case BININT2:
            this.stack.push(buffer.readUInt16LE(i));
            i += 2;
            break;
        case MARK:
            this.stack.push(this.mark);
            break;
        case FLOAT:
            var value = buffer.readLine(i);
            i += value.length + 1;
            this.stack.push(parseFloat(value));
            break;
        case LONG:
            var value = buffer.readLine(i);
            i += value.length + 1;
            this.stack.push(parseInt(value));
            break;
        case BINFLOAT:
            this.stack.push(buffer.readDoubleBE(i));
            i += 8;
            break;
        case STRING:
            var value = buffer.readLine(i);
            i += value.length + 1;
            var quotes = "\"'";
            if (value[0] == "'") {
                if (value[value.length-1] != "'")
                    throw "insecure string pickle";
            } else if (value[0] = '"') {
                if (value[value.length-1] != '"')
                    throw "insecure string pickle";
            } else {
                throw "insecure string pickle";
            }
            this.stack.push(value.substr(1, value.length-2));
            break;
        case UNICODE:
            var value = buffer.readLine(i);
            i += value.length + 1;
            this.stack.push(value);
            break;
        case BINSTRING:
            var length = buffer.readUInt32LE(i);
            i += 4;
            this.stack.push(buffer.toString('binary', i, i + length));
            i += length;
            break;
        case SHORT_BINSTRING:
            var length = buffer.readUInt8(i++);
            this.stack.push(buffer.toString('binary', i, i + length));
            i += length;
            break;
        case BINUNICODE:
            var length = buffer.readUInt32LE(i);
            i += 4;
            this.stack.push(buffer.toString('utf8', i, i + length));
            i += length;
            break;
        case APPEND:
            var value = this.stack.pop();
            this.stack[this.stack.length-1].push(value);
            break;
        case APPENDS:
            var mark = this.marker(),
                list = this.stack[mark - 1];
            list.push.apply(list, this.stack.slice(mark + 1));
            this.stack = this.stack.slice(0, mark);
            break;
        case SETITEM:
            var value = this.stack.pop()
              , key = this.stack.pop();
            this.stack[this.stack.length-1][key] = value;
            break;
        case SETITEMS:
            var mark = this.marker()
              , obj = this.stack[mark - 1];
            for (var pos = mark + 1; pos < this.stack.length; pos += 2) {
                obj[this.stack[pos]] = this.stack[pos + 1];
            }
            this.stack = this.stack.slice(0, mark);
            break;
        case LIST:
        case TUPLE:
            var mark = this.marker()
              , list = this.stack.slice(mark + 1);
            this.stack = this.stack.slice(0, mark);
            this.stack.push(list);
            break;
        case DICT:
            var mark = this.marker()
                obj = {};
            for (var pos = mark + 1; pos < this.stack.length; pos += 2) {
                obj[this.stack[pos]] = this.stack[pos + 1];
            }
            this.stack = this.stack.slice(0, mark);
            this.stack.push(obj);
            break;
        case STOP:
            return this.stack.pop();
        case NONE:
            this.stack.push(null);
            break;
        default:
            throw "Unhandled opcode '" + opcode + "'";
        }
    }
};

Parser.prototype.marker = function(parser) {
    var k = this.stack.length - 1
    while (k > 0 && this.stack[k] !== this.mark) {
        --k;
    }
    return k;
};

pickle = {
  loads: function(string) {
    return new Parser().load(string);
  }
}