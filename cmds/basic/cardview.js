const Discord = require("discord.js");
const Canvas = require('canvas');

module.exports.run =  async (bot, msg, arg, con, prefix) => {

let target = msg.mentions.users.first() || msg.author;
const rarityColor = [0x209900, 0x0000ff, 0x9900ff, 0xffaa00, 0xff0000, 0x000000]

  if(isNaN(arg[1])) return msg.reply("view `cardid`")
  let color = 0x000000;
  let card_id = arg[1]
  let sql = `Select * FROM char_inventory WHERE card_id = '${card_id}'`
  con.query(sql, (err, rows) => {
    if(err) throw err;
    if(!rows[0]) return msg.reply("Card not found")
    let char_name = rows[0].char_name;
    let image = rows[0].char_img;
    let rarity = rows[0].rarity_name;
    let luck = rows[0].luck;
    let hp = rows[0].hp;
    let speed = rows[0].speed;
    let strength = rows[0].strength;
    let owner = rows[0].user_id;
    let averageStats = rows[0].stats_average;
    getColor(rows[0].rarity_value)

    const embed = new Discord.MessageEmbed()
    embed.setTitle(char_name)
    embed.setImage(image)
    embed.setDescription(
      "Rarity: **" + rarity + "**\n\n"  +
      "Luck: **" + luck + "** \n"  +
      "HP: **" + hp + "** \n"  +
      "Speed: **" + speed + "** \n"  +
      "Strength: **" + strength + "**\n\n" +
     "Avg: **" + Math.round(averageStats) + "%** \n\n" +
      "Owner: <@" + owner + ">")

    embed.setColor(color)
    sendImg(image, embed)
  })

  async function sendImg(image, embed) {

    const canvas = Canvas.createCanvas(320, 500)
    const ctx = canvas.getContext('2d')
    const charimg = await Canvas.loadImage(image)
    ctx.drawImage(charimg, 0, 0, canvas.width, canvas.height);
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'character.png')
    embed.attachFiles(attachment)
    embed.setImage("attachment://character.png")
    msg.channel.send(embed)
  }

  function getColor(rarityNum) {
    color = rarityColor[rarityNum - 1]
  }



}

module.exports.help = {
name:"cardview"
}
