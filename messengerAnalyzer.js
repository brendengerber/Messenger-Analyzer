//add messengerAnalyzer.analyze(startDate, endDate, wordsToSkip)(returns the results) messengerAnalyzer.data() (returns the data) and use let data = this.data in .analyze().
//Use getters and setters, especially for dates since you will need to convert to ms
//add optional paramaters for words to skip and date ranges
//add logic to count messages per day average
//add logic count the most used words
//add all below into a function with parameters "dateStart", "dateEnd", "wordsToOmit" (which is an array of common words like the, a, an and will be used when looping the final words array and counting words "if not in wordsToOmit")
//count words of both of us individually and together
//add i flag to emoticon to ignore case sensitivity?



let messageAnalyzer = {
    messagesData: {},
    parseFiles: function(){
        //Regex to match current and retired Facebook emoticons as of 01/01/2022
        const emoticons = /O:-\)|O:\)|>:-\(|:42:|:-D|:D|:putnam:|O.o|:'\(|3:-\)|3:\)|=P|B\)|B-\)|8\)|8-\)|>:\(|=\)|<3|:-\/|:-\*|:\*|:3|(Y)|\^_\^|:v|<\("\)|:\|\]|=\(|:\[|:\(|:-\(|\(\^\^\^\)|:-o|:-O|:\]|:-\)|:\)|-_-|:-p|:-P|:p|:P|B\||B-\||8\||8-\||:-o|:-O|:o|:O|:\\|:-\\|:\/|>-:o|>:-O|=D|;-\)|:\)|>:o|>:O/g;

        //Create an array of all file names in the messages directory
        const fs = require("fs");
        let messageDirectory = "./messages";
        let fileNames = fs.readdirSync(messageDirectory);

        //Create an object containing all objects from the JSON files
        let filesObject = {};
        fileNames.forEach(file => {
            filesObject[file] = require("./messages/"+file);
        });

        //Loop through filesObject and creates a messagesData which contains only the desired data from all JSON files in filesObject
        //Remove messages with no text i.e. only media files(undefined), reactions(Reacted), links(https), or emoticons (both sequential or separated by spaces)
        //Create an array for all the words seperately, while stripping them of special characters (except apostrophe), whitespace, newlines, and emoticons
        for(let file in filesObject){
            for(let message of filesObject[file]['messages']){
                //Check if message is undefined, media, reaction, or contains only emoticons and continues if so
                if((message['content'] !== undefined && message['content'].replace(emoticons, '').replace(/\s+/,'') === '') || /^Reacted|https/.test(message['content']) || message['content'] === undefined){
                    continue
                //Add sender and message to messagesData if sender has not been added
                }else if(this.messagesData[message['sender_name']] === undefined){
                    this.messagesData[message['sender_name']] = [{date_ms: message['timestamp_ms'], words: message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')}];
                //Add message to messagesData
                }else{
                    this.messagesData[message['sender_name']] = this.messagesData[message['sender_name']].concat([{date_ms: message['timestamp_ms'], words: message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')}]);
                }
            }
        }
    },
    logData: function(){
        if(Object.keys(this.messagesData).length === 0){
            console.log('Data has not yet been parsed. Run "messengerAnalyzer.parseFiles()" and try again.');
        }else{
            console.dir(this.messagesData, { depth: null });
        }
    },
    analyzeData: function(startDate, endDate, wordsToSkip){

    }
}

messageAnalyzer.parseFiles()
messageAnalyzer.logData()









