const webSocket = new WebSocket(
  `wss://realtime-api.defined.fi/graphql`,
  "graphql-transport-ws"
)

const apiKeyV3 = process.env.REACT_APP_DEFINEDFI_KEY

webSocket.onopen = () => {
  console.log("opened@@@@@@@@@");
  webSocket.send(
    JSON.stringify({
      "type": "connection_init",
      "payload": {
        "Authorization": apiKeyV3
      }
    })
  )
}

// socket.on('disconnect', (reason: any) => {
//     console.log('[socket] Disconnected:', reason);
// });

// socket.on('error', (error: any) => {
//     console.log('[socket] Error:', error);
// });

export function subscribeBars() {
    // To Do
}

export function unsubscribeFromStream() {
    // To Do
}