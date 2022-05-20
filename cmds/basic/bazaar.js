const Discord = require("discord.js");
const Canvas = require('canvas');

module.exports.run =  async (bot, msg, arg, con, prefix) => {

  let target = msg.mentions.users.first();
  const embed = new Discord.MessageEmbed();
  arg = msg.content.toUpperCase().substring(prefix.length).split(/[\W_]+/g)

  const min = 1;
  const max = 87;

  let rarityArr = ['C','B','A','S','SSS']
  let lowestRarity = 5

  let searchRarity;
  let searchName;
  let searchSeries;
  let rarity = "%";
  let name = "%";
  let series = "%";

  let cardCharID;
  let cardSeriesID;
  let cardSeriesName;
  let wantedSeriesID;
  let charSeriesName;
  let rarityValue;
  let rarityName;
  let wantedImg;
  let wantedName;
  let cardImg;
  let cardName;

  let event = ["ADD", "TOP", "REMOVE", "TRADE"]

  let card;
  let wanted;
  //HAVE IT DISPLAY TOP 100 RESULTS LATER INSTEAD OF RETURNING
  if (!arg[1] || !event.includes(arg[1])) {return viewBazaar()}

  //ADD THE FUNCTIONS WITH IF STATEMENTS
  //if(event.includes(arg[1])) {return}

  if(arg[1] == "ADD") {
    addCard();
  }
  if (arg[1] == "REMOVE") {
    removeCard();
  }

function addCard() {
    if(isNaN(arg[2])) return msg.reply("Enter the **CARD ID** of the card you would like to add to bazaar");
    if(arg[3] < min || arg[3] > max) return msg.reply("Invalid character ID")
    if(isNaN(arg[3])) return msg.reply("Enter the **CHARACTER ID** of the character you want");

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
        confirmBazaar()

      })
    })

    async function confirmBazaar() {

        const canvas = Canvas.createCanvas(600, 400)
        const ctx = canvas.getContext('2d')

        const rightarrow = './images/rightarrow.png'
        const oldImg = await Canvas.loadImage(cardImg)
        const newImg = await Canvas.loadImage(wantedImg)
        const arrow = await Canvas.loadImage(rightarrow)


        ctx.drawImage(oldImg, 0, 0, canvas.width/2 - 50, canvas.height);

        ctx.drawImage(arrow, canvas.width/2 - 50, canvas.height/2-25, 100, 50);

        ctx.drawImage(newImg, canvas.width/2 + 50, 0, canvas.width/2 - 50, canvas.height);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'character.png')

        //msg.channel.send(attachment)
        const embed = new Discord.MessageEmbed()
        //embed.setTitle(name)
        embed.setDescription("Confirm adding the trade offer: **" + cardName + "** for **" + wantedName + "**")
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
              embed.setColor(0x00ff00)
              embed.setTitle("Successfully added to bazaar")
              insertBazaar(card, wanted);
              return message.edit(embed)
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

    async function insertBazaar() {
      let sql = `call insert_bazaar('${msg.author.id}', '${card}', '${wanted}', '${cardName}', '${wantedName}', '${cardSeriesID}', '${wantedSeriesID}', '${rarityValue}', '${rarityName}', '${cardCharID}', '${cardSeriesName}', '${charSeriesName}')`
      con.query(sql, (err) => {
        if(err) throw err;
      })
    }
  }

function viewBazaar() {
  let currentPage = 1;
  let message;
  const displayCount = 10;
  getParameters();

  let sql = `call get_bazaar('${name}', '${rarity}', '${series}')`;
  con.query(sql, (err, rows) => {
    if(rows.length == 0) return msg.channel.send("Nothing found");
    let seriesCount = rows[0].length
    let numPages = Math.ceil(rows[0].length/displayCount);

    const embed = new Discord.MessageEmbed();
    if(seriesCount == 0) return msg.channel.send("No cards found.")
    sorting(seriesCount,numPages,currentPage)

//START SORTING FUNCTION
    function sorting(count,totalPages,currentPage) {
      let firstValue = (currentPage - 1) * displayCount;

      if(count == 0) return msg.channel.send("No cards Found")

      if(count < displayCount) {

          addContent(0, count)

      } else if(currentPage == totalPages) {

          addContent(firstValue, count)

      } else {
          addContent(firstValue, firstValue + displayCount)
      }
      embed.setTitle("Bazaar")
      embed.setFooter("Page: " + currentPage + "/"+numPages)

      message = msg.channel.send(embed)
      .then(function (message) {
        message.react("⬅️");
        message.react("➡️");
        if(totalPages == 1) return;
        message.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name =="⬅️" || reaction.emoji.name == "➡️"),{max:1, time:10000})
        .then(collected => {
          if(collected.first().emoji.name == "⬅️") {pageUpdate(count, totalPages, numPages , message)}
          else if(collected.first().emoji.name == "➡️") {pageUpdate(count, totalPages, currentPage +1 , message)}
          else{ msg.channel.send("Timed Out")}
        }).catch( () => { return})
      }).catch( () => {return msg.channel.send("Couldn't add reaction")})
    }
//END SORTING FUNCTION

//START ADD CONTENT
    function addContent(start, end) {
      var content;
      for(i = start; i < end; i++) {
        rarity = rows[0][i].rarity_name;
        name = rows[0][i].card_name;
        name2 = rows[0][i].wanted_name;
        displayID = rows[0][i].display_id;
        cardID = rows[0][i].card_id;
        content = content + ("Card ID: **" + cardID + "** Bazaar ID: `" + displayID + "` Rarity: __**" + rarity + "**__\n **" +
        name + " ↔️ " + name2 + "**\n\n")

      }
      content = content.substring(9)
      embed.setDescription(content)
    }
//END ADD CONTENT

// START OF PAGE UPDATE FUNCTION
    function pageUpdate(count,totalPages,currentPage, message) {
      let firstValue = (currentPage - 1) * displayCount;

      if(count == 0) return msg.channel.send("No Characters Found")

      if(count < displayCount) {

          addContent(0, count)

      } else if(currentPage == totalPages) {

          addContent(firstValue, count)

      } else {
          addContent(firstValue, firstValue + displayCount)
      }
      embed.setFooter("Page: " + currentPage + "/"+numPages)
      message.edit(embed)
      .then(function (message) {
        message.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name =="⬅️" || reaction.emoji.name == "➡️"),{max:1, time:10000})
        .then(collected => {
          if(collected.first().emoji.name == "⬅️") {
            if(currentPage == 1) {
              pageUpdate(count, totalPages, totalPages , message)
            } else {
              pageUpdate(count, totalPages, currentPage -1 , message)
            }
          }
          else if(collected.first().emoji.name == "➡️") {
            if(currentPage == totalPages) {
              pageUpdate(count, totalPages, 1, message)
            } else {
              pageUpdate(count, totalPages, currentPage +1 , message)
            }
          }
          else { msg.channel.send("Timed Out")}
        }).catch( () => { return})
      }).catch( () => {return msg.channel.send("Couldn't add reactions")})
    }
//END OF PAGE UPDATE FUNCTION

  })

  function getParameters() {
    if(arg.includes("R") || arg.includes("RARITY")) {
      if(arg.includes("R") && arg.includes("RARITY")) return msg.channel.send("Unable to search for multiple `Character Names`")
      if(arg.includes("R")) {searchRarity = arg.indexOf("R")}
      if(arg.includes("RARITY")) {searchRarity = arg.indexOf("RARITY");}
      rarity = arg[searchRarity + 1]
    }

    if(arg.includes("N") || arg.includes("NAME")) {
      if(arg.includes("N") && arg.includes("NAME")) return msg.channel.send("Unable to search for multiple `Character Names`")
      if(arg.includes("N")) {searchName = arg.indexOf("N")}
      if(arg.includes("NAME")) {searchName = arg.indexOf("NAME");}
      name = "%" +arg[searchName + 1] + "%"
    }

    if(arg.includes("SE") || arg.includes("SERIES")) {
      if(arg.includes("SE") && arg.includes("SERIES")) { return msg.channel.send("Unable to search for multiple `Series Names`")}
      if(arg.includes("SE")) {searchSeries = arg.indexOf("SE")}
      if(arg.includes("SERIES")) {searchSeries = arg.indexOf("SERIES")}
      series = "%" + arg[searchSeries + 1] + "%"
    }
  }
}

async function removeCard() {
  if(arg[2] == "ALL") return removeAll();
  if(isNaN(arg[2])) return msg.reply("Invalid card ID to remove from bazaar");
  let card = arg[2]

  let sql = `Select card_id from bazaar where user_id = '${msg.author.id}' AND card_id = '${card}'`
  con.query(sql, (err, rows) => {
    if(err) throw err;
    if(rows.length == 0) return reply("No Card Found")
    remove(card)
  })

  async function remove(card) {
    let sql = `call bazaar_removal_single('${msg.author.id}', '${card}')`
    con.query(sql, (err, rows) => {
      if(err) throw err;
      msg.reply('Successfully Removed card: **' + card + "** from Bazaar.")
    })
  }

  async function removeAll() {
    let sql = `call bazaar_removal_all('${msg.author.id}')`
    con.query(sql, (err, rows) => {
      if(err) throw err;
      console.log(rows)
      msg.reply("Removed all cards from bazaar.")
    })
  }
}

}


module.exports.help = {
name:"bazaar",
alias:"bz"
}
