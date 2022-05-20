const Discord = require("discord.js");
const Canvas = require('canvas');

module.exports.run =  async (bot, msg, arg, con) => {
  if(msg.author.id !== '0' && msg.author.id !== '1') return
  const rarityColor = [0x209900, 0x0000ff, 0x9900ff, 0xffaa00, 0xff0000, 0x000000]
  let color = 0x000000
  let cost = 5;
  const min = 1;
  const max = 87;
  let rarityArr = ['C','B','A','S','SSS','Z']
  let sapphire = 0;
  let maxStats = [210, 420, 630, 840, 1050, 1260]
  let baseStats = [134, 268, 402, 536, 670, 804]
  let offset = [76, 152, 228, 304, 380, 456]
  let luck = 0, hp = 0, speed = 0, strength = 0, totalStats = 0, averageStats = 0;
  let rarityNum;
  if(isNaN(arg[1]) || arg[1] > 100 ) return msg.reply("-_-")
  // setInterval(function() {
  //   roll();
  // }, 200)
  for(i = 0; i < arg[1]; i++) {
    let generatedRarity = getRandomIntInclusive(1000,1001);
    determineRarity(generatedRarity)
    let rarity = rarityArr[rarityNum - 1]
    generateStats(rarityNum)
    roll(luck, hp, speed, strength, totalStats, averageStats, rarity, rarityNum);
  }

  function roll(luck, hp, speed, strength, totalStats, averageStats, rarity, rarityNum) {
    console.log(speed)
    let spawnCard = getRandomIntInclusive(min, max)
    if (!spawnCard) return;
    let sql = `SELECT char_name, char_img, series_id, series_name FROM characters WHERE char_id = '${spawnCard}'`
    con.query(sql, (err, rows) => {
      if(err) throw err;
      let imgSrc = rows[0].char_img;
      let char_name = rows[0].char_name;
      let series_id = rows[0].series_id;
      let series_name = rows[0].series_name;

      console.log(char_name + " rolled")
//      sendImg(imgSrc, char_name, series_id, series_name);
      let sql = `INSERT INTO char_inventory (char_id, char_name, char_img, rarity_value, rarity_name, luck, hp, speed, strength, series_id, series_name, user_id, stats_average, time, channel_id, guild_id)
      VALUES ('${spawnCard}', '${char_name}', '${imgSrc}', ${rarityNum}, '${rarity}', '${luck}', '${hp}', '${speed}', '${strength}', '${series_id}', '${series_name}', '${"816722468907384892"}', '${averageStats}', '${Date.now()}', '${msg.channel.id}', '${msg.guild.id}')`;
      con.query(sql, (err, rows) => {
        if(err) throw err;
      })
    })
    return;
  }

  // async function sendImg(imgSrc,char_name, series_id, series_name) {
  //   const canvas = Canvas.createCanvas(300, 450)
  //   const ctx = canvas.getContext('2d')
  //
  //   const charimg = await Canvas.loadImage(imgSrc)
  //
  //   ctx.drawImage(charimg, 0, 0, canvas.width, canvas.height);
  //
  //   const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'character.png')
  //   const embed = new Discord.MessageEmbed()
  //   embed.setTitle(char_name)
  //   embed.attachFiles(attachment)
  //   embed.setImage('attachment://character.png')
  //   embed.setDescription(
  //
  //     "Rarity: **" + rarity + "**\n\n"  +
  //     "Luck: **" + luck + "** \n"  +
  //     "HP: **" + hp + "** \n"  +
  //     "Speed: **" + speed + "** \n"  +
  //     "Strength: **" + strength +"** \n\n" +
  //     "Avg: **" + Math.round(averageStats) + "%**"
  //   )
  //   embed.setColor(color)
  //   embed.setFooter(msg.author.username +"'s roll")
  //   msg.channel.send(embed)
  // }

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }

  function generateStats(rarityNum) {
    luck = (rarityNum*10) + (getRandomIntInclusive(1, 10) * rarityNum)
    hp = (rarityNum*100) + (getRandomIntInclusive(1, 50) * rarityNum)
    speed = (rarityNum*10) + (getRandomIntInclusive(1, 10) * rarityNum)
    strength = (rarityNum*10) + (getRandomIntInclusive(1, 10) * rarityNum)
    totalStats = luck + hp + speed + strength;
    averageStats = (totalStats - baseStats[rarityNum - 1]) / offset[rarityNum - 1] * 100
  }

  function determineRarity(generatedRarity) {
    if(generatedRarity <= 700) {rarityNum = 1}
    else if (generatedRarity <= 900) {rarityNum = 2}
    else if (generatedRarity <= 980) {rarityNum = 3}
    else if (generatedRarity < 1000) {rarityNum = 4}
    else if (generatedRarity === 1000) {rarityNum = 5}
    else if (generatedRarity === 1001) {rarityNum = 6}
    else {console.log("Error in determining rarity")}
    color = rarityColor[rarityNum - 1]
  }

}

module.exports.help = {
name:"autoroll"
}
