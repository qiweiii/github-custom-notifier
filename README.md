
> Too many unwanted GitHub issue/pr notifications? This web extension allows you to customize which GitHub Event to be notified.

## Screenshots

### Popup

![popup](./screenshots/popup.png)

#### Custom Notifications List

#### Configure Custom Notifications

### Options Page

## How does this work?

- Events api is useful, compared to issue based (one issue = one notificaion item) approach, events based notification can have more fine-grained notifications info display, also a lot easier to handle read / mute / deletion for storage. This also allows more notification reasons.
- Each matched event will be an notification item, with info like notify reason details: label / comment / name, issue number + title + time
- Use GitHub API to fetch events, see event contents, filter the matched events, process each event to a notification item.
- All events types
    - https://docs.github.com/en/rest/using-the-rest-api/issue-event-types?apiVersion=2022-11-28

## How to add a new notification event?

Contribution welcomed! Anyone could create a PR to add the new event type to get notifications from.

## Buy me a coffee ☕️
