const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con) => {

let target = msg.mentions.users.first() || msg.author;

let specific = ["trade"]

if(!specific.includes(arg[1])) {
  const embed = new Discord.MessageEmbed()
  .setTitle("Commands")
  .addField("General", "start | daily | \n hourly | items", true)
  .addField("Cards", "roll | view \n inv | trade", true)
  .addField("Bazaar", "add | remove \n accept | top ", false)
  .setColor(0x02fdf5)
  .setDescription("Note: The trade commands can be a bit confusing, \n use the following command to get more details: `help trade`")
  msg.channel.send(embed);
} else {
  if(arg[1] == "trade") {
    const embed = new Discord.MessageEmbed()
    .setTitle("Trading/Bazaar")
    .setDescription("The bazaar has a few basic commands and one stand alone command. \n\n" +
    "- bazaar add `(your card id)` `(id of character you want)` \n" +
    "- bazaar remove `card id`\n" +
    "- bazaar remove **all** \n\n" +
    "- accept `bazaar id`  `your card id`" 
    )
    .setFooter("You can get character id by using the characterlist command")
    msg.channel.send(embed);
  }
}



}

module.exports.help = {
name:"help"
}
