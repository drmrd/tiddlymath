//
// create a new application/javascript tiddler with name
//   $:/plugins/kpe/mathjax/init.js
// and a field:
//    module-type  startup
// with the following content
//

/*\
title: $:/plugins/kpe/mathjax/init.js
type: application/javascript
module-type: startup

Adds LaTeX support through MathJax

\*/
(function(){

    /*jslint node: true, browser: true */
    /*global $tw: false, Element: false */
    "use strict";

    function appendScriptElement(fn, attr, done) {
        var head = document.getElementsByTagName('head')[0] ||
            document.documentElement;
        var res = document.createElement('script');
        if(typeof fn == 'function') {
            res[window.opera?'innerHTML':'text'] = '('+fn.toString()+')()';
        } else if(typeof fn == 'string'){
            res.src = fn;
        }
        if(attr) {
            for(var aname in attr) {
                if(attr.hasOwnProperty(aname)) {
                    res[aname] = attr[aname];
                }
            }
        }
        var loaded = false;
        res.onload = res.onreadystatechange = function(){
            if(!loaded &&
               (!this.readyState
                    || this.readyState == 'loaded'
                    || this.readyState == 'complete')) {
                loaded = true;
                res.onload = res.onreadystatechange = null;
                if(head && res.parentNode){
                    head.removeChild(res);
                }
                if(typeof done == 'function') {
                    done();
                }
            }
        };
        head.insertBefore(res, head.firstChild);
        return res;
    }


    // Export name and synchronous status
    exports.name = "mathjax";
    exports.platforms = ["browser"];
    exports.after = ["startup"];
    exports.synchronous = false;

    exports.startup = function() {
        appendScriptElement(function(){
            MathJax.Hub.Config({
                tex2jax: {
                    inlineMath: [
                        ['$','$'],
                        ['\\\\(','\\\\)']
                    ]
                }
            });
        }, {type: 'text/x-mathjax-config'});

        appendScriptElement('http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML', null, function(){
            appendScriptElement(function(){
                var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
                if(!MutationObserver) {
                    alert("MathJax plugin for TW5: Sorry, but current version of your browser is not supported!");
                } else {
                    var doMathJaxMagic = function(el,observe){
                        console.log('doing mathjax');
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub].concat(el || []));
                    };
                    var editObserver = new MutationObserver(function(mrecs,obs){
                        mrecs.forEach(function(mrec){
                            [].forEach.call(mrec.addedNodes,function(node){
                                var className = node.className || '';
                                if(/tw-reveal/.test(className) && !node.hidden || node.nodeType == Node.TEXT_NODE) {
                                    var preview = node.parentNode.querySelector('.tw-tiddler-preview-preview');
                                    if(preview) {
                                        doMathJaxMagic(preview);
                                    }
                                }
                            });
                        });
                    });
                    var d = document.getElementsByClassName("story-river")[0];
                    var viewObserver = new MutationObserver(function(mrecs,obs){
                        mrecs.forEach(function(mrec){
                            [].forEach.call(mrec.addedNodes, function(node){
                                var className = node.className || '';
                                if(/tw-tiddler-view-frame/.test(className)) {
                                    console.log('new view frame');
                                    doMathJaxMagic(node);
                                } else if(/tw-tiddler-edit-frame/.test(className)) {
                                    console.log('new edit frame - start observing');
                                    var el = node.querySelector('.tw-keyboard');
                                    editObserver.observe(el,{subtree:false,childList:true});
                                }
                            });
                        });
                    });
                    viewObserver.observe(d,{subtree:false,childList:true});
                }
            });
        });
    };

})();
