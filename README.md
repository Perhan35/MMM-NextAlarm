# MMM-NextAlarm

A [MagicMirror²](https://magicmirror.builders) module that shows how long is left
until your next alarm, read from [Home Assistant](https://www.home-assistant.io).

```
Alarm in
⏰ 07:32 · 06:55 🏠
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
| `modeEntity` | `null` | Optional entity (e.g. an `input_select`) describing the alarm mode. |
| `noAlarmModes` | `[]` | States of `modeEntity` meaning "no alarm", e.g. `["Off"]`. The module stays hidden in these states. |
| `modeSymbols` | `{}` | Symbol shown after the countdown for each state of `modeEntity`, e.g. `{ Home: "🏠", Office: "💼" }`. |
| `showFrom` | `21` | Hour (0–23) on the day before the alarm when the countdown starts showing. |
| `symbol` | `"⏰"` | Symbol before the countdown. `""` for none. |
| `size` | `"medium"` | Countdown size: `"small"`, `"medium"`, `"large"` or `"xlarge"`. |
| `showLabel` | `true` | Show a small label above the countdown ("Alarm in", translated: en, fr, de). |
| `label` | `null` | Custom label text instead of the translated one. |
| `showAlarmTime` | `true` | Show the alarm time in small next to the countdown (follows MagicMirror's `timeFormat`). |
| `warnBelow` | `7` | Hours left under which the countdown changes color, as a short-night hint. `0` to turn off. |
| `warnColor` | `"#f0a04b"` | Color used below `warnBelow`. |
| `fadeSpeed` | `2000` | Fade-in / fade-out duration, in milliseconds. |
| `fetchInterval` | `60000` | How often Home Assistant is queried, in milliseconds. |
| `tickInterval` | `15000` | How often the countdown is redrawn, in milliseconds. |

Symbols (`symbol`, `modeSymbols`) can be an emoji or any text. A plain lowercase
name such as `"house"` or `"alarm-clock"` is shown as a
[Font Awesome](https://fontawesome.com/search?ic=free) icon instead.

A change in Home Assistant shows up on the mirror within about `fetchInterval + tickInterval`.

## License

MIT
