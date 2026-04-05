# XO 8×8 — Usion Platform Mode Example

A multiplayer 8×8 XO game (5 in a row to win) built with the [Usion SDK](https://usions.com). Demonstrates **Platform mode** — the simplest connectivity mode where Usion relays all messages via Socket.IO. No game server needed.

## How it works

- Two players take turns placing X and O on an 8×8 grid
- First to get **5 in a row** (horizontal, vertical, or diagonal) wins
- All game logic runs client-side; the Usion backend just relays moves between players
- Uses the Usion Design System for consistent styling

## Run locally

```bash
npm install
npm run dev
```

Opens on [http://localhost:3014](http://localhost:3014).

To test with the Usion platform, register this as a service with `iframe_url` pointing to your local or deployed URL.

## Deploy to Vercel

```bash
npx vercel --prod
```

## Register as an Usion service

In the Usion Service Creator, register with:

- **Type:** Game
- **Mode:** Platform
- **iframe URL:** Your deployed Vercel URL
- **Min/Max players:** 2

The service config should include:

```json
{
  "realtime": {
    "connection_mode": "platform",
    "connection_transport": "websocket",
    "protocol_version": "2"
  },
  "game_config": {
    "game_type": "xo_8x8",
    "max_players": 2,
    "min_players": 2,
    "initial_state": {
      "board": ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      "moves": 0
    }
  }
}
```

## SDK

This example loads the Usion SDK and Design System directly from the CDN:

- `https://usions.com/usion-sdk.js` — Usion game SDK
- `https://usions.com/usion-design-system.css` — Usion design system

You can also install via npm: `npm install @usions/sdk`

## License

MIT
