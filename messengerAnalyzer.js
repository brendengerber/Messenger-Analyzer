
//https://stackoverflow.com/questions/45973081/how-do-i-convert-the-timestamp-of-facebook-message-object
//https://www.timeanddate.com/worldclock/converter.html?iso=20220205T070000&p1=142&p2=218
//Here is a handy tool. Just enter the time in the other zone that you want to use, and then use the time displayed for your local time in this script
//make a method using moment to convert the time which can also be used multiple times within other functions to convert the optional time zone parameter.

//*check require are they const or let? make sure the same. For example message data could be const right?

//times in messenger are stored in UTC and moment automatically converts it to local timezone
//*the .utc() method keeps it as is
//*If you want to analyze for any other time besides the local time include a timezone parameter which will be input into the moment function

//start time Dec 04, 2013 11:00
//end time Dec 05, 2017 10:59

//start time Dec 04, 2013 11:00
//end time Dec 05, 2021 10:59

//is there a way to use the default parameters, and then enter the last one manually?

//add date formatting and date formatting/timezone comment info


//If no time zone is specified, calculations will be done in local time
//If no date range is given the entire conversation history will be analyzed
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
    //Convert date range timestamp and converts to different timezone if necessary
    //*How to handle default infinit statements here
    setDates: function(startDate, endDate, timezone){
        if(startDate === 'infinity' && endDate === 'infinity'){
            startDate = 0 - Infinity
            endDate = Infinity
        } else if (startDate !== 'infinity' && endDate === 'infinity' && timezone === undefined){
            startDate = moment(startDate, "M/D/YYYY H:mm:ss").valueOf()
            endDate = Infinity
        } else if (startDate === 'infinity' && endDate !== 'infinity' && timezone === undefined){
            startDate = 0 - Infinity
            endDate = moment(endDate, "M/D/YYYY H:mm:ss").valueOf()
        } else if (startDate !== 'infinity' && endDate !== 'infinity' && timezone === undefined){
            startDate = moment(startDate, "M/D/YYYY H:mm:ss").valueOf()
            endDate = moment(endDate, "M/D/YYYY H:mm:ss").valueOf()
        } else if (startDate !== 'infinity' && endDate === 'infinity' && timezone !== undefined){
            startDate = moment.tz(startDate, "M/D/YYYY H:mm:ss", timezone).valueOf()
            endDate = Infinity
        } else if (startDate === 'infinity' && endDate !== 'infinity' && timezone !== undefined){
            startDate = 0 - Infinity
            endDate = moment.tz(endDate, "M/D/YYYY H:mm:ss", timezone).valueOf()
        } else if (startDate !== 'infinity' && endDate !== 'infinity' && timezone !== undefined){
            startDate = moment.tz(startDate, "M/D/YYYY H:mm:ss", timezone).valueOf()
            endDate = moment.tz(endDate, "M/D/YYYY H:mm:ss", timezone).valueOf()
    
        }
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
    //*Can I change UTC to "local time"
    rankDays: function(startDate = 0 - Infinity, endDate = Infinity, timezone = undefined){
        const moment = require('moment-timezone');
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
                    //Determine day of the week that the message was sent (including timezone if necessary)
                    let day = undefined
                    if(timezone === undefined){
                        day = moment(message['dateMs']).isoWeekday();
                    } else {
                        day = moment.tz(message['dateMs'], timezone).isoWeekday();
                    }
                    switch(day){
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
        //Calculate the total for each day of the week
        let total = {Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday:0}
        for(let sender in rankedDays){
            for(day in rankedDays[sender]){
                total[day] += rankedDays[sender][day]
            }
        }
        rankedDays['total'] = total
        return rankedDays
    },

//*This should run all the functions and then display them in a really nice and easy to read multi line string. The functions themselves should return the data objects. This might show less than the data objects, for example only the top 10 most used words. 
//*set defaults for variables?
    analyzeData: function(startDate = 0 - Infinity, endDate = Infinity, wordsToSkip = []){
        let string = ''
        let rankedWords = this.rankWords(startDate, endDate, wordsToSkip);
        //* loop and add formatted string for each sender including \n.
        let countedMessages = this.countMessages(startDate, endDate, wordsToSkip);
        let rankedDays = this.rankDays();
        let averagedWords = this.averageWords();
        console.log(string);
// *Add all analysis functions here
    }
}


console.log(messageAnalyzer.rankDays())


//create "data" directory when parsing, that makes it easier if you want to analyzer a different convo, you can just delete everything in messages directory
//
//add timezone support
//add messengerAnalyzer.analyze(startDate, endDate, wordsToSkip)(returns the results) messengerAnalyzer.data() (returns the data) and use let data = this.data in .analyze().
//Use getters and setters, especially for dates since you will need to convert to ms
//determine dataset date range and display a message if the range input is outside that range?
//writeFile vs writeFileSync
//This function can save those objects to variables maybe. It would also be nice to create later a csv function that would write the data objects returned by each function.
//is there a way to create a new data file if things have changed?
//descrpitions for parameters

// // add a method to check the count for a specific word checkCount(word)

// //create a different method for each analysis and have analysis method call each one. Each method should return the data and to view it log the analysis method

// //add An error has occured message to each function at the end of if else, as a catch all? or maybe it is just needed on the analyze file. Otherwise the data file either exists or it doesn't
//error message for invalid date
//luckily parse does catch her =.= but only because it's symbols, not because it's emoji, any way to catch everything that even might include letters like o.o

//useful discussion
//https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
//https://stackoverflow.com/questions/20630676/how-to-group-objects-with-timestamps-properties-by-day-week-month/38896252


