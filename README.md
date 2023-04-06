# Discord-Authentication-Bot
A simple Discord bot to authenticate users and give them a role for 30 days.

For any issue feel free to contact me.

**github:** Smart_P


## Installation Guide

###Install nodejs on ubuntu
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

- Rename configtest.json to config.json

- Go to this link: https://discordapp.com/developers/applications/
- Create a new application 
- Go to Bot Section and create a new Bot
- Reveal the token and copy it into the config.json file, "botKey"
- Then go to general and copy the Client ID
- Use this link to invite the bot inside your Discord server: 
- https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=8

- Once the bot is inside your server, and you wrote all the infos in the config file you can run the command 
```
node authBot.js
```

- Last step copy and paste the tokens or email you sent to your customers

## To Do
- [ ] Add function to check the token expiration
"# discord-authenticate-flow" 
