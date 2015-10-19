/*\
title: $:/plugins/drmrd/tiddlymath/tiddlymath.js
type:  application/javascript
module-type: startup

Initializes and configures MathJax and then has it render tiddlers whenever they are displayed/changed.
\*/

/**
 * TiddlyMath - tiddlymath.js
 * Support Website: https://github.com/drmrd/tiddlymath
 * 
 * Changes in 0.2.1
 *     - Fixed newly-created tags not being typeset in drafts
 *     - Removed unnecessary console.log calls
 *     - Removed an unused alreadyLoaded flag in the prependScriptToHead helper function
 */

(function(){
    /*jslint node: true, browser: true */
    /*global $tw: false */

    "use strict";

    /**
     * @function prependScriptToHead
     *
     * Flexibly prepends a <script> element at the beginning of the head of the current document. The output script
     * element is either of the form
     *
     *     <script onload=[n() or null] onreadystatechange=[n() or null] [Iterable Properties of t]>
     *         e.toString()
     *     </script>
     *
     * or
     *
     *     <script src="e" onload=[n() or null] onreadystatechange=[n() or null] [Iterable Properties of t] />
     *
     * depending on whether or not the parameter e is of function or string type and whether or not n is a function.
     *
     *
     * @param {text||function} scriptContents
     *     The contents of the script, provided as either code wrapped in an anonymous function or as the URL to a remote script source.
     * @param {object} attributes
     *     A dictionary (JSON object) of attributes to be assigned to the script (can be null)
     * @param {text||function} onLoadContents
     *     Code (provided either as an anonymous function or a URL to a remote javascript source) to be executed after the script has loaded.
     *
     *
     * @returns:
     *     The generated <script> DOM object.
     */
    function prependScriptToHead(scriptContents, attributes, onLoadContents){
        // Was r
        var head = document.getElementsByTagName('head')[0] || document.documentElement;
        // Was i
        var newScript = document.createElement('script');

        // Fill in the content of newScript with the code described by scriptContents
        if(typeof scriptContents == 'function'){
            newScript[window.opera?'innerHTML':'text'] = '(' + scriptContents.toString() + ')()';
        } else if(typeof scriptContents == 'string'){
            newScript.src = scriptContents;
        }

        // If the attributes object is defined, add each of its properties to newScript
        if(attributes){
            for(var a in attributes){
                if(attributes.hasOwnProperty(a)){
                    newScript[a] = attributes[a];
                }
            }
        }

        /*
         * Let onLoadContents() determine the behavior of newScript after the
         * latter has been loaded, unless said behavior was already configured
         * (e.g., via the scriptContents or other scripts in the page).
         *
         * Notes: The onreadystatechange property is used by IE while onload is
         *     used by civilized browsers. The logic wrapping onLoadContents()
         *     in this script is also for compatibility purposes (and to ensure
         *     the script is being called and appended to head for the first
         *     time).
         */
        newScript.onload = newScript.onreadystatechange = function(){
            if(!this.readyState || this.readyState=='loaded' || this.readyState=='complete'){
                newScript.onload = newScript.onreadystatechange = null;
                // If head is defined and newScript has already been assigned a parent node (how?), remove newScript from head.
                if(head && newScript.parentNode){
                    head.removeChild(newScript);
                }
                if(typeof onLoadContents == 'function'){
                    onLoadContents();
                }
            }
        };

        // Insert the new script as the first element of the document header.
        head.insertBefore(newScript,head.firstChild);

        // Return the newly-generated, newly-inserted script
        return newScript;
    }

    /**
     * getAncestorTiddler(DOMNode node)
     *
     *     Returns the tiddler containing a given node from the story river, if such a tiddler exists, and returns null otherwise
     */
    function getAncestorTiddler(node){
        var parent = node.parentNode;
        while(!parent.isSameNode(document) && parent.className.indexOf("tc-tiddler-frame") < 0) {
            parent = parent.parentNode;
        }
        return (!parent.isSameNode(document)) ? parent : null;
    }

    /**
     * tiddlerIsADraft
     *
     *     A simple check (based on the class names of the given tiddler) for whether or not it is a draft.
     */
    function tiddlerIsADraft(tiddlerNode) {
        return tiddlerNode.className.indexOf("tc-tiddler-edit-frame") >= 0;
    }

    /**
     * Create a MathJax configuration script and insert it into the document header.
     *
     * At present custom macros can be provided to MathJax by editing the shadow tiddler
     *     $:/plugins/tiddlymath/CustomTeXCommands.json
     * providing a JSON key:value pair entry for each macro as described in MathJax's documentation.
     *
     * @TODO: Add the above shadow tiddler to the plugin as an empty JSON list with a comment containing an example.
     * @TODO: Provide an easier way for specifying macros than this, possibly by programatically taking a separate configuration file and converting it to JSON.
     * @TODO: Allow more flexible customization of the MathJax configuration natively in TW5 through the plugin (e.g., the ability to specify different types of inline/displayed math delimiters), and have those configuration options be reflected here.
     * @TODO: Provide a $:/plugins/tiddlymath/macros.json tiddler for custom macro definitions
     */
    prependScriptToHead(//
        // scriptContents
        function(){
            MathJax.Hub.Config({
                /**
                 * Core Extensions:
                 *     Far too many to list here. Refer to the following
                 *     official repository directory (and its subdirectories)
                 *     for unpacked extensions:
                 *
                 *         https://github.com/mathjax/MathJax/tree/master/unpacked/extensions
                 *
                 * Preprocessors:
                 *     foo2jax.js:
                 *         A preprocessor that takes foo-style page elements
                 *         intended to display math and converts them to SCRIPT
                 *         tags for processing by MathJax.
                 *
                 *     asciimath2jax.js
                 *     jsMath2jax.js
                 *     mml2jax.js
                 *     tex2jax.js
                 * 
                 * Third-Party Extensions:
                 *     [Contrib]/counters.js:
                 *         Enable support for LaTeX counters in MathJax
                 *     [Contrib]/everymath.js:
                 *         Writing \everymath{<tokens>} will insert <tokens> at
                 *         the beginning of every math environment.
                 *     [Contrib]/forloop.js:
                 *         Implements for loops (including iteration on arrays)
                 *         in MathJax
                 *     [Contrib]/forminput.js:
                 *         Provides a \FormInput macro for creating HTML
                 *         <input> tags inside MathJax math expressions
                 *     [Contrib]/img.js:
                 *         Support for imbedding images in math.
                 *     [Contrib]/knowl.js:
                 *         Support for knowls (transclusions) through a
                 *         \knowl{url}{math} macro and two independent
                 *         libraries (see documentation)
                 *     [Contrib]/longdiv.js:
                 *         Support for long division notation via the macro
                 *         \longdiv{dividend}{divisor}
                 *     [Contrib]/modifymenu.js:
                 *         Support for manipulating the MathJax context menu
                 *         through a number of functions of the form
                 *         MathJax.Menu.function()
                 *     [Contrib]/preamble.js:
                 *         Support for a preamble key in the MathJax
                 *         configuration object. (This is awesome, see the
                 *         documentation if it looks remotely relevant to you)
                 *     [Contrib]/sqrtspacing.js:
                 *         Improves the appearance of square roots rendered in
                 *         MathJax by modifying the padding between the radical
                 *         and any pre- and succeeding non-whitespace tokens
                 *     [Contrib]/toggles.js:
                 *         Implements LaTeX toggles (like in the etoolbox
                 *         package) for MathJax.
                 *     [Contrib]/xyjax.js:
                 *         A nearly Xy-pic compatible MathJax graph and diagram
                 *         generator for MathJax. Refer to the documentation
                 *         for how to set this one up.
                 */
                extensions: ["AMScd.js", "AMSmath.js", "AMSsymbols.js",
                             "action.js", "bbox.js", "begingroup.js",
                             "boldsymbol.js", "cancel.js", "extpfeil.js",
                             "verb.js", "tex2jax.js", "[Contrib]/counters.js",
                             "[Contrib]/preamble.js"],
                tex2jax:{inlineMath:[['$','$'],['\\(','\\)']]},
                TeX: {
                    Macros: JSON.parse($tw.wiki.getTiddlerText("$:/plugins/tiddlymath/macros.json")),
                    equationNumbers: { autoNumber: "AMS" }
                },
                "HTML-CSS": { linebreaks: { automatic: true } },
                SVG: { linebreaks: { automatic: true } }
            });
        },
        // attributes list for the script
        {type:'text/x-mathjax-config'}
        // No onload behavior specified
    );

    /**
     * Create and prepend another script for that loads the latest version of MathJax from the CDN and creates a MutationObserver to monitor the story river and instruct MathJax when tiddlers need to be re-rendered.
     * @TODO: Fix the title duplication bug, in which the title of a draft of a tiddler that contains math will be duplicated every time a change is made in the draft.
     * @TODO: Have MathJax not typeset strings beginning with "$:/" (i.e., the names of shadow/system tiddlers).
     * @TODO: Get feedback on performance in large documents and consider ways to optimize how the mutation observer works (possibly using several independent ones for different types of content in the page and/or switch to using event listeners)
     * @TODO: Completely rewrite to utilize the TiddlyWiki API (convert to a widget and reimplement the refresh and render methods in set.js?)
     */
    prependScriptToHead(
        // scriptContents (from the MathJax CDN)
        'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
        // No additional attributes needed
        null,
        // Add a mutation observer to the story-river after loading the script
        // @TODO: Since we will likely be switching to using multiple mutation observers, it would be better to have this function call helper functions based on the current configuration.
        function(){
            prependScriptToHead(
                function(){
                    // Find the right MutationObserver constructor (depends
                    // on browser)
                    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                    if(!MutationObserver){
                        // If MutationObservers aren't supported by the browser, alert
                        // user and fail to load MathJax.
                        alert('MathJax plugin for TW5: Sorry, but current version of your browser is not supported!');
                        console.log("TiddlyMath Warning: Unable to load MathJax! Mutation observers are not supported in this browser!");
                    } else {
                        // Otherwise create a new MutationObserver instance, riverObserver, to monitor the story river in the TiddlyWiki
                        var riverObserver = new MutationObserver(
                            // The callback function for the MutationObserver
                            function(mutations){
                                mutations.forEach(function(mutation) {
                                    var classes = mutation.target.classList;
                                    if(typeof classes !== "undefined"){
                                        // TODO: Merge these into a more optimized set of if else if (or switch) statements once the logic as been fine-tuned.

                                        // IF: Mutation is a tiddler being displayed/edited that wasn't previously...
                                        if (classes.contains("tc-story-river") && mutation.addedNodes.length > 0){
                                            for(var newTiddler in mutation.addedNodes){
                                                MathJax.Hub.Queue(['Typeset',MathJax.Hub,newTiddler]);
                                            }; // This could/should probably be optimized a bit
                                        }
                                        if (classes.contains("tc-edit-tags") && mutation.addedNodes.length > 0) {
                                            for(var i = 0; i < mutation.addedNodes.length; i++) {
                                                var newNode = mutation.addedNodes[i];
                                                if(typeof newNode.classList !== "undefined" && newNode.classList.contains("tc-tag-label")) {
                                                    MathJax.Hub.Queue(['Typeset',MathJax.Hub,newNode]);
                                                }
                                            };
                                        } // This should probably be optimized a bit, too

                                        // IF: Something in the preview window is updated...
                                        if(typeof classes !== "undefined" && classes.contains('tc-tiddler-preview-preview')){
                                            MathJax.Hub.Queue(['Typeset',MathJax.Hub,mutation.target]);
                                        }

                                    }
                                });
                            }
                        );
                        
                        // Set <code>river</code> equal to the story-river node in
                        // the current document.
                        var river = document.getElementsByClassName('tc-story-river')[0];

                        riverObserver.observe(river,{childList:true,subtree:true});
                    }
                }
            );
        }
    );


})();
