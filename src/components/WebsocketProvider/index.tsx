import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect } from 'react'

const DEFINED_API_KEY = process.env.REACT_APP_DEFINEDFI_KEY

// price of weth on base
export const useWebsocket = () => {
  // const { data } = useQuery({
  //   queryKey: ['definedfi'],
  //   queryFn: async () => {
  //     // fetch price like normal, but the updates should be taken into account
  //     const query = `
  //       {
  //         getTokenPrices(inputs:[{address: "0x4200000000000000000000000000000000000006", networkId: 8453}]) {
  //           address networkId priceUsd
  //         }
  //       }
  //     `
  //     const response = await axios.post(
  //       'https://graph.defined.fi/graphql',
  //       {
  //         query,
  //       },
  //       {
  //         headers: {
  //           Accept: 'application/json',
  //           Authorization: DEFINED_API_KEY,
  //         },
  //       }
  //     )
  //     console.log('zeke:response', response)
  //     return response?.data?.data?.getTokenPrices
  //   },
  //   staleTime: Infinity,
  // })
  
  useEffect(() => {
    const webSocket = new WebSocket(`wss://realtime-api.defined.fi/graphql`, 'graphql-transport-ws')

    webSocket.onopen = () => {
      console.log('zeke:opened')
      webSocket.send(
        JSON.stringify({
          type: 'connection_init',
          payload: {
            Authorization: DEFINED_API_KEY,
          },
        })
      )
    }

    webSocket.onmessage = (event) => {
      // console.log('zeke:message', event.data)
      const data = JSON.parse(event.data)
      if (data.type === 'connection_ack') {
        webSocket.send(
          JSON.stringify({
            id: 'my_id',
            type: 'subscribe',
            payload: {
              variables: {
                address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
                networkId: 42161,
              },
              operationName: 'OnPriceUpdated',
              query: `
                subscription OnPriceUpdated($address: String, $networkId: Int) {
                  onPriceUpdated(address: $address, networkId: $networkId) {
                    address
                    networkId
                    priceUsd
                    timestamp
                  }
                }
              `,
            },
          })
        )
      } else {
        console.log('data', data)
      }
    }

    // // Handle incoming messages
    // webSocket.addEventListener('message', (event) => {
    //   console.log('zeke:message', event)
    // })

    // Handle socket closure
    return () => {
      webSocket.close()
    }
  }, [])
}

// export const useWebsocket = () => {
//   const queryClient = useQueryClient();

//   const { data } = useQuery({
//     queryKey: ['definedfi'],
//     queryFn: async () => {
//       // Fetch price initially
//       const query = `
//         {
//           getTokenPrices(inputs:[{address: "0x4200000000000000000000000000000000000006", networkId: 8453}]) {
//             address
//             networkId
//             priceUsd
//           }
//         }
//       `;
//       const response = await axios.post(
//         'https://graph.defined.fi/graphql',
//         { query },
//         {
//           headers: {
//             Accept: 'application/json',
//             Authorization: DEFINED_API_KEY,
//           },
//         }
//       );
//       console.log('Initial data:', response);
//       return response?.data?.data?.getTokenPrices;
//     },
//     staleTime: Infinity,
//   });

//   useEffect(() => {
//     const webSocket = new WebSocket(`wss://realtime-api.defined.fi/graphql`, 'graphql-transport-ws');

//     webSocket.onopen = () => {
//       console.log('WebSocket opened');
//       webSocket.send(
//         JSON.stringify({
//           type: 'connection_init',
//           payload: {
//             Authorization: DEFINED_API_KEY,
//           },
//         })
//       );
//     };

//     webSocket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log('WebSocket message:', data);

//       if (data.type === 'connection_ack') {
//         webSocket.send(
//           JSON.stringify({
//             id: 'price_subscription',
//             type: 'start',
//             payload: {
//               variables: {
//                 address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
//                 networkId: 42161,
//               },
//               operationName: 'OnPriceUpdated',
//               query: `
//                 subscription OnPriceUpdated($address: String, $networkId: Int) {
//                   onPriceUpdated(address: $address, networkId: $networkId) {
//                     address
//                     networkId
//                     priceUsd
//                     timestamp
//                   }
//                 }
//               `,
//             },
//           })
//         );
//       } else if (data.type === 'data' && data.id === 'price_subscription') {
//         // Update the cache with the new data
//         const updatedPrice = data.payload.data.onPriceUpdated;
//         queryClient.setQueryData(['definedfi'], (oldData) => {
//           // Update the old data with the new price
//           if (!oldData) return [updatedPrice];

//           return oldData.map((item) =>
//             item.address === updatedPrice.address && item.networkId === updatedPrice.networkId
//               ? updatedPrice
//               : item
//           );
//         });
//       }
//     };

//     // Handle socket closure
//     return () => {
//       webSocket.close();
//     };
//   }, [queryClient]);

//   return { data };
// };
