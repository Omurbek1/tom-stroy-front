'use client';

import { Input } from 'antd';
import type { CSSProperties } from 'react';

interface Props {
  placeholder: string;
  value?: string;
  onSearch: (value: string) => void;
  onClear?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function PageSearch({ placeholder, value, onSearch, onClear, className, style }: Props) {
  return (
    <Input.Search
      className={className}
      style={style}
      value={value}
      placeholder={placeholder}
      allowClear
      onSearch={onSearch}
      onChange={(e) => {
        if (!e.target.value) {
          onClear?.();
          onSearch('');
        }
      }}
    />
  );
}
