const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con) => {
  let target = msg.mentions.users.first() || msg.author;
  const sapphireEmoji = "<:ruby1:822207597344063498>"
  const goldEmoji = "<:gold:830459042820259850>"

  const blackE = "<:blackEssence:844377374908612618>"
  const redE = "<:redEssence:835904975653699624>"
  const orangeE = "<:orangeEssence:835904966177587220>"
  const purpleE = "<:purpleEssence:835904954870530099>"
  const blueE = "<:blueEssence:835904935602028654>"
  const greenE = "<:greenEssence:835903479926226954>"
  const essenceArray = [greenE, blueE, purpleE, orangeE, redE, blackE]

  let sql = `call inventory('${msg.author.id}')`;
  con.query(sql, (err, rows) => {
    if(err) throw err;
    if(!rows[0][0]) return msg.reply("You are not registered. Use the register command to start.")

    let gold = rows[0][0].gold
    let sapphire = rows[0][0].sapphire
    let black = rows[0][0].z_essence
    let red = rows[0][0].sss_essence
    let orange = rows[0][0].s_essence
    let purple = rows[0][0].a_essence
    let blue = rows[0][0].b_essence
    let green = rows[0][0].c_essence
    let essenceCount = [green, blue, purple, orange, red, black]

    var content = goldEmoji + ": " + gold + " \n"
    content += sapphireEmoji + ": " + sapphire +" \n"
    for(i = 0; i < essenceArray.length; i++) {
      if(essenceCount[i] !== 0) {
        content += essenceArray[i] + " : " + essenceCount[i] + "\n";
      }
    }

    const embed = new Discord.MessageEmbed();
    embed.setTitle(msg.author.username + "'s Items")
    embed.setAuthor(msg.author.username, msg.author.avatarURL())
    //embed.setThumbnail(msg.author.avatarURL())
    embed.setDescription(content)
    embed.setColor(0x00ffff)
    msg.channel.send(embed)
  })
}

module.exports.help = {
name:"inventory",
alias:"inv" && "i"
}
