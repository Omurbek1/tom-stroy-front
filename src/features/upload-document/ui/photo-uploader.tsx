'use client';

import { InboxOutlined } from '@ant-design/icons';
import { Upload, Typography } from 'antd';
import { message } from '@shared/lib/antd-static';
import type { UploadProps, RcFile } from 'antd/es/upload';
import { useState } from 'react';
import { uploadFile } from '../api';

export interface UploadedPhoto {
  storageKey: string;
  name: string;
  size: number;
  mime: string;
}

interface Props {
  projectId?: string;
  value?: UploadedPhoto[];
  onChange?: (photos: UploadedPhoto[]) => void;
  hint?: string;
  multiple?: boolean;
  maxCount?: number;
}

/**
 * Drag-and-drop photo uploader. Uploads each file directly to R2 via a
 * presigned URL and accumulates a list of storage keys in `value`.
 *
 * Designed for use as a controlled field in AntD forms.
 */
export function PhotoUploader({
  projectId,
  value,
  onChange,
  hint,
  multiple = true,
  maxCount = 20,
}: Props) {
  const [uploading, setUploading] = useState(0);

  const items = value ?? [];

  const handle: UploadProps['customRequest'] = async (options) => {
    const file = options.file as RcFile;
    setUploading((n) => n + 1);
    try {
      const uploaded = await uploadFile(file, {
        kind: 'PHOTO',
        projectId,
        onProgress: (pct) => options.onProgress?.({ percent: pct }),
      });
      options.onSuccess?.(uploaded);
      onChange?.([...items, uploaded]);
    } catch (err) {
      const msg = (err as Error).message ?? 'Не удалось загрузить файл';
      options.onError?.(err as Error);
      message.error(msg);
    } finally {
      setUploading((n) => n - 1);
    }
  };

  const handleRemove = (uid: string) => {
    onChange?.(items.filter((it) => it.storageKey !== uid));
  };

  return (
    <div>
      <Upload.Dragger
        name="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp"
        customRequest={handle}
        showUploadList
        fileList={items.map((it) => ({
          uid: it.storageKey,
          name: it.name,
          status: 'done' as const,
        }))}
        onRemove={(f) => {
          handleRemove(f.uid);
          return true;
        }}
        beforeUpload={(file) => {
          if (items.length >= maxCount) {
            message.error(`Максимум ${maxCount} фото`);
            return Upload.LIST_IGNORE;
          }
          if (file.size > 10 * 1024 * 1024) {
            message.error('Размер фото больше 10 МБ');
            return Upload.LIST_IGNORE;
          }
          return true;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {uploading > 0 ? `Загрузка… (${uploading})` : 'Перетащите фото или нажмите'}
        </p>
        {hint && <Typography.Text type="secondary">{hint}</Typography.Text>}
      </Upload.Dragger>
    </div>
  );
}
