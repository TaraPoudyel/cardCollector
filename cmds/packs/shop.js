const Discord = require("discord.js");
const fs = require("fs")

module.exports.run =  async (bot, msg, arg, con, prefix) => {
  if(msg.author.id !== '0' && msg.author.id !== '1') return
  let target = msg.mentions.users.first();
  const embed = new Discord.MessageEmbed();
  arg = msg.content.toUpperCase().substring(prefix.length).split(/[\W_]+/g)

  const sapphireEmoji = "<:ruby1:822207597344063498>"
  const goldEmoji = "<:gold:830459042820259850>"

  const blackE = "<:blackEssence:844377374908612618>"
  const redE = "<:redEssence:835904975653699624>"
  const orangeE = "<:orangeEssence:835904966177587220>"
  const purpleE = "<:purpleEssence:835904954870530099>"
  const blueE = "<:blueEssence:835904935602028654>"
  const greenE = "<:greenEssence:835903479926226954>"
  const essenceArray = [greenE, blueE, purpleE, orangeE, redE, blackE]

  let rawdata = fs.readFileSync('./packs.json');
  let shopData = JSON.parse(rawdata);
  let shopItems = shopData.items;

  let content = "";
  for(x in shopData.items) {
    content += "`#" + shopItems[x].id + "` **" + shopItems[x].name + "**\n" +
    "Cost: " + shopItems[x].costAmount + essenceArray[shopItems[x].costID] + "\n\n";
  }
  embed.setDescription(content)
  msg.channel.send(embed)

  if(!arg[1]) return;
  if(!isNaN(arg[1]) && arg[1] <= 6 && arg[1] >= 1 ) {
    let essence = shopItems[arg[1]-1].cost.toString();
    let amount = shopItems[arg[1]-1].costAmount;
    let generatedNum = shopItems[arg[1]-1].generatedNum;
    let sql = `select `+ essence + ` as essence from players where user_id = '${msg.author.id}'`

    con.query(sql, (err, rows) => {
      if(err) throw err;
      if(rows[0].length == 0) return msg.reply("Broken");
      if(rows[0].essence >= amount) {
        let commandfile = bot.cmds.get("shoproll")
        if(commandfile) {commandfile.run(bot, msg, "arg", con, generatedNum)}
        else(console.log("cmdfile doesnt exist"))
      }
    })
  }
}

module.exports.help = {
name:"shop",
alias:"s"
}
