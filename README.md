# Babel

Babel is an application I created as a submission to the 2017 DeveloperWeek Hackathon in San Francisco in response to a challenge created by [Flock](https://www.flock.co/). The challenge was to create an application that added functionality to their team messenger platform. The Babel application utilizes the Microsoft Translation API to add translation functionality.

## Features

* Provides users with a slash command that enables them to choose the target translation language.
* Node JS back-end integrates with a PostgreSQL database to store user data and settings.

## Code Samples

Function using event data from the Flock API to retrieve and translate the messages:

```javascript
const retrieveUserMessages = (event, callback) => {
  db.one('select * from users where userid = $1', event.userId)
  .then((user) => {
    flock.chat.fetchMessages(user.token, {
      chat: event.chat,
      uids: event.messageUids
    }, (error, messages) => {
      if (error) {
        console.warn(error);
        callback(error);
      } else {
        translateMessages(messages, user);
      }
    });
  });
}
```
Function to translate messages and return to Flock:

```javascript
const translateMessages = (messages, user) => {
  for (var i = 0; i < messages.length; i++) {
    var params = {
      text: messages[i].text,
      to: user.language
    };
    client.translate(params, function(err, data) {
      sendTranslation(messages[i].text, data, user, user.language);
    });
  }
}
```

## Languages, Frameworks, Libraries, Etc.

* Express
* NodeJS
* PostgreSQL
* NPM Packages
  * pg-promise
  * bluebird
