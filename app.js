function hideVotes(){
    //tm-votes-meter__value tm-votes-meter__value tm-votes-meter__value_positive tm-votes-meter__value_appearance-article tm-votes-meter__value_rating
    const rate = '.tm-votes-lever__score-counter.tm-votes-lever__score-counter,.tm-votes-meter__value.tm-votes-meter__value_appearance-comment'
    document.body.querySelectorAll(rate).forEach(/** @param {HTMLElement} s */ s=>{
        s.hidden=true
    })
    const muted = '.tm-comment__body-content_muted'
    document.body.querySelectorAll(muted).forEach(/** @param {HTMLElement} s*/ s=>{
        s.style.opacity = 1
    })
}
function showVotes(){
    const rate = '.tm-votes-lever__score-counter.tm-votes-lever__score-counter,.tm-votes-meter__value.tm-votes-meter__value_appearance-comment'
    document.body.querySelectorAll(rate).forEach(/** @param {HTMLElement} s */s=>{
        s.hidden=false
    })
    const muted = '.tm-comment__body-content_muted'
    document.body.querySelectorAll(muted).forEach(/** @param {HTMLElement} s*/ s=>{
        s.style.opacity = 0.4
    })
}
function hideStats(){
    state.profileElems.forEach(p=>{
        p.profileElemContainer.style.display= 'none';
    })
}
function showStats(){
    state.profileElems.forEach(p=>{
        p.profileElemContainer.style.display= '';
    })
    const userBlocks = new Map()
    document.body.querySelectorAll('.tm-user-info__username').forEach(/** @param {HTMLAnchorElement} s*/ s=>{
        const processed = state.profileElemsProcessed.get(s)
        if(state.profileElemsProcessed.get(s)!==undefined){return}
        state.profileElemsProcessed.set(s, true)
        const urlStart = '/ru/users/'
        const path = s.getAttribute('href')
        const username = path.substring(urlStart.length, path.length-1)
        let usernameBlocks = []
        if(!userBlocks.has(username)){
            userBlocks.set(username, usernameBlocks)
        } else {
            usernameBlocks = userBlocks.get(username, usernameBlocks)
        }
        usernameBlocks.push(s)
    })
    for (const username of userBlocks.keys()) {
        let profileLoad = {
            data:null,
            /** @type {[(data)=>{}]} */
            callbacks:[]
        }
        const profileExisting = state.profiles.get(username)
        if(profileExisting===undefined){
            state.profiles.set(username, profileLoad)
            fetch('https://habr.com/kek/v2/users/'+username+'/card?fl=ru&hl=ru').then(e=>{
               e.json().then(j=>{
                    profileLoad.data = j
                    profileLoad.callbacks.forEach(c=>c(j))
               })
            })
        }else{
            profileLoad=profileExisting
        }
        /** @type {Array<HTMLSpanElement>} */
        const blocks = userBlocks.get(username)
        blocks.forEach(/** @param {HTMLAnchorElement} s */ s=>{
            const profileStat = createProfieStat(s, username)
            state.profileElems.push(profileStat)
            const onLoad=(data)=>{
                updateBadge(profileStat, data, createLevelInfo(data))
            }
            if(profileLoad.data===null){
                profileLoad.callbacks.push((data)=>{
                    onLoad(data)
                })
            }else{
                onLoad(profileLoad.data)
            }
        })
    }
}
function createState(){
    return {
        hide:false,
        profiles:new Map(),
        profileElemsProcessed:new Map(),
        rarityImages:[],
        profileElems:[],
    }
}
function getElapsed(date = new Date()){
    const elapsed = (new Date()- date)
    const hours = Math.ceil(elapsed/(1000*60*60))
    let elapsedString=hours+'h'
    let days=0
    let monthes=0
    if(hours>24){
         days = Math.ceil(hours/(24))
        elapsedString=days+'d'
        if(days>356){
            monthes = Math.ceil(days/(30.436875))
            elapsedString=monthes+'m'
        }
    }
    return {
        elapsed,
        hours,
        days, 
        monthes,
        elapsedString,
    }
}
function dateToElapsedString(date = new Date()){
    const elapsed = getElapsed(date)
    return elapsed.elapsedString
}
function createLevelInfo(data=createData()){
    let level=0
    const scoreGab =  data.counterStats.commentCount>0?(data.counterStats.postCount/data.counterStats.commentCount):1
    const scoreNorm = normalize(data.scoreStats.score, 0, 50)
    const scoreRateNorm = ((data.scoreStats.votesCount-data.scoreStats.score)/2+data.scoreStats.score)/data.scoreStats.votesCount
    const lastDate = Date.parse(data.lastActivityDateTime)
    const elapsedLast = dateToElapsedString(lastDate)
    const registerDate = Date.parse(data.registerDateTime)
    const elapsedRegister = dateToElapsedString(registerDate)
    if(data.counterStats.postCount===0){
        if(data.scoreStats.score<=0){
            level=0
        }else {
            level=1
        }
    }else{
        if(data.scoreStats.score<0){
            level=2
        }else{
            if(scoreGab<0.05){
                level=3
            }else{
                const elapsed = getElapsed(registerDate)
                if(elapsed.monthes<120) {
                    level=4
                }else{
                    level=5
                }
            }
        }
    }
    const levelInfo = {
        level,
        scoreNorm,
        scoreRateNorm,
        scoreGab,
        elapsedLast,
        elapsedRegister,
    }
    return levelInfo
}
function createProfieStat(s, username){
    const profileElemContainer = document.createElement('span')
    const profileElem = document.createElement('span')
    profileElem.textContent = username
    profileElem.style.fontSize='.8125rem'
    const profileIcon = document.createElement('img')
    profileIcon.style.height='.8125rem'
    profileIcon.style.marginLeft='3px'
    profileIcon.src=state.rarityImages[0]
    s.parentElement.appendChild(profileElemContainer)
    profileElemContainer.appendChild(profileIcon)
    profileElemContainer.appendChild(profileElem)
    return{
        profileElemContainer,
        profileElem,
        profileIcon
    }
}
/** @param {HTMLAnchorElement} span */
function updateBadge(profileStat = createProfieStat(), data=createData(), levelInfo=createLevelInfo()){
    const sign = data.scoreStats.score>0?'+':''
    profileStat.profileIcon.src=state.rarityImages[levelInfo.level]
    profileStat.profileElem.textContent = ''
        + '| P'+data.counterStats.postCount+ ' '
        + '| G'+(Math.ceil(levelInfo.scoreGab*100))+'% '
        + '| X'+(Math.ceil(levelInfo.scoreRateNorm*100))+'% '
        + '| '+sign + data.scoreStats.score+'('+data.scoreStats.votesCount+') '
        +' | C'+data.counterStats.commentCount+' '
        + '| F'+data.followStats.followersCount+' '
        + '| L'+ levelInfo.elapsedLast+' '
        + '| R'+ levelInfo.elapsedRegister+' '
        + '| V'+levelInfo.level+' '
}
function createData(){
return {
    "alias": "Dominux",
    "fullname": null,
    "avatarUrl": null,
    "speciality": null,
    "gender": "0",
    "rating": 0.1,
    "ratingPos": 2152,
    "scoreStats": {
      "score": -3,
      "votesCount": 5
    },
    "relatedData": {
      "vote": {
        "value": null
      },
      "canVote": true,
      "isSubscribed": false
    },
    "followStats": {
      "followCount": 0,
      "followersCount": 0
    },
    "lastActivityDateTime": "2023-07-26T09:26:51+00:00",
    "registerDateTime": "2018-03-19T14:43:52+00:00",
    "birthday": null,
    "location": null,
    "workplace": [],
    "counterStats": {
      "postCount": 0,
      "commentCount": 25,
      "favoriteCount": 1
    },
    "isReadonly": false,
    "canBeInvited": true
  }
}
function normalize(value=0,min=-20,max=300){
  const offset = min>=0?0:-min
  if(value>=max){return 1}
  if(value<=min){return 0}
  const norm = (value+offset)/((max+offset)-(min+offset))
  return norm
}
function normalizeGeom(value=0,min=-20,max=300){
    const norm = normalize(value, min, max)
    const geom = Math.sqrt(norm)
    return geom
}
function animate() {
    requestAnimationFrame(animate)
    process()
}
function createRarity(level=0){
    //Common-Uncommon-Rare-Epic-Legendary-Mystic-Relic-Masterwork-Ethernal
    const names = [
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
        'mythic',
        'relic',
        'masterwork',
        'eternal',
    ]
    const colors = [
        '#8a8a8a',
        '#6ee34b',
        '#2274f0',
        '#cc14c6',
        '#e8e413',
        '#ff8400',
        '#f02424',
        '#ff0080',
        '#000000',
    ]
    return {
        names,
        colors,
        name:names[level],
        color:colors[level]
    }
}
function createRarityIcons(maxLevel = 9){
    let images = []
    const width = 32
    const icoWidth = 5
    for(let i=0;i<maxLevel;i++){
        const canvas = document.createElement('canvas')
        canvas.width=32
        canvas.height=32
        const ctx = canvas.getContext('2d')
        const rarity = createRarity(i)
        ctx.beginPath()
        ctx.moveTo(16,0)
        ctx.lineTo(32-icoWidth,13)
        ctx.lineTo(32-icoWidth,19)
        ctx.lineTo(16,32)
        ctx.lineTo(icoWidth,19)
        ctx.lineTo(icoWidth,13)
        ctx.closePath()
        ctx.fillStyle=rarity.color
        ctx.fill()
        const image = canvas.toDataURL()
        images.push(image)
    }
    state.rarityImages=images
    return images
}
function process(){
    if(saved.isHide){
        hideVotes()
    }else{
        showVotes()
    }
    if(saved.showStats){
        showStats()
    }else{
        hideStats()
    }
}
function init(){
}
//---
const state = createState()
let  saved = createSaved()
function onMessage({message, sender, sendResponse}){
    if(message.isInit){
        message.isInit=false
        message.saved=saved
        sendResponse(message)
    }else{
        saved=message.saved
    }
}
window.addEventListener('load', e=>{
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if(message.isInit){
            const messageResponse = Object.assign({},message)
            messageResponse.saved=saved
            messageResponse.isInit=false
            sendResponse(messageResponse)
        }else{
            saved=message.saved
            localStorage.setItem('saved', JSON.stringify(message.saved))
        }
    })
    createRarityIcons()
    process()
    animate()
})
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
function sendMessage(message){
    chrome.runtime.sendMessage(null, message, null)
}