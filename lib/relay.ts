import { type Event, Relay } from 'nostr-tools';

export let relay: Relay;
let relayUrl: string;

export const init = async (url: string) => {
  relayUrl = url;
  await connect();
};

const connect = async () => {
  relay = await Relay.connect(relayUrl);
};

export const getEvent = (id: string): Promise<Event | null> => {
  return new Promise((resolve, reject) => {
    const sub = relay.subscribe([
      { ids: [id], limit: 1 },
    ], {
      onevent(event) {
        resolve(event);
      },
      oneose() {
        sub.close();
        reject(null);
      },
    });
  });
};

export const getProfile = (author: string): Promise<Event | null> => {
  return new Promise((resolve, reject) => {
    const sub = relay.subscribe([
      {
        kinds: [0],
        authors: [author],
        limit: 1,
      },
    ], {
      onevent(event) {
        resolve(event);
      },
      oneose() {
        sub.close();
        reject(null);
      },
    });
  });
};

export const publish = async (ev: Event) => {
  await relay.publish(ev);
};
