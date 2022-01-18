// //Next to do is figure out how to break the messages into words at spaces, \n, and special characters in order to add them to wordsArray
// //add optional paramaters for words to skip and date ranges
// //skip message content that begins with Reacted
// //how to deal with undefined?


//Creates an array of all file names in the messages directory
const fs = require("fs");
let messageDirectory = "./messages";
let fileNames = fs.readdirSync(messageDirectory);

//Creates object containing all the JSON objects
let filesObject = {}
fileNames.forEach(file => {
    filesObject[file] = require("./messages/"+file);
})




//loops through the filesObject
//add logic to remove messages that only contain media and do not contain text (Should be available on main branch using &&)
//add logic to not include strings starting with Reacted 
//add logic to strip message['content'] using regex
messagesObject = {};
for(let file in filesObject){
    for(let message of filesObject[file]['messages']){
        if(messagesObject[message['sender_name']] === undefined){
            messagesObject[message['sender_name']] = [{text : message['content'], date_ms : message['timestamp_ms']}]
        } else {
            messagesObject[message['sender_name']] = messagesObject[message['sender_name']].concat([{text : message['content'], date_ms : message['timestamp_ms']}])

        }
    }
}


console.dir(messagesObject, { depth: null })



























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

// let test = 'this*is ' + "a\n" +" test"
// test = test.split(/\W/)
// console.log(test)



