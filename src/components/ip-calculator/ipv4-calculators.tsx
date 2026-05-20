'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  calculateNetwork,
  prefixToMask,
  intToIp,
  maskToPrefix,
  ipToInt,
  getWildcardMask,
  ipToBinary,
  ipToHex,
  binaryToIp,
  hexToIp,
  decimalToIp,
  ipToDecimal,
  hostsToPrefix,
  isValidIp,
  isValidPrefix,
} from '@/lib/ip-utils';

// ============================================================
// Shared Components
// ============================================================
function IPOctetInput({
  value,
  onChange,
}: {
  value: number[];
  onChange: (val: number[]) => void;
}) {
  const handleChange = (index: number, val: string) => {
    const num = val === '' ? 0 : parseInt(val, 10);
    if (isNaN(num) || num < 0 || num > 255) return;
    const newVal = [...value];
    newVal[index] = num;
    onChange(newVal);
  };

  return (
    <div className="flex items-center gap-0">
      {value.map((v, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <span className="text-muted-foreground font-mono text-[11px] px-0.5">.</span>}
          <Input
            className="w-11 h-7 text-center font-mono text-[11px] px-1"
            value={v}
            onChange={(e) => handleChange(i, e.target.value)}
          />
        </span>
      ))}
    </div>
  );
}

/** 单行结果：标签在左，值在右（适合短值如IP地址） */
function ResultInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="text-[12px] font-mono break-all text-right">{value || '—'}</span>
    </div>
  );
}

/** 块级结果：标签在左，值在右（与ResultInline一致，右对齐） */
function ResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="text-[12px] font-mono break-all text-right">{value || '—'}</span>
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded border bg-muted/30 p-2">
      <h4 className="font-semibold text-[11px] mb-1">处理结果</h4>
      {children}
    </div>
  );
}

// ============================================================
// 1. 网络IP地址计算器
// ============================================================
function NetworkIPCalculator() {
  const [ip, setIp] = useState([192, 168, 0, 1]);
  const [prefix, setPrefix] = useState(24);

  const result = useMemo(() => {
    const ipStr = ip.join('.');
    if (!isValidIp(ipStr) || !isValidPrefix(prefix)) return null;
    return calculateNetwork(ipStr, prefix);
  }, [ip, prefix]);

  const clear = useCallback(() => {
    setIp([0, 0, 0, 0]);
    setPrefix(24);
  }, []);

  const copyResult = useCallback(() => {
    if (!result) return;
    const text = `IP地址: ${result.ip}\n子网掩码: ${result.subnetMask}\n网络地址: ${result.network}\n第一个可用: ${result.firstUsable}\n最后可用: ${result.lastUsable}\n广播地址: ${result.broadcast}\n可用地址数: ${result.usableAddresses}\n地址总数: ${result.totalAddresses}`;
    navigator.clipboard.writeText(text);
  }, [result]);

  return (
    <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
      <CardHeader className="px-3 py-2 pb-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">网络IP地址计算器</CardTitle>
          <div className="flex items-center gap-1">
            <IPOctetInput value={ip} onChange={setIp} />
            <span className="text-muted-foreground font-mono text-[11px]">/</span>
            <Input
              className="w-11 h-7 text-center font-mono text-[11px] px-1"
              value={prefix}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 32) setPrefix(val);
              }}
            />
            <Button onClick={clear} variant="outline" size="sm" className="h-7 text-[11px] px-2">清除</Button>
            <Button onClick={copyResult} variant="outline" size="sm" className="h-7 text-[11px] px-2" disabled={!result}>复制</Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          显示网络、广播、第一个和最后一个可用地址
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        <ResultBox>
          <div className="grid grid-cols-2 gap-x-3">
            <ResultInline label="可用地址:" value={result?.usableAddresses.toString() ?? ''} />
            <ResultInline label="掩码:" value={result?.subnetMask ?? ''} />
            <ResultInline label="网络:" value={result?.network ?? ''} />
            <ResultInline label="广播:" value={result?.broadcast ?? ''} />
            <ResultInline label="第一个可用:" value={result?.firstUsable ?? ''} />
            <ResultInline label="最后可用:" value={result?.lastUsable ?? ''} />
          </div>
        </ResultBox>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          在网络掩码&quot;位格式&quot;也被称为CIDR格式（CIDR=无类别域间路由选择）
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 2. 通过掩码位计算子网掩码
// ============================================================
function MaskBitsCalculator() {
  const [maskBits, setMaskBits] = useState(27);

  const result = useMemo(() => {
    if (!isValidPrefix(maskBits)) return null;
    const maskInt = prefixToMask(maskBits);
    const totalAddresses = Math.pow(2, 32 - maskBits);
    const usableAddresses = maskBits >= 31 ? (maskBits === 32 ? 1 : 2) : totalAddresses - 2;
    return { usableAddresses, totalAddresses, subnetMask: intToIp(maskInt) };
  }, [maskBits]);

  const clear = useCallback(() => { setMaskBits(24); }, []);

  return (
    <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
      <CardHeader className="px-3 py-2 pb-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">通过掩码位计算子网掩码</CardTitle>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground font-mono text-[11px]">/</span>
            <Input
              className="w-11 h-7 text-center font-mono text-[11px] px-1"
              value={maskBits}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 32) setMaskBits(val);
              }}
            />
            <Button onClick={clear} variant="outline" size="sm" className="h-7 text-[11px] px-2">清除</Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          根据掩码位元数计算子网掩码及可用地址数
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        <ResultBox>
          <div className="grid grid-cols-2 gap-x-3">
            <ResultInline label="可用地址数:" value={result?.usableAddresses.toString() ?? ''} />
            <ResultInline label="地址总数:" value={result?.totalAddresses.toString() ?? ''} />
          </div>
          <ResultInline label="子网掩码:" value={result?.subnetMask ?? ''} />
        </ResultBox>

        <div className="rounded border bg-muted/20 p-2 space-y-0.5">
          <h4 className="font-semibold text-[11px] mb-0.5">IP组播地址范围</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            所有的多播地址以位模式 &apos;1110&apos; 开始。
          </p>
          <div className="grid grid-cols-2 gap-x-2">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground font-mono">224.0.0.0 - 224.0.0.255</span>{' '}
              知名多播
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground font-mono">224.0.1.0 - 238.255.255.255</span>{' '}
              全球组播
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground font-mono">239.0.0.0 - 239.255.255.255</span>{' '}
            本地多播
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 3. 掩码位转换子网掩码
// ============================================================
function MaskConversionCalculator() {
  const [maskBits, setMaskBits] = useState(24);

  const result = useMemo(() => {
    if (!isValidPrefix(maskBits)) return null;
    const maskInt = prefixToMask(maskBits);
    const decimalMask = intToIp(maskInt);
    const hexMask = ipToHex(decimalMask);
    return { decimalMask, hexMask };
  }, [maskBits]);

  const clear = useCallback(() => { setMaskBits(24); }, []);

  return (
    <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
      <CardHeader className="px-3 py-2 pb-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">通过掩码位转换子网掩码</CardTitle>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground font-mono text-[11px]">/</span>
            <Input
              className="w-11 h-7 text-center font-mono text-[11px] px-1"
              value={maskBits}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 32) setMaskBits(val);
              }}
            />
            <Button onClick={clear} variant="outline" size="sm" className="h-7 text-[11px] px-2">清除</Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          将掩码位元数转换为十进制和十六进制子网掩码
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        <ResultBox>
          <div className="grid grid-cols-2 gap-x-3">
            <ResultInline label="十进制:" value={result?.decimalMask ?? ''} />
            <ResultInline label="十六进制:" value={result?.hexMask ?? ''} />
          </div>
        </ResultBox>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 4. 通过主机数计算子网掩码
// ============================================================
function HostCountCalculator() {
  const [hostCount, setHostCount] = useState(5);

  const result = useMemo(() => {
    if (hostCount <= 0) return null;
    const prefix = hostsToPrefix(hostCount);
    const maskInt = prefixToMask(prefix);
    const totalAddresses = Math.pow(2, 32 - prefix);
    const usableAddresses = prefix >= 31 ? (prefix === 32 ? 1 : 2) : totalAddresses - 2;
    return { prefix, subnetMask: intToIp(maskInt), usableAddresses };
  }, [hostCount]);

  const clear = useCallback(() => { setHostCount(1); }, []);

  return (
    <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
      <CardHeader className="px-3 py-2 pb-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">通过主机数计算子网掩码</CardTitle>
          <div className="flex items-center gap-1">
            <Input
              className="w-20 h-7 font-mono text-[11px] px-2"
              type="number"
              min={1}
              value={hostCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) setHostCount(val);
              }}
            />
            <Button onClick={clear} variant="outline" size="sm" className="h-7 text-[11px] px-2">清除</Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          根据需要的主机数量计算所需的子网掩码
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        <ResultBox>
          <div className="grid grid-cols-2 gap-x-3">
            <ResultInline label="掩码位元数:" value={result ? `/${result.prefix}` : ''} />
            <ResultInline label="子网掩码:" value={result?.subnetMask ?? ''} />
          </div>
          <ResultInline label="可用地址数:" value={result?.usableAddresses.toString() ?? ''} />
        </ResultBox>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 5-9: 子网工具 & 转换工具（共享IP联动计算）
// ============================================================
function SubnetAndConverters() {
  const [sharedIp, setSharedIp] = useState([192, 168, 0, 1]);
  const [networkClass, setNetworkClass] = useState<'default' | 'A' | 'B' | 'C'>('default');
  const [subnetIpCount, setSubnetIpCount] = useState('');
  const [hostCount, setHostCount] = useState('');
  const [calculated, setCalculated] = useState(false);

  const getNetworkClassStr = (ipStr: string): string => {
    const first = parseInt(ipStr.split('.')[0], 10);
    if (first < 128) return 'A类';
    if (first < 192) return 'B类';
    return 'C类';
  };

  const getDefaultPrefix = (ipStr: string, netClass: string): number => {
    if (netClass !== 'default') return netClass === 'A' ? 8 : netClass === 'B' ? 16 : 24;
    const first = parseInt(ipStr.split('.')[0], 10);
    if (first < 128) return 8;
    if (first < 192) return 16;
    return 24;
  };

  const allResults = useMemo(() => {
    if (!calculated) return null;
    const ipStr = sharedIp.join('.');
    if (!isValidIp(ipStr)) return null;

    const basePrefix = getDefaultPrefix(ipStr, networkClass);
    let calcPrefix = basePrefix;
    let calcMaskStr = '';

    let subnetResult: {
      networkType: string; subnetMask: string; subnet: string;
      hostsPerNetwork: number; prefix: number;
    } | null = null;

    if (subnetIpCount) {
      const count = parseInt(subnetIpCount, 10);
      if (count > 0) {
        const subnetBits = Math.ceil(Math.log2(count));
        const newPrefix = basePrefix + subnetBits;
        if (newPrefix <= 32) {
          calcPrefix = newPrefix;
          const maskInt = prefixToMask(newPrefix);
          const totalPerSubnet = Math.pow(2, 32 - newPrefix);
          calcMaskStr = intToIp(maskInt);
          subnetResult = {
            networkType: networkClass === 'default' ? getNetworkClassStr(ipStr) : `${networkClass}类`,
            subnetMask: calcMaskStr, subnet: `/${newPrefix}`,
            hostsPerNetwork: totalPerSubnet, prefix: newPrefix,
          };
        }
      }
    } else if (hostCount) {
      const count = parseInt(hostCount, 10);
      if (count > 0) {
        let hostBits = 0;
        while (Math.pow(2, hostBits) - 2 < count) hostBits++;
        const newPrefix = 32 - hostBits;
        const maskInt = prefixToMask(newPrefix);
        const totalPerSubnet = Math.pow(2, hostBits);
        calcPrefix = newPrefix;
        calcMaskStr = intToIp(maskInt);
        subnetResult = {
          networkType: networkClass === 'default' ? getNetworkClassStr(ipStr) : `${networkClass}类`,
          subnetMask: calcMaskStr, subnet: `/${newPrefix}`,
          hostsPerNetwork: totalPerSubnet, prefix: newPrefix,
        };
      }
    }

    if (!subnetResult) {
      const maskInt = prefixToMask(basePrefix);
      const totalPerSubnet = Math.pow(2, 32 - basePrefix);
      calcMaskStr = intToIp(maskInt);
      subnetResult = {
        networkType: networkClass === 'default' ? getNetworkClassStr(ipStr) : `${networkClass}类`,
        subnetMask: calcMaskStr, subnet: `/${basePrefix}`,
        hostsPerNetwork: totalPerSubnet, prefix: basePrefix,
      };
    }

    const maskInt = ipToInt(calcMaskStr);
    const ipInt = ipToInt(ipStr);
    const networkInt = (ipInt & maskInt) >>> 0;
    const wildcardInt = getWildcardMask(maskInt);
    const nodeInt = (ipInt & wildcardInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    return {
      subnet: subnetResult,
      networkNode: {
        network: intToIp(networkInt),
        node: intToIp(nodeInt),
        broadcast: intToIp(broadcastInt),
      },
      maskConverter: {
        bits: maskToPrefix(maskInt),
        binary: ipToBinary(calcMaskStr),
      },
      baseConverter: {
        decimal: ipStr,
        binary: ipToBinary(ipStr),
        hex: ipToHex(ipStr),
        singleDecimal: ipToDecimal(ipStr),
      },
      wildcard: {
        wildcard: intToIp(wildcardInt),
        binaryMask: ipToBinary(calcMaskStr),
        binaryWildcard: ipToBinary(intToIp(wildcardInt)),
      },
    };
  }, [calculated, sharedIp, networkClass, subnetIpCount, hostCount]);

  const calculate = useCallback(() => {
    setCalculated(true);
  }, []);

  const clear = useCallback(() => {
    setSharedIp([0, 0, 0, 0]);
    setCalculated(false);
  }, []);

  return (
    <div className="space-y-3">
      {/* 共享IP输入区域 */}
      <div className="rounded border bg-secondary/30 shadow-sm px-3 py-2 space-y-1">
        <h3 className="font-semibold text-[11px]">输入 IP 地址，点击计算后所有工具同步计算</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-[11px] font-medium whitespace-nowrap">IP:</Label>
          <IPOctetInput value={sharedIp} onChange={setSharedIp} />
          <Button onClick={calculate} size="sm" className="h-7 text-[11px] px-3">计算</Button>
          <Button onClick={clear} variant="outline" size="sm" className="h-7 text-[11px] px-2">清除</Button>
        </div>
      </div>

      {/* 子网工具 */}
      <div>
        <Separator className="mb-2" />
        <h3 className="text-[11px] font-semibold text-muted-foreground mb-1.5 px-1">子网工具</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* 5. 子网掩码计算器 */}
          <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
            <CardHeader className="px-3 py-2 pb-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">子网掩码计算器</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {(['default', 'A', 'B', 'C'] as const).map((cls) => (
                    <label key={cls} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="netclass"
                        checked={networkClass === cls}
                        onChange={() => setNetworkClass(cls)}
                        className="accent-primary w-3 h-3"
                      />
                      <span className="text-[11px]">{cls === 'default' ? '默认' : `${cls}类网`}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-[11px] font-medium whitespace-nowrap">子网IP数:</Label>
                <Select value={subnetIpCount || '__none__'} onValueChange={(v) => { const val = v === '__none__' ? '' : v; setSubnetIpCount(val); if (val) setHostCount(''); }}>
                  <SelectTrigger className="w-[100px] h-7 text-[11px]">
                    <SelectValue placeholder="可选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {[2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label className="text-[11px] font-medium whitespace-nowrap">主机数:</Label>
                <Select value={hostCount || '__none__'} onValueChange={(v) => { const val = v === '__none__' ? '' : v; setHostCount(val); if (val) setSubnetIpCount(''); }}>
                  <SelectTrigger className="w-[100px] h-7 text-[11px]">
                    <SelectValue placeholder="可选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {[2, 6, 14, 30, 62, 126, 254, 510, 1022, 2046, 4094, 8190, 16382, 32766, 65534].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
              <ResultBox>
                <div className="grid grid-cols-2 gap-x-3">
                  <ResultInline label="网络类型:" value={allResults?.subnet?.networkType ?? ''} />
                  <ResultInline label="子网:" value={allResults?.subnet?.subnet ?? ''} />
                  <ResultInline label="子网掩码:" value={allResults?.subnet?.subnetMask ?? ''} />
                  <ResultInline label="节点/主机数:" value={allResults?.subnet?.hostsPerNetwork.toString() ?? ''} />
                </div>
              </ResultBox>
            </CardContent>
          </Card>

          {/* 6. 网络/节点计算器 */}
          <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
            <CardHeader className="px-3 py-2 pb-1">
              <CardTitle className="text-sm">网络/节点计算器</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <ResultBox>
                <div className="grid grid-cols-2 gap-x-3">
                  <ResultInline label="网络:" value={allResults?.networkNode?.network ?? ''} />
                  <ResultInline label="广播地址:" value={allResults?.networkNode?.broadcast ?? ''} />
                </div>
                <ResultInline label="节点/主机:" value={allResults?.networkNode?.node ?? ''} />
              </ResultBox>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 转换工具 */}
      <div>
        <Separator className="mb-2" />
        <h3 className="text-[11px] font-semibold text-muted-foreground mb-1.5 px-1">转换工具</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* 7. 子网掩码换算器 */}
          <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
            <CardHeader className="px-3 py-2 pb-1">
              <CardTitle className="text-sm">子网掩码换算器</CardTitle>
              <p className="text-[10px] text-muted-foreground">十进制 ↔ 掩码位元数</p>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <ResultBox>
                <ResultInline label="掩码位元数:" value={allResults?.maskConverter ? `/${allResults.maskConverter.bits}` : ''} />
                <ResultBlock label="二进制:" value={allResults?.maskConverter?.binary ?? ''} />
              </ResultBox>
            </CardContent>
          </Card>

          {/* 8. IP地址进制转换器 */}
          <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
            <CardHeader className="px-3 py-2 pb-1">
              <CardTitle className="text-sm">IP地址进制转换器</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <ResultBox>
                <div className="grid grid-cols-2 gap-x-3">
                  <ResultInline label="十进制:" value={allResults?.baseConverter?.decimal ?? ''} />
                  <ResultInline label="十六进制:" value={allResults?.baseConverter?.hex ?? ''} />
                </div>
                <ResultBlock label="二进制:" value={allResults?.baseConverter?.binary ?? ''} />
                <ResultInline label="十进制数值:" value={allResults?.baseConverter?.singleDecimal ?? ''} />
              </ResultBox>
            </CardContent>
          </Card>

          {/* 9. 子网掩码逆算器 */}
          <Card className="h-full gap-0 py-0 bg-secondary/30 shadow-sm">
            <CardHeader className="px-3 py-2 pb-1">
              <CardTitle className="text-sm">子网掩码逆算器</CardTitle>
              <p className="text-[10px] text-muted-foreground">子网掩码反码（通配符掩码）</p>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <ResultBox>
                <ResultInline label="通配符掩码:" value={allResults?.wildcard?.wildcard ?? ''} />
                <ResultBlock label="掩码(二进制):" value={allResults?.wildcard?.binaryMask ?? ''} />
                <ResultBlock label="通配符(二进制):" value={allResults?.wildcard?.binaryWildcard ?? ''} />
              </ResultBox>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main: Unified IPv4 Component
// ============================================================
export default function IPv4Calculators() {
  return (
    <div className="space-y-3">
      <div>
        <Separator className="mb-2" />
        <h3 className="text-[11px] font-semibold text-muted-foreground mb-1.5 px-1">核心计算</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <NetworkIPCalculator />
          <MaskBitsCalculator />
          <MaskConversionCalculator />
          <HostCountCalculator />
        </div>
      </div>

      <SubnetAndConverters />
    </div>
  );
}
