const Discord = require("discord.js");

module.exports.run =  async (bot, msg, arg, con) => {
  let currentPage = 1;
  let message;
  const displayCount = 10;
  let sql = `CALL getSeriesList`
  con.query(sql, (err, rows) => {
    let seriesCount = rows[0].length
    let numPages = Math.ceil(rows[0].length/displayCount);

    const embed = new Discord.MessageEmbed();
    if(seriesCount == 0) return msg.channel.send("No series found.")
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
      var content;
      for(i = start; i < end; i++) {
        id = rows[0][i].series_id;
        name = rows[0][i].series_name;
        content = content + ('**' + id +'**' + ": " + name +"\n")
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
}

module.exports.help = {
name:"series"
}
