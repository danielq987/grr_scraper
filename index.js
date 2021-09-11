const axios = require("axios");
const table = require("table");
const datefns = require("date-fns");

const main = async () => {
  try {
    const args = process.argv.slice(2);

    let date;
    if (args[0]) {
      const parsed = args[0]
        .split(/\D/)
        .filter((a) => a)
        .reverse();

      let year;
      let month = Number(parsed[1]) - 1;
      let day = Number(parsed[0]);
      if (parsed.length === 3) {
        year = Number(parsed[2]);
      } else if (parsed.length === 2) {
        year = new Date().getFullYear();
      } else {
        throw "Invalid date string";
      }

      date = new Date(year, month, day);
    } else {
      dateString = new Date();
    }

    dateString = datefns.format(date, "yyyy-MM-dd");

    const result = await axios.post(
      "https://app.rockgympro.com/b/widget/?a=equery",
      `PreventChromeAutocomplete=&random=613b9f409916b&iframeid=rgpiframe613b804a0d7ba&mode=e&fctrl_1=offering_guid&offering_guid=bade513c97b64dc1969d61ec2a9b489a&fctrl_2=course_guid&course_guid=&fctrl_3=limited_to_course_guid_for_offering_guid_bade513c97b64dc1969d61ec2a9b489a&limited_to_course_guid_for_offering_guid_bade513c97b64dc1969d61ec2a9b489a=&fctrl_4=show_date&show_date=${dateString}&fctrl_5=promo_code_bade513c97b64dc1969d61ec2a9b489a&promo_code_bade513c97b64dc1969d61ec2a9b489a=&ftagname_0_pcount-pid-1-1804=pcount&ftagval_0_pcount-pid-1-1804=1&ftagname_1_pcount-pid-1-1804=pid&ftagval_1_pcount-pid-1-1804=1804&fctrl_6=pcount-pid-1-1804&pcount-pid-1-1804=0`,
      {
        headers: {
          "Content-Type": "text/plain",
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
      }
    );

    const rows = result.data.event_list_html.split("<tr>").slice(1);

    const data = [[dateString, "Availability"]];

    for (let row of rows) {
      row = row.replace(/(\<.*?\>)/g, "");
      let lines = row
        .split(/\r?\n/g)
        .filter((a) => a)
        .slice(0, 2);

      lines[0] = lines[0].split(",").at(-1).trim();
      lines[1] = lines[1].replace("Availability", "");
      data.push(lines);
    }

    console.log(table.table(data));
  } catch (error) {
    console.error(error);
  }
};

main();
