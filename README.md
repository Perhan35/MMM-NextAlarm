# MMM-NextAlarm

A [MagicMirror²](https://magicmirror.builders) module that shows how long is left
until your next alarm, read from [Home Assistant](https://www.home-assistant.io).

```
⏰ 07:32
```

The countdown (`HH:mm`) only appears in the evening: from `showFrom` o'clock the
day before the alarm, until the alarm goes off. The rest of the time the module
is hidden.

## Installation

```sh
cd ~/MagicMirror/modules
git clone https://github.com/Perhan35/MMM-NextAlarm.git
```

No dependencies to install (uses the `fetch` built into Node.js 18+).

## Home Assistant token

1. In Home Assistant, open **Profile → Security → Long-lived access tokens** and create a token.
2. Make it available to MagicMirror as the `MM_HASS_TOKEN` environment variable,
   for example `MM_HASS_TOKEN=xxxx npm run start`, or in the `environment:` section
   of your Docker Compose file.

The token stays on the server: it is used by the node_helper and never sent to the browser.

## Configuration

```js
{
	module: "MMM-NextAlarm",
	position: "top_center",
	config: {
		hassUrl: "http://homeassistant.local:8123",
		alarmEntity: "sensor.next_alarm",
		showFrom: 21
	}
},
```

| Option | Default | Description |
| --- | --- | --- |
| `hassUrl` | `"http://homeassistant.local:8123"` | Home Assistant URL, as seen from the MagicMirror server. HTTPS works too. |
| `alarmEntity` | `"sensor.next_alarm"` | Entity holding the next alarm. Either an `input_datetime` (date and time) or a sensor whose state is a date (`device_class: timestamp`). |
| `modeEntity` | `null` | Optional entity (e.g. an `input_select`) that can turn the display off. |
| `noAlarmModes` | `[]` | States of `modeEntity` meaning "no alarm", e.g. `["Off", "None"]`. The module stays hidden in these states. |
| `showFrom` | `21` | Hour (0–23) on the day before the alarm when the countdown starts showing. |
| `symbol` | `"⏰"` | Text shown before the countdown. Use `""` for none. |
| `fetchInterval` | `60000` | How often Home Assistant is queried, in milliseconds. |
| `tickInterval` | `15000` | How often the countdown is redrawn, in milliseconds. |

A change in Home Assistant shows up on the mirror within about `fetchInterval + tickInterval`.

## License

MIT
