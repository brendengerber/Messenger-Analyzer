//For a simple easy to read log of the analyzed data run messageAnalyzer.logAnalyzedData()
//Optional parameters in order are start date, end date, timezone, and words to skip

//If no date range is given the entire conversation history will be analyzed
//If no time zone is specified, calculations will be done in local time
//Dates should be entered as strings in the following format 'M/D/YYYY H:mm:ss'
//Timezones should be entered as strings such as 'America/Chicago' or 'Asia/Ho_Chi_Minh'
//A full list of timezones is available at https://momentjs.com/timezone/ or in the timezonesStrings.txt file
//Words to skip should be entered as an empty array of strings

//If you would like to analyze a new conversation, delete all old message JSON files as well as the data directory
let messageAnalyzer = {
    parseFiles: function(){
        let messagesData = {};
        //Regex to match current and retired Facebook emoticons (not emoji) as of 01/01/2022
        const emoticons = /O:-\)|O:\)|>:-\(|:42:|:-D|:D|:putnam:|O.o|:'\(|3:-\)|3:\)|=P|B\)|B-\)|8\)|8-\)|>:\(|=\)|<3|:-\/|:-\*|:\*|:3|\(Y\)|\(y\)|\^_\^|:v|<\("\)|:\|\]|=\(|:\[|:\(|:-\(|\(\^\^\^\)|:-o|:-O|:\]|:-\)|:\)|-_-|:-p|:-P|:p|:P|B\||B-\||8\||8-\||:-o|:-O|:o|:O|:\\|:-\\|:\/|>-:o|>:-O|=D|;-\)|:\)|>:o|>:O/g;
        //Create an array of all file names in the messages directory
        let messageDirectory = './messages';
        const fileNames = require('fs').readdirSync(messageDirectory);
        //Create an object containing all objects from the JSON files
        let filesObject = {};
        fileNames.forEach(file => {
            filesObject[file] = require('./messages/'+ file);
        });
        //Add 'participants' from each file to messagesData as 'sender'
        for(let file in filesObject){
            for(let participant of filesObject[file]['participants']){
                messagesData[participant['name']] = [];
            }
        }
        //Loop through filesObject and add only the desired data from all JSON files in filesObject to messagesData
        for(let file in filesObject){
            for(let message of filesObject[file]['messages']){
                //Format message content by removing 'Reacted' dialog, emoticons, special characters (excluding apostrophes), and URLs as well as trimming whitespace and setting to lower case letters (replaces with spaces rather than empty string as it does not remove other content which will be parsed in the next if...else statement and this prevents content from running together)
                if(message['content'] !== undefined){
                    message['content'] = message['content'].replace(/(?:https?|ftp):\/\/[\S]+/g, ' ').replace(/^Reacted.*to your message $/, ' ').replace(emoticons, ' ').replace(/(?!')\W+/g, ' ').toLowerCase().trim();
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
        require('fs').mkdirSync('./messages/data');
        require('fs').writeFileSync('./messages/data/data.json', JSON.stringify(messagesData));
    },
    //Check if data file exists and creates it if not
    checkForDataFile: function(){
        if(!require('fs').existsSync('./messages/data/data.json')){
            this.parseFiles();
        }
    },
    //Log data file, useful for examining raw data
    logData: function(){
        this.checkForDataFile();
        console.dir(require('./messages/data/data.json'),{ depth: null });
    },
    //Convert date range to timestamp and converts to different timezone if necessary    
    setDates: function(date, timezone){
        const moment = require('moment-timezone')
        let convertedDate = undefined;
        if(date === 'start'){
            convertedDate = 0 - Infinity;
        }else if(date === 'end'){
            convertedDate = Infinity;
        }else if(date !== 'start' && date !== 'end' && timezone === 'local'){
            convertedDate = moment(date, 'M/D/YYYY H:mm:ss').valueOf();
        }else if(date !== 'start' && date !== 'end' && timezone !== 'local'){
            convertedDate = moment.tz(date, 'M/D/YYYY H:mm:ss', timezone).valueOf();
        } 
        return convertedDate
    },
    //Count the messages sent by each sender as well as the total
    countMessages: function(startDate = 'start', endDate = 'end', timezone = 'local'){
        this.checkForDataFile();
        const messageData = require('./messages/data/data.json');
        let messageCounts = {};
        convertedStartDate = this.setDates(startDate, timezone);
        convertedEndDate = this.setDates(endDate, timezone);
        //Add senders to messageCounts object and sets count to 0
        for(let sender in messageData){
            messageCounts[sender] = 0;
        }
        //Increments the counter for each message sent by each sender
        for(let sender in messageData){
            for(let message of messageData[sender]){
                if(message['dateMs'] >= convertedStartDate && message['dateMs'] <= convertedEndDate){
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
    rankWords: function(startDate = 'start', endDate = 'end', timezone = 'local', wordsToSkip = []){
        this.checkForDataFile();
        const messageData = require('./messages/data/data.json');
        let wordInstances = {};
        let sortedWordInstances = {};
        convertedStartDate = this.setDates(startDate, timezone);
        convertedEndDate = this.setDates(endDate, timezone);
        //Add senders to wordInstances object
        for(let sender in messageData){
            wordInstances[sender] = {};
        }
        //Add words to wordInstances and increment the counter if the word is already present
        for(let sender in messageData){
            for(let message of messageData[sender]){
                if(message['dateMs'] >= convertedStartDate && message['dateMs'] <= convertedEndDate){
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
    averageWords: function(startDate = 'start', endDate = 'end', timezone = 'local'){
        this.checkForDataFile();
        const messageData = require('./messages/data/data.json');
        let averageWordsPerMessage = {};
        convertedStartDate = this.setDates(startDate, timezone);
        convertedEndDate = this.setDates(endDate, timezone);        
        //Add senders to AverageWordsPerMessage object
        for(let sender in messageData){
            averageWordsPerMessage[sender] = {};
        }
        //Increment the word and message counters for each sender and calculate the average words per message
        for(let sender in messageData){
            let totalMessages = 0;
            let totalWords = 0;
            for(let message of messageData[sender]){
                if(message['dateMs'] >= convertedStartDate && message['dateMs'] <= convertedEndDate){
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
    rankDays: function(startDate = 'start', endDate = 'end', timezone = 'local'){
        const moment = require('moment-timezone');
        this.checkForDataFile();
        convertedStartDate = this.setDates(startDate, timezone);
        convertedEndDate = this.setDates(endDate, timezone);           
        const messageData = require('./messages/data/data.json');
        let rankedDays = {};
        //Add senders to rankedDays object
        for(let sender in messageData){
            rankedDays[sender] = {Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday:0};
        }
        //Loop through all messages for each sender, and increment the appropriate day of the week
        for(let sender in messageData){
            for(let message of messageData[sender]){
                if(message['dateMs'] >= convertedStartDate && message['dateMs'] <= convertedEndDate){
                    //Determine day of the week that the message was sent (including timezone if necessary)
                    let day = undefined
                    if(timezone === 'local'){
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
        let total = {Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday:0};
        for(let sender in rankedDays){
            for(day in rankedDays[sender]){
                total[day] += rankedDays[sender][day]
            }
        }
        rankedDays['total'] = total;
        return rankedDays
    },
    //Log an easy to read summary of the analyzed data
    logAnalyzedData: function(startDate, endDate, timezone, wordsToSkip){
        this.checkForDataFile()
        let string = ''
        //Create a string for countMessages method
        string = string.concat('**MESSAGES SENT**\n' + '-'.repeat(17) + '\n');
        let countedMessages = this.countMessages(startDate, endDate, timezone);
        for(let sender in countedMessages){
            if(sender !== 'total'){
                string = string.concat(`Total messages sent by ${sender}: ${countedMessages[sender]}\n`);
            }else{
                string = string.concat(`Total messages sent: ${countedMessages['total']}\n`);
            }
        }
        //Create a string for averageWords method
        string = string.concat('\n\n**AVERAGE MESSAGE LENGTH**\n' + '-'.repeat(26) + '\n');
        let averageWords = this.averageWords(startDate, endDate, timezone);
        for(sender in averageWords){
            string = string.concat(`${sender}'s average message length: ${averageWords[sender]}\n`);
        }
        //Create a string for rankedWords method
        string = string.concat('\n\n**MOST SENT WORDS**\n' + '-'.repeat(19) + '\n');
        let rankedWords = this.rankWords(startDate, endDate, timezone, wordsToSkip);
        for(let sender in rankedWords){
            string = string.concat(`${sender}'s top ten most sent words: \n`);
            for(let i=0; i < 10; i++ ){
                string = string.concat(`     ${rankedWords[sender][i][0]}: ${rankedWords[sender][i][1]}\n`);
            }
            string = string.concat('\n');
        }
        //Create a string for rankDays method
        string = string.concat('\n**MESSAGES SENT BY DAY**\n' + '-'.repeat(24) + '\n');
        let rankedDays = this.rankDays(startDate, endDate, timezone);
        for(let sender in rankedDays){
            if(sender !== 'total'){
                string = string.concat(`Words sent by ${sender}:\n`);
                for(let day in rankedDays[sender]){
                    string = string.concat(`     ${day}: ${rankedDays[sender][day]}\n`);
                }
                string = string.concat('\n');
            }else{
                string = string.concat(`Words sent in ${'total'}:\n`);
                for(let day in rankedDays[sender]){
                    string = string.concat(`     ${day}: ${rankedDays['total'][day]}\n`);
                }
            }
        }
        console.log(string);
    }
}

messageAnalyzer.logAnalyzedData()