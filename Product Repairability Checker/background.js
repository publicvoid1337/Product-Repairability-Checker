//Create Context Menu on Init
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'ifixitCheck',
        title: 'Check IFIXIT',
        contexts: ['selection']
    });
});


//Listens for extention-icon clicks
chrome.action.onClicked.addListener((tab) => {

    var resultTitle;    // placeholder for Frotend calls
    var resultLink;     // only using first search result
    var resultScore;    // should be changed once frontend is implimented

    chrome.scripting.executeScript({    //script injection
        target: {tabId: tab.id},    //targed active Tab
        files: ['./scripts/collectProductName.js']
    },
    (results) => {  //results are given as prototype array, index 0 is main frame of targeted page, result is return value of executed function(s)
        if(chrome.runtime.lastError) { console.log('Fail to inject script. Are you trying to inject into a native chrome page?'); return; }
        fetch(`https://www.ifixit.com/api/2.0/search/${results[0].result.replace('\n', ' ')}?filter=wiki`) //getrequest to IFIXIT api search function
        .then(response => response.json())
        .then((data) => {   //response is converted to json format of easy javascript object handling
            if(!data.results) { console.log('Invalid Response.'); return; }
            if(data.results.length == 0) { console.log(`No search results for '${results[0].result.replace('\n', ' ')}.'`); return; }
            resultTitle = data.results[0].title;
            resultLink = data.results[0].url;

            //PLACEHOLDER
            console.log(resultTitle);
            console.log(resultLink);
            //PLACEHOLDER

            fetch(`https://www.ifixit.com/api/2.0/categories/${resultTitle}`)   //list hierarchy structure to specific product
            .then(response => response.json())
            .then((data) => {
                var breakCondition = false; //condition to break out of teardown loop
                data.guides.forEach(guide => {      //search for teardowns
                    if(guide.type == 'teardown'){   //in hierarchy
                        fetch(`https://www.ifixit.com/api/2.0/guides/${guide.guideid}`) //get exact information about teardown
                        .then(response => response.json())
                        .then((data) => {
                            if(data.steps.length == 0) { console.log('Teardown invalid.'); return; }
                            data.steps[data.steps.length - 1].lines.forEach(line => {       //if repairability score exists, it will be in the last line
                                if(line.text_raw.match(/'''\b([1-9]|1[0-2])\b out of 10'''/g) || line.text_raw.match(/\b([1-9]|1[0-2])\b out of 10/g)){ //UID?
                                    var textMatch = line.text_raw.match(/\b([1-9]|1[0-2])\b out of 10/g).toString();    //filter
                                    resultScore = textMatch.substring(0, 2).substring(0, 2).replace(' ', '');;          //score

                                    //PLACEHOLDER
                                    console.log(resultScore);
                                    //PLACEHOLDER

                                    breakCondition = true;
                                    return;
                                }
                            });
                        });
                    }
                    if(breakCondition) { return; }
                });
            });
        });
    });
});


//---COPY---//
chrome.contextMenus.onClicked.addListener((_, tab) => {
    
    var resultTitle;    // placeholder for Frotend calls
    var resultLink;     // only using first search result
    var resultScore;    // should be changed once frontend is implimented

    chrome.scripting.executeScript({    //script injection
        target: {tabId: tab.id},    //targed active Tab
        files: ['./scripts/collectProductName.js']
    },
    (results) => {  //results are given as prototype array, index 0 is main frame of targeted page, result is return value of executed function(s)
        if(chrome.runtime.lastError) { console.log('Fail to inject script. Are you trying to inject into a native chrome page?'); return; }
        fetch(`https://www.ifixit.com/api/2.0/search/${results[0].result.replace('\n', ' ')}?filter=wiki`) //getrequest to IFIXIT api search function
        .then(response => response.json())
        .then((data) => {   //response is converted to json format of easy javascript object handling
            if(!data.results) { console.log('Invalid Response.'); return; }
            if(data.results.length == 0) { console.log(`No search results for '${results[0].result.replace('\n', ' ')}.'`); return; }
            resultTitle = data.results[0].title;
            resultLink = data.results[0].url;

            //PLACEHOLDER
            console.log(resultTitle);
            console.log(resultLink);
            //PLACEHOLDER

            fetch(`https://www.ifixit.com/api/2.0/categories/${resultTitle}`)   //list hierarchy structure to specific product
            .then(response => response.json())
            .then((data) => {
                var breakCondition = false; //condition to break out of teardown loop
                data.guides.forEach(guide => {      //search for teardowns
                    if(guide.type == 'teardown'){   //in hierarchy
                        fetch(`https://www.ifixit.com/api/2.0/guides/${guide.guideid}`) //get exact information about teardown
                        .then(response => response.json())
                        .then((data) => {
                            if(data.steps.length == 0) { console.log('Teardown invalid.'); return; }
                            data.steps[data.steps.length - 1].lines.forEach(line => {       //if repairability score exists, it will be in the last line
                                if(line.text_raw.match(/'''\b([1-9]|1[0-2])\b out of 10'''/g) || line.text_raw.match(/\b([1-9]|1[0-2])\b out of 10/g)){ //UID?
                                    var textMatch = line.text_raw.match(/\b([1-9]|1[0-2])\b out of 10/g).toString();    //filter
                                    resultScore = textMatch.substring(0, 2).substring(0, 2).replace(' ', '');;          //score

                                    //PLACEHOLDER
                                    console.log(resultScore);
                                    //PLACEHOLDER

                                    breakCondition = true;
                                    return;
                                }
                            });
                        });
                    }
                    if(breakCondition) { return; }
                });
            });
        });
    });
});


//---TODO---//
//better implimentation with frontend
//modularization
//not all possible errors catched, but no errors in testing | maybe migrate if error catches to try catch statements