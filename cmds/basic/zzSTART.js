const Discord = require("discord.js");

module.exports.run = async (bot, msg, arg, con) => {
let target = msg.mentions.users.first() || msg.author;

  con.query(`SELECT * FROM players WHERE user_id = '${target.id}'`, (err, rows) =>{
    if(err) throw err;
    if (!rows[0]) {
      let sql;
      let time = Date.now();
      sql = `INSERT INTO players (user_id, gold, silver, sapphire, reg_date) VALUES ('${msg.author.id}', '${'100'}', '${'5000'}', '${'10'}', '${time}')`
      con.query(sql, console.log)

      const embed = new Discord.MessageEmbed()
      .setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: true, size: 1024 }))
      .addField('Welcome!', "You have successfully been registered.")
      .setColor(0x02fdf5)
      msg.channel.send(embed);
    }

    else {
      msg.channel.send("User already registered")
    }
  })
}

module.exports.help = {
  name:"start"
}
