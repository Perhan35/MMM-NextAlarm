/* MMM-NextAlarm — temps restant avant la prochaine alarme Home Assistant.
 * Visible seulement le soir (à partir de showFrom la veille) jusqu'à l'alarme.
 * Le jeton HA est lu côté serveur (node_helper, env MM_HASS_TOKEN), jamais envoyé au navigateur. */
Module.register("MMM-NextAlarm", {
	defaults: {
		hassUrl: "http://homeassistant.local:8123",
		alarmEntity: "input_datetime.next_alarm",
		modeEntity: "input_select.reveil",
		noAlarmModes: ["Aucun"],
		showFrom: 21,               // heure (veille de l'alarme) à partir de laquelle on affiche
		symbol: "⏰",
		fetchInterval: 60 * 1000,
		tickInterval: 15 * 1000
	},

	start () {
		this.alarm = null; // Date ou null
		this.sendSocketNotification("NEXTALARM_CONFIG", this.config);
		setInterval(() => this.updateDom(), this.config.tickInterval);
	},

	socketNotificationReceived (n, p) {
		if (n !== "NEXTALARM_DATA") return;
		this.alarm = p && !this.config.noAlarmModes.includes(p.mode) && p.timestamp
			? new Date(p.timestamp * 1000) : null;
		this.updateDom();
	},

	remaining () {
		if (!this.alarm) return null;
		const now = new Date();
		const start = new Date(this.alarm);
		start.setHours(0, 0, 0, 0);
		start.setTime(start.getTime() - (24 - this.config.showFrom) * 3600 * 1000);
		if (now < start || now >= this.alarm) return null;
		const min = Math.ceil((this.alarm - now) / 60000);
		const pad = (x) => String(x).padStart(2, "0");
		return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
	},

	getDom () {
		const el = document.createElement("div");
		const r = this.remaining();
		el.className = "medium bright";
		el.textContent = r ? `${this.config.symbol} ${r}` : "";
		el.style.display = r ? "" : "none";
		return el;
	}
});
