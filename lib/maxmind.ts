import maxmind, { type AsnResponse, type CountryResponse, type Reader } from 'maxmind';
// @deno-types="@types/ip"
import { default as ip } from 'ip';

export let ASN: Reader<AsnResponse>;
export let Country: Reader<CountryResponse>;

export const init = async (): Promise<void> => {
  ASN = await maxmind.open<AsnResponse>(Deno.cwd() + '/geoip/ASN.mmdb');
  Country = await maxmind.open<CountryResponse>(
    Deno.cwd() + '/geoip/Country.mmdb',
  );
};

const IpAllowList = [
  '127.0.0.0/8',
  '192.168.0.0/16',
  '172.16.0.0/12',
  '10.0.0.0/8',
  'fe80::/10',
];

interface ASNList {
  [index: number]: boolean;
}

const AsnAllowList: ASNList = {};

const AsnDenyList: ASNList = {
  20473: true,
};

interface CountryList {
  [index: string]: boolean;
}
const CountryAllowList: CountryList = {
  JP: true,
};

export const checkIP = (access_ip: string): boolean => {
  let isAllowedIp = false;
  IpAllowList.some((value) => {
    const cidr = (() => {
      try {
        return ip.cidrSubnet(value);
      } catch (_) {
        return null;
      }
    })();
    if (cidr == null) return;
    if (cidr.contains(access_ip)) {
      isAllowedIp = true;
      return true;
    } else {
      return false;
    }
  });
  if (isAllowedIp) {
    return true;
  }

  const asn = ASN.get(access_ip);
  if (asn == null) return false;
  else if (AsnAllowList[asn.autonomous_system_number]) return true;
  else if (AsnDenyList[asn.autonomous_system_number]) return false;

  const country = Country.get(access_ip);
  if (country == null || country.country == null) return false;
  if (CountryAllowList[country.country.iso_code]) return true;
  return false;
};
