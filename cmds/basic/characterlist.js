const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con, prefix) => {
  arg = msg.content.toUpperCase().substring(prefix.length).split(/[\W_]+/g)

  let currentPage = 1;
  let message;
  const displayCount = 10;
  let searchName;
  let searchSeries;
  let name = "%";
  let series = "%";
  getParameters();

  function getParameters() {
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

  let sql = `call getCharList('${name}', '${series}')`;
  con.query(sql, (err, rows) => {
    if(rows.length == 0) return;
    let seriesCount = rows[0].length
    let numPages = Math.ceil(rows[0].length/displayCount);

    const embed = new Discord.MessageEmbed();
    if(seriesCount == 0) return msg.channel.send("No characters found.")
    sorting(seriesCount,numPages,currentPage)

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
      var content = "";
      for(i = start; i < end; i++) {
        id = rows[0][i].char_id;
        name = rows[0][i].char_name;
        content = content + ('**' + id +'**' + ": " + name +"\n")
      }

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
}

module.exports.help = {
name:"characters"
}
