const Discord = require("discord.js");
const Canvas = require('canvas');

module.exports.run =  async (bot, msg, arg, con, prefix) => {

  let target = msg.mentions.users.first();
  arg = msg.content.toUpperCase().substring(prefix.length).split(/[\W_]+/g)

  let img;
  let img2;
  let name;
  let name2;
  let bazaarCardID;

  if(!arg[1]) return msg.reply("Enter the bazaar ID of the trade you want to accept");
  if(isNaN(arg[2])) return msg.reply("Enter the ID of your card to trade")
  const card = arg[2];
  const tradeId = arg[1];

  con.query(`select * from bazaar where display_id = '${tradeId}'`, (err, rows) => {
    if(err) throw err;
    if(rows.length == 0) return msg.reply("Incorrect bazaar ID")
    let wanted = rows[0].char_wanted;
    let rarity = rows[0].rarity_value;
    bazaarCardID = rows[0].card_id;
    con.query(`select char_img, char_name from char_inventory where card_id = '${bazaarCardID}'`, (err, rows) => {
      if(err) throw err;
      img = rows[0].char_img;
      name = rows[0].char_name;
    })

    let sql = `select char_id, card_id, char_img, char_name from char_inventory where user_id = '${msg.author.id}' AND card_id = '${card}' AND rarity_value = '${rarity}'`
    con.query(sql, (err, rows) => {
      if(err) throw err;
      if(rows.length == 0) return msg.reply("Card not found")
      if(wanted !== rows[0].char_id) return msg.reply("Incorrect character for trade.")
      img2 = rows[0].char_img;
      name2 = rows[0].char_name;
      setEmbed()
    })
  })

  async function setEmbed() {

      const canvas = Canvas.createCanvas(600, 400)
      const ctx = canvas.getContext('2d')

      const rightarrow = './images/rightarrow.png'
      const oldImg = await Canvas.loadImage(img)
      const newImg = await Canvas.loadImage(img2)
      const arrow = await Canvas.loadImage(rightarrow)


      ctx.drawImage(newImg, 0, 0, canvas.width/2 - 50, canvas.height);

      ctx.drawImage(arrow, canvas.width/2 - 50, canvas.height/2-25, 100, 50);

      ctx.drawImage(oldImg, canvas.width/2 + 50, 0, canvas.width/2 - 50, canvas.height);

      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'character.png')

      //msg.channel.send(attachment)
      const embed = new Discord.MessageEmbed()
      //embed.setTitle(name)
      embed.setDescription("Confirm trading YOUR: **" + name2 + "** FOR: **" + name + "**")
      embed.attachFiles(attachment)
      embed.setImage('attachment://character.png')
      embed.setColor(0xffff00)
      confirmation(embed)
  }

  function confirmation(embed) {
    message = msg.channel.send(embed)
    .then(function (message) {
      message.react("✅");
      message.react("❌")
      message.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name =="✅" || reaction.emoji.name =="❌"),{max:1, time:10000})
      .then(collected => {
        if(collected.first().emoji.name == "✅") {
          finalTrade();
          embed.setColor(0x00ff00)
          embed.setDescription("**Successfully Traded**")
          message.edit(embed)
        }
        else if(collected.first().emoji.name == "❌") {
          embed.setColor(0xff0000)
          embed.setDescription("**Trade Cancelled**")
          return message.edit(embed)
        }
        else{ msg.channel.send("Timed Out")}
      }).catch( () => { return})
    }).catch( () => {return msg.channel.send("Couldn't add reaction")})
  }

  function finalTrade() {
    let sql = `select card_id, user_id from char_inventory where card_id = '${card}'`
    con.query(sql, (err, rows) => {
      if(err) throw err;
      if(rows.length == 0) return msg.reply("You no longer own `" + card +"`")
      let sql = `select display_id, user_id from bazaar where display_id = '${tradeId}'`
      con.query(sql, (err, rows) => {
        if(err) throw err;
        if(rows.length == 0) return msg.reply("The following trade is no longer in Bazaar.")
        let bazaarOwner = rows[0].user_id;

        let sql = `update char_inventory set user_id = '${msg.author.id}', in_bazaar = '${0}' where card_id = '${bazaarCardID}'`
        con.query(sql, (err) => {
          if(err) throw err;
          let sql = `update char_inventory set user_id = '${bazaarOwner}' where card_id = '${card}'`
          con.query(sql, (err) => {
            if(err) throw err;
            con.query(`delete from bazaar where display_id = '${tradeId}'`, (err) => {
              if(err) throw err;
            })
          })
        })
      })

    })
  }
}

module.exports.help = {
name:"accept"
}
