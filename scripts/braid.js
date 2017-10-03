/* jslint node: true */

// How to do user buttons in Slack
// https://github.com/slackapi/hubot-slack/issues/316

// Random fake o'reilly
// https://imgur.com/gallery/vqUQ5

"use strict";

var GoogleSpreadsheet = require("google-spreadsheet");
var Conversation = require("hubot-conversation");
var Auth = require("./braid-4cd2635a1fa0.json");

function updateSpreadsheet(row) {
  var doc = new GoogleSpreadsheet("1zLEbOqsqPUb4XS5ByM5PaPzgmGptl9iiIgOUlAx6-ig");
  var sheet;

  doc.useServiceAccountAuth(Auth, function(err) {
    doc.getInfo(function(err, info) {
      sheet = info.worksheets[0];
      sheet.addRow(row, function(err, row) {});
    });
  });
}

// match[0] returns "{string}" in terminal but "bluebot {string}" on slack
function stripHandle(text) {
  if (text.includes("bluebot")) text = text.slice(8);
  return text;
}

module.exports = function(robot) {
  var switchBoard = new Conversation(robot);

  robot.respond(/hey|hi|hello/i, function(res) {
    res.send("Hello!");
  });

  // If I say start
  robot.hear(/braid start/i, function(res) {
    var dialog = switchBoard.startDialog(res, 300000);
    var row = {};

    dialog.dialogTimeout = function(res) {
      // Times out after 5 minutes
      res.send("Sorry, I was timed out! You can type `braid start` to start over.");
    };

    // The bot says "Before we get started, I wanted to make sure you knew Braid currently only supports neighborhoods in San Francisco. "
    var text = "Welcome to Braid! Braid is a service inspired by the now defunct Weave (RIP) that brings awesome people together over coffee."
             + "\nYou can think of us as a networking service, or a channel for connecting with friends you haven't met yet."
             + "\nBefore we get started, I wanted to make sure you knew Braid currently only supports neighborhoods in San Francisco."
             + "\nIs that okay?";
    res.send(text);

    // If NO, ask what city they live in
    // dialog.addChoice(/no/i, function (res) {
      // Ask if they want to be notified/help run it
      // res.send("Ah! Where do you live?");
    // });

    // If YES, proceed
    dialog.addChoice(/yes|ok/i, function (res) {
      row.city = "San Francisco";

      // What days and times are you free to meet? All meetings are 30 minutes by default.
      var text = "Great! What days and times are you free to meet? All meetings are 30 minutes by default."
               + "\nYou can say something like '9am M/W/F' or 'Anytime before 1030'."
               + "\nWeekdays before 11am only please.";
      res.send(text);
      // This should be a checkbox tbh

      dialog.addChoice(/.*/, function(res) {
        var availability = stripHandle(res.match[0]);
        row.availability = availability;
        // And what neighborhoods work for you?
        // Like 5-7 neighborhoods
        var text = "Ok, your availability is \"" + availability + "\""
                 + "\nAnd what neighborhoods work for you?"
                 + "\nYou can say something like 'SoMa and Pac Heights' or 'Anywhere east of Hayes Valley'";

        res.send(text);

        dialog.addChoice(/.*/, function(res) {
          var neighborhoods = stripHandle(res.match[0]);
          var text = "You're good to meet in \"" + neighborhoods + "\", got it."
                   + "\nWhat name should we use when referring to you?";
          row.neighborhoods = neighborhoods;
          res.send(text);

          dialog.addChoice(/.*/, function(res) {
            var name = stripHandle(res.match[0]);
            var text = "Nice to meet you, " + name + "!"
                     + "\nFinally, how would you describe yourself to the people we end up matching you with?"
                     + "\nThink tweet-length (new or old is fine), some examples:"
                     + "\n'I write about tech and the internet at @BuzzFeedNews. Co-host of @iexplorer podcast'"
                     + "\n'Indoor enthusiast. Co-founder of @StackOverflow and @discourse.'";
            row.name = name;
            res.send(text);

            dialog.addChoice(/.*/, function(res) {
              var profile = stripHandle(res.match[0]);
              var text = "Ok!"
                       + "\nLast step! We need to pass contact info along to whoever we match you with. What's your email?";
              row.profile = profile;
              res.send(text);

              // Contact info?
              // We're going to support messages in this channel eventually but let's start with email/phone
              dialog.addChoice(/.*/, function(res) {
                var email = stripHandle(res.match[0]);
                row.email = email;
                updateSpreadsheet(row);

                // Ok great!
                // Summary of your information
                // You'll get a message from me about your first meeting this Sunday evening!

                var text = "Got it! Here's a summary of your information:"
                         + "\nName: " + row.name
                         + "\nEmail: " + row.email
                         + "\nProfile: " + row.profile
                         + "\nNeighborhoods: " + row.neighborhoods
                         + "\nAvailability: " + row.availability
                         + "\nYou'll get a message from me about your first meeting this Sunday evening!"
                         + "\n(You won't really this service doesn't actually work yet.)";
                res.send(text);
              });
            });
          });
        });
      });
    });
  });
};

// Sunday night: Here's the person!
// rand() from list of open places to meet at that time in that neighborhood
// Add to Calendar?

// How to send a message to everyone with the bot installed?
// Is this even possible
// Might have to be a Slack app instead of a bot

// Reminder: 15m

// After the meeting
// Did you meet?
// What did you think?

// COMMAND: Help
// Gives all available commands

// COMMAND: Skip
// Skip this week?

// COMMAND: Meet
// Okay, you'll get a message from me on Sunday!

// COMMAND: Cancel
// There's this whole thing

// COMMAND: Status
// You have a meeting scheduled
// You have no meetings
// This could be the room topic? Or a pinned message

// COMMAND: Feedback
// At any point you can say "feedback" to send a message to the Braid team

// Data structures
// Relationships
// ??? Do this manually first
