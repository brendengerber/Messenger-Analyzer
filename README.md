# **Facebook Messenger Analyzer**
## **Desctiption**
This simple script will allow you to conduct a simple analysis of your messenger history with a specific person. I was originally inspired to create this as a Valentine's Day gift for my wife who is currently learning how to code. I used the data to create a visual representation of the data from 3 years before and after our wedding to illustrate how our relationship has changed. Glossy photo paper and a simple frame and voilà, a great Valentine's Day gift!
## **Usage**

1. Download the JSON file containing your messenger data.
    * Proceed to Facebook's download [page](https://www.facebook.com/dyi)
    * Change "format" to "JSON"
    * Change Media Quality to "Low" (decreased file size)
    * Click "Request a downnload"

2. You will be sent an email to confirm the request and a second email when your request is ready to download. Remember the file will only be available for a few days before you will have to resubmit the request.

3. In your newly downloaded zipfile, navigate to messages/inbox/ and open the desired conversation.

4. Copy the JSON files and paste them into messengerAnalyzer/messages/. Make sure to delete the placeholder file.

5. Run messengerAnalyzer.js in Node.js to log an easy to read breakdown of the analyzed data to the console. If you need to download Node.js visit [their](https://nodejs.org/en/) website.

6. For more detailed information such as optional parameters, see comments in messengerAnalyzer.js.

7. If you would like to analyze a new conversation, don't forget to delete data.json in the data directory as well as the old message JSON files.

## **Credits**
Thanks [Thu Smiley](https://github.com/thusmiley/) for contributing your share of the data and for being a wonderful wife. And thanks for all the words my love!

## **License**
GNU General Public License v3.0, see COPYING.txt for complete document.
