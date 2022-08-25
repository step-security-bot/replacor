#!/usr/bin/env node
//##!/opt/homebrew/bin/node

import fetch from "node-fetch";
import dotenv from 'dotenv'
import {Buffer} from 'node:buffer';
import {Command} from 'commander';

dotenv.config();

process.env.CONFLUENCE_URL ? console.log("CONFLUENCE_URL:" + process.env.CONFLUENCE_URL) : console.log("CONFLUENCE_URL not set");
process.env.CONFLUENCE_API_TOKEN ? console.log("CONFLUENCE_API_TOKEN is set") : console.log("CONFLUENCE_API_TOKEN not set");
process.env.CONFLUENCE_USER ? console.log("CONFLUENCE_USER:" + process.env.CONFLUENCE_USER) : console.log("CONFLUENCE_USER not set");


//confluence search query to get all the content ids that match the search term
const searchQuery1 = `
query {
  search(query: "space:${process.env.SPACE_KEY}", type: page) {
    results {
      id
    }
  }
}
`;

const searchstring = "";

const searchurl = process.env.CONFLUENCE_URL + "/wiki/rest/api/content/search";
const searchQuery = searchurl + "?cql=text~gitlab" + searchstring;
console.log("searchQuery: " + searchQuery);

const encodedtoken = Buffer.from(`${process.env.CONFLUENCE_USER}:${process.env.CONFLUENCE_API_TOKEN}`).toString('base64');
console.log("encodedtoken: " + encodedtoken);

fetch(searchQuery, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedtoken}`,
    }
    //body: JSON.stringify({query: searchQuery}),
}).then(res => res.json()).then(json => {
    console.log("Total Size: " + json.size);
    console.log("Content IDs: " + json.results.map(result => result.id));
    json.results.forEach(result => {
        console.log(result.id);
    });

}).catch(err => {
    console.log(err);
})


const bodyData = `{
  "version": {
    "number": $version
  },
  "type": "page",
  "body": {
    "storage": {
      "value": "$value",
      "representation": "storage"
    }
  }
}`;

/*fetch('https://$DOMAIN.atlassian.net/wiki/rest/api/content/{id}', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer $process.env.BBTOKEN',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: bodyData
})
    .then(response => {
        console.log(
            `Response: ${response.status} ${response.statusText}`
        );
        return response.text();
    })
    .then(text => console.log(text))
    .catch(err => console.error(err));*/