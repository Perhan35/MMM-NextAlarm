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
		showFrom: 21,              // hour (day before the alarm) when the display starts
		symbol: "⏰",
		fetchInterval: 60 * 1000,  // how often Home Assistant is queried (ms)
		tickInterval: 15 * 1000    // how often the countdown is redrawn (ms)
	},

	start () {
		this.alarm = null;
		this.sendSocketNotification("NEXTALARM_CONFIG", this.config);
		setInterval(() => this.updateDom(), this.config.tickInterval);
	},

	socketNotificationReceived (notification, payload) {
		if (notification !== "NEXTALARM_DATA") return;
		const disabled = payload.mode !== null && this.config.noAlarmModes.includes(payload.mode);
		this.alarm = !disabled && payload.timestamp ? new Date(payload.timestamp) : null;
		this.updateDom();
	},

	remaining () {
		if (!this.alarm) return null;
		const now = new Date();
		const start = new Date(this.alarm);
		start.setHours(0, 0, 0, 0);
		start.setTime(start.getTime() - (24 - this.config.showFrom) * 3600 * 1000);
		if (now < start || now >= this.alarm) return null;
		const minutes = Math.ceil((this.alarm - now) / 60000);
		const pad = (x) => String(x).padStart(2, "0");
		return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
	},

	getDom () {
		const el = document.createElement("div");
		const text = this.remaining();
		el.className = "medium bright";
		el.textContent = text ? `${this.config.symbol} ${text}`.trim() : "";
		el.style.display = text ? "" : "none";
		return el;
	}
});
