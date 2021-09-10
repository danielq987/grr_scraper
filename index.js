const axios = require("axios");
const table = require("table");
const datefns = require("date-fns");

const main = async () => {
  try {
    const args = process.argv.slice(2);

    let dateString;
    if (args[0]) {
      console.log(args);
      if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(args[0])) {
        dateString = args[0];
      } else if (/^\d{1,2}[-/]\d{2}$/.test(args[0])) {
        dateString = `${new Date().getFullYear()}-${args[0]}`;
      } else {
        throw "Invalid date string";
      }
    } else {
      dateString = new Date().toISOString().split("T")[0];
    }

    dateString = dateString.replace("/", "-");

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

    const data = [];

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
