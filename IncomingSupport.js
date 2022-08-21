var supp_data;
var progress = 0;
var units = game_data.units;
var total_units = initializeUnits();
var players = {};
var tbl;

function initializeUnits() {
  let base_units = {};
  for (let key in units) {
    let unit_type = units[key];
    if (unit_type == "militia")
      continue;
    base_units[unit_type] = 0;
  }
  return base_units;
}
//---->INCOMMING_SUPPORTS<----
function get_incomming_supports() {
  if (progress == 0) {
    supp_data = $("span[data-command-type='support']");
  }
  if (progress >= supp_data.length) {
    return;
  }

  $.ajax({
    url: "https://" + document.location.host + "/game.php?village=" + game_data.village.id + "&screen=info_command&ajax=details&id=" + $(supp_data).eq(progress).attr("data-command-id"),
    async: true,
    success: function (result) {
      if (result != '{"no_authorization":true}') {
        let data = result;
        let sp_d_cont = $(supp_data[progress]).parent().siblings(".quickedit-label").eq(0);
        var oreg = $(".command_hover_details").eq(progress).hasClass("commandicon-ally");
        let html = "";
        for (let x = 0; x < units.length; x++) {
          let unit_type = units[x];
          if (unit_type == "militia")
            continue;
          let unit_count = data.units[units[x]].count;
          total_units[unit_type] += parseInt(unit_count);
          if (total_units[unit_type] == "0")
            continue;

          html += `<img src="https://dshu.innogamescdn.com/asset/cf618eb/graphic/unit/unit_${unit_type}.png">${total_units[unit_type]} `;
          
          let maybePlayerName = sp_d_cont[0].innerText;

          if (oreg === true) {
            console.log(total_units);
            maybePlayerName = maybePlayerName.trim();
          } else {
            console.log("oreg - else");
            maybePlayerName = game_data.player.name;
          }

          if (!(maybePlayerName in players))
            players[maybePlayerName] = initializeUnits();
            players[maybePlayerName][unit_type] += parseInt(unit_count);
        }
        $(sp_d_cont).html(html);
      }
      ++progress;
      setTimeout(get_incomming_supports, 250);
    }
  })
}

function alw_check_commands() {
  $("span").each(function () {
    if ($(this).text().indexOf("0:00:1") > -1 || $(this).text().indexOf("0:00:0") > -1) {
      $(this).parent().parent().remove();
    }
  });
  setTimeout(alw_check_commands, 6000);
}

(() => {
  initializeUnits(total_units);
  alw_check_commands();
  get_incomming_supports();
})();
