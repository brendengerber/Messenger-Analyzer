//add optional paramaters for words to skip and date ranges
//add logic to count messages per day average
//add logic to parse word lists and count the most used words
//add all below into a function with parameters "dateStart", "dateEnd", "wordsToOmit" (which is an array of common words like the, a, an and will be used when looping the final words array and counting words "if not in wordsToOmit")
//counts words of both of us individually and together
//does it work for convos with multiple people?


//Creates an array of all file names in the messages directory
const fs = require("fs");
let messageDirectory = "./messages";
let fileNames = fs.readdirSync(messageDirectory);

//Creates object containing all the JSON objects
let filesObject = {}
fileNames.forEach(file => {
    filesObject[file] = require("./messages/"+file);
})




//loops through the filesObject and creates messagesObject which contains only the desired data from all JSON filesObject
//Removes messages with no text i.e. only media files, reactions, or links
//add logic to add an array of words to the end of the object in the array {text : message['content'], date_ms : message['timestamp_ms', words: xx]}. keep text so that I can calculate things like messages per day?
messagesObject = {};
for(let file in filesObject){
    for(let message of filesObject[file]['messages']){
        if(messagesObject[message['sender_name']] === undefined && message['content'] !== undefined && /^(?!Reacted|https)/.test(message['content'])){
            messagesObject[message['sender_name']] = [{text: message['content'], date_ms: message['timestamp_ms']}]
        } else if(message['content'] !== undefined && /^(?!Reacted|https)/.test(message['content'])){
            messagesObject[message['sender_name']] = messagesObject[message['sender_name']].concat([{text: message['content'], date_ms : message['timestamp_ms']}])

        }
    }
}

console.dir(messagesObject, { depth: null })






// //Use this to add arrays of the words in the messages
// let test = "this*is " + " a\n" +" test string "
// test = test.trim().split(/\W+/g)
// // test = test.split(/\W/)g.filter(word => word !== '')
// console.log(test)






















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





