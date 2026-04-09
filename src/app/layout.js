import Link from 'next/link';
import "./globals.css";

export const metadata = {
  title: "Homestay Paradise | Vote cho kỳ nghỉ của bạn",
  description: "Cùng nhau chọn ra những căn homestay tuyệt vời nhất cho chuyến đi sắp tới. Xem hình ảnh, tiện ích và bình chọn ngay!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <nav style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '30px', position: 'sticky', top: '0', zIndex: '100' }} className="glass">
          <Link href="/" style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.2rem' }}>🌿 Homestay Voter</Link>
          <Link href="/admin" style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Admin Panel</Link>
        </nav>
        {children}
        <footer style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p>© 2026 Homestay Voter. Nguyễn Nhật Trường. Made with 💚 for người dễ thương.</p>
        </footer>
      </body>
    </html>
  );
}
