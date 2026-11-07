/* MMM-NextAlarm
 * Shows the time left until the next alarm stored in Home Assistant, as HH:mm.
 * Visible only in the evening (from `showFrom` o'clock the day before the alarm)
 * until the alarm time. The Home Assistant token is read by the node_helper on
 * the server and is never sent to the browser. */
Module.register("MMM-NextAlarm", {
	defaults: {
		hassUrl: "http://homeassistant.local:8123",
		alarmEntity: "sensor.next_alarm",
		modeEntity: null,          // optional entity that can disable the display
		noAlarmModes: [],          // states of modeEntity meaning "no alarm"
		modeSymbols: {},           // state of modeEntity -> symbol shown next to the countdown
		showFrom: 21,              // hour (day before the alarm) when the display starts
		symbol: "⏰",              // symbol before the countdown: emoji/text or Font Awesome name ("" for none)
		size: "medium",            // countdown size: "small", "medium", "large" or "xlarge"
		showLabel: true,           // small "Alarm in" label above the countdown
		label: null,               // custom label text (null = translated default)
		showAlarmTime: true,       // alarm time in small next to the countdown
		warnBelow: 7,              // hours left under which the countdown changes color (0 = off)
		warnColor: "#f0a04b",
		fadeSpeed: 2000,           // fade in/out duration (ms)
		fetchInterval: 60 * 1000,  // how often Home Assistant is queried (ms)
		tickInterval: 15 * 1000    // how often the countdown is redrawn (ms)
	},

	getStyles () {
		return ["MMM-NextAlarm.css"];
	},

	getTranslations () {
		return { en: "translations/en.json", fr: "translations/fr.json", de: "translations/de.json" };
	},

	start () {
		this.alarm = null;
		this.mode = null;
		this.visible = true;
		this.rendered = null;
		this.sendSocketNotification("NEXTALARM_CONFIG", this.config);
		setInterval(() => this.refresh(), this.config.tickInterval);
	},

	notificationReceived (notification) {
		if (notification === "DOM_OBJECTS_CREATED") this.refresh();
	},

	socketNotificationReceived (notification, payload) {
		if (notification !== "NEXTALARM_DATA") return;
		this.mode = payload.mode;
		const disabled = payload.mode !== null && this.config.noAlarmModes.includes(payload.mode);
		this.alarm = !disabled && payload.timestamp ? new Date(payload.timestamp) : null;
		this.refresh();
	},

	// Minutes left until the alarm, or null outside the display window.
	minutesLeft () {
		if (!this.alarm) return null;
		const now = new Date();
		const start = new Date(this.alarm);
		start.setHours(0, 0, 0, 0);
		start.setTime(start.getTime() - (24 - this.config.showFrom) * 3600 * 1000);
		if (now < start || now >= this.alarm) return null;
		return Math.ceil((this.alarm - now) / 60000);
	},

	// Redraw only when something visible changed, and fade the module in or out.
	refresh () {
		const minutes = this.minutesLeft();
		const key = minutes === null ? null : `${minutes}|${this.mode}`;
		if (key !== this.rendered) {
			this.rendered = key;
			if (key !== null) this.updateDom();
		}
		const show = minutes !== null;
		if (show === this.visible) return;
		this.visible = show;
		const lock = { lockString: this.identifier };
		if (show) this.show(this.config.fadeSpeed, lock);
		else this.hide(this.config.fadeSpeed, lock);
	},

	// A plain lowercase name (e.g. "house") is a Font Awesome icon; anything else
	// (emoji, text) is shown as is.
	icon (symbol, extraClass) {
		const isFontAwesome = /^[a-z0-9-]+$/.test(symbol);
		const el = document.createElement(isFontAwesome ? "i" : "span");
		el.className = isFontAwesome ? `fa-solid fa-${symbol} ${extraClass}` : extraClass;
		if (!isFontAwesome) el.textContent = symbol;
		return el;
	},

	getDom () {
		const wrapper = document.createElement("div");
		wrapper.className = "nextalarm";
		const minutes = this.minutesLeft();
		if (minutes === null) return wrapper;

		if (this.config.showLabel) {
			const label = document.createElement("div");
			label.className = "nextalarm-label xsmall dimmed";
			label.textContent = this.config.label ?? this.translate("ALARM_IN");
			wrapper.appendChild(label);
		}

		const line = document.createElement("div");
		line.className = "nextalarm-line";

		const countdown = document.createElement("span");
		countdown.className = `nextalarm-countdown ${this.config.size} bright`;
		if (this.config.warnBelow > 0 && minutes < this.config.warnBelow * 60) {
			countdown.style.color = this.config.warnColor;
		}
		if (this.config.symbol) countdown.appendChild(this.icon(this.config.symbol, "nextalarm-symbol"));
		const pad = (x) => String(x).padStart(2, "0");
		countdown.appendChild(document.createTextNode(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`));
		line.appendChild(countdown);

		if (this.config.showAlarmTime) {
			const time = document.createElement("span");
			time.className = "nextalarm-time small dimmed";
			time.textContent = new Intl.DateTimeFormat(config.language, {
				hour: "2-digit", minute: "2-digit", hour12: config.timeFormat === 12
			}).format(this.alarm);
			line.appendChild(time);
		}

		const modeIcon = this.config.modeSymbols[this.mode];
		if (modeIcon) line.appendChild(this.icon(modeIcon, "nextalarm-mode small dimmed"));

		wrapper.appendChild(line);
		return wrapper;
	}
});
