//      Discord Auth Bot
//          Made By
//     github: Smart_P

const Discord = require("discord.js");
const fs = require('fs');
const sql = require("sqlite");
const schedule = require("node-schedule");
const colors = require("colors");
const client = new Discord.Client();

//Reading from config file
fs.readFile('./config.json', function read(err, data) {
    if (err) {
        console.log('Error Occured, could not find a config.json file');
        process.exit(1);
    }
    try {
        var config = JSON.parse(data);
        init(config);
    } catch (e) {
        console.log(e);
        console.log('Error Occured, your config.json file contains invalid JSON syntax.');
        process.exit(1);
    }
});

function init(config){
client.login(config.botKey)
setupDb()
checkToken(config)

client.on('ready', () => {
    console.log(colors.grey(`Logged in as ${client.user.tag}`));
    client.user.setPresence({
        'game':{
            'name': 'Authenticating...',
            'type': 'Playing'
        }
    })
})

client.on('disconnect', () => {
    console.error("An error has occured. Please check you special keys in your config.json file and try again.");
    process.exit(1);
})

client.on('message', async message => {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.author.bot) return;
    
    //Command Ping
    if (command == 'ping'){
        message.channel.send(client.ping)
    }
    
    //Command Activate
    if (command == 'auth' && message.channel.type == 'dm'){
        
        if (message.content.split(' ').length == 2){
            
            let token = message.content.split(' ')[1]
            
            fs.readFile('./tokens.txt', 'utf8', async function (err, data) {
                if (err) throw err;
                tokens = data.split('\n')

                if ((tokens.indexOf(token)) > -1)  {

                    tmp = await message.author.send('**Verifying...**')
                    let startDate = Date.now()
                    let endDate = startDate + (30 * 24 * 60 * 60 * 1000)

                    await sql.get('SELECT * FROM users WHERE token = ?', [token]).then(row => {
                        if (!row) {
                            try {
                                sql.run("INSERT INTO users (userTag, userId, token, startDate, endDate) VALUES (?, ?, ?, ?, ?)", [message.author.tag, message.author.id, token, startDate, endDate]);
                                
                                var role = client.guilds.get(config.serverId).roles.find(role => role.name === config.roleName);
                                client.guilds.get(config.serverId).members.get(message.author.id).addRole(role); 
                                
                                tmp.edit('**Verified!** :white_check_mark:')
                                console.log(colors.green(`NEW User Verified: ${message.author.tag} with Token: ${token}`))
                                
                            } catch (error) {
                                console.log(error)
                            }
                        } else {
                            tmp.edit(`**Token already used. Please contact an admin** :handshake:`)
                            console.log(colors.red(`${message.author.tag} - Tried to use an expired token. - Token: ${token}`))
                        }
                    })
                } else {
                    message.channel.send('**Invalid token.** :weary:')
                    console.log(colors.yellow(`${message.author.tag} - Used an invalid token. - Token: ${token}`))
                }
            });
        }
    } else if (command != 'auth' && message.channel.type == 'dm') {
        message.author.send('**In order to activate your account type the following:** !auth _YOURTOKEN_')
    } else {
        return
    }
})
}

async function setupDb(){
    try {
        await sql.open("./users.sqlite", { Promise });
        await sql.run("CREATE TABLE IF NOT EXISTS users (userTag TEXT, userId TEXT, token TEXT UNIQUE, startDate TIMESTAMP, endDate TIMESTAMP)");
    } catch (error) {
        console.log(error)
    }
}

async function checkToken(config){
    schedule.scheduleJob({hour: 00, minute: 00, second: 00}, async () => {
        await sql.all('SELECT userTag, userId, token, endDate FROM users').then(function(res) { result=res });

        result.forEach(element => {
            if (Date.now() > element.endDate){
                var role = client.guilds.get(config.serverId).roles.find(role => role.name === config.roleName);
                client.guilds.get(config.serverId).members.get(element.userId).removeRole(role);
                sql.run('DELETE FROM users WHERE token = ?', element.token)
                
                var data = fs.readFileSync('./tokens.txt', 'utf-8').split("\n");
                var arrayIndex = data.indexOf(element.token)
                data.splice(arrayIndex, 1)
                fs.writeFile("./tokens.txt", data.join("\n"), {encoding : 'utf-8'}, (error) => {if (error) throw error;})
                
                console.log(colors.cyan("Token Exipired: " + element.token + " - User: " + element.userTag + " - UserID: " + element.userId))
            }
        });
        })
    }