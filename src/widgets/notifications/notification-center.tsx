'use client';

import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Empty, List, Skeleton, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from '@entities/notification/hooks';
import type { AppNotification } from '@entities/notification/types';
import { formatDate } from '@shared/lib/format';

function NotificationItem({
  item,
  onClick,
}: {
  item: AppNotification;
  onClick: (n: AppNotification) => void;
}) {
  const isUnread = !item.readAt;
  return (
    <List.Item
      onClick={() => onClick(item)}
      style={{
        cursor: 'pointer',
        background: isUnread ? 'rgba(22,119,255,0.06)' : undefined,
        padding: '8px 12px',
      }}
    >
      <List.Item.Meta
        title={
          <Typography.Text strong={isUnread}>{item.title}</Typography.Text>
        }
        description={
          <>
            {item.body && (
              <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 4 }}>
                {item.body}
              </Typography.Paragraph>
            )}
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatDate(item.createdAt)}
            </Typography.Text>
          </>
        }
      />
    </List.Item>
  );
}

export function NotificationCenter() {
  const router = useRouter();
  const { data: list, isLoading } = useNotifications();
  const { data: unread } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const items = useMemo(() => list?.data ?? [], [list]);
  const unreadValue = unread ?? 0;

  const handleClick = (n: AppNotification) => {
    if (!n.readAt) markRead.mutate(n.id);
    const projectId = n.payload?.projectId;
    if (projectId) router.push(`/projects/${projectId}`);
  };

  const panel = (
    <div
      style={{
        width: 380,
        maxHeight: 480,
        overflowY: 'auto',
        background: 'var(--ant-color-bg-elevated, #fff)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        borderRadius: 8,
        padding: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 8px 8px',
        }}
      >
        <Typography.Text strong>Уведомления</Typography.Text>
        <Button
          size="small"
          type="link"
          icon={<CheckOutlined />}
          disabled={unreadValue === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          Прочитать всё
        </Button>
      </div>
      {isLoading ? (
        <Skeleton active style={{ padding: 12 }} />
      ) : items.length === 0 ? (
        <Empty description="Нет уведомлений" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={items}
          renderItem={(n) => <NotificationItem item={n} onClick={handleClick} />}
          split
        />
      )}
    </div>
  );

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => panel}
    >
      <Badge count={unreadValue} size="small" offset={[-4, 4]}>
        <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
      </Badge>
    </Dropdown>
  );
}
