
var FB = function (panel, module, context) {
    
    this.panel = panel;
    this.document = panel.document;
    this.suiteDivs = {};
    this.logRunningSpecs = false;
    this.module = module;
    this.context = context;
    
    //TODO: make not global
    jasmine_reporter_div = panel.panelNode;
};

FB.prototype = {

    /**
     * 
     */
    reset: function () {
        this.suiteDivs = {};
        this.logRunningSpecs = false;
        jasmine_reporter_div.innerHTML = '';
    },

    /**
     * 
     * @param {Object} runner
     */
    reportRunnerStarting: function (runner) {
    
        if (!jasmine_reporter_div) {
            this.module.showPanel(this.context.browser, this.panel);
        }
        
        this.outerDiv           = this.document.createElement('div');
        this.outerDiv.className = 'jasmine_reporter';
        
        this.runnerDiv          = this.document.createElement('div');
        this.runnerMessageSpan  = this.document.createElement('span');
        this.finishedAtSpan     = this.document.createElement('span');
        
        this.outerDiv.appendChild (this.runnerDiv);
        this.runnerDiv.appendChild(this.runnerMessageSpan);
        this.runnerDiv.appendChild(this.finishedAtSpan);
        
        jasmine_reporter_div.appendChild(this.outerDiv);
        
        var suites = runner.suites(),
            i = 0;
        
        for (; i < suites.length; i++) {
            
            var suite = suites[i],
                suiteDiv  = this.document.createElement('div'),
                runSpec   = this.document.createElement('a'),
                desc      = this.document.createElement('a'),
                parentDiv = this.outerDiv;
            
            suiteDiv.className = suite;
            runSpec.className  = 'run_spec';
            desc.className     = 'description';
            
            runSpec.innerHTML = 'run';
            desc.innerHTML    = suite.description;
            
            runSpec.href = '?spec=' + encodeURIComponent(suite.getFullName());
            desc.href    = '?spec=' + encodeURIComponent(suite.getFullName());
            
            suiteDiv.appendChild(runSpec);
            suiteDiv.appendChild(desc);
            
            this.suiteDivs[suite.id] = suiteDiv;
            
            if (suite.parentSuite) {
                parentDiv = this.suiteDivs[suite.parentSuite.id];
            }
            
            parentDiv.appendChild(suiteDiv);
        }
        
        this.startedAt = new Date();
    },
    
    /**
     * 
     * @param {Object} runner
     */
    reportRunnerResults: function (runner) {

        var results = runner.results(),
            cname = (results.failedCount > 0) ? "runner failed" : "runner passed";
        
        this.runnerDiv.className = cname;
        
        var specs = runner.specs(),
            specCount = 0,
            i = 0;
        
        for (; i < specs.length; i++) {
            if (this.specFilter(specs[i])) {
                specCount++;
            }
        }
        
        var message = "" + specCount + " spec" + (specCount == 1 ? "" : "s") + ", " + 
            results.failedCount + " failure" + ((results.failedCount == 1) ? "" : "s");
        
        message += " in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + "s";
        
        var desc = this.document.createElement('a');
        desc.className = 'description';
        desc.href = '?';
        desc.innerHTML = message;
        
        if (this.runnerMessageSpan.firstChild) {
            this.runnerMessageSpan.replaceChild(desc, this.runnerMessageSpan.firstChild);
        } else {
            this.runnerMessageSpan.appendChild(desc);
        }
        
        var finishedNode = this.document.createTextNode("Finished at " + new Date().toString());
        this.finishedAtSpan.appendChild(finishedNode);
        this.finishedAtSpan.className = "finished-at";
    },
    
    /**
     * 
     * @param {Object} suite
     */
    reportSuiteResults: function (suite) {

        var results = suite.results(),
            status  = results.passed() ? 'passed' : 'failed';
        
        // todo: change this to check results.skipped
        if (results.totalCount == 0) { 
            status = 'skipped';
        }
        
        this.suiteDivs[suite.id].className += " " + status;
    },
    
    /**
     * 
     * @param {Object} spec
     */
    reportSpecStarting: function (spec) {
        
    },
    
    /**
     * 
     * @param {Object} spec
     */
    reportSpecResults: function (spec) {
    
        var results = spec.results(), 
            status  = results.passed() ? 'passed' : 'failed';
        
        if (results.skipped) {
            status = 'skipped';
        }
        
        var specDiv     = this.document.createElement('div'),
            runSpec     = this.document.createElement('a'),
            description = this.document.createElement('a'),
            messagesDiv = this.document.createElement('a'),
            resultItems = results.getItems(),
            i = 0,
            result;
            
        specDiv.className = 'spec ' + status;
        runSpec.className = 'run_spec ';
        description.className = 'description ';
        
        runSpec.href = '?spec=' + encodeURIComponent(spec.getFullName());
        runSpec.innerHTML = 'run';
        
        description.href = '?spec=' + encodeURIComponent(spec.getFullName());
        description.title = spec.getFullName();
        description.innerHTML = spec.description;
        
        specDiv.appendChild(runSpec);
        specDiv.appendChild(description);
        
        messagesDiv.className = 'messages';
        
        for (; i < resultItems.length; i++) {
        
            result = resultItems[i];
            
            if (result.type == 'log') {
                var logDiv = this.document.createElement('div');
                logDiv.className = 'resultMessage log';
                logDiv.innerHTML = result.toString();
                messagesDiv.appendChild(logDiv);
            }
            else if (result.type == 'expect' && result.passed && !result.passed()) {
                
                var failDiv = this.document.createElement('div');
                failDiv.className = 'resultMessage fail';
                failDiv.innerHTML = result.message;
                messagesDiv.appendChild(failDiv);
                
                if (result.trace.stack) {
                    var stackTrace = this.document.createElement('div');
                    stackTrace.className = 'stackTrace';
                    stackTrace.innerHTML = result.trace.stack;
                    messagesDiv.appendChild(stackTrace);
                }
            }
        }
        
        if (messagesDiv.childNodes.length > 0) {
            specDiv.appendChild(messagesDiv);
        }
        
        this.suiteDivs[spec.suite.id].appendChild(specDiv);
    },
    
    /**
     * 
     */
    log: function () {},
    
    /**
     * 
     * @param {Object} spec
     */
    specFilter: function (spec) {
        
        var paramMap = {},
            params = this.document.location.search.substring(1).split('&'),
            i = 0,
            p;
        
        for (; i < params.length; i++) {
            p = params[i].split('=');
            paramMap[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
        }
        
        if (!paramMap["spec"]) {
            return true;
        }
        
        return spec.getFullName().indexOf(paramMap["spec"]) == 0;
    }
};