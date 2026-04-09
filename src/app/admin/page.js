"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const [homestays, setHomestays] = useState([]);
  const [inputText, setInputText] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [status, setStatus] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]); // Array of URLs
  const cloudName = "eggoeggoeggoeggo"; 
  const uploadPreset = "dalat2026"; 
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {

    fetchHomestays();
  }, []);

  const fetchHomestays = async () => {
    const { data } = await supabase.from('homestays').select('*, comments(*)').order('created_at', { ascending: false });
    if (data) setHomestays(data);
  };

  const handleAddFromJson = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      if (editingId) {
        // Handling Update
        const updateData = {
          ...parsed,
          images: uploadedImages.length > 0 ? uploadedImages : (parsed.images || (parsed.image ? [parsed.image] : []))
        };

        const { error } = await supabase.from('homestays').update(updateData).eq('id', editingId);
        
        if (!error) {
          fetchHomestays();
          resetForm();
          setStatus("✅ Đã cập nhật homestay thành công!");
          setTimeout(() => setStatus(""), 3000);
        } else {
          setStatus("❌ Lỗi Supabase: " + error.message);
        }
      } else {
        // Handling Insert
        const itemsToAdd = Array.isArray(parsed) ? parsed : [parsed];
        const newItems = itemsToAdd.map(item => ({
          ...item,
          images: uploadedImages.length > 0 ? uploadedImages : (item.images || (item.image ? [item.image] : [])),
          votes: item.votes || 0
        }));

        const { error } = await supabase.from('homestays').insert(newItems);
        
        if (!error) {
          fetchHomestays();
          resetForm();
          setStatus("✅ Đã thêm " + newItems.length + " homestay thành công!");
          setTimeout(() => setStatus(""), 3000);
        } else {
          setStatus("❌ Lỗi Supabase: " + error.message);
        }
      }
    } catch (e) {
      setStatus("❌ Lỗi format JSON. Hãy kiểm tra lại!");
    }
  };

  const resetForm = () => {
    setJsonInput("");
    setInputText("");
    setUploadedImages([]);
    setEditingId(null);
  };

  const handleEdit = (home) => {
    setEditingId(home.id);
    const { id, created_at, votes, comments, ...rest } = home;
    setJsonInput(JSON.stringify(rest, null, 2));
    setUploadedImages(home.images || (home.image ? [home.image] : []));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const deleteHomestay = async (id) => {
    const { error } = await supabase.from('homestays').delete().eq('id', id);
    if (!error) fetchHomestays();
  };

  return (
    <main className="container animate-fade" style={{ paddingTop: '40px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Quản trị Homestay</h1>
        <p style={{ color: 'var(--text-muted)' }}>Thêm mới địa điểm hoặc quản lý danh sách hiện tại.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Left Column: Import */}
        <div className="glass" style={{ padding: '30px', position: 'sticky', top: '100px', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '20px' }}>{editingId ? "🔧 Chỉnh sửa Homestay" : "Nhập dữ liệu AI"}</h2>

          <p style={{ fontSize: '0.9rem', marginBottom: '15px', color: 'var(--text-muted)' }}>
            Dán thông tin mô tả homestay vào đây, sau đó copy prompt để nhờ AI gen ra JSON.
          </p>
          
          <textarea 
            placeholder="Ví dụ: Homestay X ở Đà Lạt, giá 1tr, có hồ bơi, 3 phòng ngủ..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ 
              width: '100%', 
              height: '100px', 
              padding: '15px', 
              borderRadius: '12px', 
              border: '1px solid var(--primary-soft)',
              marginBottom: '15px',
              fontFamily: 'inherit'
            }}
          />

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Tải ảnh lên Cloudinary:</h3>
            <input 
              type="file" 
              accept="image/*"
              multiple
              disabled={isUploading}
              onChange={async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;

                setIsUploading(true);
                const urls = [];
                
                for (const file of files) {
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("upload_preset", uploadPreset);

                  try {
                    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                      method: "POST",
                      body: formData
                    });
                    const data = await res.json();
                    if (data.secure_url) {
                      urls.push(data.secure_url);
                    }
                  } catch (err) {
                    console.error("Upload error", err);
                  }
                }

                if (urls.length > 0) {
                  const newUploadedImages = [...uploadedImages, ...urls];
                  setUploadedImages(newUploadedImages);
                  setStatus(`✅ Đã tải lên ${urls.length} ảnh!`);
                } else {
                  setStatus("❌ Lỗi upload ảnh.");
                }
                setIsUploading(false);
              }}
              style={{ fontSize: '0.9rem' }}
            />
            {isUploading && <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>⌛ Đang tải lên...</p>}
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              {uploadedImages.map((url, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img src={url} style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <button 
                    onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                    style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px' }}
                  >✕</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#f8fdf8', padding: '15px', borderRadius: '8px', border: '1px dashed var(--primary)', marginBottom: '20px' }}>
            <div style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '5px' }}>COPY PROMPT CHO AI:</div>
            <code style={{ fontSize: '0.8rem', display: 'block', whiteSpace: 'pre-wrap', color: '#444' }}>
              Dựa vào thông tin sau, hãy trả về JSON (CHỈ JSON):
              {"\n"}{"{"}
              {"\n"}  "name": "Tên",
              {"\n"}  "price": number,
              {"\n"}  "rooms": number,
              {"\n"}  "distance": number,
              {"\n"}  "amenities": ["A", "B"],
              {"\n"}  "description": "Mô tả thật hấp dẫn và chi tiết"
              {"\n"}{"}"}
              {"\n\n"}*Lưu ý: Không cần lo về phần ảnh (images), hệ thống sẽ tự động gán ảnh bạn vừa upload.*
            </code>
          </div>

          <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Dán JSON kết quả từ AI vào đây:</h3>
          <textarea 
            placeholder='{ "name": "..." }'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            style={{ 
              width: '100%', 
              height: '100px', 
              padding: '15px', 
              borderRadius: '12px', 
              border: '2px solid var(--primary)',
              marginBottom: '15px',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleAddFromJson}
              style={{ 
                flex: 1,
                background: editingId ? 'var(--primary-light)' : 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                padding: '15px', 
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '1rem'
              }}
            >
              {editingId ? "Lưu thay đổi" : "Nhập Homestay Ngay"}
            </button>
            {editingId && (
              <button 
                onClick={resetForm}
                style={{ 
                  background: '#f5f5f5', 
                  color: '#666', 
                  border: 'none', 
                  padding: '0 20px', 
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                Hủy
              </button>
            )}
          </div>

          
          {status && <div style={{ marginTop: '15px', textAlign: 'center', fontWeight: '600' }}>{status}</div>}
        </div>

        {/* Right Column: List & Manage */}
        <div>
          <h2 style={{ marginBottom: '20px' }}>Danh sách hiện có ({homestays.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {homestays.map(home => (
              <div key={home.id} className="glass" style={{ padding: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <img src={home.image} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: '700' }}>{home.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{home.price.toLocaleString()}đ • {home.votes} votes</div>
                  
                  {/* Brief Comment List */}
                  {home.comments?.length > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '5px' }}>Bình luận mới nhất:</div>
                      {home.comments.slice(0, 2).map(c => (
                        <div key={c.id} style={{ fontStyle: 'italic', marginBottom: '3px' }}>
                          "{c.text}" - {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => handleEdit(home)}
                    style={{ background: 'var(--bg-mint)', color: 'var(--primary)', border: '1px solid var(--primary-soft)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}
                  >
                    Sửa JSON
                  </button>
                  <button 
                    onClick={() => deleteHomestay(home.id)}
                    style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem' }}
                  >
                    Xóa
                  </button>
                </div>

              </div>
            ))}
            {homestays.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Chưa có homestay nào.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
