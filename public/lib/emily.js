/*
 Emily <VERSION> http://flams.github.com/emily

 The MIT License (MIT)

 Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
*/
define("Tools",[],function(){return{getGlobal:function(){return function(){return this}.call(null)},mixin:function(a,b,h){this.loop(a,function(c,d){if(!b[d]||!h)b[d]=a[d]});return b},count:function(a){var b=0;this.loop(a,function(){b++});return b},compareObjects:function(a,b){return Object.getOwnPropertyNames(a).sort().join("")==Object.getOwnPropertyNames(b).sort().join("")},compareNumbers:function(a,b){return a>b?1:a<b?-1:0},toArray:function(a){return[].slice.call(a)},loop:function(a,b,h){var c;
if(a instanceof Object&&b instanceof Function){if(a instanceof Array)for(c=0;c<a.length;c++)b.call(h,a[c],c,a);else for(c in a)a.hasOwnProperty(c)&&b.call(h,a[c],c,a);return true}else return false},objectsDiffs:function(a,b){if(a instanceof Object&&b instanceof Object){var h=[],c=[],d=[],e=[];this.loop(b,function(b,f){typeof a[f]=="undefined"?e.push(f):b!==a[f]?c.push(f):b===a[f]&&h.push(f)});this.loop(a,function(c,f){typeof b[f]=="undefined"&&d.push(f)});return{updated:c,unchanged:h,added:e,deleted:d}}else return false},
jsonify:function(a){return a instanceof Object?JSON.parse(JSON.stringify(a)):false},clone:function(a){return a instanceof Array?a.slice(0):typeof a=="object"&&a!==null&&!(a instanceof RegExp)?this.mixin(a,{}):false},getNestedProperty:function(a,b){return a&&a instanceof Object?typeof b=="string"&&b!==""?b.split(".").reduce(function(b,c){return b&&b[c]},a):typeof b=="number"?a[b]:a:a},setNestedProperty:function(a,b,h){if(a&&a instanceof Object)if(typeof b=="string"&&b!==""){var c=b.split(".");return c.reduce(function(b,
a,g){b[a]=b[a]||{};c.length==g+1&&(b[a]=h);return b[a]},a)}else return typeof b=="number"?(a[b]=h,a[b]):a;else return a}}});
define("Observable",["Tools"],function(a){return function(){var b={};this.watch=function(a,c,d){if(typeof c=="function"){var e=b[a]=b[a]||[],c=[c,d];e.push(c);return[a,e.indexOf(c)]}else return false};this.unwatch=function(a){var c=a[0],a=a[1];return b[c]&&b[c][a]?(delete b[c][a],b[c].some(function(a){return!!a})||delete b[c],true):false};this.notify=function(h){var c=b[h],d=a.toArray(arguments).slice(1);return c?(a.loop(c,function(a){try{a&&a[0].apply(a[1]||null,d)}catch(b){}}),true):false};this.hasObserver=
function(a){return!(!a||!b[a[0]]||!b[a[0]][a[1]])};this.hasTopic=function(a){return!!b[a]};this.unwatchAll=function(a){b[a]?delete b[a]:b={};return true}}});
define("StateMachine",["Tools"],function(a){function b(){var b={};this.add=function(a,d,e,g){var f=[];if(b[a])return false;return typeof a=="string"&&typeof d=="function"?(f[0]=d,typeof e=="object"&&(f[1]=e),typeof e=="string"&&(f[2]=e),typeof g=="string"&&(f[2]=g),b[a]=f,true):false};this.has=function(a){return!!b[a]};this.get=function(a){return b[a]||false};this.event=function(c){var d=b[c];return d?(d[0].apply(d[1],a.toArray(arguments).slice(1)),d[2]):false}}return function(h,c){var d={},e="";
this.init=function(a){return d[a]?(e=a,true):false};this.add=function(a){return d[a]?d[a]:d[a]=new b};this.get=function(a){return d[a]};this.getCurrent=function(){return e};this.has=function(a){return d.hasOwnProperty(a)};this.advance=function(a){return this.has(a)?(e=a,true):false};this.event=function(b){var f;f=d[e].event.apply(d[e].event,a.toArray(arguments));return f===false?false:(f&&(d[e].event("exit"),e=f,d[e].event("entry")),true)};a.loop(c,function(a,b){var c=this.add(b);a.forEach(function(a){c.add.apply(null,
a)})},this);this.init(h)}});
define("Promise",["Observable","StateMachine"],function(a,b){return function c(){var d=null,e=null,g=new a,f={Pending:[["fulfill",function(a){d=a;g.notify("fulfill",a)},"Fulfilled"],["reject",function(a){e=a;g.notify("reject",a)},"Rejected"],["toFulfill",function(a){g.watch("fulfill",a)}],["toReject",function(a){g.watch("reject",a)}]],Fulfilled:[["toFulfill",function(a){setTimeout(function(){a(d)},0)}]],Rejected:[["toReject",function(a){setTimeout(function(){a(e)},0)}]]},i=new b("Pending",f);this.fulfill=
function(a){i.event("fulfill",a);return this};this.reject=function(a){i.event("reject",a);return this};this.then=function(a,b,f,g){var j=new c;a instanceof Function?b instanceof Function?i.event("toFulfill",this.makeResolver(j,a)):i.event("toFulfill",this.makeResolver(j,a,b)):i.event("toFulfill",this.makeResolver(j,function(){j.fulfill(d)}));b instanceof Function&&i.event("toReject",this.makeResolver(j,b,f));f instanceof Function&&i.event("toReject",this.makeResolver(j,f,g));!(b instanceof Function)&&
!(f instanceof Function)&&i.event("toReject",this.makeResolver(j,function(){j.reject(e)}));return j};this.sync=function(a){return a instanceof Object&&a.then?(a.then(function(a){this.fulfill(a)}.bind(this),function(a){this.reject(a)}.bind(this)),true):false};this.makeResolver=function(a,b,f){return function(c){var d;try{d=b.call(f,c),a.sync(d)||a.fulfill(d)}catch(e){a.reject(e)}}};this.getReason=function(){return e};this.getValue=function(){return d};this.getObservable=function(){return g};this.getStateMachine=
function(){return i};this.getStates=function(){return f}}});
define("Store",["Observable","Tools"],function(a,b){return function(h){var c=b.clone(h)||{},d=new a,e=new a,g=function(a){var i=b.objectsDiffs(a,c);["updated","deleted","added"].forEach(function(a){i[a].forEach(function(b){d.notify(a,b,c[b]);e.notify(b,c[b],a)})})};this.count=this.getNbItems=function(){return c instanceof Array?c.length:b.count(c)};this.get=function(a){return c[a]};this.has=function(a){return c.hasOwnProperty(a)};this.set=function(a,b){var h,g;return typeof a!="undefined"?(h=this.has(a),
g=this.get(a),c[a]=b,h=h?"updated":"added",d.notify(h,a,c[a],g),e.notify(a,c[a],h,g),true):false};this.update=function(a,c,h){var g;return this.has(a)?(g=this.get(a),b.setNestedProperty(g,c,h),d.notify("updated",c,h),e.notify(a,g,"updated"),true):false};this.del=function(a){return this.has(a)?(this.alter("splice",a,1)||(delete c[a],d.notify("deleted",a),e.notify(a,c[a],"deleted")),true):false};this.delAll=function(a){return a instanceof Array?(a.sort(b.compareNumbers).reverse().forEach(this.del,this),
true):false};this.alter=function(a){var d,e;return c[a]?(e=b.clone(c),d=this.proxy.apply(this,arguments),g(e),d):false};this.proxy=function(a){return c[a]?c[a].apply(c,Array.prototype.slice.call(arguments,1)):false};this.watch=function(a,b,c){return d.watch(a,b,c)};this.unwatch=function(a){return d.unwatch(a)};this.getStoreObservable=function(){return d};this.watchValue=function(a,b,c){return e.watch(a,b,c)};this.unwatchValue=function(a){return e.unwatch(a)};this.getValueObservable=function(){return e};
this.loop=function(a,d){b.loop(c,a,d)};this.reset=function(a){if(a instanceof Object){var d=b.clone(c);c=b.clone(a)||{};g(d);return true}else return false};this.toJSON=function(){return JSON.stringify(c)};this.dump=function(){return c}}});
define("Transport",[],function(){return function(a){var b=null;this.setReqHandlers=function(a){return a instanceof Object?(b=a,true):false};this.getReqHandlers=function(){return b};this.request=function(a,c,d,e){return b.has(a)&&typeof c!="undefined"?(b.get(a)(c,function(){d&&d.apply(e,arguments)}),true):false};this.listen=function(a,c,d,e){if(b.has(a)&&typeof c!="undefined"&&typeof d=="function"){var g=function(){d.apply(e,arguments)},f;f=b.get(a)(c,g,g);return function(){typeof f=="function"?f():
typeof f=="object"&&typeof f.func=="function"&&f.func.call(f.scope)}}else return false};this.setReqHandlers(a)}});