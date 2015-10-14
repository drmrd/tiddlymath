/**
 * Changes in 0.1.0-alpha1
 *     * Significant readability improvements, thanks to reading through the original script by kpe
 * 	   * Changed a call to get elements with class named "story-river" to "tc-story-river", since I'm not sure how that was reverted to the older, out of date class name (unless I'm switching them around in my head).
 */

(function(){

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
	 * 	   <script src="e" onload=[n() or null] onreadystatechange=[n() or null] [Iterable Properties of t] />
	 *
	 * depending on whether or not the parameter e is of function or string type and whether or not n is a function.
	 *
	 *
	 * @param {text||function} scriptContents
	 * 	   The contents of the script, provided as either code wrapped in an anonymous function or as the URL to a remote script source.
	 * @param {object} attributes
	 *     A dictionary (JSON object) of attributes to be assigned to the script (can be null)
	 * @param {text||function} onLoadContents
	 *     Code (provided either as an anonymous function or a URL to a remote javascript source) to be executed after the script has loaded.
	 *
	 *
	 * @returns:
	 *     The generated <script> DOM object.
	 */
	"use strict";
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

		// Was o
		// Set a flag that scriptContents can access to indicate the behavior of the script after loading shouldn't be modified based on onLoadContents
		var alreadyLoaded = false; // Used for some (compatibility test?) reason in the next conditional

		// Let onLoadContents() determine the behavior of newScript after the latter has been loaded, unless said behavior was already configured (e.g., via the scriptContents or other scripts in the page)
		newScript.onload = newScript.onreadystatechange = function(){
			// Ah the joys of browser incompatibilities
			if(!alreadyLoaded && (!this.readyState || this.readyState=='loaded' || this.readyState=='complete')){
				alreadyLoaded = true;
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
	 */
	console.log("About to initialize MathJax configuration script element");
	prependScriptToHead(//
		// scriptContents
		function(){
			MathJax.Hub.Config({
				tex2jax:{inlineMath:[['$','$'],['\\(','\\)']]},
				TeX: {
					Macros: JSON.parse($tw.wiki.getTiddlerText("$:/plugins/tiddlymath/CustomTeXCommands.json")),
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
	 * We now prepend two scripts to the document head in order to load and configure MathJax. We note that (since we are prepending), the second script that follows will actually be loaded first, whence the first doesn't throw errors when making calls to MathJax objects.
	 */

	/**
	 * Load the latest version of MathJax from the CDN then create a MutationObserver that monitors the story river of the current TiddlyWiki for changes and instructs MathJax to reprocess any new math.
	 * @TODO: Fix the title duplication bug, in which the title of a draft of a tiddler that contains math will be duplicated every time a change is made in the draft.
	 * @TODO: Have MathJax not typeset strings beginning with "$:/" (i.e., the names of shadow/system tiddlers).
	 * @TODO: Get feedback on performance in large documents and consider ways to optimize how the mutation observer works (possibly using several independent ones for different types of content in the page)
	 */
	console.log("About to initialize MathJax.js script element");
	prependScriptToHead(//
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
							// Called with two arguments (mutations: a list of MutationRecords, thisObserver: a reference to riverObserver (I'm not 100% sure this is needed, but the MDN uses it...should see what happens if it's removed.)
							function(mutations){
								// @TODO: Take into account that the mutations might not be of the desired form (depending on their type property)
								mutations.forEach(function(mutation) {
										console.log("New Mutation");
										console.log("Mutation type: " + mutation.type);
										// Note that mutation.target is just the text inside the edited field, and so we immediately jump to looking at its parent node instead.
										var mutatedTiddler = getAncestorTiddler(mutation.target.parentNode);

										if (mutatedTiddler !== null) {
											if (tiddlerIsADraft(mutatedTiddler)) {
												console.log(mutatedTiddler.toString());
												// @TODO: Add support here for previewing newly-created tags
												MathJax.Hub.Queue(['Typeset',MathJax.Hub,mutatedTiddler.getElementsByClassName("tc-tiddler-preview-preview")[0]]);
											} else {
												console.log(mutatedTiddler.toString());
												MathJax.Hub.Queue(['Typeset',MathJax.Hub,mutatedTiddler]);
											}
										}
									}
								)
							}
						);
						// Set <code>n</code> equal to the story-river node in
						// the current document.
						var river = document.getElementsByClassName('tc-story-river')[0];
						console.log("MutationObserver created");

						// @CHANGES: Removed childList, since I think it's unnecessary if using subtree
						// @CHANGES: Removed attributes, since I don't think we care about attribute changes
						riverObserver.observe(river,{characterData:true,subtree:true});
					}
				}
			);
		}
	);


})();
