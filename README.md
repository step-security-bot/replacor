# replacor

#pre-reqs
. node


# Installation
```
npm install
```

CLI options
```
./search.js -h                                                                                                                                                             <aws:services>
Usage: search.js [options]

CLI to search Confluence Pages

Options:
  -V, --version             output the version number
  -q, --query <query>       CQL query to search for, eg: text~gitlab
  -u, --user  <user>        user eg: a@aol.com
  -t, --token <token>       API token with scope read:content-details:confluence,write:content:confluence
  -d, --domain <domainurl>  eg: https://<domain_name>.atlassian.net
  -h, --help                display help for command
```

example of an execution
```
./search.js -u $CONFLUENCE_USER -t $CONFLUENCE_TOKEN -d $CONFLUENCE_DOMAIN -q text~bitbucket.com                                                                       <aws:services>
```
