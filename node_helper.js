const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
	socketNotificationReceived (n, cfg) {
		if (n !== "NEXTALARM_CONFIG" || this.timer) return;
		this.cfg = cfg;
		this.fetch();
		this.timer = setInterval(() => this.fetch(), cfg.fetchInterval);
	},

	async state (entity) {
		const r = await fetch(`${this.cfg.hassUrl}/api/states/${entity}`, {
			headers: { Authorization: `Bearer ${process.env.MM_HASS_TOKEN}` }
		});
		if (!r.ok) throw new Error(`${entity}: HTTP ${r.status}`);
		return r.json();
	},

	async fetch () {
		try {
			const [alarm, mode] = await Promise.all([
				this.state(this.cfg.alarmEntity),
				this.state(this.cfg.modeEntity)
			]);
			this.sendSocketNotification("NEXTALARM_DATA", {
				timestamp: alarm.attributes.timestamp,
				mode: mode.state
			});
		} catch (e) {
			Log.error(`MMM-NextAlarm: ${e.message}`);
		}
	}
});
