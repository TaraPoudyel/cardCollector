const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con, prefix) => {
  arg = msg.content.toUpperCase().substring(prefix.length).split(/[\W_]+/g)

  let target = msg.mentions.users.first() || msg.author;
  const sapphireEmoji = "<:ruby1:822207597344063498>"
  const goldEmoji = "<:gold:830459042820259850>"

  const blackE = "<:blackEssence:844377374908612618>"
  const redE = "<:redEssence:835904975653699624>"
  const orangeE = "<:orangeEssence:835904966177587220>"
  const purpleE = "<:purpleEssence:835904954870530099>"
  const blueE = "<:blueEssence:835904935602028654>"
  const greenE = "<:greenEssence:835903479926226954>"
  const essenceArray = [greenE, blueE, purpleE, orangeE, redE, blackE]
  const acceptable = ["N","NAME","R","RARITY","SE","SERIES", "ALL"]
  let searchRarity;
  let searchName;
  let searchSeries;
  let rarity = "%";
  let name = "%";
  let series = "%";
  let sql;
  let delsql;
  if (!arg[1]) {return}
  getParameters();
  if(!rarity || rarity.toUpperCase() == "SSS" || rarity.toUpperCase() == "Z") return msg.channel.send("Cannot multi-exchange")
  if (!isNaN(arg[1])) {
    sql = `call get_card('${msg.author.id}', '${arg[1]}')`;
    delsql = `call exchange_single('${msg.author.id}', '${arg[1]}')`;
  } else {
    if(!acceptable.includes(arg[1])) return;
    sql = `call exchange_characterinventory('${msg.author.id}', '${name}', '${rarity}', '${series}')`;
    delsql = `call exchange('${msg.author.id}', '${name}', '${rarity}', '${series}')`;
  }

  let currentPage = 1;
  let message;
  const displayCount = 10;
  let burnValue = 0;
  const burnArray = [1, 2, 5, 20, 150, 1000]
  let essenceCount = [0, 0, 0, 0, 0, 0]
  const embed = new Discord.MessageEmbed();

  con.query(sql, (err, rows) => {
    let itemCount = rows[0].length
    let numPages = Math.ceil(rows[0].length/displayCount);

    if(itemCount == 0) return msg.channel.send("No cards found.")

    for(i = 0; i < rows[0].length; i++) {
      burnValue += burnArray[rows[0][i].rarity_value - 1];
      essenceCount[rows[0][i].rarity_value-1]++;
    }
    sorting(itemCount,numPages,currentPage)

//START SORTING FUNCTION
    function sorting(count,totalPages,currentPage) {
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
      embed.setTitle("You are about to exchange the following for: \n" + burnValue + sapphireEmoji)

      message = msg.channel.send(embed)
      .then(function (message) {
        if(totalPages > 1) {
          message.react("⬅️");
          message.react("➡️");
        }
        message.react("✅")
        message.react("❌")
        message.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name =="⬅️" || reaction.emoji.name == "➡️" || reaction.emoji.name == "✅" || reaction.emoji.name =="❌"),{max:1, time:10000})
        .then(collected => {
          if(collected.first().emoji.name == "⬅️") {pageUpdate(count, totalPages, numPages , message)}
          else if(collected.first().emoji.name == "➡️") {pageUpdate(count, totalPages, currentPage +1 , message)}
          else if(collected.first().emoji.name == "❌") {
            embed.setColor(0xff0000)
            return message.edit(embed)
          }
          else if(collected.first().emoji.name == "✅") {exchangeFunction(message, essenceCount)}
          else{ msg.channel.send("Timed Out")}
        }).catch( () => { return})
      }).catch( () => {return msg.channel.send("Couldn't add reaction")})
    }
//END SORTING FUNCTION

//START ADD CONTENT
    function addContent(start, end) {
      var content;
      for(i = start; i < end; i++) {
        id = rows[0][i].card_id;
        name = rows[0][i].char_name;
        rarity = rows[0][i].rarity_name;
        content = content + ('`#' + id +'`' + "  `" + rarity +"` **" + name +"**\n")
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
        message.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name =="⬅️" || reaction.emoji.name == "➡️" || reaction.emoji.name == "✅" || reaction.emoji.name =="❌"),{max:1, time:10000})
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
          else if(collected.first().emoji.name == "❌") {
            embed.setColor(0xff0000)
            return message.edit(embed)
          }
          else if(collected.first().emoji.name == "✅") {exchangeFunction(message, essenceCount)}
          else { msg.channel.send("Timed Out")}
        }).catch( () => { return})
      }).catch( () => {return msg.channel.send("Couldn't add reactions")})

    //END OF PAGE UPDATE FUNCTION
    }

//END OF QUERY
  })

  function exchangeFunction(message, essenceCount) {
    con.query(sql, (err, rows) => {
      if(err) throw err;
      let burnValueCheck = 0;

      for(i = 0; i < rows[0].length; i++) {
        burnValueCheck += burnArray[rows[0][i].rarity_value-1]
      }
      if (burnValueCheck === burnValue) {
        con.query(delsql, (err, rows) => {
          if(err) throw err;
          con.query(`call exchange_inventory('${msg.author.id}', '${burnValue}', '${essenceCount[0]}', '${essenceCount[1]}', '${essenceCount[2]}', '${essenceCount[3]}', '${essenceCount[4]}', '${essenceCount[5]}')`)
        })
        let updatedTitle = "Sucessfully Exchanged the following for: \n" + burnValue + sapphireEmoji;
        for(i = 0; i < essenceCount.length; i++) {
          if(essenceCount[i] !== 0) {
            updatedTitle += " " + essenceArray[i] + essenceCount[i];
          }
        }
        embed.setColor(0x40ff40)
        embed.setTitle(updatedTitle)
        message.edit(embed)
      }
      else {
        embed.setColor(0xff0000)
        message.edit(embed)
      }
    })
  }

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

module.exports.help = {
name:"exchange"
}
