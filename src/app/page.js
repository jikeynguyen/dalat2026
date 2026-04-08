"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AMENITY_ICONS = {
  "Wifi": "📶",
  "Hồ bơi": "🏊‍♂️",
  "BBQ": "🔥",
  "Gần suối": "🌊",
  "Sân vườn": "🏡",
  "Bếp": "🍳",
  "Karaoke": "🎤",
  "Bồn tắm": "🛁",
  "Điều hòa": "❄️",
  "Tủ lạnh": "🧊",
  "Đỗ xe": "🚗"
};

export default function Home() {
  const [homestays, setHomestays] = useState([]);
  const [selectedHome, setSelectedHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    fetchHomestays();
  }, []);

  useEffect(() => {
    if (selectedHome) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedHome]);

  const fetchHomestays = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('homestays')
      .select('*, comments(*)')
      .order('votes', { ascending: false });
    
    if (data) setHomestays(data);
    setLoading(false);
  };

  const handleVote = async (id) => {
    const { data: current } = await supabase
      .from('homestays')
      .select('votes')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('homestays')
      .update({ votes: (current?.votes || 0) + 1 })
      .eq('id', id);

    if (!error) {
      fetchHomestays();
      if (selectedHome && selectedHome.id === id) {
        setSelectedHome({ ...selectedHome, votes: (selectedHome.votes || 0) + 1 });
      }
    }
  };

  const handleAddComment = async (e, homestayId) => {
    e.preventDefault();
    const name = e.target.name.value;
    const text = e.target.comment.value;
    if (!name || !text) return;

    const { error } = await supabase
      .from('comments')
      .insert([{ homestay_id: homestayId, name, text }]);

    if (!error) {
      fetchHomestays();
      // Recalculate selected home to include new comment
      const { data } = await supabase
        .from('homestays')
        .select('*, comments(*)')
        .eq('id', homestayId)
        .single();
      if (data) setSelectedHome(data);
      e.target.reset();
    }
  };

  const getAmenityIcon = (text) => {
    for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
      if (text.toLowerCase().includes(key.toLowerCase())) return icon;
    }
    return "✨";
  };

  return (
    <>
      <main className="container animate-fade" style={{ paddingTop: '40px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Tìm Kiếm Homestay Ưng Ý</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Bình chọn cho địa điểm bạn muốn chúng ta sẽ cùng đi nhất! 🍃</p>
        </header>

        {loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="animate-pulse" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Đang tải dữ liệu...</div>
          </div>
        )}

        <section className="glass" style={{ padding: '30px', marginBottom: '60px', borderLeft: '8px solid var(--primary-light)' }}>
          <h2 style={{ marginBottom: '15px' }}>💡 Tips chọn homestay cho nhóm</h2>
          <ul style={{ color: 'var(--text-muted)', marginLeft: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
            <li>Ưu tiên gần trung tâm nếu muốn đi dạo đêm.</li>
            <li>Chọn căn có BBQ nếu muốn nhậu nhẹt tại chỗ.</li>
            <li>Kiểm tra số lượng phòng ngủ để chia team cho dễ.</li>
            <li>Xem kỹ ảnh view cửa sổ - yếu tố sống ảo hàng đầu!</li>
          </ul>
        </section>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '30px',
          paddingBottom: '60px'
        }}>
          {homestays.map((home) => {
            const mainImage = (home.images && home.images.length > 0) ? home.images[0] : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800";
            return (
              <div key={home.id} className="glass card-hover" style={{ 
                overflow: 'hidden', 
                transition: 'var(--transition)',
                boxShadow: 'var(--shadow)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px'
              }}>
                <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={mainImage} 
                      alt={home.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                      onMouseOver={e => e.target.style.transform = 'scale(1.1)'}
                      onMouseOut={e => e.target.style.transform = 'scale(1)'}
                    />
                  <div style={{ 
                    position: 'absolute', 
                    top: '15px', 
                    right: '15px', 
                    background: 'rgba(255,255,255,0.9)', 
                    padding: '5px 15px', 
                    borderRadius: '50px',
                    fontWeight: '600',
                    color: 'var(--primary)',
                    fontSize: '0.9rem'
                  }}>
                    {home.distance} km từ trung tâm
                  </div>
                </div>

                <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0' }}>{home.name}</h2>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary-light)' }}>
                      {home.price.toLocaleString('vi-VN')}đ/đêm
                    </span>
                  </div>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>{home.description}</p>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Tiện ích</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {home.amenities.map((item, idx) => (
                        <div key={idx} title={item} style={{ 
                          fontSize: '1.2rem', 
                          background: 'var(--bg-mint)', 
                          padding: '8px', 
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--primary-soft)',
                          width: '40px',
                          height: '40px'
                        }}>
                          {getAmenityIcon(item)}
                        </div>
                      ))}
                      <div style={{ 
                        fontSize: '0.8rem', 
                        background: '#e3f2fd', 
                        padding: '8px 12px', 
                        borderRadius: '10px', 
                        color: '#1565c0',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: '600'
                      }}>
                        🛏 {home.rooms} phòng
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '25px', flexGrow: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Nhận xét mới nhất</div>
                    {home.comments?.length > 0 ? (
                      <div className="glass" style={{ padding: '12px', background: '#f8fdf8', border: 'none', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-main)', margin: 0 }}>
                          "{home.comments[0].text.substring(0, 100)}{home.comments[0].text.length > 100 ? '...' : ''}"
                        </p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginTop: '5px', fontWeight: '600' }}>— {home.comments[0].name}</div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có nhận xét nào...</p>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button 
                      onClick={() => {
                        setSelectedHome(home);
                        setCurrentImgIndex(0);
                      }}
                      style={{ 
                        background: 'none', 
                        color: 'var(--primary)', 
                        border: '1px solid var(--primary)', 
                        padding: '10px 15px', 
                        borderRadius: '12px',
                        fontWeight: '600',
                      }}
                    >
                      Chi tiết
                    </button>
                    <button 
                      onClick={() => handleVote(home.id)}
                      style={{ 
                        background: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '12px 25px', 
                        borderRadius: '12px',
                        fontWeight: '600',
                        transition: 'var(--transition)'
                      }}
                      onMouseOver={e => e.target.style.background = 'var(--primary-light)'}
                      onMouseOut={e => e.target.style.background = 'var(--primary)'}
                    >
                      Vote Ngay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Detail Modal Overhaul - Moved outside of <main> and z-index 9999 */}
      {selectedHome && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(15px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }} onClick={() => setSelectedHome(null)}>
          
          <div className="glass" style={{
            maxWidth: '1200px',
            width: '95%',
            height: '90vh',
            background: 'white',
            borderRadius: '32px',
            overflow: 'hidden',
            display: 'flex',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Left side: Sticky Image Gallery */}
            <div style={{
              flex: '1.2',
              height: '100%',
              background: '#000',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img 
                src={selectedHome.images?.[currentImgIndex] || selectedHome.image} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} 
              />
              
              {/* Image Controls Overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.9)', padding: '8px 20px', borderRadius: '50px', fontWeight: '700', color: '#000', fontSize: '0.9rem' }}>
                      {currentImgIndex + 1} / {selectedHome.images?.length || 1}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => setCurrentImgIndex(prev => (prev === 0 ? selectedHome.images.length - 1 : prev - 1))}
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', width: '60px', height: '60px', borderRadius: '50%', color: 'white', fontSize: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.4)'}
                    onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                  >❮</button>
                  <button 
                    onClick={() => setCurrentImgIndex(prev => (prev === selectedHome.images.length - 1 ? 0 : prev + 1))}
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', width: '60px', height: '60px', borderRadius: '50%', color: 'white', fontSize: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.4)'}
                    onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                  >❯</button>
                </div>

                {/* Thumbnails Overlay */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0' }} className="no-scrollbar">
                  {selectedHome.images?.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      onClick={() => setCurrentImgIndex(i)}
                      style={{ 
                        width: '70px', height: '50px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer',
                        border: i === currentImgIndex ? '2px solid white' : '2px solid transparent',
                        opacity: i === currentImgIndex ? 1 : 0.6,
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Scrollable Info */}
            <div style={{
              flex: '1',
              height: '100%',
              overflowY: 'auto',
              padding: '40px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              background: '#fff'
            }} className="no-scrollbar">
              
              <button 
                onClick={() => setSelectedHome(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '1.2rem', background: '#f5f5f5', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
              >✕</button>

              <div style={{ marginBottom: '30px' }}>
                <span style={{ color: 'var(--primary-light)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Đà Lạt • Homestay</span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '10px', marginBottom: '10px' }}>{selectedHome.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ background: 'var(--bg-mint)', padding: '5px 15px', borderRadius: '50px', color: 'var(--primary)', fontWeight: '600' }}>
                    📍 Cách trung tâm {selectedHome.distance} km
                  </span>
                  <span style={{ fontWeight: '600' }}>🛏 {selectedHome.rooms} Phòng ngủ</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '30px', marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>📄 Mô tả chi tiết</h3>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>{selectedHome.description}</p>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px' }}>🌿 Tiện ích nổi bật</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {selectedHome.amenities.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fdf8', padding: '15px', borderRadius: '16px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getAmenityIcon(item)}</span>
                      <span style={{ fontWeight: '500' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '140px' }}>
                <h3 style={{ marginBottom: '20px' }}>💬 Thảo luận & Nhận xét ({selectedHome.comments?.length || 0})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedHome.comments?.map(c => (
                    <div key={c.id} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ color: 'var(--primary)' }}>{c.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(c.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>{c.text}</p>
                    </div>
                  ))}
                  
                  <form onSubmit={(e) => handleAddComment(e, selectedHome.id)} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '30px' }}>
                    <input name="name" placeholder="Tên của bạn..." required style={{ padding: '15px', borderRadius: '12px', border: '1px solid #ddd' }} />
                    <textarea name="comment" placeholder="Bạn thấy căn này thế nào?" required style={{ padding: '15px', borderRadius: '12px', border: '1px solid #ddd', minHeight: '100px' }}></textarea>
                    <button type="submit" style={{ background: 'var(--primary-light)', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: '700' }}>Gửi bình luận</button>
                  </form>
                </div>
              </div>

              {/* Sticky Bottom Action Bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid #eee',
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 20
              }}>
                <div>
                  <div style={{ color: '#666', fontSize: '0.8rem' }}>Giá từ</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-light)' }}>
                    {selectedHome.price.toLocaleString()}đ<small style={{ fontSize: '0.9rem', fontWeight: '400', color: '#666' }}>/đêm</small>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedHome.votes || 0} Votes</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Đang dẫn đầu</div>
                  </div>
                  <button 
                    onClick={() => handleVote(selectedHome.id)}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(45, 90, 39, 0.2)' }}
                  >
                    Chốt 👍
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
