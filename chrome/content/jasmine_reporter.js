/*global FBL */

FBL.ns(function(){ with (FBL) {
    
    var jasmine_reporterPanel = function () {
        // do nothing
    };
    
    /**
     * 
     */
    jasmine_reporterPanel.prototype = extend(Firebug.Panel, {
    
        name : "jasmine_reporter",
        title: "Jasmine Reporter",
        initialize: function () {
            Firebug.Panel.initialize.apply(this, arguments);
            
            var doc = this.document,
                styleSheet = createStyleSheet(doc, 'chrome://jasmine_reporter/skin/jasmine_reporter.css');
            
            styleSheet.setAttribute("id", 'jasmine_reporter');
            addStyleSheet(doc, styleSheet);
        }
    });
    
    /**
     * 
     */
    Firebug.jasmine_reporterModule = extend(Firebug.Module, {
    
        /**
         * Show Jasmine panel
         * @param {Object} browser
         * @param {Object} panel
         */
        showPanel: function (browser, panel) {
            var isJasmine_reporterPanel = panel && panel.name == "jasmine_reporter", 
                jasmine_reporterButtons = browser.chrome.$("fbjasmine_reporterButtons");
            
            collapse(jasmine_reporterButtons, !isJasmine_reporterPanel);
        },
        
        /**
         * Watches the window for important events. If the window
         * hasn't been initialized, then the Firebug Jasmine object is injected
         * into the window object.
         */
        watchWindow: function (context, win) {
        
            if (win && win.wrappedJSObject && win.wrappedJSObject.jasmine) {
                return;
            }
            
            this.panel = context.getPanel("jasmine_reporter");
            
            // add all the jasminey stuff to the wrappedJS object
            win.wrappedJSObject.jasmine = jasmine; 
            win.wrappedJSObject.spyOn = spyOn;
            win.wrappedJSObject.it  = it;
            win.wrappedJSObject.xit = xit;
            win.wrappedJSObject.expect = expect;
            win.wrappedJSObject.runs  = runs;
            win.wrappedJSObject.waits = waits;
            win.wrappedJSObject.waitsFor = waitsFor;
            win.wrappedJSObject.beforeEach = beforeEach;
            win.wrappedJSObject.afterEach  = afterEach;
            win.wrappedJSObject.describe   = describe;
            win.wrappedJSObject.xdescribe  = xdescribe;
            
            // reset the enviroment on each load
            jasmine.currentEnv_ = new jasmine.Env();
            
            // load the reporter
            this.reporter = new FB(this.panel, this, context);
            jasmine.getEnv().addReporter(this.reporter);
        },
        
        /**
         * About button actions
         * @param {Object} context
         */
        onShowPassedButton: function (context) {
            if (this.reporter.outerDiv.className.indexOf('show-passed') === -1) {
                this.reporter.outerDiv.className += ' show-passed';
            } else {
                this.reporter.outerDiv.className = j.outerDiv.className.replace(/ show-passed/, '');
            }
        },
        
        /**
         * About button actions
         * @param {Object} context
         */
        onShowSkippedButton: function (context) {
            if (this.reporter.outerDiv.className.indexOf('show-skipped') === -1) {
                this.reporter.outerDiv.className += ' show-skipped';
            } else {
                this.reporter.outerDiv.className = j.outerDiv.className.replace(/ show-skipped/, '');
            }
        },
        
        /**
         * About button actions
         * @param {Object} context
         */
        onRunallButton: function (context) {
            this.showPanel(context.browser, context.getPanel("jasmine_reporter"));
        }
        
    });
    
    Firebug.registerPanel(jasmine_reporterPanel);
    Firebug.registerModule(Firebug.jasmine_reporterModule);
    
}});
