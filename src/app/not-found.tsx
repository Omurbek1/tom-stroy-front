import Link from 'next/link';
import { Button, Result } from 'antd';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f6f8',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Такой страницы не существует"
        extra={
          <Link href="/dashboard">
            <Button type="primary">На дашборд</Button>
          </Link>
        }
      />
    </div>
  );
}
