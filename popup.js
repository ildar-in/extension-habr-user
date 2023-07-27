window.addEventListener('load', e=>{
/** @type {HTMLInputElement} */
    const hideCheck = document.getElementById('ildarin_hauth_hide')
    hideCheck.addEventListener('change',e=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {hide: hideCheck.checked}, function(response) {}) 
        })
    })
})