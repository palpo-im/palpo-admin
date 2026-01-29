# Configuration

Palpo Admin could be configured using the following ways (both are optional, and both could be used together):

* By providing the `config.json` file alongside with the Palpo Admin deployment
* By providing configuration under the `im.palpo.admin` key in the `/.well-known/matrix/client` file

**Why `/.well-known/matrix/client`?**

Because any instance of Palpo Admin will automatically pick up the configuration from the homeserver.
Common use case when you have a Palpo server running, but don't want (or can't) deploy Palpo Admin alongside with it.
In this case, you could provide the configuration in the `/.well-known/matrix/client` file,
and any Palpo Admin instance will pick it up.

Another common case is when you have multiple servers running and want to use a single Palpo Admin instance to manage them all.
In this case, you could provide the configuration in the `/.well-known/matrix/client` file for each of the servers.

## Configuration options

* `restrictBaseUrl` - restrictBaseUrl restricts the Palpo Admin instance to work only with specific homeserver(-s).
  It accepts both a string and an array of strings.
  The homeserver URL should be the _actual_ homeserver URL, and not the delegated one.
  Example: `https://matrix.example.com` or `https://synapse.example.net`
  [More details](restrict-hs.md)
* `externalAuthProvider` - set if an external authentication provider is used (e.g., OIDC, LDAP, etc).
  It accepts a boolean value.
  [More details](external-auth-provider.md)
* `corsCredentials` - configure the CORS credentials for the Palpo Admin instance.
  It accepts the following values:
  * `same-origin` (default): Cookies will be sent only if the request is made from the same origin as the server.
  * `include`: Cookies will be sent regardless of the origin of the request.
  * `omit`: Cookies will not be sent with the request.
  [More details](cors-credentials.md)
* `asManagedUsers` - protect system user accounts managed by appservices (such as bridges) / system (such as bots) from accidental changes.
  By defining a list of MXID regex patterns, you can protect these accounts from accidental changes.
  Example: `^@baibot:example\\.com$`, `^@slackbot:example\\.com$`, `^@slack_[a-zA-Z0-9\\-]+:example\\.com$`, `^@telegrambot:example\\.com$`, `^@telegram_[a-zA-Z0-9]+:example\\.com$`
  [More details](system-users.md)
* `menu` - add custom menu items to the main menu (sidebar) by providing a `menu` array in the config.
  Each `menu` item can contain the following fields:
  * `label` (required): The text to display in the menu.
  * `icon` (optional): The icon to display next to the label, one of the [src/utils/icons.ts](../src/utils/icons.ts) icons, otherwise a default icon will be used.
  * `url` (required): The URL to navigate to when the menu item is clicked.
  [More details](custom-menu.md)

## Examples

### config.json

```json
{
  "restrictBaseUrl": [
    "https://matrix.example.com",
    "https://synapse.example.net"
  ],
  "asManagedUsers": [
    "^@baibot:example\\.com$",
    "^@slackbot:example\\.com$",
    "^@slack_[a-zA-Z0-9\\-]+:example\\.com$",
    "^@telegrambot:example\\.com$",
    "^@telegram_[a-zA-Z0-9]+:example\\.com$"
  ],
  "menu": [
    {
      "label": "Contact support",
      "icon": "SupportAgent",
      "url": "https://github.com/palpo-im/palpo-admin/issues"
    }
  ]
}
```

### `/.well-known/matrix/client`

```json
{
  "im.palpo.admin": {
    "restrictBaseUrl": [
      "https://matrix.example.com",
      "https://synapse.example.net"
    ],
    "asManagedUsers": [
      "^@baibot:example\\.com$",
      "^@slackbot:example\\.com$",
      "^@slack_[a-zA-Z0-9\\-]+:example\\.com$",
      "^@telegrambot:example\\.com$",
      "^@telegram_[a-zA-Z0-9]+:example\\.com$"
    ],
    "menu": [
      {
        "label": "Contact support",
        "icon": "SupportAgent",
        "url": "https://github.com/palpo-im/palpo-admin/issues"
      }
    ]
  }
}
```
