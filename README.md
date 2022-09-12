# Pre-Reqs

* [Install node.js](https://nodejs.org/en/)
* [API Token with scope read:content-details:confluence,write:content:confluence](https://id.atlassian.com/manage/api-tokens)



# Setup
```
npm install
```

# Search CLI
```
./search.js -h                                                                                                                                                           
Usage: search.js [options]

CLI to search Confluence Pages

Options:
  -V, --version             output the version number
  -q, --query <query>       CQL query to search for, eg: text~gitlab
  -u, --user  <user>        user eg: your_email@domain.com
  -t, --token <token>       your_user_api_token with scope read:content-details:confluence,write:content:confluence
  -d, --domain <domainurl>  eg: https://<domain_name>.atlassian.net
  -h, --help                display help for command
```

example of an execution
```
./search.js -u $CONFLUENCE_USER -t $CONFLUENCE_TOKEN -d $CONFLUENCE_DOMAIN -q text~bitbucket.com                                                                       
```

# Search & Replace CLI
```
./replace.js -h                                                                                                                                   
Usage: replace.js [options]

CLI to replace strings in Confluence Pages

Options:
  -V, --version             output the version number
  -q, --query <query>       CQL query used to search pages, eg: text~gitlab
  -s, --search  <string>    string to replace eg: gitlab
  -r, --replace  <string>   replacement string eg: gitlab -> github
  -u, --user  <user>        user eg: your_email@domain.com
  -t, --token <token>       your_user_api_token with scope read:content-details:confluence,write:content:confluence
  -d, --domain <domainurl>  eg: https://<domain_name>.atlassian.net
  -h, --help                display help for command
  ```
  
  example of an execution
```
./replace.js -u $CONFLUENCE_USER -t $CONFLUENCE_TOKEN -d $CONFLUENCE_DOMAIN -q text~searchexpression -s <text2replace> -r <replacement-text>                                                           
```

# Reference
https://developer.atlassian.com/server/confluence/advanced-searching-using-cql
https://developer.atlassian.com/server/confluence/performing-text-searches-using-cql
