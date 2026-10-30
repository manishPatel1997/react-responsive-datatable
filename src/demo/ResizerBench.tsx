import React from 'react';
import {
  IconSmartphone,
  IconTablet,
  IconLaptop,
  IconMonitor,
  IconMaximize2,
} from './demoIcons';

interface ResizerBenchProps {
  width: number | string;
  onWidthChange: (w: number | string) => void;
  children: React.ReactNode;
}

export function ResizerBench({ width, onWidthChange, children }: ResizerBenchProps) {
  const isFull = width === '100%';
  const numericWidth = typeof width === 'number' ? width : 1100;

  const presets = [
    { label: 'Mobile', value: 375, icon: IconSmartphone, desc: '375px' },
    { label: 'Tablet', value: 640, icon: IconTablet, desc: '640px' },
    { label: 'Laptop', value: 920, icon: IconLaptop, desc: '920px' },
    { label: 'Desktop', value: 1140, icon: IconMonitor, desc: '1140px' },
    { label: 'Full', value: '100%', icon: IconMaximize2, desc: '100%' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Resizer Control Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--rdt-surface)',
          borderRadius: 8,
          border: '1px solid var(--rdt-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--rdt-text-muted)' }}>
            CONTAINER WIDTH:
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              padding: '2px 8px',
              background: '#e0f2fe',
              color: '#0369a1',
              borderRadius: 4,
            }}
          >
            {isFull ? '100% (Fluid)' : `${numericWidth}px`}
          </span>
        </div>

        {/* Preset buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {presets.map((preset) => {
            const Icon = preset.icon;
            const active = width === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onWidthChange(preset.value)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 6,
                  border: `1px solid ${active ? '#0284c7' : 'var(--rdt-border)'}`,
                  background: active ? '#0284c7' : 'var(--rdt-bg)',
                  color: active ? '#ffffff' : 'var(--rdt-text)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                <span>{preset.label}</span>
                <span style={{ opacity: 0.7, fontSize: 11 }}>({preset.desc})</span>
              </button>
            );
          })}
        </div>

        {/* Drag slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
          <span style={{ fontSize: 12, color: 'var(--rdt-text-muted)' }}>320px</span>
          <input
            type="range"
            min={320}
            max={1300}
            step={10}
            value={isFull ? 1200 : numericWidth}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            style={{ flex: 1, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, color: 'var(--rdt-text-muted)' }}>1300px</span>
        </div>
      </div>

      {/* Resizable Preview Container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'hidden',
          padding: '8px 0',
        }}
      >
        <div
          style={{
            width: typeof width === 'number' ? `${width}px` : '100%',
            maxWidth: '100%',
            transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

