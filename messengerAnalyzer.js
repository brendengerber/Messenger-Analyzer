//https://stackoverflow.com/questions/20630676/how-to-group-objects-with-timestamps-properties-by-day-week-month/38896252
//convert standard to unix using moment
//is the reason the conversion is coming out wrong because the timestamp was converted to local time already? that could make it easier, https://www.epochconverter.com/timezones
//otherwise convert it and then sort it
//it appears as if the timestamp is local time
//https://stackoverflow.com/questions/45973081/how-do-i-convert-the-timestamp-of-facebook-message-object
//Times for messenger are for the time zone where you were when you downloaded the data, if you have changed timezones then you may need to convert the time/date you enter to reflect that
//https://www.timeanddate.com/worldclock/converter.html?iso=20220205T070000&p1=142&p2=218
//Here is a handy tool. Just enter the time in the other zone that you want to use, and then use the time displayed for your local time in this script
//make a method using moment to convert the time which can also be used multiple times within other functions to convert the optional time zone parameter.


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
        //Add 'participants' from each file to messagesData as 'sender'
        for(let file in filesObject){
            for(let participant of filesObject[file]['participants']){
                messagesData[participant['name']] = []
            }
        }
        //Loop through filesObject and add only the desired data from all JSON files in filesObject to messagesData
        for(let file in filesObject){
            for(let message of filesObject[file]['messages']){
                //Format message content by removing 'Reacted' dialog, emoticons, special characters (excluding apostrophes), and URLs as well as trimming whitespace and setting to lower case letters (replaces with spaces rather than empty string as it does not remove other content which will be parsed in the next if...else statement and this prevents content from running together)
                if(message['content'] !== undefined){
                    message['content'] = message['content'].replace(/(?:https?|ftp):\/\/[\S]+/g, ' ').replace(/^Reacted.*to your message $/, ' ').replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').toLowerCase().trim()
                }
                //Check if message is undefined, empty, or of the wrong type (i.e. share) and continues if so  
                if( message['content'] === '' || message['content'] === undefined || message['type'] !== 'Generic') {
                    continue
                //Add message to messagesData as an array of seperate words
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
    convertDate: function(){
//*Add date timezone conversion function here
    },
    //Count the messages sent by each sender as well as the total
    countMessages: function(startDate = 0 - Infinity, endDate = Infinity){
        this.checkForDataFile();
        let messageData = require('./data/data.json');
        let messageCounts = {};
        //Add senders to messageCounts object and sets count to 0
        for(let sender in messageData){
            messageCounts[sender] = 0;
        }
        //Increments the counter for each message sent by each sender
        for(let sender in messageData){
            for(let message of messageData[sender]){
                if(message['dateMs'] >= startDate && message['dateMs'] <= endDate){
                    messageCounts[sender] += 1;
                }
            }
        }
        //Calculate the total combined messages sent
        let total = 0;
        for(let sender in messageCounts){
            total += messageCounts[sender];
        }
        messageCounts['total'] = total;
        return messageCounts
    },
    //Rank words of each sender based usage and order them in decending order
    rankWords: function(startDate = 0 - Infinity, endDate = Infinity, wordsToSkip = []){
        this.checkForDataFile();
        let messageData = require('./data/data.json');
        let wordInstances = {};
        let sortedWordInstances = {};
        //Add senders to wordInstances object
        for(let sender in messageData){
            wordInstances[sender] = {};
        }
        //Add words to wordInstances and increment the counter if the word is already present
        for(let sender in messageData){
            for(let message of messageData[sender]){
                if(message['dateMs'] >= startDate && message['dateMs'] <= endDate){
                    for(let word of message['words']){
                        if(wordsToSkip.includes(word)){
                            continue
                        }else if(word in wordInstances[sender]){
                           wordInstances[sender][word] = wordInstances[sender][word] + 1;
                       }else{
                           wordInstances[sender][word] = 1;
                       }
                    }
                }
            }
        }
        //converts the objects for each sender into a sortable array and sorts the words in decending order by the number of times they were sent
        for(sender in wordInstances){
            sortedWordInstances[sender] = Object.entries(wordInstances[sender]).sort((a,b)=> b[1] - a[1]);
        }
        return sortedWordInstances;
    },
    //Calculate the average number of words per message for each sender
    averageWords: function(startDate = 0 - Infinity, endDate = Infinity){
        this.checkForDataFile();
        let messageData = require('./data/data.json');
        let averageWordsPerMessage = {};
        //Add senders to AverageWordsPerMessage object
        for(let sender in messageData){
            averageWordsPerMessage[sender] = {};
        }
        //Increment the word and message counters for each sender and calculate the average words per message
        for(let sender in messageData){
            let totalMessages = 0;
            let totalWords = 0;
            for(let message of messageData[sender]){
                if(message['dateMs'] >= startDate && message['dateMs'] <= endDate){
                    totalMessages += 1;
                    for(word of message['words']){
                        totalWords += 1;
                    }
                }
                averageWordsPerMessage[sender] = totalWords / totalMessages;
            }
        }
        return averageWordsPerMessage
    },
    //Calculate the number of messages sent each day of the week by each sender
    rankDays: function(startDate = 0 - Infinity, endDate = Infinity, timeZone = undefined){
        const moment = require("./node_modules/moment")
        this.checkForDataFile();
        let messageData = require('./data/data.json');
        let rankedDays = {};
        //Add senders to rankedDays object
        for(let sender in messageData){
            rankedDays[sender] = {Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday:0}
        }
        //Loop through all messages for each sender, access the timestamp property, and increment the appropriate day of the week
        for(let sender in messageData){
            for(let message of messageData[sender]){
                if(message['dateMs'] >= startDate && message['dateMs'] <= endDate){
                    let day = moment.unix(message['dateMs']/1000).isoWeekday();
                    switch (day){
                        case 1:
                            rankedDays[sender]['Monday'] += 1;
                            break;
                        case 2:
                            rankedDays[sender]['Tuesday'] += 1;
                            break;  
                        case 3:
                            rankedDays[sender]['Wednesday'] += 1;
                            break;
                        case 4:
                            rankedDays[sender]['Thursday'] += 1;
                            break;
                        case 5:
                            rankedDays[sender]['Friday'] += 1;
                            break;   
                        case 6:
                            rankedDays[sender]['Saturday'] += 1;
                            break;
                        case 7:
                            rankedDays[sender]['Sunday'] += 1;
                            break;
                    }

                }
            }
        }
        return rankedDays
    },

//*This should run all the functions and then display them in a really nice and easy to read multi line string. The functions themselves should return the data objects. This might show less than the data objects, for example only the top 10 most used words. 
//*set defaults for variables?
    analyzeData: function(startDate = 0 - Infinity, endDate = Infinity, wordsToSkip = []){
        this.rankWords(startDate, endDate, wordsToSkip);
        this.countMessages(startDate, endDate, wordsToSkip);
        this.rankDays();
// *Add all analysis functions here
    }
}


console.log(messageAnalyzer.rankDays())
// console.log(messageAnalyzer.averageWords(1642375751538,1642375757314))
// console.log(messageAnalyzer.rankWords('16 January 2022 17:29:11', 'Sun 16 January 2022 17:29:17', ['the', 'a', 'an', 'and', 'or', 'to', 'for', 'in']))
// console.log(messageAnalyzer.rankWords(1642375751538, 1642375757314, ['the', 'a', 'an', 'and', 'or', 'to', 'for', 'in']))
// console.log(messageAnalyzer.countWords(1642375751538, 1642375757314))
// console.log(messageAnalyzer.countMessages())

// console.log(Date.parse('Sun, 16 Jan 2022 23:29:17 GMT'))
// console.log(new Date().toUTCString())


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
//descrpitions for parameters

// // add a method to check the count for a specific word checkCount(word)

// //create a different method for each analysis and have analysis method call each one. Each method should return the data and to view it log the analysis method

// // similar list of objects but for the days of the week. is the ms a monday? if so monday ++. Look up if there is a way to check day of the week for ms time.

// //add An error has occured message to each function at the end of if else, as a catch all? or maybe it is just needed on the analyze file. Otherwise the data file either exists or it doesn't
//error message for invalid date
//luckily parse does catch her =.= but only because it's symbols, not because it's emoji, any way to catch everything that even might include letters like o.o

//useful discussion
// https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
//https://stackoverflow.com/questions/20630676/how-to-group-objects-with-timestamps-properties-by-day-week-month/38896252


