//add messengerAnalyzer.analyze(startDate, endDate, wordsToSkip)(returns the results) messengerAnalyzer.data() (returns the data) and use let data = this.data in .analyze().
//Use getters and setters, especially for dates since you will need to convert to ms
//add logic to count messages per day average for each sender
//add logic to count the most used words for each sender
//add logic to count total messages sent for each sender
//add all below into a function with parameters 'dateStart', 'dateEnd', 'wordsToOmit' (which is an array of common words like the, a, an and will be used when looping the final words array and counting words 'if not in wordsToOmit')
//determine dataset date range and display a message if the range input is outside that range?
//writeFile vs writeFileSync
//This function can save those objects to variables maybe. It would also be nice to create later a csv function that would write the data objects returned by each function.
//is there a way to create a new data file if things have changed?



let messageAnalyzer = {
    parseFiles: function(){
        let messagesData = {};
        //Regex to match current and retired Facebook emoticons (not emoji) as of 01/01/2022
        const emoticons = /O:-\)|O:\)|>:-\(|:42:|:-D|:D|:putnam:|O.o|:'\(|3:-\)|3:\)|=P|B\)|B-\)|8\)|8-\)|>:\(|=\)|<3|:-\/|:-\*|:\*|:3|\(Y\)|\(y\)|\^_\^|:v|<\("\)|:\|\]|=\(|:\[|:\(|:-\(|\(\^\^\^\)|:-o|:-O|:\]|:-\)|:\)|-_-|:-p|:-P|:p|:P|B\||B-\||8\||8-\||:-o|:-O|:o|:O|:\\|:-\\|:\/|>-:o|>:-O|=D|;-\)|:\)|>:o|>:O/g;
        //Create an array of all file names in the messages directory
        let messageDirectory = './messages';
        let fileNames = require('fs').readdirSync(messageDirectory);
        //Create an object containing all objects from the JSON files
        let filesObject = {};
        fileNames.forEach(file => {
            filesObject[file] = require('./messages/'+ file);
        });
        //Loop through filesObject and creates messagesData which contains only the desired data from all JSON files in filesObject
        //Remove messages with no text i.e. only media files(undefined), reactions(Reacted), links(https), or emoticons (both sequential or separated by spaces)
        //Create an array of all individual words for each message, while stripping them of special characters (except apostrophe), whitespace, newlines, emoticons, and capital letters
        //* luckily this does catch her =.= but only because it's symbols, not because it's emoji, any way to catch everything that even might include letters like o.o
        //Add 'participants' from each file to messagesData as 'sender'
        for(let file in filesObject){
            for(let participant of filesObject[file]['participants']){
                messagesData[participant['name']] = []
            }
        }
        for(let file in filesObject){
            for(let message of filesObject[file]['messages']){
                //Format message content by removing 'Reacted' dialog, emoticons, special characters (excluding apostrophes), and URLs as well as trimming whitespace and setting to lower case letters (replaces with spaces rather than empty string as it does not remove other content which will be parsed in the next if...else statement and this prevents content from running together)
                if(message['content'] !== undefined){
                    message['content'] = message['content'].replace(/(?:https?|ftp):\/\/[\S]+/g, ' ').replace(/^Reacted.*to your message $/, ' ').replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').toLowerCase().trim()
                }
                //Check if message is undefined, empty, or of the wrong type (i.e. share) and continues if so  
                if( message['content'] === '' || message['content'] === undefined || message['type'] !== 'Generic') {
                    continue
                //Add message to messagesData
                }else{
                    messagesData[message['sender_name']] = messagesData[message['sender_name']].concat([{dateMs: message['timestamp_ms'], words: message['content'].split(' ')}]);
                }
            }
        }
        //Create a JSON file to avoid the lengthy parsing process if doing multiple analytics
        require('fs').writeFileSync('./data/data.json', JSON.stringify(messagesData));
    },
    //Check if data file exists and creates it if not
    checkForDataFile: function(){
        if(!require('fs').existsSync('./data/data.json')){
            this.parseFiles();
        }
    },
    //Log data file, useful for examining raw data
    logData: function(){
        this.checkForDataFile();
        console.dir(require('./data/data.json'),{ depth: null });
    },
    //Count the messages sent by each sender as well as the total
    countWords: function(startDate, endDate){
        this.checkForDataFile();
        let messageData = require('./data/data.json');
        let wordCounts = {};
        for(let sender in messageData){
            wordCounts[sender] = 0;
        }
        for(let sender in messageData){
            for(let message of messageData[sender]){
                if(message['dateMs'] >= startDate && message['dateMs'] <= endDate){
                    wordCounts[sender] += 1
                }
            }
        }
        let total = 0;
        for(let sender in wordCounts){
            total += wordCounts[sender];
        }
        wordCounts['total'] = total
        return wordCounts
    },
    









//* this is working (but needs to be ordered still...sort the object's keys by their value)
//* user input needs to be converted to ms and it will work flawlessly
//* need to add words to skip
//* https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
//* set defaults for dates?
//* Times in messenger are already converted to UTC, dates parsed without timezone are assumed to be UTC as well?
    rankWords: function(startDate, endDate, wordsToSkip){
        this.checkForDataFile();
        let messageData = require('./data/data.json');
        let wordInstances = {};
        let sortableWordInstances = [];
        for(let sender in messageData){
            wordInstances[sender] = {};
        }
        for(let sender in messageData){
            for(let message of messageData[sender]){
                if(message['dateMs'] >= startDate && message['dateMs'] <= endDate){
                    for(let word of message['words']){
                       if(word in wordInstances[sender]){
                           wordInstances[sender][word] = wordInstances[sender][word] + 1;
                       }else{
                           wordInstances[sender][word] = 1
                       }
                    }
                }
            }
        }
        console.log(wordInstances)
    },










    rankDays: function(){
//*add rankDays function here and return the result
    },
//*This should run all the functions and then display them in a really nice and easy to read multi line string. The functions themselves should return the data objects. This might show less than the data objects, for example only the top 10 most used words. 
//*set defaults for variables?
    analyzeData: function(startDate, endDate, wordsToSkip){
        this.rankWords();
        this.rankDays();
// *Add all analysis functions here
    }
}
messageAnalyzer.logData()
console.log(messageAnalyzer.countWords(1642375751538, 1642375757314))




// //create a different method for each analysis and have analysis method call each one. Each method should return the data and to view it log the analysis method

// // loop through if the word exists totalNumber ++ if not then add it. then organize it in another loop

// // similar list of objects but for the days of the week. is the ms a monday? if so monday ++. Look up if there is a way to check day of the week for ms time.

// //look up best way to organize an array by rank and apply it to my mini objects, by calculating the value of the object first and using that to sort

// //add An error has occured message to each function at the end of if else, as a catch all? or maybe it is just needed on the analyze file. Otherwise the data file either exists or it doesn't



