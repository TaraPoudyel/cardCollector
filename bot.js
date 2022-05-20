const Discord = require('discord.js');
require('dotenv').config();
const bot = new Discord.Client();
const token = " token "
const mysql = require("mysql2");
const fs = require("fs")
const schedule = require("node-schedule");
let prefix = ",";

const rarityArr = ['C','B','A','S','SSS']
const colorArr = [0x209900, 0x0000ff, 0x9900ff, 0xffaa00, 0xff0000]

const guildPrefixes = new Map();

//COMMAND HANDLER
bot.cmds = new Discord.Collection();

bot.aliases = new Discord.Collection(); // Collection for all aliases of every command
const modules = ['admin', 'basic', 'help', 'packs', 'noncommands', 'rollbase']; // This will be the list of the names of all modules (folder) your bot owns
modules.forEach(c => {
fs.readdir(`./cmds/${c}/`, (err, files) => { // Here we go through all folders (modules)
if (err) throw err; // If there is error, throw an error in the console
console.log(`[Commandlogs] Loaded ${files.length} cmds of module ${c}`); // When cmds of a module are successfully loaded, you can see it in the console
files.forEach(f => { // Now we go through all files of a folder (module)
const props = require(`./cmds/${c}/${f}`); // Location of the current command file
bot.cmds.set(props.help.name, props); // Now we add the commmand in the client.cmds Collection which we defined in previous code
bot.aliases.set(props.help.alias, props);
});
});
});

//DATABASE STUFF
var con = mysql.createConnection({

  host: "localhost",
  user: "root",
  password:"abc123abc@",
  database: "pos"

});

con.connect(err => {
  if(err) throw err;
  console.log("Connected to database");
  con.query("SHOW TABLES", console.log);

})

//READY EVENT
bot.on('ready', ()=>{

  console.log("Turning on.")
  bot.guilds.cache.forEach(guild => {
    con.promise().query(
      `SELECT cmd_prefix from Guilds WHERE guild_id = '${guild.id}'`
    ).then(result => {
      guildPrefixes.set(guild.id, result[0][0].cmd_prefix);
    }).catch( err => console.log(err));
  });
  console.log(guildPrefixes)
});

//GUILD CREATE EVENT
bot.on('guildCreate', async (guild) => {
  con.query(
    sql = `INSERT INTO guilds (guild_id, cmd_prefix) VALUES ('${guild.id}', '${","}')`
  )
  con.query(`select guild_id from guilds where guild_id = '${guild.id}'`, (err, rows) => {
    if(rows.length == 0) {
      con.query(sql, console.log);
      guildPrefixes.set(guild.id, ",");
    }
  })
})

//MESSAGE EVENT
bot.on('message', async (msg) => {
  let channel = msg.guild.channel;
  //Query to keep DB alive
  setInterval(function(){
  con.query(`SELECT COUNT(*) FROM guilds`)
  }, 45000)

//CHECKS IF BOT HAS PERMISSION TO SEND MESSAGE
  const botPermissionsIn = msg.guild.me.permissionsIn(msg.channel);
  if(!botPermissionsIn.has('SEND_MESSAGES')) {return}

  const prefix = guildPrefixes.get(msg.guild.id)

  if(msg.mentions.users.first() == '816722468907384892') {

      msg.channel.send("My prefix for is `" + prefix + "`" )
  }

  if(!msg.content.startsWith(prefix) || msg.author.bot) return;
  let ss = msg.content.substring(prefix.length).split(" ")

  //PREFIX STUFF
  if(ss[0] == 'prefix' && ss[1].length > 0 && ss[1].length <= 3) {
    let newPrefix = ss[1];
    if(msg.member.hasPermission('ADMINISTRATOR')) {
      try {
        await con.promise().query(
          `UPDATE guilds SET cmd_prefix = '${newPrefix}' WHERE guild_id = '${msg.guild.id}'`
        )
        guildPrefixes.set(msg.guild.id, newPrefix);
        msg.channel.send("Prefix updated to `" + newPrefix +"`")
      } catch(err) {
        console.log(err);
        msg.channel.send("Failed to update guild prefix.")
      }
    } else {
      msg.channel.send("You don't have sufficient permission for this command.");
    }
  }

	//LOOK FOR COMMAND FILE AND RUN IF FOUND
  if(!msg.content.startsWith(prefix)) return;
  let arg = msg.content.toLowerCase().substring(prefix.length).split(" ");
	let commandfile = bot.cmds.get(arg[0]);
  let aliasCommandFile = bot.aliases.get(arg[0])
	if(commandfile) {commandfile.run(bot, msg, arg, con, prefix)}
  else if(aliasCommandFile) aliasCommandFile.run(bot, msg, arg, con, prefix);

});

bot.login(token);
