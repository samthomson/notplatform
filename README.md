# NotPlatform - Nostr IoT Device Management

A decentralized IoT device management platform built on the Nostr protocol. Give your IoT devices their own Nostr identities, manage relay connections, and query events from your devices in real-time.

## Features

- 🤖 **Device Identity Management**: Create Nostr identities for each IoT device
- 🔐 **Secure Key Storage**: Encrypted private keys for device authentication
- 📡 **Relay Configuration**: Set custom relay connections for each device
- 🔄 **Real-time Event Streaming**: Subscribe to and query events from your devices
- 📊 **Activity Monitoring**: View device logs and event history
- 🌐 **Decentralized**: Built on Nostr protocol - no central server required

## Why NotPlatform?

Traditional IoT platforms lock you into centralized services with proprietary protocols. NotPlatform leverages the open Nostr protocol to give you:

- **Device Sovereignty**: Each device has its own Nostr keypair
- **Protocol Freedom**: Use standard Nostr relays and clients
- **Interoperability**: Devices can communicate with any Nostr-compatible service
- **Privacy**: Encrypted device credentials you control
- **No Lock-in**: Your devices, your keys, your relays

## How It Works

1. **Create Device Identity**: Generate a unique Nostr keypair for your IoT device
2. **Configure Relays**: Specify which Nostr relays the device should connect to
3. **Copy Credentials**: Get the device's naddr identifier and private key
4. **Program Device**: Configure your IoT hardware with the Nostr credentials
5. **Monitor Events**: Watch real-time events from your device on the Nostr network
6. **Query History**: View past events and activity logs

## Event Structure

### Device Configuration (Kind 34419)
Replaceable event storing device information and configuration. Each device has its own keypair - events are signed by the device's key, not the owner's key.

```json
{
  "kind": 34419,
  "pubkey": "<device-pubkey>",
  "tags": [
    ["d", "sensor-01"],
    ["name", "Living Room Sensor"],
    ["p", "<owner-pubkey>"],
    ["relay", "wss://relay.example.com"],
    ["relay", "wss://relay2.example.com"]
  ],
  "content": "<encrypted-hex-private-key>"
}
```

**Security Design:**
- Each device generates its own keypair on creation
- The device's **private key (hex format)** is encrypted to the owner's pubkey using NIP-44
- All device updates are signed with the device's key, not the owner's key
- This allows sharing the device's private key with IoT hardware without risking the owner's main identity
- The owner can decrypt and view the hex private key through the UI

### Activity Log (Kind 4171)
Regular event recording device activity:

```json
{
  "kind": 4171,
  "pubkey": "<device-pubkey>",
  "tags": [
    ["a", "34419:<device-pubkey>:<d-tag>"],
    ["event_type", "sensor_reading"],
    ["data", "temperature", "22.5"]
  ],
  "content": ""
}
```

## Device Setup

1. **Get Device ID**: Copy the naddr identifier from the device detail page
2. **Get Private Key**: Click "Decrypt" to reveal the device's private key (64-character hex string)
3. **Configure Relays**: Set the relay URLs for your device to connect to
4. **Program Hardware**: Use the credentials in your IoT device firmware
5. **Publish Events**: Device publishes events using its Nostr identity
6. **Monitor**: View real-time events in the NotPlatform dashboard

**Security Note**: The device's private key is separate from your main Nostr identity, so sharing it with IoT hardware doesn't compromise your personal account.

## Technology Stack

- **React 18**: Modern UI framework with hooks
- **Nostr Protocol**: Decentralized real-time communication
- **TailwindCSS**: Utility-first styling
- **Nostrify**: Nostr protocol implementation
- **TanStack Query**: Data fetching and caching
- **shadcn/ui**: Accessible UI components

## Development

```bash
# Install dependencies and start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Relay Configuration

The app connects to Nostr relays for device communication:
- **Default Relay**: `wss://relay.samt.st`

You can configure custom relay lists for each device through the device management interface.

## Real-time Updates

The app maintains active WebSocket connections to relays and automatically:
- Updates device lists when new devices are created
- Refreshes event streams when devices publish
- Shows new activity logs in real-time
- Syncs configuration changes across all connected clients

## Architecture

### Hooks
- `usePlantPots`: Fetch all devices for current user (to be renamed)
- `usePlantPot`: Fetch a single device by identifier (to be renamed)
- `usePlantLogs`: Fetch activity logs for a device (to be renamed)
- `usePlantPotSubscription`: Subscribe to real-time updates via WebSocket (to be renamed)

### Components
- Device list view: Grid view of all devices
- Device detail view: Configuration, logs, and event history
- Create device dialog: Form to create new device identities
- Connection status: Live relay connection indicator

### Utilities
- Helper functions for formatting and naddr generation

## Use Cases

- **Sensor Networks**: Temperature, humidity, motion sensors
- **Smart Home Devices**: Lights, switches, controllers
- **Industrial IoT**: Equipment monitoring and automation
- **Environmental Monitoring**: Weather stations, air quality sensors
- **Custom Projects**: Any IoT device that can publish Nostr events

## License

This project is vibed with [Shakespeare](https://shakespeare.diy) - an AI-powered website builder.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
