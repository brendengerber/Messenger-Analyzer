//add messengerAnalyzer.analyze(startDate, endDate, wordsToSkip)(returns the results) messengerAnalyzer.data() (returns the data) and use let data = this.data in .analyze().
//Use getters and setters, especially for dates since you will need to convert to ms
//add logic to count messages per day average for each sender
//add logic to count the most used words for each sender
//add logic to count total messages sent for each sender
//add all below into a function with parameters "dateStart", "dateEnd", "wordsToOmit" (which is an array of common words like the, a, an and will be used when looping the final words array and counting words "if not in wordsToOmit")
//determine dataset date range and display a message if the range input is outside that range?



let messageAnalyzer = {
    parseFiles: function(){
        const fs  = require('fs');
        let messagesData = {};
        //Regex to match current and retired Facebook emoticons as of 01/01/2022
        const emoticons = /O:-\)|O:\)|>:-\(|:42:|:-D|:D|:putnam:|O.o|:'\(|3:-\)|3:\)|=P|B\)|B-\)|8\)|8-\)|>:\(|=\)|<3|:-\/|:-\*|:\*|:3|(Y)|\^_\^|:v|<\("\)|:\|\]|=\(|:\[|:\(|:-\(|\(\^\^\^\)|:-o|:-O|:\]|:-\)|:\)|-_-|:-p|:-P|:p|:P|B\||B-\||8\||8-\||:-o|:-O|:o|:O|:\\|:-\\|:\/|>-:o|>:-O|=D|;-\)|:\)|>:o|>:O/g;

        //Create an array of all file names in the messages directory
        let messageDirectory = "./messages";
        let fileNames = fs.readdirSync(messageDirectory);

        //Create an object containing all objects from the JSON files
        let filesObject = {};
        fileNames.forEach(file => {
            filesObject[file] = require("./messages/"+file);
        });

        //Loop through filesObject and creates messagesData which contains only the desired data from all JSON files in filesObject
        //Remove messages with no text i.e. only media files(undefined), reactions(Reacted), links(https), or emoticons (both sequential or separated by spaces)
        //Create an array for all the words seperately, while stripping them of special characters (except apostrophe), whitespace, newlines, and emoticons
        for(let file in filesObject){
            for(let message of filesObject[file]['messages']){
                //Check if message is undefined, media, reaction, or contains only emoticons and continues if so
                if((message['content'] !== undefined && message['content'].replace(emoticons, '').replace(/\s+/,'') === '') || /^Reacted|https/.test(message['content']) || message['content'] === undefined){
                    continue
                //Add sender and message to messagesData if sender has not been added
                }else if(messagesData[message['sender_name']] === undefined){
                    messagesData[message['sender_name']] = [{date_ms: message['timestamp_ms'], words: message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')}];
                //Add message to messagesData
                }else{
                    messagesData[message['sender_name']] = messagesData[message['sender_name']].concat([{date_ms: message['timestamp_ms'], words: message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').trim().split(' ')}]);
                }
            }
        }
        fs.writeFileSync("./messages/data.JSON", JSON.stringify(messagesData))
    },
    //change to access file not object
    logData: function(){
        if(Object.keys(this.messageData).length === 0){
            console.log('Data has not yet been parsed. Run "messengerAnalyzer.parseFiles()" and try again.');
        }else{
            console.dir(this.messageData, { depth: null });
        }
    },
    rankWords: function(){
        const fs = require("fs");
        if(!fs.existsSync("./messages/data.JSON")){
            this.parseFiles()
        }
        //add rankWords function here
    },
    rankDays: function(){
//add rankDays function here and return the result
    },
    analyzeData: function(startDate, endDate, wordsToSkip){
        this.rankWords();
        this.rankDays();
//Add all analysis functions here
    }
}

messageAnalyzer.parseFiles()


// rankWords: function(data_file){
//     if(dataJSON does not exist){
//         create JSON using .parsefiles
//     } else {
//         let wordInstances = [{word: 'word1', totalNumber: 4}, {word: 'word2', totalNumber: 5}];
//     //add function here to create the wordInstances and then organize it
//     }
// }

//before all else have parse files create the JSON file, and put messenger data object inside that function
//then change logData to check if the JSON data file exists rather than if the messenger data object has a length, maybe instead of an error just have it run it.


//create a different method for each analysis and have analysis method call each one. Each method should return the data and to view it log the analysis method

// loop through if the word exists totalNumber ++ if not then add it. then organize it in another loop

// similar list of objects but for the days of the week. is the ms a monday? if so monday ++. Look up if there is a way to check day of the week for ms time.

//look up best way to organize an array by rank and apply it to my mini objects, by calculating the value of the object first and using that to sort


//add An error has occured message to each function at the end of if else, as a catch all? or maybe it is just needed on the analyze file. Otherwise the data file either exists or it doesn't