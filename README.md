To build the application, just set the required environment variables and use `docker compose`, as shown below:

```
SECRET='superSecretToken' \
  DOMAIN='<your_hostname>' \
  ADMINPWD='superSecretPassword' \
  EASYFLAG='flag{fake_easy_flag}' \
  MEDIUMFLAG='flag{fake_medium_flag}' \
  HARDFLAG='flag{fake_hard_flag}' \
  docker compose up --build --detach
```

Then you can access the application at http://<your_hostname>

_Note: When testing locally, set DOMAIN to 'nginx' and uncomment the relevant lines in pup.js (see `app/pup.js` for more info)._
