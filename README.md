TiddlyMath
==========

Provides support for typesetting LaTeX code via MathJax in essentially all components of a TiddlyWiki5 application.


Usage
=====

Currently you can use either `\(` and `\)` or dollar signs (`$`) to delimit inline math. Displayed equations may be delimited by either `\[` and `\]` or double dollar signs (`$$`). The plugin also renders other standard AMSMath environments (such as `align`) correctly.

To see these in action, after installing the plugin and reloading your TiddlyWiki, create a new tiddler and add the following code to the text for the tiddler:

    ; Theorem (Cauchy-Schwarz Inequality)
    : If $V$ is an inner product space under $\langle \cdot, \cdot \rangle: V \times V \to \mathbb{C}$, then for all $x,y \in V$
    \[
        \left|\langle x, y \rangle\right|^2 \leq \|x\|\cdot\|y\|,
    \]
    where $\|z\| := \langle z, z \rangle$ for all $z \in V$.

If the plugin has successfully been installed, the tiddler's preview pane will display this text typeset by MathJax, and if you edit the text of the tiddler the preview will be re-rendered on the fly.

MathJax may also be used in tiddler titles and tags, although unless you really like large tiddlers you should probably avoid using displayed math in either of those under normal circumstances.

Future versions of the plugin will also support custom delimiters and just generally have more support exposed to the user for configuring MathJax.


Future Goals
============
1. Support all essential configuration features possible in MathJax (e.g., setting inline and displayed math delimiters, configuring output type and appearance, fonts, etc.)
2. Support for entering \def and \newcommand statements in a configuration tiddler and have them be available to MathJax from the first time the page is rendered.
3. Doing things the "right way" under the hood by utilizing core TiddlyWiki functionality instead of traversing the DOM tree to typeset.
4. Bug fixes.
5. Requests I receive. (Don't hesitate to file an issue!)


Acknowledgments
===============

TiddlyMath is a fork of the kantorsite MathJax plugin available at the following URL:

http://mathjax-tw5.kantorsite.net/

The kantorsite MathJax plugin was based on a gist from github user kpe available here:

https://gist.github.com/kpe/cc0547b318e6f8d4ddaa