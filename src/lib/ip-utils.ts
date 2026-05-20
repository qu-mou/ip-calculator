// ============================================================
// IPv4 Utility Functions
// ============================================================

/**
 * Convert IP string to 32-bit unsigned integer
 */
export function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Convert 32-bit unsigned integer to IP string
 */
export function intToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

/**
 * Get subnet mask from CIDR prefix length
 */
export function prefixToMask(prefix: number): number {
  if (prefix === 0) return 0;
  return (~0 << (32 - prefix)) >>> 0;
}

/**
 * Get CIDR prefix length from subnet mask
 */
export function maskToPrefix(mask: number): number {
  if (mask === 0) return 0;
  let count = 0;
  let m = mask;
  while (m & 0x80000000) {
    count++;
    m = (m << 1) >>> 0;
  }
  return count;
}

/**
 * Calculate all network details from IP and CIDR prefix
 */
export function calculateNetwork(ip: string, prefix: number) {
  const ipInt = ipToInt(ip);
  const maskInt = prefixToMask(prefix);
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | ~maskInt) >>> 0;
  const firstUsableInt = prefix === 32 ? networkInt : (networkInt + 1) >>> 0;
  const lastUsableInt = prefix === 32 ? networkInt : (broadcastInt - 1) >>> 0;
  const totalAddresses = Math.pow(2, 32 - prefix);
  const usableAddresses = prefix >= 31 ? (prefix === 32 ? 1 : 2) : totalAddresses - 2;

  return {
    ip: intToIp(ipInt),
    network: intToIp(networkInt),
    broadcast: intToIp(broadcastInt),
    firstUsable: intToIp(firstUsableInt),
    lastUsable: intToIp(lastUsableInt),
    subnetMask: intToIp(maskInt),
    prefix,
    totalAddresses,
    usableAddresses,
    ipClass: getIpClass(ipInt),
  };
}

/**
 * Determine IP class (A, B, C, D, E)
 */
export function getIpClass(ipInt: number): string {
  const firstOctet = (ipInt >>> 24) & 255;
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D (组播)';
  return 'E (保留)';
}

/**
 * Calculate required prefix length for a given number of hosts
 */
export function hostsToPrefix(hostCount: number): number {
  if (hostCount <= 0) return 32;
  if (hostCount === 1) return 32;
  if (hostCount === 2) return 31;
  // Find the smallest prefix (largest network) where usable addresses >= hostCount
  // Start from /30 (smallest useful subnet for normal use) and go down
  for (let prefix = 30; prefix >= 0; prefix--) {
    const usableAddresses = Math.pow(2, 32 - prefix) - 2;
    if (usableAddresses >= hostCount) {
      return prefix;
    }
  }
  return 0;
}

/**
 * Convert IP to binary string representation
 */
export function ipToBinary(ip: string): string {
  return ip
    .split('.')
    .map((octet) => Number(octet).toString(2).padStart(8, '0'))
    .join('.');
}

/**
 * Convert IP to hexadecimal string representation
 */
export function ipToHex(ip: string): string {
  return ip
    .split('.')
    .map((octet) => Number(octet).toString(16).toUpperCase().padStart(2, '0'))
    .join('.');
}

/**
 * Convert IP to single decimal number
 */
export function ipToDecimal(ip: string): string {
  return ipToInt(ip).toString();
}

/**
 * Convert binary string to IP
 */
export function binaryToIp(binary: string): string {
  return binary
    .split('.')
    .map((b) => parseInt(b, 2).toString())
    .join('.');
}

/**
 * Convert hex string to IP
 */
export function hexToIp(hex: string): string {
  return hex
    .split('.')
    .map((h) => parseInt(h, 16).toString())
    .join('.');
}

/**
 * Convert single decimal number to IP
 */
export function decimalToIp(dec: string): string {
  const num = parseInt(dec, 10);
  if (isNaN(num) || num < 0 || num > 4294967295) return '';
  return intToIp(num);
}

/**
 * Calculate the wildcard (inverse) mask
 */
export function getWildcardMask(maskInt: number): number {
  return (~maskInt) >>> 0;
}

/**
 * Validate IP address format
 */
export function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = Number(part);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
}

/**
 * Validate CIDR prefix
 */
export function isValidPrefix(prefix: number): boolean {
  return prefix >= 0 && prefix <= 32 && Number.isInteger(prefix);
}

// ============================================================
// IPv6 Utility Functions
// ============================================================

/**
 * BigInt-based IPv6 utilities
 */
export function ipv6ToBigInt(ipv6: string): bigint {
  // Expand compressed form first
  const expanded = expandIPv6(ipv6);
  const groups = expanded.split(':');
  let result = 0n;
  for (const group of groups) {
    result = (result << 16n) | BigInt(parseInt(group, 16));
  }
  return result;
}

export function bigIntToIPv6(num: bigint): string {
  const groups: string[] = [];
  for (let i = 0; i < 8; i++) {
    groups.unshift((num & 0xffffn).toString(16).toUpperCase().padStart(4, '0'));
    num >>= 16n;
  }
  return compressIPv6(groups.join(':'));
}

export function expandIPv6(ipv6: string): string {
  // Handle :: expansion
  if (ipv6 === '::') return '0000:0000:0000:0000:0000:0000:0000:0000';

  let halves = ipv6.split('::');

  if (halves.length === 2) {
    const left = halves[0] ? halves[0].split(':') : [];
    const right = halves[1] ? halves[1].split(':') : [];
    const missing = 8 - left.length - right.length;
    const middle = Array(missing).fill('0000');
    const allGroups = [
      ...left.map((g) => g.padStart(4, '0').toUpperCase()),
      ...middle,
      ...right.map((g) => g.padStart(4, '0').toUpperCase()),
    ];
    return allGroups.join(':').toUpperCase();
  }

  return ipv6.split(':').map((g) => g.padStart(4, '0')).join(':').toUpperCase();
}

export function compressIPv6(ipv6: string): string {
  const expanded = expandIPv6(ipv6);
  const groups = expanded.split(':');

  // Find longest run of consecutive 0000 groups
  let bestStart = -1;
  let bestLen = 0;
  let currentStart = -1;
  let currentLen = 0;

  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0000') {
      if (currentStart === -1) currentStart = i;
      currentLen++;
      if (currentLen > bestLen) {
        bestStart = currentStart;
        bestLen = currentLen;
      }
    } else {
      currentStart = -1;
      currentLen = 0;
    }
  }

  if (bestLen >= 2) {
    const left = groups.slice(0, bestStart).map((g) => (g.replace(/^0+/, '') || '0').toUpperCase());
    const right = groups.slice(bestStart + bestLen).map((g) => (g.replace(/^0+/, '') || '0').toUpperCase());

    if (left.length === 0 && right.length === 0) return '::';
    if (left.length === 0) return '::' + right.join(':');
    if (right.length === 0) return left.join(':') + '::';
    return left.join(':') + '::' + right.join(':');
  }

  // No compression possible, just remove leading zeros
  return groups.map((g) => (g.replace(/^0+/, '') || '0').toUpperCase()).join(':').toUpperCase();
}

export function calculateIPv6Range(ipv6: string, prefix: number): { lower: string; upper: string } {
  const ipBig = ipv6ToBigInt(ipv6);
  const maskBig = prefix === 0
    ? 0n
    : ((1n << 128n) - 1n) << BigInt(128 - prefix);
  const networkBig = ipBig & maskBig;
  const hostMaskBig = ((1n << 128n) - 1n) >> BigInt(prefix);
  const broadcastBig = networkBig | hostMaskBig;

  return {
    lower: bigIntToIPv6(networkBig),
    upper: bigIntToIPv6(broadcastBig),
  };
}

export function isValidIPv6(ipv6: string): boolean {
  try {
    const expanded = expandIPv6(ipv6);
    const groups = expanded.split(':');
    if (groups.length !== 8) return false;
    return groups.every((g) => {
      const num = parseInt(g, 16);
      return !isNaN(num) && num >= 0 && num <= 0xffff;
    });
  } catch {
    return false;
  }
}
