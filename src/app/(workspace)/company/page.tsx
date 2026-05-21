'use client';

import { Card, Col, Row, Typography } from 'antd';
import {
  CarOutlined,
  ContainerOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';

interface HubItem {
  key: string;
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const HUB: HubItem[] = [
  {
    key: 'employees',
    href: '/employees',
    title: 'Сотрудники',
    description: 'Все люди компании, ставки, должности и активность',
    icon: <UserOutlined />,
  },
  {
    key: 'brigades',
    href: '/brigades',
    title: 'Бригады',
    description: 'Каталог бригад: составы, специализации, личные склады',
    icon: <TeamOutlined />,
  },
  {
    key: 'warehouse',
    href: '/warehouse',
    title: 'Склады',
    description: 'Центральные склады, остатки, движение, перемещения, закупки',
    icon: <ShopOutlined />,
  },
  {
    key: 'vehicles',
    href: '/vehicles',
    title: 'Техника',
    description: 'Парк техники, журналы использования, расход топлива',
    icon: <CarOutlined />,
  },
  {
    key: 'suppliers',
    href: '/warehouse?tab=suppliers',
    title: 'Поставщики',
    description: 'Контрагенты по закупу — контакты, ИНН, рейтинг',
    icon: <ContainerOutlined />,
  },
];

/**
 * Company hub — entry point to all company-wide directories. Operational
 * sections (бригады, склады, техника) used to clutter the global sidebar;
 * now they live here so the sidebar can stay at 6 items.
 */
export default function CompanyHubPage() {
  return (
    <>
      <PageHeader
        title="Компания"
        subtitle="Справочники компании — всё, что не привязано к конкретному объекту"
      />
      <PageContainer>
        <Row gutter={[16, 16]}>
          {HUB.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.key}>
              <Link href={item.href} prefetch style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  styles={{ body: { padding: 18 } }}
                  style={{ height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'var(--color-surface-2, #f4f6f8)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        color: 'var(--color-primary, #1677ff)',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, marginBottom: 4 }}
                      >
                        {item.title}
                      </Typography.Title>
                      <Typography.Paragraph
                        type="secondary"
                        style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}
                      >
                        {item.description}
                      </Typography.Paragraph>
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </PageContainer>
    </>
  );
}
