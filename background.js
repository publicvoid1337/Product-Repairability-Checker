//Create Context Menu on Init
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'ifixitCheck',
        title: 'Check IFIXIT',
        contexts: ['selection']
    });
});

function getResults(tab, callback) {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},                                    //targed active Tab
        func: () => { return window.getSelection().toString(); }    //get selected Text
    },
    (results) => {  //results are given as prototype array, index 0 is main frame of targeted page
        if(chrome.runtime.lastError) { console.error('Fail to inject script. Are you trying to inject into a native chrome page?'); return; }
        fetch(`https://www.ifixit.com/api/2.0/search/${results[0].result.replace('\n', ' ')}?filter=wiki`) //getrequest to IFIXIT api search function
        .then(response => response.json())
        .then((data) => {   //response is converted to json format of easy javascript object handling
            if(!data.results) { console.error('Invalid Response.'); return; }
            if(data.results.length == 0) { console.error(`No search results for '${results[0].result.replace('\n', ' ')}.'`); return; }

            const results = {   //to-be-return value of function, including title, link and score of first 5 listed items
                "first": {
                    "title": data.results[0].title,
                    "link": data.results[0].url,
                    "score": null
                },
                "second": {
                    "title": data.results[1].title,
                    "link": data.results[1].url,
                    "score": null
                },
                "third": {
                    "title": data.results[2].title,
                    "link": data.results[2].url,
                    "score": null
                },
                "fourth": {
                    "title": data.results[3].title,
                    "link": data.results[3].url,
                    "score": null
                },
                "fifth": {
                    "title": data.results[4].title,
                    "link": data.results[4].url,
                    "score": null
                },
            }

            Object.keys(results).forEach(result => {                                            //loop for all 5 items
                fetch(`https://www.ifixit.com/api/2.0/categories/${results[result].title}`)     //list hierarchy structure of specific product
                .then(response => response.json())
                .then((data) => {
                    var breakCondition = false;         //condition to break out of teardown loop
                    data.guides.forEach(guide => {
                        if(guide.type == 'teardown' || guide.type == 'technique'){   //search for teardowns/techniques
                            fetch(`https://www.ifixit.com/api/2.0/guides/${guide.guideid}`) //get exact information about teardown/technique
                            .then(response => response.json())
                            .then((data) => {
                                if(data.steps.length == 0) { console.error('Teardown invalid.'); return; }
                                data.steps[data.steps.length - 1].lines.forEach(line => {       //if repairability score exists, it will be in the last line
                                    if(line.text_raw.match(/'''\b([1-9]|1[0-2])\b out of 10'''/g) || line.text_raw.match(/\b([1-9]|1[0-2])\b out of 10/g)){
                                        var textMatch = line.text_raw.match(/\b([1-9]|1[0-2])\b out of 10/g).toString();    //filter
                                        results[result].score = textMatch.substring(0, 2).substring(0, 2).replace(' ', ''); //get score
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
            callback(results); 
        });
    });
}

//Listens for extention-icon clicks
chrome.action.onClicked.addListener((tab) => {
    getResults(tab, (results) => {
        console.log(results);
    });
});

//Listens for contextMenu clicks
chrome.contextMenus.onClicked.addListener((_, tab) => { 
    getResults(tab, (results) => {
        console.log(results);
    });
})



//---TODO---//
//better implimentation with frontend
//not all possible errors catched, but no errors in testing | maybe migrate if error catches to try catch statements
//some teardowns use number words eg. 'seven out of ten' (2 cases in testing)