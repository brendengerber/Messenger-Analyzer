//add optional paramaters for words to skip and date ranges
//add logic to count messages per day average
//add logic to parse word lists and count the most used words
//add all below into a function with parameters "dateStart", "dateEnd", "wordsToOmit" (which is an array of common words like the, a, an and will be used when looping the final words array and counting words "if not in wordsToOmit")
//counts words of both of us individually and together
//does it work for convos with multiple people?
//words arrays sometimes have an empty string at the end for some reason
//if only an emoji is sent, it returns an empty array, set up to skip adding if only an emoticon, .replace(emoticons, ' ').replace(/^\s$/, undefined) doesn't work when put on the undefined thing for some reason, can search :/ to see
//apostrophe sometimes comes up as \u00e2\u0080\u0099 in JSON file and â\x80\x99 in terminal log, how can we fix this? This is from vietnam keyboard. .replace(/\\u00e2\\u0080\\u0099/g, "'").replace(/â\\x80\\x99/g, "'") does not work because it cant replace the several undefined messages
//add i flag to emoticon to ignore case sensitivity?
//when deciding to include or not if message['content'] !== undefined, include a regex to change emoticons to undefined first
const emoticons = /O:-\)|O:\)|>:-\(|:42:|:-D|:D|:putnam:|O.o|:'\(|3:-\)|3:\)|=P|B\)|B-\)|8\)|8-\)|>:\(|=\)|<3|:-\/|:-\*|:\*|:3|(Y)|\^_\^|:v|<\("\)|:\|\]|=\(|:\[|:\(|:-\(|\(\^\^\^\)|:-o|:-O|:\]|:-\)|:\)|-_-|:-p|:-P|:p|:P|B\||B-\||8\||8-\||:-o|:-O|:o|:O|:\\|:-\\|:\/|>-:o|>:-O|=D|;-\)|:\)|>:o|>:O/g


//Creates an array of all file names in the messages directory
const fs = require("fs");
let messageDirectory = "./messages";
let fileNames = fs.readdirSync(messageDirectory);

//Creates object containing all the JSON objects
let filesObject = {}
fileNames.forEach(file => {
    filesObject[file] = require("./messages/"+file);
})



//loops through filesObject and creates a messagesObject which contains only the desired data from all JSON files in filesObject
//Removes messages with no text i.e. only media files(undefined), reactions(Reacted), or links(https)
//Creates an array for all the words seperately while stripping them of special characters (except apostrophe, including weird unicode â\x80\x99 and \u00e2\u0080\u0099 ), spacing, newlines, and emoticons (list of current and retired as of 01/01/2022)
messagesObject = {};

for(let file in filesObject){
    for(let message of filesObject[file]['messages']){
        if(message['content'] !== undefined && message['content'].replace(emoticons, '').replace(/\s+/,'') === ''){
            continue
        } else if(messagesObject[message['sender_name']] === undefined && message['content'] !== undefined && /^(?!Reacted|https)/.test(message['content'])){
            messagesObject[message['sender_name']] = [{text: message['content'], date_ms: message['timestamp_ms'], words: message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')}];
        } else if(message['content'] !== undefined && /^(?!Reacted|https)/.test(message['content'])){
            messagesObject[message['sender_name']] = messagesObject[message['sender_name']].concat([{text: message['content'], date_ms: message['timestamp_ms'], words: message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')}])
        }
    }
}

//prints out full object if desired for analysis
console.dir(messagesObject, { depth: null })



// // // //Use this to add arrays of the words in the messages
// let emoticons = /O:-\)|O:\)|>:-\(|:42:|:-D|:D|:putnam:|O.o|:'\(|3:-\)|3:\)|=P|B\)|B-\)|8\)|8-\)|>:\(|=\)|<3|:-\/|:-\*|:\*|:3|(Y)|\^_\^|:v|<\("\)|:\|\]|=\(|:\[|:\(|:-\(|\(\^\^\^\)|:-o|:-O|:\]|:-\)|:\)|-_-|:-p|:-P|:p|:P|B\||B-\||8\||8-\||:-o|:-O|:o|:O|:\\|:-\\|:\/|>-:o|>:-O|=D|;-\)|:\)|>:o|>:O/g

// let test = " this*is " + " a\n" +" :D:D test? :P:) string you're D :D :* :/"
// test = test.replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')
// // console.log(test)
// // test = test.trim().split(/(?!')\W+/g)
// // // // test = test.split(/\W/)g.filter(word => word !== '')
// console.log(test)

// let test = ':/ :) test'
// // let test = ':) and some more text :)'
// // test = test.match(emoticons)
// // console.log(test)

// if(test !== undefined && test.replace(emoticons, '').replace(/\s+/,'') === ''){
//     console.log('success')
// }else{
//     console.log(test)
// }


















// //foreach method, but not working due to formatting?
// // filesObject.forEach(file => {
// //     filesObject[file]['messages'].forEach(message => {
// //         messagesArray.push(message['content'])
// //     })
// // })
// console.log(messagesArray)
// //breaks messagesArray into an array containing only one word per index, not working
// let wordsArray = []
// for(let messages in messagesArray){
//     for(let words in messages){
//         wordsArray.push(words)
//     }
// }

// // console.log (wordsArray)
// // console.log(messagesArray)





