window.onload = async function() {
    let message = createMessage()
    message.isInit = true
    sendMessage(message, async response=>{
        message=response
        const test = document.createElement('div')
        test.innerHTML='<h1>Hello!</h1>'
        document.body.appendChild(test)
        /** @type {HTMLInputElement} */
        const hideCheck = document.getElementById('ildarin_hauth_hide')
        const showstat = document.getElementById('ildarin_hauth_showstat')
        if(message.saved.isHide){
            hideCheck.checked=true
        }
        if(message.saved.showStats){
            showstat.checked=true
        }
        hideCheck.addEventListener('change',e=>{
            message.saved.isHide=hideCheck.checked
            sendMessage(message)
        })
        showstat.addEventListener('change',e=>{
            message.saved.showStats=showstat.checked
            sendMessage(message)
        })
    })
}
function sendMessage(message, onResponse=(response)=>{}){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, message, onResponse) 
    })
}
//--- boilerplate
function createMessage(message={isInit:true, saved:createSaved()}){
    return message
}
function createSaved(savedData = {
    isHide:false,
    showStats:false,
}){
    const savedFromLocal = localStorage.getItem('saved')
    const savedObj = JSON.parse(savedFromLocal)
    if(savedFromLocal!==undefined){
        Object.assign(savedData, savedObj)
    }
    return savedData
}
async function getMessageAsync(){
    return new Promise(resolve=>{
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            resolve(message)
        })
    })
}
