# Palpo-specific components

This directory contains Palpo-specific components for server management and monitoring.

## Components

* [Server Status icon](#server-status-icon)
* [Server Status page](#server-status-page)
* [Server Notifications icon](#server-notifications-icon)
* [Server Notifications page](#server-notifications-page)
* [Server Actions Page](#server-actions-page)
* [Server Commands Panel](#server-commands-panel)
* [Billing Page](#billing-page)
* [Instance config](#instance-config)

### Server Status icon

In the application bar the monitoring icon is displayed that shows the current server status, and has the following color dot (and tooltip indicators):

* 🟢 (green) - the server is up and running, everything is fine, no issues detected
* 🟡 (yellow) - the server is up and running, but there is a command in progress, so some temporary issues may occur
* 🔴 (red) - there is at least 1 issue with one of the server's components

The same icon (and link to the [Server Status page](#server-status-page)) is displayed in the sidebar.

### Server Status page

When you click on the [Server Status icon](#server-status-icon) in the application bar, you will be redirected to the
Server Status page. This page contains the following information:

* Overall server status (up/updating/has issues)
* Details about the currently running command (if any)
* Details about the server's components statuses (up/down with error details and suggested actions) by categories

### Server Notifications icon

In the application bar the notifications icon is displayed that shows the number of unread (not removed) notifications

### Server Notifications page

When you click on a notification from the [Server Notifications icon](#server-notifications-icon)'s list in the application bar, you will be redirected to the Server Notifications page. This page contains the full text of all the notifications you have about your server.

### Server Actions Page

When you click on the `Server Actions` sidebar menu item, you will be redirected to the Server Actions page.
On this page you can do the following:

* Run a command on your server immediately
* Schedule a command to run at a specific date and time
* Configure a recurring schedule for a command to run at a specific time every week

### Server Commands Panel

When you open Server Actions page, you will see the Server Commands panel.
This panel contains all the commands you can run on your server in 1 click.
Once command is finished, you will get a notification about the result.

### Billing Page

When you click on the `Billing` sidebar menu item, you will see the Billing page.
On this page you can see the list of successful payments and invoices.

### Instance config

With instance config you can whitelabel Palpo Admin, and disable some features you don't need.

**Whitelabelling** - the following customizations are available:

* Application name (browser tab title, error pages)
* Logo (login page)
* Favicon (browser tab icon)
* Background image (login page background)

**Disabling features** - the following features can be disabled:

* Server Actions
* Server Status
* Server Notifications
* Billing page
* Support page
* Federation page
* Invite tokens page
