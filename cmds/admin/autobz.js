const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con) => {
console.log(arg)
let sql = `select * from char_inventory where user_id = "816722468907384892" and in_bazaar = "0" limit 400`
let count = 20;
con.query(sql, (err, rows) => {
  if(err) throw err;
  if(rows.length == 0) return msg.reply("Nope");
  if (rows.length <= 20) {count = rows.length - 1}
  for(i = 0; i < count; i++) {
    let id = rows[i].card_id;
    let want = getRandomIntInclusive(1, 50)
    arg = ["ADD", id, want]
  }
})

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }

  function addCard(id, want) {
      if(isNaN(id)) return msg.reply("Enter the **CARD ID** of the card you would like to add to bazaar");
      if(isNaN(want)) return msg.reply("Enter the **CHARACTER ID** of the character you want");
      if(want < min || want > max) return msg.reply("Invalid character ID")

      card = arg[2];
      wanted = arg[3];
      let sql = `call get_card('${msg.author.id}', '${card}')`;
      con.query(sql, (err, rows) => {
        if(err) throw err;
        if(rows[0].length == 0) return msg.reply("Card `" + card + "` not found.")
        if(rows[0][0].in_bazaar == 1) return msg.reply("Card already in bazaar.")
        if(rows[0][0].rarity_value < lowestRarity ) return msg.reply("Cannot add cards under rarity: `" + rarityArr[lowestRarity - 1] + "` to bazaar.")
        cardImg = rows[0][0].char_img;
        cardName = rows[0][0].char_name;
        rarityName = rows[0][0].rarity_name;
        rarityValue = rows[0][0].rarity_value;
        cardCharID = rows[0][0].char_id;
        cardSeriesID = rows[0][0].series_id;
        cardSeriesName = rows[0][0].series_name;

        con.query(`call getCharacter('${wanted}')`, (err, rows) => {
          if(err) throw err;
          if(!rows[0]) return msg.reply("Character with ID `" + wanted + "` not found")
          wantedImg = rows[0][0].char_img;
          wantedName = rows[0][0].char_name;
          wantedSeriesID = rows[0][0].series_id;
          charSeriesName = rows[0][0].series_name;

        })
      })

      async function insertBazaar() {
        let sql = `call insert_bazaar('${msg.author.id}', '${card}', '${wanted}', '${cardName}', '${wantedName}', '${cardSeriesID}', '${wantedSeriesID}', '${rarityValue}', '${rarityName}', '${cardCharID}', '${cardSeriesName}', '${charSeriesName}')`
        con.query(sql, (err) => {
          if(err) throw err;
        })
      }
    }
}
module.exports.help = {
name:"autobz"
}
