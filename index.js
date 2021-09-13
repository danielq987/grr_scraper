#!/usr/bin/env node
const axios = require("axios");
const table = require("table");
const datefns = require("date-fns");

const GENERIC_ERROR = `Something went wrong.
USAGE: \`grrAvail [mm-dd]\`.  

If no date provided, today's date will be used.
`;

const main = async () => {
  try {
    // Ignore the first two elements of argv.
    const args = process.argv.slice(2);

    let date;
    if (args[0]) {
      // Split argument by non-numbers -> parsed = [dd, mm, yyyy] or [dd, mm]
      const parsed = args[0]
        .split(/\D/)
        .filter((a) => a)
        .reverse();

      let year;
      let month = Number(parsed[1]) - 1;
      let day = Number(parsed[0]);

      if (parsed.length === 3) {
        // YYYY-MM-DD
        year = Number(parsed[2]);
      } else if (parsed.length === 2) {
        // MM-DD
        year = new Date().getFullYear();
      } else {
        throw GENERIC_ERROR;
      }

      date = new Date(year, month, day);

      // If no year was provided, ensure that the automatic date is not over a month in the past.
      if (date < datefns.subMonths(new Date(), 1) && parsed.length === 2) {
        date = datefns.addYears(date, 1);
      }
    } else {
      date = new Date();
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

      const splitted = lines[0].split(",");
      lines[0] = splitted[splitted.length - 1].trim();
      lines[1] = lines[1].replace("Availability", "");
      data.push(lines);
    }

    console.log(table.table(data));
  } catch (error) {
    console.error(error);
  }
};

main();
