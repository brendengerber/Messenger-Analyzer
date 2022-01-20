//add messengerAnalyzer.analyze(startDate, endDate, wordsToSkip)(returns the results) messengerAnalyzer.data() (returns the data) and use let data = this.data in .analyze().
//Use getters and setters, especially for dates since you will need to convert to ms
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
//What if there is a message after http?
//CSV for excel?
//check how emoji are represented, could be an issue slipping in

//Regex to match current and retired Facebook emoticons as of 01/01/2022
const emoticons = /O:-\)|O:\)|>:-\(|:42:|:-D|:D|:putnam:|O.o|:'\(|3:-\)|3:\)|=P|B\)|B-\)|8\)|8-\)|>:\(|=\)|<3|:-\/|:-\*|:\*|:3|(Y)|\^_\^|:v|<\("\)|:\|\]|=\(|:\[|:\(|:-\(|\(\^\^\^\)|:-o|:-O|:\]|:-\)|:\)|-_-|:-p|:-P|:p|:P|B\||B-\||8\||8-\||:-o|:-O|:o|:O|:\\|:-\\|:\/|>-:o|>:-O|=D|;-\)|:\)|>:o|>:O/g

//Create an array of all file names in the messages directory
const fs = require("fs");
let messageDirectory = "./messages";
let fileNames = fs.readdirSync(messageDirectory);

//Create an object containing all objects from the JSON files
let filesObject = {}
fileNames.forEach(file => {
    filesObject[file] = require("./messages/"+file);
})

//Loop through filesObject and creates a messagesObject which contains only the desired data from all JSON files in filesObject
//Remove messages with no text i.e. only media files(undefined), reactions(Reacted), links(https), or emoticons (both sequential or separated by spaces)
//Create an array for all the words seperately, while stripping them of special characters (except apostrophe), whitespace, newlines, and emoticons
messagesObject = {};
for(let file in filesObject){
    for(let message of filesObject[file]['messages']){
        //Check if message is undefined, media, reaction, or contains only emoticons and continues if so
        if((message['content'] !== undefined && message['content'].replace(emoticons, '').replace(/\s+/,'') === '') || /^Reacted|https/.test(message['content']) || message['content'] === undefined){
            continue
        //Add sender and message to messagesObject if sender has not been added
        }else if(messagesObject[message['sender_name']] === undefined){
            messagesObject[message['sender_name']] = [{date_ms: message['timestamp_ms'], words: message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')}];
        //Add message to messagesObject
        }else{
            messagesObject[message['sender_name']] = messagesObject[message['sender_name']].concat([{date_ms: message['timestamp_ms'], words: message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')}])
        }
    }
}

//Print out full object if desired for analysis
console.dir(messagesObject, { depth: null })

