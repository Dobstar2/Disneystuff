const microbitModule = (() => {
  const SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  let device, writer, statusEl;

  function setStatusEl(el) {
    statusEl = el;
    updateStatus();
  }

  function updateStatus() {
    if (statusEl) {
      const connected = device && device.gatt.connected && writer;
      statusEl.textContent = connected ? 'Connected \u2705' : 'Not Connected \u274C';
    }
  }

  async function connect(auto = false) {
    try {
      if (!device) {
        if (auto) return updateStatus();
        device = await navigator.bluetooth.requestDevice({
          filters: [{ namePrefix: 'BBC micro:bit' }],
          optionalServices: [SERVICE]
        });
        device.addEventListener('gattserverdisconnected', () => reconnect());
      }
      if (!device.gatt.connected) {
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE);
        writer = await service.getCharacteristic(CHARACTERISTIC);
      }
      updateStatus();
    } catch (err) {
      console.error('Bluetooth error', err);
      updateStatus();
      if (!auto) throw err;
    }
  }

  async function reconnect() {
    updateStatus();
    if (device) {
      try { await connect(true); } catch(e) {}
    }
  }

  async function send(msg) {
    await connect(true);
    if (writer) {
      const data = new TextEncoder().encode(msg + '\n');
      await writer.writeValue(data);
      console.log('Sent to micro:bit:', msg);
    }
  }

  function triggerRide(id) {
    return send('ride:' + id);
  }

  function party() {
    return send('party');
  }

  return { connect, send, triggerRide, party, setStatusEl, updateStatus };
})();

window.microbitModule = microbitModule;
