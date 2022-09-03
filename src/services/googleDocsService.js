const { google } = require("googleapis");
const keys = require("../google-keys");

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

client.authorize((err, tokens) => {
  if (err) {
    console.log(err);
    return;
  }
});

class GoogleDocsOps {
  // Exporting restaurants per city
  async exportRestaurants(client, restaurantData) {
    const columnNames = ["_id", "name", "address", "phone", "city", "category"];
    const rawData = [];
    restaurantData.map((v) => {
      const tempData = Object.keys(v).map((key) => {
        return v[key];
      });
      rawData.push(tempData);
      return;
    });

    let exportData = [];
    rawData.map((v) => {
      let tempData = [];
      for (let i = 0; i < 3; i++) {
        tempData.push(v[i]);
      }
      tempData.push(v[3].replace(/\s/g, "", ""));
      tempData.push(v[4]);
      tempData.push(v[5].join());
      exportData.push(tempData);
      return;
    });

    exportData.unshift(columnNames);

    const gsapi = google.sheets({ version: "v4", auth: client });

    const options = {
      spreadsheetId: "18y9qQ-gkZunAZJCpNmx6I_vVlzYiG0L-FTP2O1kecCA",
      range: "restaurants!A1",
      valueInputOption: "USER_ENTERED",
      resource: { values: exportData },
    };

    await gsapi.spreadsheets.values.update(options);

    return;
  }

  // Exporting menues per restaurant
  async exportMenus(client, menuData) {
    const columnNames = [
      "restaurantId",
      "name",
      "description",
      "price",
      "imageUrl",
    ];
    const rawData = [];
    menuData.map((v) => {
      const tempData = Object.keys(v).map((key) => {
        return v[key];
      });
      rawData.push(tempData);
      return;
    });
    let exportData = [];
    rawData.map((v) => {
      let tempData = [];
      for (let i = 1; i < v.length; i++) {
        if (v[i].split(" ")[0] === "+") {
          let el = v[i].replace("+", "");
          tempData.push(el);
        } else {
          tempData.push(v[i]);
        }
      }
      exportData.push(tempData);
    });
    exportData.unshift(columnNames);

    const gsapi = google.sheets({ version: "v4", auth: client });
    const options = {
      spreadsheetId: "18y9qQ-gkZunAZJCpNmx6I_vVlzYiG0L-FTP2O1kecCA",
      range: "menus!A1",
      valueInputOption: "USER_ENTERED",
      resource: { values: exportData },
    };

    await gsapi.spreadsheets.values.update(options);

    return;
  }
}

module.exports = new GoogleDocsOps();
