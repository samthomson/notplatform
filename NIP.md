# NIP-XX: NotPlatform - Decentralized IoT Device Management Protocol

## Abstract

This NIP defines event kinds for managing IoT devices using Nostr as the communication protocol. It enables users to create device identities, configure relay connections, and receive activity logs from IoT devices without relying on centralized platforms.

## Event Kinds

### Kind 34419: Device Configuration

A parameterized replaceable event representing a single IoT device with its configuration and metadata.

**Structure:**
```json
{
  "kind": 34419,
  "pubkey": "<device-pubkey>",
  "content": "<encrypted-hex-private-key>",
  "tags": [
    ["d", "sensor-01"],
    ["name", "Living Room Sensor"],
    ["p", "<owner-pubkey>"],
    ["relay", "wss://relay.example.com"],
    ["relay", "wss://relay2.example.com"],
    ["client", "notplatform"],
    ["alt", "IoT device configuration for Nostr-based device management"]
  ]
}
```

**Tags:**
- `d` (required): Unique identifier for the device (used for replaceability)
- `name` (optional): Human-readable display name
- `p` (required): Owner's pubkey who created this device
- `relay` (optional, multiple): Relay URLs the device should connect to
- `client` (optional): Client application identifier
- `alt` (required): NIP-31 human-readable description

**Content:**
The device's private key (64-character hex string) encrypted to the owner's pubkey using NIP-44 encryption. This allows the owner to share the private key with IoT devices without compromising their main identity.

**Replaceability:**
Events are unique per `device-pubkey + kind + d-tag`. Each device generates its own keypair on creation and signs all updates with that key.

---

### Kind 4171: Device Activity Log

A regular event recording device activity and sensor data.

**Structure:**
```json
{
  "kind": 4171,
  "pubkey": "<device-pubkey>",
  "content": "",
  "tags": [
    ["a", "34419:<device-pubkey>:<d-tag>"],
    ["event_type", "sensor_reading"],
    ["data", "temperature", "22.5"],
    ["data", "humidity", "65"],
    ["client", "esp32-sensor"],
    ["alt", "IoT device activity log - sensor reading"]
  ]
}
```

**Tags:**
- `a` (required): References the device using addressable event coordinate
- `event_type` (required): Type of activity (e.g., "sensor_reading", "status_update", "alert")
- `data` (optional, multiple): Key-value pairs for sensor data or metadata
- `client` (optional): IoT device identifier
- `alt` (required): NIP-31 human-readable description

**Published by:** IoT device (signed with device's private key)

---

## Workflow

### Creating a Device (Web Application)

1. User creates device with name "Living Room Sensor"
2. Application generates new keypair for the device
3. Application encrypts device's hex private key to user's pubkey (NIP-44)
4. Application publishes kind 34419 event signed with device's key
5. Event includes `d` tag with identifier, `name` tag with display name, and `relay` tags for relay configuration

### Configuring Relays (Web Application)

1. User adds relay URLs to device configuration
2. Application decrypts device's private key
3. Application fetches current kind 34419 event
4. Application adds/updates relay tags
5. Application republishes kind 34419 event (replaces previous version)

### IoT Device Setup

1. User clicks "Decrypt" to reveal device's hex private key
2. User copies hex private key and d-tag identifier
3. User configures IoT device with:
   - Relay URLs (from relay tags)
   - Device private key (hex)
   - Device d-tag identifier

### IoT Device Operation

1. IoT device subscribes to relay for kind 34419 events matching its pubkey + d-tag
2. IoT device receives configuration updates
3. IoT device publishes activity:
   - Publishes kind 4171 log events with sensor data
   - Includes `event_type` tag to categorize activity
   - Includes `data` tags with sensor readings or metadata
4. Web application queries kind 4171 events with `#a` tag matching device coordinate

### Viewing Activity Logs (Web Application)

1. Application queries kind 4171 events with `#a` tag matching device coordinate
2. Displays activity logs with timestamps and data
3. Auto-refreshes to show new logs in real-time via WebSocket subscriptions

## Security Model

Each device has its own keypair separate from the owner's identity:

- **Owner's key**: Creates and manages devices through web interface
- **Device's key**: Signs all device events and is shared with IoT hardware
- **Benefit**: If IoT device is compromised, only that device is affected, not the owner's main Nostr identity

The device's private key is stored encrypted in the event content, only decryptable by the owner.

## Implementation Notes

- Device identifiers (d-tags) should be automatically slugified (lowercase, hyphens only)
- IoT devices should preserve all tags when updating device events (especially `p`, `name`, `content`, `relay`)
- Activity logs use regular events (not replaceable) to maintain complete history
- Web applications should use WebSocket subscriptions for real-time updates
- Multiple relay tags allow devices to connect to multiple Nostr relays
- Event types should be standardized per use case (sensor_reading, status_update, alert, etc.)

## Use Cases

### Sensor Networks
```json
{
  "kind": 4171,
  "tags": [
    ["event_type", "sensor_reading"],
    ["data", "temperature", "22.5"],
    ["data", "humidity", "65"],
    ["data", "pressure", "1013.25"]
  ]
}
```

### Smart Home Devices
```json
{
  "kind": 4171,
  "tags": [
    ["event_type", "status_update"],
    ["data", "state", "on"],
    ["data", "brightness", "75"]
  ]
}
```

### Industrial Monitoring
```json
{
  "kind": 4171,
  "tags": [
    ["event_type", "alert"],
    ["data", "level", "warning"],
    ["data", "message", "Temperature exceeds threshold"]
  ]
}
```

## References

- [NIP-01: Basic Protocol](https://github.com/nostr-protocol/nips/blob/master/01.md)
- [NIP-31: Alt Tags](https://github.com/nostr-protocol/nips/blob/master/31.md)
- [NIP-44: Encrypted Payloads](https://github.com/nostr-protocol/nips/blob/master/44.md)
