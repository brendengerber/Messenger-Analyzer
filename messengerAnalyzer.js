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

// console.log(filesObject['message_1.json']['messages'])





//loops through the filesObject which contains the objects from each JSON file and puts the messages into an array
//removes messages that only contain media and do not contain text
messagesArray = [];
for(let file in filesObject){
    filesObject[file]['messages'].forEach(message => {
        if(message['content'] !== undefined){
            messagesArray.push(message['content'])
        }
    })
}


//foreach method, but not working due to formatting?
// filesObject.forEach(file => {
//     filesObject[file]['messages'].forEach(message => {
//         messagesArray.push(message['content'])
//     })
// })

//breaks messagesArray into an array containing only one word per index, not working
let wordsArray = []
for(let messages in messagesArray){
    for(let words in messages){
        console.log(words)
        wordsArray.push(words)
    }
}

// console.log (wordsArray)
// console.log(messagesArray)

let test = 'this*is ' + "a\n" +" test"
test = test.split(/\W/)
console.log(test)



