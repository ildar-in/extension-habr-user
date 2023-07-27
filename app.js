function hideVotes(){
    const rate = '.tm-votes-lever__score-counter.tm-votes-lever__score-counter,.tm-votes-meter__value.tm-votes-meter__value_appearance-comment'
    document.body.querySelectorAll(rate).forEach(/** @param {HTMLElement} s */ s=>{
        s.hidden=true
    })
    const muted = '.tm-comment__body-content_muted'
    document.body.querySelectorAll(muted).forEach(/** @param {HTMLElement} s*/ s=>{
        s.style.opacity = 1
    })
}
function createState(){
    return {
        hide:false,
        profiles:new Map(),
        profileElemsProcessed:new Map(),
    }
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
            const profileElem = document.createElement('span')
            profileElem.textContent = username
            profileElem.style.fontSize='.8125rem'
            s.parentElement.appendChild(profileElem)
            const onLoad=(data)=>{
                updateBadge(profileElem, data, createLevelInfo(data))
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
function createLevelInfo(data=createData()){
    const levelInfo = {
        level:0,
        scoreNorm:0,
        scoreRateNorm:0,
    }
    if( data.counterStats.postCount===0){
        if(data.scoreStats.score<=0){
            levelInfo.level=0
        }
        if(data.scoreStats.score>0){
            levelInfo.level=1
        }
    }else{
        //const 
        if(data.scoreStats.score<0){
            levelInfo.level=3
        }
        if(data.scoreStats.score<0){
            levelInfo.level=3
        }
    }
    const maxScore = 50
    const minScore = 0
    const scoreNorm = normalize(data.scoreStats.score, minScore, maxScore)
    const scoreRateNorm = ((data.scoreStats.votesCount-data.scoreStats.score)/2+data.scoreStats.score)/data.scoreStats.votesCount
    levelInfo.scoreNorm=scoreNorm
    levelInfo.scoreRateNorm=scoreRateNorm
    return levelInfo
}
/** @param {HTMLAnchorElement} span */
function updateBadge(span, data=createData(), levelInfo=createLevelInfo()){
    const sign = data.scoreStats.score>0?'+':''
    span.textContent = ''
        + '| P'+data.counterStats.postCount+ ' '
        + '| X'+(Math.ceil(levelInfo.scoreRateNorm*100))+'% '
        + '| '+sign + data.scoreStats.score+'('+data.scoreStats.votesCount+') '
        +' | C'+data.counterStats.commentCount+' '
        + '| F'+data.followStats.followersCount+' '
        + '| L'+ dateToString(Date.parse(data.lastActivityDateTime))+' '
        + '| R'+dateToString(Date.parse(data.registerDateTime))+' '
  }
function dateToString(date=new Date()){
    const elapsed =  (new Date()- date)
    const hours = Math.ceil(elapsed/(1000*60*60))
    if(hours>24){
        const days = Math.ceil(hours/(24))
        if(days>356){
            const monthes = Math.ceil(days/(30.436875))
            return monthes+'m'
        }
        return days+'d'
    }
    return hours+'h'
}
function process(){
    if(state.hide){
        hideVotes()
    }else{
        showVotes()
    }
}
function animate() {
    requestAnimationFrame(animate)
    process()
}
document.addEventListener('readystatechange',e=>{
    animate()
})
window.addEventListener('load', e=>{
    process()
})
function createRarity(level=0){
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
//---
const state = createState()
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    state.hide = message.hide
    return true
})