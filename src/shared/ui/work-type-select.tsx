'use client';

import { Select } from 'antd';
import { useMemo } from 'react';
import type { WorkType } from '@entities/daily-report/types';
import { WORK_TYPE_CATEGORIES, WORK_TYPE_LABEL } from '@shared/constants/work-type';

interface Props {
  value?: WorkType;
  onChange?: (v: WorkType | undefined) => void;
  size?: 'small' | 'middle' | 'large';
}

export function WorkTypeSelect({ value, onChange, size }: Props) {
  const groups = useMemo(
    () =>
      WORK_TYPE_CATEGORIES.map((cat) => ({
        label: cat.label,
        options: cat.values.map((v) => ({ value: v, label: WORK_TYPE_LABEL[v] })),
      })),
    [],
  );

  return (
    <Select
      showSearch
      size={size}
      value={value}
      onChange={onChange}
      placeholder="Тип работ"
      options={groups}
      filterOption={(input, option) =>
        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
      }
    />
  );
}
