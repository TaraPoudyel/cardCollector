const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con) => {

if(isNaN(arg[1])) return msg.channel.send(" updateimg `card id` \nUpdate current card image to new image if character image is changed");

let sql = `Select * FROM char_inventory WHERE card_id = '${arg[1]}' AND user_id = '${msg.author.id}'`
con.query(sql, (err, rows) => {
  if(!rows[0]) return msg.reply("Card not found")
  let id = rows[0].char_id;
  con.query(`Select * FROM characters WHERE char_id = '${id}'`, (err, rows) => {
    if(!rows[0]) return msg.reply("Card not found")
    let newImg = rows[0].char_img;
    con.query(`UPDATE char_inventory SET char_img = '${newImg}' WHERE char_id = '${id}'`, (err, rows) => {
      if(err) console.log(err);
      msg.channel.send("Image successfully updated.")
    })
  })
})
}
module.exports.help = {
name:"updateimage"
}
