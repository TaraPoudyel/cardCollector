const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con, prefix) => {

  if(msg.author.id !== "0") return
  if(!arg[1]) return  msg.channel.send("Need arg 1")
  if(isNaN(arg[1])) return  msg.channel.send("Arg 1 = series id")
  let name = "";

  for(i = 2; i < arg.length; i++) {
    name+= arg[i] + " ";
  }
  name = name.slice(0, -1)
  if(!name) return;

  let sql = `SELECT * FROM series WHERE series_id = '${arg[1]}'`
  con.query(sql, (err, rows) => {
    if(rows.length == 0) return msg.channel.send("Series not found")
    let seriesName = rows[0].series_name;
    let seriesID = rows[0].series_id
    let message = msg.channel.send("Are you sure you want to add  `" + name + "` from `" + seriesName + "`")
    .then(function (message) {
      message.react("✅");
      message.react("❌");
      message.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name == "✅" || reaction.emoji.name =="❌"),{max:1, time:10000})
      .then(collected => {
        if(collected.first().emoji.name == "❌") {
          return message.edit(message.content + " - **Cancelled**")
        }
        else if(collected.first().emoji.name == "✅") {
          con.query(`INSERT INTO characters (char_name, series_id, series_name) VALUES ('${name}', '${seriesID}', '${seriesName}')`, (err) => {
            if(err) msg.reply("Error")
            message.edit(message.content + " - **Successful**")
          })
        }
        else{ msg.channel.send("Timed Out")}
      }).catch( () => { return})
    }).catch( () => {return msg.channel.send("Couldn't add reaction")})

  })
}

module.exports.help = {
name:"addcharacter"
}
