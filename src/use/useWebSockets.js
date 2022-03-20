import { AuthService } from '@/services/auth.service';

export function useWebSockets(url, name, cb) {
  const endpoint = process.env.VUE_APP_API_BASE_URL.replace('http', 'ws');
  const socket = new WebSocket(
    `${endpoint}${url}?bearer=${AuthService.getToken()}`,
  );

  const send = (msg) => {
    socket.send(JSON.stringify(msg));
  };

  socket.onmessage = (e) => {
    cb(JSON.parse(e.data));
  };
  socket.onopen = (e) => {
    window.vue.$log.debug(`open connection with ${name} socket`, e);
  };
  socket.onerror = (e) => {
    window.vue.$log.error(`error in connection with ${name} socket`, e);
  };
  socket.onclose = (e) => {
    window.vue.$log.error(`closed connection with ${name} socket`, e);
  };

  return {
    socket,
    send,
  };
}
