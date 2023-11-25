import { nip19 } from 'nostr-tools';
import * as nostrRegex from '/lib/regex.ts';

export const nip19ToHex = (input: string): string => {
  if (input.match(nostrRegex.npub)) return nip19.decode(input).data as string;
  else if (input.match(nostrRegex.nprofile)) {
    return (nip19.decode(input).data as nip19.ProfilePointer).pubkey;
  } else if (input.match(nostrRegex.note)) {
    return nip19.decode(input).data as string;
  } else if (input.match(nostrRegex.nevent)) {
    return (nip19.decode(input).data as nip19.EventPointer).id;
  } else return input;
};
