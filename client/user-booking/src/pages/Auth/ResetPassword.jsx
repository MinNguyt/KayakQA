import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../../services/api.service.js';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !phone) { setError('Vui lòng nhập đầy đủ email và số điện thoại.'); return; }
        setLoading(true);
        const result = await apiService.verifyRecoveryInfo(email, phone);
        setLoading(false);
        if (result.success) {
            setUserId(result.data.responseObject.userId);
            setStep(2);
            setSuccess('Xác thực thành công!');
        } else {
            setError(result.error || 'Thông tin xác thực không chính xác.');
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        if (!password || !confirmPassword) { setError('Vui lòng nhập đầy đủ mật khẩu.'); return; }
        if (password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }
        setLoading(true);
        const result = await apiService.confirmResetPassword(userId, password);
        setLoading(false);
        if (result.success) {
            setSuccess('Đặt lại mật khẩu thành công!');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.error || 'Đặt lại mật khẩu thất bại.');
        }
    };

    const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '40px 20px' };
    const cardStyle = { width: '100%', maxWidth: '460px', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden' };
    const headerStyle = { padding: '40px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #fff 0%, #fafbfc 100%)' };
    const iconStyle = { width: '80px', height: '80px', borderRadius: '24px', background: step === 1 ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px', boxShadow: step === 1 ? '0 8px 32px rgba(99,102,241,0.3)' : '0 8px 32px rgba(16,185,129,0.3)' };
    const titleStyle = { fontSize: '26px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' };
    const subtitleStyle = { fontSize: '15px', color: '#64748b' };
    const bodyStyle = { padding: '32px 40px 40px' };
    const inputGroupStyle = { marginBottom: '20px' };
    const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' };
    const inputBase = { width: '100%', padding: '14px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '12px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' };
    const inputFocusStyle = { borderColor: step === 1 ? '#6366f1' : '#10b981', boxShadow: step === 1 ? '0 0 0 4px rgba(99,102,241,0.1)' : '0 0 0 4px rgba(16,185,129,0.1)' };
    const errorStyle = { padding: '14px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' };
    const successStyle = { padding: '14px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#16a34a', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' };
    const btnStyle = { width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', color: '#fff', background: loading ? '#94a3b8' : (step === 1 ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #10b981, #059669)'), border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : (step === 1 ? '0 4px 14px rgba(99,102,241,0.35)' : '0 4px 14px rgba(16,185,129,0.35)') };
    const stepStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' };
    const stepCircle = (active, done) => ({ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', background: done ? 'linear-gradient(135deg, #10b981, #059669)' : (active ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#f1f5f9'), color: active || done ? '#fff' : '#94a3b8', boxShadow: active || done ? '0 4px 12px rgba(0,0,0,0.15)' : 'none' });
    const backLinkStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', fontSize: '14px', color: '#64748b', textDecoration: 'none' };
    const pwdToggleStyle = { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '500' };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={headerStyle}>
                    <div style={iconStyle}>{step === 1 ? '🔐' : '🔑'}</div>
                    <h1 style={titleStyle}>{step === 1 ? 'Khôi phục tài khoản' : 'Tạo mật khẩu mới'}</h1>
                    <p style={subtitleStyle}>{step === 1 ? 'Xác minh danh tính để lấy lại quyền truy cập' : 'Chọn một mật khẩu mạnh và dễ nhớ'}</p>
                    <div style={stepStyle}>
                        <div style={stepCircle(step === 1, step > 1)}>{step > 1 ? '✓' : '1'}</div>
                        <div style={{ width: '60px', height: '3px', background: step > 1 ? '#10b981' : '#e2e8f0', borderRadius: '2px' }}></div>
                        <div style={stepCircle(step === 2, false)}>2</div>
                    </div>
                </div>
                <div style={bodyStyle}>
                    {error && <div style={errorStyle}><span>⚠️</span>{error}</div>}
                    {success && <div style={successStyle}><span>✅</span>{success}</div>}
                    {step === 1 ? (
                        <form onSubmit={handleVerify}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="name@company.com" style={{ ...inputBase, ...(focusedField === 'email' ? inputFocusStyle : {}) }} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Số điện thoại</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} placeholder="0912 345 678" style={{ ...inputBase, ...(focusedField === 'phone' ? inputFocusStyle : {}) }} />
                            </div>
                            <button type="submit" disabled={loading} style={btnStyle}>{loading ? '⏳ Đang xác minh...' : 'Tiếp tục'}</button>
                        </form>
                    ) : (
                        <form onSubmit={handleReset}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Mật khẩu mới</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} placeholder="Nhập mật khẩu mới" style={{ ...inputBase, paddingRight: '80px', ...(focusedField === 'password' ? inputFocusStyle : {}) }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={pwdToggleStyle}>{showPassword ? '🙈 Ẩn' : '👁️ Hiện'}</button>
                                </div>
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Xác nhận mật khẩu</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} placeholder="Nhập lại mật khẩu" style={{ ...inputBase, ...(focusedField === 'confirm' ? inputFocusStyle : {}) }} />
                            </div>
                            <button type="submit" disabled={loading} style={btnStyle}>{loading ? '⏳ Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
                        </form>
                    )}
                    <a href="/login" style={backLinkStyle}><span>←</span> Quay lại đăng nhập</a>
                </div>
            </div>
        </div>
    );
}
