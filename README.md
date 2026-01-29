<p align="center">
  <img alt="Palpo Admin Logo" src="./public/images/logo.webp" height="140" />
  <h3 align="center">
    Palpo Admin<br>
    <a href="./LICENSE">
      <img alt="License" src="https://img.shields.io/github/license/palpo-im/palpo-admin">
    </a>
  </h3>
  <p align="center">Feature-packed and visually customizable admin GUI for Palpo servers.</p>
</p>

---

## Features

- User management (create, edit, delete, suspend, deactivate)
- Room management (view, delete, assign admins)
- Media management and statistics
- Report handling
- Federation destinations management
- Registration tokens
- Server status monitoring
- Authenticated media support
- Visual customization and theming
- Multi-language support

## Configuration

You can use `config.json` file to configure Palpo Admin instance,
and `/.well-known/matrix/client` file to provide configuration specifically for your homeserver.

Note that configuration inside the `/.well-known/matrix/client` file should go under the `im.palpo.admin` key,
and it will override the configuration from the `config.json` file.

[Configuration options](./docs/config.md)

The `config.json` can be injected into a Docker container using a bind mount.

```yml
services:
  palpo-admin:
    ...
    volumes:
      - ./config.json:/app/config.json:ro
    ...
```

### Prefilling login form

You can prefill all fields on the login page using GET parameters.

[Documentation](./docs/prefill-login-form.md)

### Restricting available homeserver

You can restrict the homeserver(s), so that the user can no longer define it himself.

[Documentation](./docs/restrict-hs.md)

### Configuring CORS credentials

You can configure the CORS credentials mode for the Palpo Admin instance.

[Documentation](./docs/cors-credentials.md)

### Protecting appservice managed users

To avoid accidental adjustments of appservice-managed users (e.g., puppets created by a bridge) and breaking the bridge,
you can specify the list of MXIDs (regexp) that should be prohibited from any changes, except display name and avatar.

[Documentation](./docs/system-users.md)

### Adding custom menu items

You can add custom menu items to the main menu by providing a `menu` array in the config.

[Documentation](./docs/custom-menu.md)

## Usage

### Supported Server

It needs at least Palpo or [Synapse](https://github.com/element-hq/synapse) v1.116.0 for all functions to work as expected!

### Prerequisites

You need access to the following endpoints:

- `/_matrix`
- `/_synapse/admin`

### Step-By-Step install

You have three options:

1.  [Download the tarball and serve with any webserver](#steps-for-1)
2.  [Download the source code from github and run using nodejs](#steps-for-2)
3.  [Run the Docker container](#steps-for-3)

#### Steps for 1)

- make sure you have a webserver installed that can serve static files (any webserver like nginx or apache will do)
- configure a vhost for palpo admin on your webserver
- download the .tar.gz from the latest release
- unpack the .tar.gz
- move or symlink the `palpo-admin` into your vhosts root dir
- open the url of the vhost in your browser

[Reverse Proxy Documentation with Examples](./docs/reverse-proxy.md)

#### Steps for 2)

- make sure you have installed the following: git, yarn, nodejs
- download the source code: `git clone https://github.com/palpo-im/palpo-admin.git`
- change into downloaded directory: `cd palpo-admin`
- download dependencies: `yarn install`
- start web server: `yarn start`

#### Steps for 3)

- run the Docker container from the public docker registry: `docker run -p 8080:80 ghcr.io/palpo-im/palpo-admin` or use the [docker-compose.yml](docker-compose.yml): `docker-compose up -d`

  > note: if you're building on an architecture other than amd64 (for example a raspberry pi), make sure to define a maximum ram for node. otherwise the build will fail.

  > note: if you're running on a ipv4-only system, make sure to set `SERVER_HOST=0.0.0.0` env var. Otherwise palpo-admin will not be able to start.

  ```yml
  services:
    palpo-admin:
      container_name: palpo-admin
      hostname: palpo-admin
      build:
        context: https://github.com/palpo-im/palpo-admin.git
        dockerfile: Dockerfile.build
        args:
          - BUILDKIT_CONTEXT_KEEP_GIT_DIR=1
        #   - NODE_OPTIONS="--max_old_space_size=1024"
        #   - BASE_PATH="/palpo-admin"
      ports:
        - "8080:80"
      restart: unless-stopped
  ```

- browse to http://localhost:8080

### Serving Palpo Admin on a different path

The path prefix where palpo-admin is served can only be changed during the build step.

If you downloaded the source code, use `yarn build --base=/my-prefix` to set a path prefix.

If you want to build your own Docker container, use the `BASE_PATH` argument.

## Development

- See https://yarnpkg.com/getting-started/editor-sdks how to setup your IDE
- Use `yarn lint` to run all style and linter checks
- Use `yarn test` to run all unit tests
- Use `yarn fix` to fix the coding style
