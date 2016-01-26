load('sbbsdefs.js');

function wstsGetIPAddress() {

	try {

		var ip = [];
		var data = [];

		console.lock_input(true);
		console.telnet_cmd(253, 28); // DO TTYLOC

		var stime = system.timer;
		while (system.timer - stime < 1) {
			if (!client.socket.data_waiting) continue;
			data.push(client.socket.recvBin(1));
			if (data.length >= 14 &&
				data[data.length - 3] !== 255 &&
				data[data.length - 2] === 255 &&
				data[data.length - 1] === 240
			) {
				break;
			}
		}

		// Check for a valid reply
		if (data.length < 14 || // Minimum response length
			// Should start like this
			data[0] !== 255 || // IAC
			data[1] !== 250 || // SB
			data[2] !== 28 || // TTYLOC
			data[3] !== 0 || // FORMAT
			// Should end like this
			data[data.length - 2] !== 255 || // IAC
			data[data.length - 1] !== 240 // SE
		) {
			throw 'Invalid reply to TTYLOC command.';
		}

		for (var d = 4; d < data.length - 2; d++) {
			ip.push(data[d]);
			if (data[d] === 255) d++;
		}
		if (ip.length !== 8) throw 'Invalid reply to TTYLOC command.';

	} catch (err) {

		log(LOG_DEBUG, err);

	} finally {

		console.lock_input(false);

		if (ip.length !== 8) {
			return;
		} else {
			return ip.slice(0, 4).join('.');
		}

	}

}

function wsrsGetIPAddress() {

	var fn = format('%suser/%04d.web', system.data_dir, user.number);
	if (!file_exists(fn)) return;
	var f = new File(fn);
	if (!f.open('r')) return;
	var session = f.iniGetObject();
	f.close();
	if (typeof session.ip_address === 'undefined') return;

	return session.ip_address;

}