// modified copy from http://www.dragino.com/downloads/downloads/LGT_92/LGT-92_LoRa_GPS_Tracker_UserManual_v1.5.0.pdf
function decodeUplink(input) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var value = input.bytes[0] << 24 | input.bytes[1] << 16 | input.bytes[2] << 8 | input.bytes[3];
  var validLocation = false;
  if (input.bytes[0] & 0x80) {
    value |= 0xFFFFFFFF00000000;
  } else {
    if (value !== 0) {
      validLocation = true;
    }
  }
  var latitude = value / 1000000; // gps latitude,units: °
  value = input.bytes[4] << 24 | input.bytes[5] << 16 | input.bytes[6] << 8 | input.bytes[7];
  if (input.bytes[4] & 0x80) {
    value |= 0xFFFFFFFF00000000;
  }
  var longitude = value / 1000000; // gps longitude,units: °
  var alarm = !!(input.bytes[8] & 0x40); // Alarm status
  value = ((input.bytes[8] & 0x3f) << 8) | input.bytes[9];
  var batV = value / 1000; // Battery,units:V
  value = (input.bytes[10] & 0xC0);
  var motion_mode;
  if (value == 0x40) {
    motion_mode = "Move";
  } else if (value == 0x80) {
    motion_mode = "Collide";
  } else if (value == 0xC0) {
    motion_mode = "User";
  } else {
    motion_mode = "Disable";
  }
  var led_updown = (input.bytes[10] & 0x20) ? "ON" : "OFF"; //LED status for position,uplink and downlink
  value = input.bytes[11] << 8 | input.bytes[12];
  if (input.bytes[11] & 0x80) {
    value |= 0xFFFF0000;
  }
  var roll = value / 100; // roll,units: °
  value = input.bytes[13] << 8 | input.bytes[14];
  if (input.bytes[13] & 0x80) {
    value |= 0xFFFF0000;
  }
  var pitch = value / 100; // pitch,units: °
  var result = {
    roll: roll,
    pitch: pitch,
    batV: batV,
    vbat: batV,
    alarm: alarm,
    MD: motion_mode,
    LON: led_updown,
  };
  var warnings = [];
  if (validLocation) {
    result['latitude'] = latitude;
    result['longitude'] = longitude;
  } else {
    warnings.push("no valid location");
  }
  return {
    data: result,
    warnings: warnings,
    errors: []
  };
}
