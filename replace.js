#!/usr/bin/env node

import fetch from "node-fetch";
import dotenv from "dotenv";
import { Buffer } from "node:buffer";
import { Command, Option } from "commander";
import log4js from "log4js";
import { diffWordsWithSpace } from "diff";
import colors from "colors";

const logger = log4js.getLogger();
dotenv.config();

const options = new Command()
  .name("replace.js")
  .description("CLI to replace strings in Confluence Pages")
  .version("0.0.1")
  .requiredOption(
    "-q, --query <query>",
    "CQL query used to search pages, eg: text~gitlab"
  )
  .requiredOption("-s, --search  <string>", "string to replace eg: gitlab")
  .requiredOption(
    "-r, --replace  <string>",
    "replacement string eg: gitlab -> github"
  )
  .addOption(
    new Option("-u, --user  <user>", "user eg: your_email@domain.com").env(
      "CONFLUENCE_USER"
    )
  )
  .addOption(
    new Option(
      "-t, --token <token>",
      "your_user_api_token with scope read:content-details:confluence,write:content:confluence"
    ).env("CONFLUENCE_TOKEN")
  )
  .addOption(
    new Option(
      "-d, --domain <domainurl>",
      "eg: https://<domain_name>.atlassian.net"
    ).env("CONFLUENCE_DOMAIN")
  )
  .addOption(
    new Option(
      "-l, --loglevel <loglevel>",
      "loglevel, eg: debug, info, warn, error, fatal"
    ).env("LOGLEVEL")
  )
  .option(
    "-c, --convertbburl",
    "convert bitbucket url format to github url format"
  )
  .option("--dryrun", "dry run only")
  .parse()
  .opts();

let user;
let token;
let query;
let domain;
let search;
let replacestr = "";
replacestr = options.replace;
query = options.query;
search = options.search;
user = options.user;
token = options.token;
domain = options.domain;

logger.level = options.loglevel ?? process.env.LOGLEVEL ?? "info";
logger.debug(options);

const searchQuery = domain + "/wiki/rest/api/content/search?cql=" + query;

const header = {
  "Content-Type": "application/json",
  Authorization: "Basic " + Buffer.from(user + ":" + token).toString("base64"),
};
logger.debug({ "searchQuery: ": searchQuery });
logger.debug(header);

fetch(searchQuery, {
  method: "GET",
  headers: header,
})
  .then((res) => res.json())
  .then((json) => {
    logger.debug({ "Content IDs: ": json.results.map((result) => result.id) });
    json.size
      ? console.table({ "Total Pages: ": json.size })
      : console.table({ "No results matching query": query });
    json.results.forEach((result) => {
      getContent(result.id);
    });
  })
  .catch((err) => {
    console.error(err);
  });

function getPageQuery(pageId) {
  return (
    domain + "/wiki/rest/api/content/" + pageId + "?expand=body.storage,version"
  );
}

function getPageUpdateQuery(pageId) {
  return domain + "/wiki/rest/api/content/" + pageId;
}

function convertBBurl2GH(content) {
  const re = /projects\/([^\/]*)\/repos\/([^\/]*)\/browse/gim;
  const subst = "$2";
  return content.replace(re, subst);
}

function replaceStr(content) {
  const replacedContent = content.replace(new RegExp(search, "ig"), replacestr);
  const replacedContent2 = options.convertbburl
    ? convertBBurl2GH(replacedContent)
    : replacedContent;
  return replacedContent2;
}

function showdiff(content, replacedContent) {
  if (content != replacedContent) {
    const dff = diffWordsWithSpace(content, replacedContent, {
      ignoreCase: true,
      ignoreWhitespace: true,
    });
    let diffstr = "";
    dff.forEach((part) => {
      const color = part.added ? "green" : part.removed ? "red" : "grey";
      // console.log(colors[color](part?.value));
      diffstr += colors[color](part?.value);
      // process.stdout.write(colors[color](part?.value ?? ""));
    });
    console.log("");
    return diffstr;
  } else {
    return "no changes";
  }
}

function getContent(id) {
  fetch(getPageQuery(id), {
    method: "GET",
    headers: header,
  })
    .then((res) => res.json())
    .then((json) => {
      const content = json.body.storage.value;
      const title = json.title;
      const type = json.type;
      const replacedContent = replaceStr(content);
      const titleReplaced = replaceStr(title);
      logger.info({ "Page ID: ": id, "Title: ": title, "Type: ": type });
      const difftitle = showdiff(title, titleReplaced);
      const diffstr = showdiff(content, replacedContent);
      process.stdout.write(diffstr) && console.log("");
      options.dryrun
        ? logger.debug({
            title,
            ...(title == titleReplaced && { "No changes to title": "" }),
            ...(content != replacedContent && {
              content,
              replacedContent,
            }),
            ...(content == replacedContent && { "No changes to content": "" }),
          })
        : updateContent(
            id,
            json.version.number + 1,
            type,
            titleReplaced,
            JSON.stringify(replacedContent)
          );
    })
    .catch((err) => {
      console.error(err);
    });
}

function updateContent(id, version, type, title, content) {
  const bodyData = `{
        "version": {
            "number": ${version}
        },
        "type": "${type}",
        "title":  "${title}",
        "body": {
            "storage": {
                "value": ${content},
                "representation": "storage"
            }
        }
    }`;
  logger.debug(bodyData.toString());
  fetch(getPageUpdateQuery(id), {
    method: "PUT",
    headers: header,
    body: bodyData,
  })
    .then((res) => res.json())
    .then((json) => {
      json.data
        ? console.log(json.data.errors)
        : console.table({
            id: json.id,
            type: json.type,
            version: json.version.number,
            title: json.title,
          });
    })
    .catch((err) => {
      console.error(err);
    });
}
