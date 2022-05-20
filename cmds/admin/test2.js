const Discord = require("discord.js");
const Canvas = require('canvas');

module.exports.run =  async (bot, msg, arg, con, prefix) => {
  if(msg.author.id !== '0' && msg.author.id !== '0') return
  let target = msg.mentions.users.first();
  const embed = new Discord.MessageEmbed();
  arg = msg.content.substring(prefix.length).split(" ")

  console.log(arg[2])

  img = arg[1];
  sendImg(img)
  async function sendImg(imgSrc) {
    const canvas = Canvas.createCanvas(300, 450)
    const ctx = canvas.getContext('2d')

    const charimg = await Canvas.loadImage(imgSrc)

    ctx.drawImage(charimg, 0, 0, canvas.width, canvas.height);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'character.png')
    const embed = new Discord.MessageEmbed()

    embed.setColor(0xffff00)
    embed.attachFiles(attachment)
    embed.setImage('attachment://character.png')

    msg.channel.send(embed)
  }


}

module.exports.help = {
name:"test2"
}
