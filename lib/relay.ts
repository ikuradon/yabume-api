import { relayInit, type Relay, type Event } from "nostr-tools";

export let relay: Relay;
let relayUrl: string;

export const init = async (url: string) => {
  relayUrl = url;
  await connect();
};

const connect = async () => {
  relay = relayInit(relayUrl);
  await relay.connect();
};

export const getEvent = (id: string): Promise<Event<0> | null> => {
  return relay.get({ ids: [id], limit: 1 });
};

export const getProfile = (author: string): Promise<Event<0> | null> => {
  return relay.get({
    kinds: [0],
    authors: [author],
    limit: 1,
  });
};

export const publish = async (ev: Event) => {
  await relay.publish(ev);
};
