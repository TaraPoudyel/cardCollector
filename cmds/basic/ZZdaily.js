const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con) => {

let target = msg.mentions.users.first() || msg.author;
const sapphireEmoji = "<:ruby1:822207597344063498>"
const goldEmoji = "<:gold:830459042820259850>"

let amount = 50;
const cooldown = 82800
const cooldownMS = cooldown * 1000
let sql = `SELECT daily, daily_amount FROM players WHERE user_id = '${msg.author.id}'`
con.query(sql, (err, rows) => {
  if(rows.length == 0) return msg.channel.send("User not found");
  if(rows[0].daily_amount > 0) {amount = rows[0].daily_amount}
  let oldTime = rows[0].daily;
  let currentTime = Date.now();
  let newTime = oldTime + cooldownMS;
  let timeDifference = Math.round((newTime - currentTime)/1000);

  if (timeDifference > 0) {
    timeStuff(timeDifference)
    return;
  }
  else {
    let sql = `UPDATE players SET daily = '${currentTime}', sapphire = sapphire + '${amount}' WHERE user_id = '${msg.author.id}'`
    con.query(sql, (err) => {
      if(err) throw err;
    })
    generateEmbed();
  }

})

function generateEmbed() {
  const embed = new Discord.MessageEmbed()
  .setTitle("Successfully claimed Daily Reward")
  .setDescription(sapphireEmoji + ": " + amount)
  .setColor(0x00ffff)
  .setFooter(msg.author.username)
  msg.channel.send(embed);
}

function timeStuff(seconds) {
  if(seconds < 60) {
    return msg.reply("Daily is on cooldown for **" + seconds + "** seconds.")
  }
  else if(seconds < 3600) {
    let minutes = Math.round(seconds/60)
    return msg.reply("Daily is on cooldown for **" + minutes + "** minutes.")
  }
  else {
    let hours = Math.round(seconds/3600)
    return msg.reply("Daily is on cooldown for **" + hours + "** hours.")
  }
}

}

module.exports.help = {
name:"daily"
}
