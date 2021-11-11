var supp_data;
var progress = 0;
var units = game_data.units;
var total_units = initializeUnits();
var players = {};

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

function createTable() {
  let body = document.getElementById("content_value");
  tbl = document.createElement('table');
  tbl.className = "vis";
  tbl.id = "incomings_summary";
  tbl.style = "margin-left:auto; margin-right:auto;"

  let keys = Object.keys(players);
  for (let row = 0; row < keys.length + 2/*total+tags*/; ++row) {
    let tr = tbl.insertRow();
    for (let key = 0; key < Object.keys(total_units).length + 1/*player*/; ++key) {
      let td = tr.insertCell();
      td.style = "text-align:center";
      let unitKey = key-1;
      if (key == 0)
        td.style.fontWeight = 'bold';
      if (row == 0) { // First row
        if (key == 0) {
          td.appendChild(document.createTextNode("Jednotky"));
        } else {
          let img = document.createElement('img');
          img.src = "https://dshu.innogamescdn.com/asset/cf618eb/graphic/unit/unit_" + units[unitKey] + ".png";
          td.appendChild(img);
        }
      } else {
        if (row == 1) { // Second row
          if (key == 0) {
            td.appendChild(document.createTextNode("Celkem"));
          } else {
            td.appendChild(document.createTextNode(total_units[units[unitKey]]));
          }
        } else {
          let player = keys[row-2];
          if (key == 0) {
            td.appendChild(document.createTextNode(player));
          } else {
            td.appendChild(document.createTextNode(players[player][units[unitKey]]));
          }
        }
      }
    }
  }
  body.prepend(tbl);
  $("#incomings_summary").append(`<tr><td style = "text-align: right; font-weight: bold;" colspan = "${$("#incomings_summary").find("tr").eq(0).find("td").length}">Celkem: <img src = "https://dshu.innogamescdn.com/asset/4b16a6f/graphic/buildings/farm.png">${total_farm_capacity()} jednotek selského dvora</td></tr>`);
  let inc = document.getElementById("incomings_summary");
  inc.scrollIntoView(false);
  
}

function forum_txt_generator(){
	var forum_post_txt = "[table]";
	
	var rows = $("#incomings_summary").find("tr");
	for(var x = 0; x < rows.length; x++){
		if(x == 0){
			var cols = $(rows[x]).find("td");
			forum_post_txt += "[**]";
			for(var y = 0; y < cols.length; y++){
				if(y == 0){
					forum_post_txt += "[b]" + $(cols[y]).text().trim() + "[/b]";
				}else{
					forum_post_txt += "[||][unit]" + $(cols[y]).find("img").attr("src").match(/unit_\w+.png/)[0].replace("unit_", "").replace(".png", "") + "[/unit]";
				}
			}
			forum_post_txt += "[/**]";
		}else if(x == 1){
			var cols = $(rows[x]).find("td");
			forum_post_txt += "[**]Celkem";
			for(var y = 1; y < cols.length; y++){
				forum_post_txt += "[||]" + $(cols[y]).text().trim();
			}
			forum_post_txt += "[/**]";
		}else if(x+1 == rows.length){
			forum_post_txt += "[**]";
			forum_post_txt += "Celkem: " + $(rows[x]).text().match(/\d+/)[0] + " tanyahelynyi egysÃ©g";
			forum_post_txt += "[/**]";
		}else{
			var cols = $(rows[x]).find("td");
			forum_post_txt += "[*]";
			for(var y = 0; y < cols.length; y++){
				if(y == 0){
					forum_post_txt += "[player]" + $(cols[y]).text().trim() + "[/player]";
				}else{
					forum_post_txt += "[|]" + $(cols[y]).text().trim();
				}
			}
			forum_post_txt += "[/*]";
		}
		
	}
	forum_post_txt += "[/table]";
	$("#incomings_summary").append(`<details>
						<summary>Forum tabulka</summary>
					<textarea cols = "100" rows = "20">${forum_post_txt}</textarea>
				</details>`);
}
//---->INCOMMING_SUPPORTS<----
function get_incomming_supports() {
  if (progress == 0) {
    supp_data = $("span[data-command-type='support']");
  }
  if (progress >= supp_data.length) {
    createTable();
    forum_txt_generator();
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
          if (unit_count == "0")
            continue;
          html += `<img src="https://dshu.innogamescdn.com/asset/cf618eb/graphic/unit/unit_${unit_type}.png">${unit_count} `;
          total_units[unit_type] += parseInt(unit_count);
          let maybePlayerName = sp_d_cont[0].innerText;

          if (oreg === true) {
            maybePlayerName = maybePlayerName.trim();
          } else {
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
function total_farm_capacity(){
	var units_and_capacity = {"spear": 1, "sword": 1, "axe": 1, "archer": 1, "spy": 2, "light": 4, "heavy": 6, "marcher": 5, "ram": 5, "catapult": 8, "knight": 10, "snob": 100};
	var total = 0;
	for(var x = 0; x < game_data.units.length; x++){
		if(game_data.units[x] == "militia")
			continue;
		total += total_units[game_data.units[x]] * units_and_capacity[game_data.units[x]];
	}
	return total;
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