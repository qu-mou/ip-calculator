'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  ipv6ToBigInt,
  bigIntToIPv6,
  expandIPv6,
  compressIPv6,
  calculateIPv6Range,
  isValidIPv6,
} from '@/lib/ip-utils';

/** 单行结果：标签在左，值在右（适合短值） */
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

// ============================================================
// 1. IPV6 地址 ↔ 数字转换
// ============================================================
function IPv6NumberConverter() {
  const [ipv6Addr, setIpv6Addr] = useState('2001:4860:4860::8888'.toUpperCase());
  const [ipv6Number, setIpv6Number] = useState('');

  const fromAddr = useMemo(() => {
    if (!isValidIPv6(ipv6Addr)) return null;
    try { return ipv6ToBigInt(ipv6Addr).toString(); }
    catch { return null; }
  }, [ipv6Addr]);

  const fromNumber = useMemo(() => {
    if (!ipv6Number) return null;
    try { return bigIntToIPv6(BigInt(ipv6Number)); }
    catch { return null; }
  }, [ipv6Number]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="gap-0 py-0 bg-secondary/30 shadow-sm">
      <CardHeader className="px-3 py-2 pb-1">
        <CardTitle className="text-sm">IPV6 地址 ↔ 数字转换</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        {/* IPV6 → 数字 */}
        <div className="space-y-1">
          <Label className="text-[11px] font-medium">IPV6地址</Label>
          <div className="flex items-center gap-1.5">
            <Input
              className="font-mono text-[11px] h-7 px-2"
              value={ipv6Addr}
              onChange={(e) => setIpv6Addr(e.target.value.toUpperCase())}
              placeholder="输入IPV6地址"
            />
            <Button size="sm" className="whitespace-nowrap text-[11px] h-7 px-2" disabled={!fromAddr}>
              转数字
            </Button>
          </div>
          <div className="rounded border bg-muted/30 p-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">IPV6数字</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 text-[10px] px-1"
                onClick={() => fromAddr && copyToClipboard(fromAddr)}
                disabled={!fromAddr}
              >
                复制
              </Button>
            </div>
            <p className="font-mono text-[11px] break-all leading-snug">{fromAddr || '—'}</p>
          </div>
        </div>

        {/* 数字 → IPV6 */}
        <div className="space-y-1">
          <Label className="text-[11px] font-medium">IPV6数字</Label>
          <div className="flex items-center gap-1.5">
            <Input
              className="font-mono text-[11px] h-7 px-2"
              value={ipv6Number}
              onChange={(e) => setIpv6Number(e.target.value.toUpperCase())}
              placeholder="输入IPV6数字"
            />
            <Button size="sm" className="whitespace-nowrap text-[11px] h-7 px-2" disabled={!fromNumber}>
              转IPV6
            </Button>
          </div>
          <div className="rounded border bg-muted/30 p-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">IPV6地址</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 text-[10px] px-1"
                onClick={() => fromNumber && copyToClipboard(fromNumber)}
                disabled={!fromNumber}
              >
                复制
              </Button>
            </div>
            <p className="font-mono text-[11px] break-all leading-snug">{fromNumber || '—'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 2. IPV6 扩展 ↔ 压缩转换
// ============================================================
function IPv6CompressionConverter() {
  const [extendedAddr, setExtendedAddr] = useState('2001:4860:4860:0000:0000:0000:0000:8888'.toUpperCase());
  const [compressedAddr, setCompressedAddr] = useState('2001:4860:4860::8888'.toUpperCase());

  const fromExtended = useMemo(() => {
    try {
      if (!isValidIPv6(extendedAddr)) return null;
      return compressIPv6(extendedAddr);
    } catch { return null; }
  }, [extendedAddr]);

  const fromCompressed = useMemo(() => {
    try {
      if (!isValidIPv6(compressedAddr)) return null;
      return expandIPv6(compressedAddr);
    } catch { return null; }
  }, [compressedAddr]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="gap-0 py-0 bg-secondary/30 shadow-sm">
      <CardHeader className="px-3 py-2 pb-1">
        <CardTitle className="text-sm">IPV6 扩展 ↔ 压缩转换</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
        {/* 扩展 → 压缩 */}
        <div className="space-y-1">
          <Label className="text-[11px] font-medium">IPV6扩展地址</Label>
          <div className="flex items-center gap-1.5">
            <Input
              className="font-mono text-[11px] h-7 px-2"
              value={extendedAddr}
              onChange={(e) => setExtendedAddr(e.target.value.toUpperCase())}
              placeholder="输入扩展IPV6地址"
            />
            <Button size="sm" className="whitespace-nowrap text-[11px] h-7 px-2" disabled={!fromExtended}>
              压缩
            </Button>
          </div>
          <div className="rounded border bg-muted/30 p-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">压缩地址</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 text-[10px] px-1"
                onClick={() => fromExtended && copyToClipboard(fromExtended)}
                disabled={!fromExtended}
              >
                复制
              </Button>
            </div>
            <p className="font-mono text-[11px] break-all leading-snug">{fromExtended || '—'}</p>
          </div>
        </div>

        {/* 压缩 → 扩展 */}
        <div className="space-y-1">
          <Label className="text-[11px] font-medium">IPV6压缩地址</Label>
          <div className="flex items-center gap-1.5">
            <Input
              className="font-mono text-[11px] h-7 px-2"
              value={compressedAddr}
              onChange={(e) => setCompressedAddr(e.target.value.toUpperCase())}
              placeholder="输入压缩IPV6地址"
            />
            <Button size="sm" className="whitespace-nowrap text-[11px] h-7 px-2" disabled={!fromCompressed}>
              扩展
            </Button>
          </div>
          <div className="rounded border bg-muted/30 p-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">扩展地址</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 text-[10px] px-1"
                onClick={() => fromCompressed && copyToClipboard(fromCompressed)}
                disabled={!fromCompressed}
              >
                复制
              </Button>
            </div>
            <p className="font-mono text-[11px] break-all leading-snug">{fromCompressed || '—'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 3. IPV6 地址范围计算（滑块实时计算）
// ============================================================
function IPv6RangeCalculator() {
  const [ipv6Addr, setIpv6Addr] = useState('2001:DB8::1');
  const [prefix, setPrefix] = useState(48);

  const result = useMemo(() => {
    if (!isValidIPv6(ipv6Addr)) return null;
    try {
      const { lower, upper } = calculateIPv6Range(ipv6Addr, prefix);
      return {
        lower, upper,
        expandedLower: expandIPv6(lower),
        expandedUpper: expandIPv6(upper),
      };
    } catch {
      return null;
    }
  }, [ipv6Addr, prefix]);

  return (
    <Card className="lg:col-span-2 gap-0 py-0 bg-secondary/30 shadow-sm">
      <CardHeader className="px-3 py-2 pb-1">
        <CardTitle className="text-sm">IPV6 地址范围计算</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 输入区 */}
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium">IPV6 地址</Label>
              <Input
                className="font-mono text-[11px] h-7 px-2"
                value={ipv6Addr}
                onChange={(e) => setIpv6Addr(e.target.value.toUpperCase())}
                placeholder="输入IPV6地址"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium">
                掩码位: <span className="font-mono">/{prefix}</span>
              </Label>
              <Slider
                value={[prefix]}
                onValueChange={([val]) => setPrefix(val)}
                min={0}
                max={128}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>/0</span>
                <span>/64</span>
                <span>/128</span>
              </div>
            </div>
          </div>

          {/* 结果区 */}
          <div className="min-w-0 overflow-hidden">
            <div className="rounded border bg-muted/30 p-2 space-y-0.5">
              <h4 className="font-semibold text-[11px] mb-1">子网地址范围</h4>
              {result ? (
                <>
                  <ResultInline label="下界（压缩）" value={result.lower} />
                  <ResultBlock label="下界（扩展）" value={result.expandedLower} />
                  <ResultInline label="上界（压缩）" value={result.upper} />
                  <ResultBlock label="上界（扩展）" value={result.expandedUpper} />
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground">请输入有效的IPV6地址</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main component
// ============================================================
export default function IPv6Calculator() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <IPv6NumberConverter />
        <IPv6CompressionConverter />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <IPv6RangeCalculator />
      </div>
    </div>
  );
}
