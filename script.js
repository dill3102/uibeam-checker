// --------------------------------------------
// ファイル読み込み関連
// --------------------------------------------
function loadContent(page) {
    const urlParams = new URLSearchParams(window.location.search);
    const content = urlParams.get('content');

    if (content != null  && content != "" ){
        page = content
    }
    
    fetch(`contents/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            switch (page){
                case "home":
                    HomeInit()
                    break
                case "censorship":
                    CensorshipInit()
                    break
            }
        })
        .catch(error => console.error('コンテンツの読み込みに失敗しました:', error));
}

// 初回ページ表示（デフォルト: ホーム）
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname !== "/") {
        window.location.href = "/";
    }

    if (isRegisteredNull()){
        setSampleTargets()
    }
    GetDayRandom(1,2);
    loadContent('home');    
});

function HomeInit(){
    OnlyOnceAnimateBeam("beam-on-first-time")
    SetPlaceHolder("SampleTextInputField");

}

function CensorshipInit(){
    SetPlaceHolder("CensorshipTextInputField");
}


// --------------------------------------------
// 検閲対象文字群操作
// --------------------------------------------
function addTargetCharacter(key, character){
    if (!isRegisterKey(key)){
        return 
    }

    targetCharacters = GetRegisteredForLocalStorage()
    if (window.TargetCharacters){
        return
    }
    
    var list = targetCharacters.get(key)

    // null対策
    if (isFalsy(list)) {
        list = []
    }

    // 登録済みなら追加せずに終了
    if (list.includes(character)){
        return
    }
    
    list.push(character)
    targetCharacters.set(key,list)
    SetLocalStorage(targetCharacters)
}

function setTargetCharacterList(key, list){
    if (!isRegisterKey(key)){
        return 
    }

    targetCharacters = GetRegisteredForLocalStorage()
    if (window.TargetCharacters){
        return
    }

    targetCharacters.set(key,list)
    SetLocalStorage(targetCharacters)
}

function getTargetCharacters(key, target){
    if (!isRegisterKey(key)){
        return 
    }
    
    if (isFalsy(target)){
        target = RegisteredTarget.Registered
    }

    var targetCharacters = []
    if (target == RegisteredTarget.Sample){
        return getSampleTarget(key)
    }

    var targetCharacters = GetRegisteredForLocalStorage()
    if (isFalsy(targetCharacters)) {
        return []
    }

    var list = targetCharacters.get(key)
    if (isFalsy(list)) {
        return []
    }

    return list
}

function deleteTargetCharacter(key, character){
    if (!isRegisterKey(key)){
        return 
    }

    var list = getTargetCharacters(key)
    let index = list.indexOf(character);
    if (index !== -1) {
        list.splice(index, 1);
    }

    setTargetCharacterList(key,list)
}


function debugTargetCharacters(){
    var key = getNowRegisterKey()
    var list = getTargetCharacters(key)
    console.log(list)
}


// local storage 操作 ------------------ 

const LocalStorageKeyTargetKeys = "target-keys"
function SetLocalStorage(obj){
    var tmp = JSON.stringify(Object.fromEntries(obj))
    localStorage.setItem(LocalStorageKeyTargetKeys, tmp);
}

function GetRegisteredForLocalStorage(){
    var obj = JSON.parse(localStorage.getItem(LocalStorageKeyTargetKeys));
    if (isFalsy(obj)){
        return new Map()
    }
    
    return new Map(Object.entries(obj))
}

function isRegisteredNull(){
    return isFalsy(JSON.parse(localStorage.getItem(LocalStorageKeyTargetKeys)));
}


// --------------------------------------------
// register key utils
// --------------------------------------------
const key_u= "う"
const key_i= "い"
const key_bi= "び"
const key_bar= "ー"
const key_mu= "む"
const default_key = key_u // default(場合によっては、query paramとか)

function getRegisterKeys(){
    return [key_u, key_i, key_bi, key_bar,key_mu]
}

// keyである=true 存在しない=false
function isRegisterKey(key ){
    return getRegisterKeys().includes(key)
}

function SetNowRegisterKey(key){
    if (!isRegisterKey(key)){
        return 
    }
    window.usingRegisterKey = key
}

function getNowRegisterKey(){
    if (isFalsy(window.usingRegisterKey)){
        return default_key
    }
    return window.usingRegisterKey
}

// --------------------------------------------
// utils
// --------------------------------------------
function isFalsy(value) {
    return !value;
}

function getMonotoneBlack(count){
    let c = "c"+ (count*3 -3).toString(16)
    return "#"+c+c+c
    
}


// --------------------------------------------
// register
// --------------------------------------------

function SubmitButton(){
    const inputField = document.getElementById('inputField');
    const inputValue = inputField.value.trim();

    if (inputValue) { // 空でなければ追加
        addTargetCharacter(getNowRegisterKey(),inputValue) 
        inputField.value = ''; // 入力欄をクリア
    } else {
        return
    }
    
    updateList(getNowRegisterKey());
    updateTargetTable();
}

// 一覧表示用
const HtmlKeyCharacterList = "CharacterList"
const HtmlKeyTargetTable = "registration-taget-table"
const HtmlKeyModalTarget = "modal-target"

function updateList(key) {
    const charList = document.getElementById(HtmlKeyCharacterList);
    charList.innerHTML = ''; // 既存のリストをクリア
    charList.style.overflowY="auto";
    
    var list = getTargetCharacters(key)
    if(list.length==0){
        charList.textContent="検閲対象文字が登録されていません。"
        charList.style.paddingLeft="10px"
        return
    }
    charList.style.paddingLeft="0px"

    list.forEach((char) => {
        const box = createTargetCharacterBox(key,char)
        charList.appendChild(box);
    });
}

function createTargetCharacterBox(key,character){
    const box = document.createElement("div");
    box.style.position = "relative"; // ✕ボタンを配置しやすくする
    box.style.display = "inline-block"; // サイズを文字に合わせる
    box.style.padding = "10px 20px"; // 余白
    box.style.margin = "5px"; // 間隔
    box.style.border = "1px solid black"; // 枠線
    box.style.borderRadius = "5px"; // 角を少し丸める
    box.style.backgroundColor = "#f8f8f8"; // 背景色
    box.style.width = "20px";
    box.style.fontSize = "16px";
    box.style.textAlign = "center";
    box.textContent = character;

    const closeButton = document.createElement("span");
    closeButton.innerHTML = "&times;"; // ✕ マーク
    closeButton.style.position = "absolute";
    closeButton.style.top = "2px";
    closeButton.style.right = "5px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "18px";
    closeButton.style.color = "red";

    // ✕ボタンのクリックで要素を削除
    closeButton.onclick = function () {
        deleteTargetCharacter(key, character)
        // ここに更新用の処理を追加したい。
        updateTargetTable()
        box.remove();
    };

    box.appendChild(closeButton);
    
    return box;
}

function removeRegisteredCharacterAll(){
    getRegisterKeys().forEach((value) => {setTargetCharacterList(value)});
}

function setSampleTargets(){
    getRegisterKeys().forEach((value) => {
        setTargetCharacterList(value, getSampleTarget(value));
    });
}


function getSampleTarget(key){
    if (!isRegisterKey(key)){
        return []
    }

    switch(key){
        case key_u: return [ 'う', 'ウ', '宇' ]
        case key_i: return [ 'い', 'イ', '伊' ]
        case key_bi: return [ 'び', 'ビ', '美' ]
        case key_bar: return [ 'ー', '｜','1', '１',]
        case key_mu: return [ 'む', 'ム', '武' , '娘']
        default: return []
    }
}

function setSeriousTargets(){
    getRegisterKeys().forEach((value, _) => {setTargetCharacterList(value, getSeriousTarget(value))});
}

function getSeriousTarget(key){
    if (!isRegisterKey(key)){
        return []
    }

    switch(key){
        case key_u: return [ 
            "u","U","う","ウ","ｳ","ヴ","ｳﾞ","ぅ","ゥ","ｩ",
            "生","植","得","浮","受","打","売","埋","憂","請",
            "右","雨","羽","宇","有","卯","迂","烏","禹","芋",
            "初","飢","魚","牛","失","渦","嘘","歌","謡","内",
            "撃","移","映","独","馬","旨","海","産","裏","浦",
            "潤","運","雲","噂",
        ]
        case key_i: return [
            "i","I","い","イ","ｲ","ぃ","ィ","ｨ",
            "伊","衣","戌","異","井","出","居","違","逸","糸",
            "往","行","射","入","要","言","生","位","胃","尉",
            "依","囲","易","医","威","為","委","石","市","ゐ",
            "以","意","移","偉","家","磯","気","息","一","逝",
            "院","印","因","亥","鋳","維","遺"
        ]
        case key_bi: return [
            "b","B","e","E","び","ひ", "ビ","ﾋﾞ","ヒ","ﾋ", 
            "美","備","微","尾","比","碑","飛","費","非","貴",
            "理","薇","便","櫃","火","氷","引","彼","悲","緋",
            "響","秘","妃","日","品","人","平","病","秒",
        ]
        case key_bar: return [ "ー", "-", "−", "—", "–", "＿", "˗", "﹣", "⎯", "⏤", "─", "━", "―", "￣", "∼", "∸", "l","I","｜","ⅼ","Ⅰ","＿","1","１","一","/","(",")","（","）"]
        case key_mu: return [
            "m","M","む","ム","ﾑ",
            "無","務","夢","武","霧","牟","鞴","陸","睦","剥",
            "群","向","視","未","虫","蒸","六","胸","村",
            "昔","仏","娘","厶"
        ]
        default: return []
    }
}

function getRegisterKeyBackGroundColorCode(key){
    if (!isRegisterKey(key)){
        return "#FFFFFF"
    }

    switch(key){
        case key_u:     return "#3DC4FF"
        case key_i:     return "#00B8EE"
        case key_bi:    return "#00B1E7"
        case key_bar:   return "#00A3E0"
        case key_mu:    return "#0095D9"
        default:        return "#FFFFFF"
    }
}

function genRegisterNumber(key){
    switch(key){
        case key_u:     return 1
        case key_i:     return 2
        case key_bi:    return 3
        case key_bar:   return 4
        case key_mu:    return 5
        default:        return 0
    }
}

// --------------------------------------------
// 検閲処理
// --------------------------------------------
class BeamPart {
    constructor(key, char) {
        this.beamPartKey = key;
        this.character = char;
    }
}

class BeamCtrl {
    // ビームであるかを確認する
    constructor(text,registeredTarget){
        this.defaultText = ""
        this.generated = false
        this.textData = []
        this.maxRowLength = 0
        this.checkBeam(text,registeredTarget)
        this.normalizeLength()
        this.checkAns()
    }

    // todo fix
    checkBeam(text, registeredTarget){
        if (isFalsy(registeredTarget)){
            registeredTarget = RegisteredTarget.Sample
        }
        this.generateText(text, registeredTarget)
    }
    
    normalizeLength(){
        for (let i=0; i<this.textData.length;i++ ){
            for (let j=this.textData[i].length; j < this.maxRowLength;j++ ){
                this.textData[i].push(new BeamPart(""," "))
            }
        }
    }

    // BeamCtrl準備
    generateText(text,registeredTarget) {
        this.defaultText = text
		this.generated =  true
        text.split("\n").forEach((t)=>{
            t = t.trim()
            if (t == ""){ return }
            if (t.length > this.maxRowLength){
                this.maxRowLength = t.length
                console.log(t, "length:",this.maxRowLength)
            }
            this.textData.push(this.checkIsUiBeamText(t,registeredTarget))
        })
    }

    // 改行済みのテキスト
    checkIsUiBeamText(splitText, registeredTarget) {
        var ret = []
        Array.from(splitText).forEach((t)=>{
            var key = this.checkIsBeamPart(t, registeredTarget)
            var tmp = new BeamPart(key,t)
            ret.push(tmp)
        })

        return ret
    }

    // 検閲対象に含まれる場合keyを返却
    // key毎に色の変更等を行う
    checkIsBeamPart(char,registeredTarget) {
        var keys = getRegisterKeys()
        var ret = ""

        keys.forEach((key)=>{
            const list = getTargetCharacters(key,registeredTarget)
            if (list.includes(char)){
               ret = key
               return
            }
        })

        return ret
    }
    
    getCensorship(){
        return this.textData
    }

    checkAns(){
        var message = []
        console.log(this.textData)
        
        this.textData.forEach((texts)=>{
            let text = ""
            texts.forEach((p)=>{
                const char = this.overrideKey(p.beamPartKey, p.character)
                text = text+char
            })
            message.push(text)
        })

        message.forEach((m, index)=>{console.log(index,m)})
    }
    
    overrideKey(key,char){
        if (key==""){
            return char
        }

        switch (key){
            case key_u:     return "□"
            case key_i:     return "■"
            case key_bi:    return "○"
            case key_bar:   return "●"
            case key_mu:    return "☆"
            default:        return char
        }
    }
}


// --------------------------------------------
// 各コンテンツ用
// --------------------------------------------


// home ------------------

const RegisteredTarget =Object.freeze({
    Sample : "Sample",
    Registered:"Registered",
})

class CensorshipTargetsTable extends HTMLElement{
    constructor() {
        super();
    }
    
    connectedCallback() {
        this.target = this.dataset.target 
        this.createTable();
    }

    createTable(){
        this.innerHTML=""
        let table = document.createElement("table")
        let header = this.createHeader()
        let body =  this.createBodies()
        table.appendChild(header)
        table.appendChild(body)
        this.appendChild(table);
    }

    createHeader(){
        let header = document.createElement("thead")
        let tr = document.createElement("tr")
        let th1 = document.createElement("th")
        let th2 = document.createElement("th")
        th1.textContent = "キー"
        th1.style.whiteSpace="nowrap"
        th1.style.textAlign="center"
        th1.style.backgroundColor="#008080"
        th2.style.backgroundColor="#008080"
        
        th1.style.color="white"
        th2.style.color="white"
    
        th2.style.textAlign="center"
        th2.textContent = "各要素の検閲対象文字"
        tr.appendChild(th1);
        tr.appendChild(th2);
        header.appendChild(tr)
        return header
    }

    createBodies(){
        let body = document.createElement("tbody")
        var keys = getRegisterKeys()
        // 配列の各要素をリストに追加
        keys.forEach((key) => {
            var characters = getTargetCharacters(key,this.target)
            // row 作成 + key valueを作成して追加
            const row = document.createElement("tr");
            const keyCell = document.createElement("td");
            keyCell.textContent = key;
            keyCell.style.textAlign="center"
            row.appendChild(keyCell);
            const valueCell = document.createElement("td");
            valueCell.textContent = characters.join(", "); 
            row.appendChild(valueCell);
            
            // const box = createTargetCharacterBox(key,char)
            body.appendChild(row);
        });
        return body
    }
}

class RegisteredCharactersByKey extends HTMLElement{
    connectedCallback() {
        updateList(getRegisterKeys()[0])
    }
}

class  MyNotice extends HTMLElement{
    constructor(){
        super();
        const noticeMessage = [
            "※ 当サイトの内容は、可能な限り他者を尊重し、公正であり続けることを心掛けています。",
            "※ 万が一、意図しない不利益や誤解を招くような表現があった場合には、お知らせいただけると幸いです。",
            "※ 皆様にとって有益で、快適に利用いただけるサイト作りを目指しています。",
        ]
        
        noticeMessage.forEach((message) => {
            let p = document.createElement("p")
            p.textContent = message
            this.appendChild(p);
        });      
    }
}

customElements.define("censorship-targets-table", CensorshipTargetsTable);
customElements.define("registered-characters-by-key", RegisteredCharactersByKey);
customElements.define("my-notice", MyNotice);

// id: 文字列取得対象
// target: 書き出し対象
function execCensorship(id,displayTarget,registeredTarget){
    const inputField = document.getElementById(id);
    let inputValue = inputField.value;
    if (!isFalsy(inputValue)){
        inputValue = inputValue.trim()
    }

    if (inputValue==""){
        inputValue = inputField.placeholder;
    }

    let text = ""
    inputValue = inputValue.trim()
    inputValue.split(" ").forEach((t)=>{
         text = text+t
    })
    
    const ctrl = new BeamCtrl(text,registeredTarget)
    const generatedTexts = ctrl.getCensorship()
    createCensoredTextBox(generatedTexts,displayTarget)
}

function createCensoredTextBox(generatedTexts,target){
    var displayTarget = document.getElementById(target);
    displayTarget.innerHTML = "";
    displayTarget.style.border="1px solid lightgray";
    displayTarget.style.display= "inline-block";
    
    let body = document.createElement("tbody")
    generatedTexts.forEach((texts) => {
        const row = document.createElement("tr");
        texts.forEach((t)=>{
            const cell = document.createElement("td");
            cell.style.border = "1px solid lightgray";
            cell.style.textAlign="center"
            cell.textContent = t.character
            bgColor = getRegisterKeyBackGroundColorCode(t.beamPartKey)
            if (bgColor != "#FFFFFF"){
                cell.style.color = "#FFFFFF";
                cell.style.fontWeight = "bold";
                cell.style.borderColor = "#000000";   
            }
            cell.style.backgroundColor = bgColor
            row.appendChild(cell)
        })
        
        body.appendChild(row)
    });
    displayTarget.appendChild(body)
}

function updateTargetTable(){
    const targetTable = document.getElementById(HtmlKeyTargetTable);
    if (!isFalsy(targetTable)){
        targetTable.createTable()
    }
}

//  min ~ max(含む)までの乱数を日付で生成
function GetDayRandom(min,max){
    max++
    const date = new Date("2025-02-18T12:00:00Z");
    const unixTime = Math.floor((date.getTime()+(60*60*24+1)) / 1000);
    const res = min + (unixTime % (max-min));
    return res
}

const UiBeamSampleTexts = [
    'うちの娘がうい先生のファンで\nいつもかじりついて配信をみていますw\n\n美術の授業でもうい先生の絵を描いて\n1番かわいくできた と持って帰って飾ってます。\n\n娘は本当は居ません',
    'うい先生に質問です絵を描き始めるのに\nいち万円でいたタブを譲ってもらったのですが\nびみょうに古いです\nいまからでも新型を買ったほうがいいですか？\nむだにならない値段も教えてほしいです',
    'うい先生こんばんわ！\nイラストを書く時、裸体を書かない派どちらですか？\n美大生の人は「みんな裸体から書いている」なんて\nいっていました。\nむっつりとかそういうのではないです。',
    'うに食べたい\nこいも食べたい\n甘エビもいいな\nアルコールと一緒に\n海鮮系のムニエルで',
    '今頃ういはクソマロ集めで忙しいだろうなぁ。\nあーいつも大変そうだなぁ。\n誰か美少年のお手伝いさんが居れば。。。\nピコーン\nムキムキマッチョメンの僕が行きますよ',
    'こういう機会がないと聞けないので！！！\nよいチャンスかなと思い質問させて下さい！\nビビッと浮かんだ質問が一つだけですが！！！\nいいかなーとお二人の！！！！！！！！！\nむむむねのサイズをお聞きしても良いですか！',
    '噂のイラストレーター件Vtuber「しぐれう\nい」がローソンに登場！本人描きおろしの\n美麗イラストを使用したオリジナルグッズや、\nいつもは見られない（？）からあげクンになりきる\nむちゃかわな姿もお披露目♪'
]

function GetUiBeamSamples(id){
    if (UiBeamSampleTexts.length < id ){
        return ""
    }
    return UiBeamSampleTexts[id]
}

function OnlyOnceAnimateBeam(id){
    let item = document.getElementById(id)
    if (isFalsy(item)){
        return
    }
    
    if (sessionStorage.getItem(id+"-animationPlayed")) {
        item.innerHTML="";
        return
    } 
    
    setTimeout(() => {sessionStorage.setItem(id+"-animationPlayed", "true");}, 1000);
}

function SetPlaceHolder(id){
    let textArea = document.getElementById(id)
    if (isFalsy(textArea)){
        console.log(" SetPlaceHolder none id : ", id)
        return
    }
    textArea.placeholder = GetUiBeamSamples(GetDayRandom(0,UiBeamSampleTexts.length))
}

function changeRegisterTab(index) {
    const tabs = document.querySelectorAll(".tab");
    const key = getRegisterKeys()[index]

    SetNowRegisterKey(key); 
    debugTargetCharacters();
    updateList(key)
    
    tabs.forEach((tab, i) => {
        tab.classList.toggle("active", i === index);
    });
}

function openUserDecidedModal( message, func){
    const bg = document.createElement("div");
    bg.style.position = "fixed";
    bg.style.display="flex";
    bg.style.top = 0;
    bg.style.left = 0;
    bg.style.width = "100%";
    bg.style.height = "100%";
    bg.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    bg.style.justifyContent = "center";
    bg.style.alignItems = "center";

    const content = document.createElement("div");
    content.style.backgroundColor = "white";
    content.style.textAlign = "center";
    content.style.borderRadius = "8px";
    content.style.padding = "20px";
    content.style.width = "400px";
    content.style.width = "400px";

    const text = document.createElement("div");
    text.textContent = message
    const close = document.createElement("button");
    close.innerHTML = "&times;";
    close.style.position= "absolute";
    close.style.top= "10px";
    close.style.right= "10px";
    close.style.fontSize= "20px";
    close.style.cursor= "pointer";

    const buttons = document.createElement("div");
    buttons.style.display = "flex";
    buttons.style.flexDirection = "row";
    buttons.width = "100%";
    buttons.style.margin = "3%";

    const yesButton = document.createElement("button");
    const noButton = document.createElement("button");
    yesButton.style.margin="auto"
    noButton.style.margin="auto"
    yesButton.style.width = "25%";
    noButton.style.width = "25%";

    yesButton.classList.add("executeButton");
    noButton.classList.add("executeButton");

    close.onclick = function tmp(){closeFunc()}
    yesButton.onclick = function tmp(){func();closeFunc()}
    noButton.onclick = function tmp(){noFunc()}

    
    yesButton.textContent = "Yes"
    noButton.textContent = "No"

    buttons.appendChild(noButton)
    buttons.appendChild(yesButton)

    content.appendChild(text)
    content.appendChild(close)
    content.appendChild(buttons)
    bg.appendChild(content);
    
    document.getElementById(HtmlKeyModalTarget).appendChild(bg)
}

function successFunc(){
    closeFunc();
}

function closeFunc(){
    document.getElementById(HtmlKeyModalTarget).innerHTML = ""
}

function noFunc(){
    closeFunc()
}