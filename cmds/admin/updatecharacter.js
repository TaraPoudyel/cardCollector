const Discord = require("discord.js");
const Canvas = require('canvas');

module.exports.run =  async (bot, msg, arg, con, prefix) => {
//if(msg.guild.id !== "687863574416195584") return;
if(msg.author.id !== "0") return;

arg = msg.content.substring(prefix.length).split(" ")

let reg = new RegExp(/\.(png)$/i)
if(!reg.test(arg[2])) {
return msg.channel.send("Failed to find image.")
}
if(isNaN(arg[1])) return;
let sql = `Select * FROM characters WHERE char_id = '${arg[1]}'`
con.query(sql, (err, rows) => {
  if(rows[0].length == 0) return msg.reply("character with the id `" + arg[1] +"` was not found")
  let name = rows[0].char_name;
  if(!rows[0].char_img) {
    msg.reply("Image1 not found")
  }
  else {
    let img = rows[0].char_img;
    let img2 = arg[2]
    updateImage(img, img2, name)
  }
})


async function updateImage(img, img2, name) {

    const canvas = Canvas.createCanvas(600, 400)
    const ctx = canvas.getContext('2d')

    const rightarrow = './images/rightarrow.png'
    const oldImg = await Canvas.loadImage(img)
    const arrow = await Canvas.loadImage(rightarrow)
    const newImg = await Canvas.loadImage(img2)

    ctx.drawImage(oldImg, 0, 0, canvas.width/2 - 50, canvas.height);

    ctx.drawImage(arrow, canvas.width/2 - 50, canvas.height/2-25, 100, 50);

    ctx.drawImage(newImg, canvas.width/2 + 50, 0, canvas.width/2 - 50, canvas.height);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'character.png')

    //msg.channel.send(attachment)
    const embed = new Discord.MessageEmbed()
    //embed.setTitle(name)
    embed.setDescription("**CONFIRM THE CHANGE OF IMAGE FOR " + name +"**")
    embed.attachFiles(attachment)
    embed.setImage('attachment://character.png')
    embed.setColor(0xffff00)
    message = msg.channel.send(embed)
    .then(function (message) {
      message.react("✅");
      message.react("❌")
      message.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name =="✅" || reaction.emoji.name =="❌"),{max:1, time:10000})
      .then(collected => {
        if(collected.first().emoji.name == "✅") {
          con.query(`UPDATE characters SET char_img = '${img2}' WHERE char_id = '${arg[1]}'`, (err) => {
            if(err) throw err;
          })
          embed.setColor(0x00ff00)
          embed.setDescription("**SUCCESSFULLY CHANGED THE IMAGE FOR " + name +"**")
          message.edit(embed)
        }
        else if(collected.first().emoji.name == "❌") {
          embed.setColor(0xff0000)
          embed.setDescription("**CANCELLED**")
          return message.edit(embed)
        }
        else{ msg.channel.send("Timed Out")}
      }).catch( () => { return})
    }).catch( () => {return msg.channel.send("Couldn't add reaction")})

}


}
module.exports.help = {
name:"uc"
}
