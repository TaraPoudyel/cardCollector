const Discord = require("discord.js");
const Canvas = require('canvas');

module.exports.run =  async (bot, msg, arg, con, prefix) => {

let target = msg.mentions.users.first() || msg.author;

  if(isNaN(arg[1])) return msg.reply("view `character id`")
  let color = 0x00ffff;
  let char_id = arg[1]
  let sql = `Select * FROM characters WHERE char_id = '${char_id}'`
  con.query(sql, (err, rows) => {
    if(err) throw err;
    if(!rows[0]) return msg.reply("Card not found")
    let char_name = rows[0].char_name;
    let image = rows[0].char_img;
    let seriesName = rows[0].series_name;
    let id = rows[0].char_id;
    const embed = new Discord.MessageEmbed()
    embed.setTitle(char_name)
    embed.setImage(image)
    embed.setDescription(
      "ID: **" + id + "** \n\n" +
      "Series: **" + seriesName + "**"
    )

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



}

module.exports.help = {
name:"charview"
}
