function sendMessage(message){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {}) 
    })
}
async function getMessageAsync(){
    return new Promise(resolve=>{
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            resolve(message)
        })
    })
}
