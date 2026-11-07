const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
	socketNotificationReceived (notification, config) {
		if (notification !== "NEXTALARM_CONFIG" || this.timer) return;
		this.config = config;
		if (!process.env.MM_HASS_TOKEN) Log.error("MMM-NextAlarm: MM_HASS_TOKEN is not set");
		this.fetch();
		this.timer = setInterval(() => this.fetch(), config.fetchInterval);
	},

	async getState (entity) {
		const res = await fetch(`${this.config.hassUrl}/api/states/${entity}`, {
			headers: { Authorization: `Bearer ${process.env.MM_HASS_TOKEN}` }
		});
		if (!res.ok) throw new Error(`${entity}: HTTP ${res.status}`);
		return res.json();
	},

	// input_datetime exposes a `timestamp` attribute (seconds); timestamp sensors
	// carry an ISO date as their state. Returns milliseconds, or null.
	toMillis (state) {
		if (typeof state.attributes?.timestamp === "number") return state.attributes.timestamp * 1000;
		const ms = Date.parse(state.state);
		return Number.isNaN(ms) ? null : ms;
	},

	async fetch () {
		try {
			const [alarm, mode] = await Promise.all([
				this.getState(this.config.alarmEntity),
				this.config.modeEntity ? this.getState(this.config.modeEntity) : null
			]);
			this.sendSocketNotification("NEXTALARM_DATA", {
				timestamp: this.toMillis(alarm),
				mode: mode ? mode.state : null
			});
		} catch (e) {
			Log.error(`MMM-NextAlarm: ${e.message}`);
		}
	}
});
