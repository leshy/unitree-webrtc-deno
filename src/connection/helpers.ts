// import { Webrtc, WebrtcConfig } from "./webrtc/webrtc"
// import { Connection } from "./connection"

// export type AnyConnection = Connection<unknown, unknown>
// export type ConnectionConfig = WebrtcConfig
// export type ConnectionOrConfig = AnyConnection | ConnectionConfig

// function isConnection(
//     connection: ConnectionOrConfig,
// ): connection is AnyConnection {
//     // check if connection is a dict
//     return connection instanceof Webrtc
// }

// // the idea is that modules that deal with robot connections
// // can either accept connection instances or connection configs (as root config optionally)
// // this function is supposed to return an instance either way
// export function connectionFromConfig(
//     connection: ConnectionOrConfig,
// ): AnyConnection {
//     if (isConnection(connection)) {
//         return connection
//     } else {
//         return new Webrtc(connection)
//     }
// }
