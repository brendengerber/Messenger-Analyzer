//add messengerAnalyzer.analyze(startDate, endDate, wordsToSkip)(returns the results) messengerAnalyzer.data() (returns the data) and use let data = this.data in .analyze().
//Use getters and setters, especially for dates since you will need to convert to ms
//add logic to count messages per day average for each sender
//add logic to count the most used words for each sender
//add logic to count total messages sent for each sender
//add all below into a function with parameters "dateStart", "dateEnd", "wordsToOmit" (which is an array of common words like the, a, an and will be used when looping the final words array and counting words "if not in wordsToOmit")
//determine dataset date range and display a message if the range input is outside that range?
//writeFile vs writeFileSync
//change double quotes to singles for consistency 
//This function can save those objects to variables maybe. It would also be nice to create later a csv function that would write the data objects returned by each function.

// **************Need to remove the http replace method and add http back to skipping if at the beginning and then run and compare results to the main branch. If they are the same, remove the http at the beginning and add it where indicated. As of now they do not quite match.  Add back in the original text before parsiing for comparison. Also check for "stickers"


let messageAnalyzer = {
    //* this works almost, but check out the weird numbers when consol logging wordInstances in the rankWords method, why are they getting in there during parseFiles()?  some are coming as part of unicode? some are coming from links after text (such as 14791675), how can I remove those links when regex http trigers? It's important to remove them as they will influence daily and yearly message averages etc.
    //* perhaps remove everything unwanted in the line inside the for loop but before the if statements. For example remove emoji, and urls (from everywhere not just beginning), and then the first if statement can be to continue if it's empty, undefined, or only reacted. Just have to make sure spaces don't slip in somehow. or maybe it can just go into each elseif since emoticons are already there etc.
    //* for example replace all with a space and then trim. if they had only emoticons and links, then they will only be spaces and will trim to nothing and be skipped. Oh the problem is when you try to replace undefined
    parseFiles: function(){
        let messagesData = {};
        //Regex to match current and retired Facebook emoticons as of 01/01/2022
        const emoticons = /O:-\)|O:\)|>:-\(|:42:|:-D|:D|:putnam:|O.o|:'\(|3:-\)|3:\)|=P|B\)|B-\)|8\)|8-\)|>:\(|=\)|<3|:-\/|:-\*|:\*|:3|(Y)|\^_\^|:v|<\("\)|:\|\]|=\(|:\[|:\(|:-\(|\(\^\^\^\)|:-o|:-O|:\]|:-\)|:\)|-_-|:-p|:-P|:p|:P|B\||B-\||8\||8-\||:-o|:-O|:o|:O|:\\|:-\\|:\/|>-:o|>:-O|=D|;-\)|:\)|>:o|>:O/g;
        //Create an array of all file names in the messages directory
        let messageDirectory = "./messages";
        let fileNames = require('fs').readdirSync(messageDirectory);
        //Create an object containing all objects from the JSON files
        let filesObject = {};
        fileNames.forEach(file => {
            filesObject[file] = require("./messages/"+file);
        });
        //Loop through filesObject and creates messagesData which contains only the desired data from all JSON files in filesObject
        //Remove messages with no text i.e. only media files(undefined), reactions(Reacted), links(https), or emoticons (both sequential or separated by spaces)
        //Create an array for all the words seperately, while stripping them of special characters (except apostrophe), whitespace, newlines, emoticons, and capital letters
        //*Should I loop through and add senders as empty objects first like i do in rankWords?
        //*remove 2 instances of message: message[content] for final
        for(let file in filesObject){
            for(let message of filesObject[file]['messages']){
                if(message['content'] !== undefined){
                    message['content'] = message['content'].replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').replace(/LOGIC TO REPLACE HTTP HERE/).toLowerCase().trim()
                }
                //Check if message is undefined, media, reaction, or contains only emoticons and continues if so
                if((message['content'] !== undefined && message['content'].replace(emoticons, '').replace(/\s+/,'') === '') || /^Reacted|http/.test(message['content']) || message['content'] === undefined){
                    continue
                //Add sender and message to messagesData if sender has not been added
                }else if(messagesData[message['sender_name']] === undefined){
                    messagesData[message['sender_name']] = [{message: message[content], dateMs: message['timestamp_ms'], words: message['content'].split(' ')}];
                //Add message to messagesData
                }else{
                    messagesData[message['sender_name']] = messagesData[message['sender_name']].concat([{message: message[content], dateMs: message['timestamp_ms'], words: message['content'].split(' ')}]);
                }
            }
        }
        require('fs').writeFileSync("./data/data.json", JSON.stringify(messagesData));
    },
    logData: function(){
        if(!require('fs').existsSync("./data/data.json")){
            this.parseFiles();
        }
        console.dir(require("./data/data.json"),{ depth: null });
    },










//* this is working (but needs to be ordered still...sort the object's keys by their value)
//* user input needs to be converted to ms and it will work flawlessly
//* need to add words to skip
//* https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
    rankWords: function(startDate, endDate){
        if(!require('fs').existsSync("./data/data.json")){
            this.parseFiles();
        }
        let messageData = require("./data/data.json");
        let wordInstances = {};
        let sortableWordInstances =[];
        for(let sender in messageData){
            wordInstances[sender]={};
        }
        for(let sender in messageData){
            for(let message of messageData[sender]){
                // if(message['dateMs'] >= startDate && message['dateMs' <= endDate]){
                    for(let word of message['words']){
                       if(word in wordInstances[sender]){
                           wordInstances[sender][word] = wordInstances[sender][word] + 1;
                       }else{
                           wordInstances[sender][word] = 1
                       }
                    }
                // }
            }
        }
        console.log(wordInstances)
    },










    rankDays: function(){
//*add rankDays function here and return the result
    },
//*This should run all the functions and then display them in a really nice and easy to read multi line string. The functions themselves should return the data objects. 
    analyzeData: function(startDate, endDate, wordsToSkip){
        this.rankWords();
        this.rankDays();
// *Add all analysis functions here
    }
}
// messageAnalyzer.rankWords(0,100000000000000000000000)
messageAnalyzer.parseFiles()


// //create a different method for each analysis and have analysis method call each one. Each method should return the data and to view it log the analysis method

// // loop through if the word exists totalNumber ++ if not then add it. then organize it in another loop

// // similar list of objects but for the days of the week. is the ms a monday? if so monday ++. Look up if there is a way to check day of the week for ms time.

// //look up best way to organize an array by rank and apply it to my mini objects, by calculating the value of the object first and using that to sort


// //add An error has occured message to each function at the end of if else, as a catch all? or maybe it is just needed on the analyze file. Otherwise the data file either exists or it doesn't



