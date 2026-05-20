'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import IPv4Calculators from '@/components/ip-calculator/ipv4-calculators';
import IPv6Calculator from '@/components/ip-calculator/ipv6-calculator';
import { Globe, Network, Sun, Moon } from 'lucide-react';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="w-3.5 h-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute w-3.5 h-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切换主题</span>
    </Button>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('ipv4');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="w-[80%] mx-auto px-3 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded bg-primary text-primary-foreground">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">IP 地址计算器</h1>
                <p className="text-[10px] text-muted-foreground">
                  IPV4 / IPV6 网络地址计算与转换工具
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-[80%] mx-auto px-3 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-[160px] grid-cols-2 mb-2 h-8">
            <TabsTrigger value="ipv4" className="flex items-center gap-1 text-[11px] h-7">
              <Network className="w-3 h-3" />
              <span>IPV4</span>
            </TabsTrigger>
            <TabsTrigger value="ipv6" className="flex items-center gap-1 text-[11px] h-7">
              <Globe className="w-3 h-3" />
              <span>IPV6</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ipv4" className="mt-0">
            <IPv4Calculators />
          </TabsContent>

          <TabsContent value="ipv6" className="mt-0">
            <IPv6Calculator />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="w-[80%] mx-auto px-3 py-1.5">
          <p className="text-center text-[10px] text-muted-foreground">
            IP 地址计算器 — 支持 IPV4/IPV6 网络地址计算、子网掩码转换、进制转换
          </p>
        </div>
      </footer>
    </div>
  );
}
