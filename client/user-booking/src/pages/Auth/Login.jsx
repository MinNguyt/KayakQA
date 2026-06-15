import { useState } from 'react';
import apiService from '../../services/api.service.js';
import { Navigate, useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password) {
            setError('Vui lòng nhập email và mật khẩu.');
            return;
        }

        setLoading(true);
        const result = await apiService.login({ email, password });
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Đăng nhập thất bại');
            return;
        }

        // LoginResponse contains: token, id, username, email, role
        const loginData = result.data;
        console.log("Login response:", loginData);

        if (!loginData || !loginData.token) {
            setError('Phản hồi đăng nhập không hợp lệ');
            return;
        }

        // Store token and user data
        apiService.setAuthToken(loginData.token);
        apiService.setUserData({
            id: loginData.id,
            email: loginData.email,
            username: loginData.username,
            role: loginData.role
        });

        setSuccess('Đăng nhập thành công! Chào mừng bạn trở lại.');
        setTimeout(() => {
            navigate('/');
        }, 1500);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            fontFamily: "'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        leftPanel: {
            flex: 1,
            background: 'linear-gradient(145deg, #1e3a5f 0%, #0d2137 50%, #0a1929 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            position: 'relative',
            overflow: 'hidden',
        },
        decorativeCircle1: {
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
        },
        decorativeCircle2: {
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
            bottom: '-50px',
            left: '-50px',
        },
        brandSection: {
            position: 'relative',
            zIndex: 1,
            color: '#fff',
        },
        logoIcon: {
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            fontSize: '28px',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
        },
        brandTitle: {
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '16px',
            letterSpacing: '-0.5px',
            lineHeight: '1.2',
        },
        brandTagline: {
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.6',
            maxWidth: '380px',
        },
        featureList: {
            marginTop: '48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '15px',
        },
        featureIcon: {
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
        },
        rightPanel: {
            flex: 1,
            background: '#fafbfc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
        },
        formContainer: {
            width: '100%',
            maxWidth: '420px',
        },
        welcomeText: {
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px',
            fontWeight: '500',
        },
        formTitle: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '8px',
        },
        formSubtitle: {
            fontSize: '15px',
            color: '#64748b',
            marginBottom: '36px',
            lineHeight: '1.5',
        },
        inputGroup: {
            marginBottom: '20px',
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '8px',
        },
        inputWrapper: {
            position: 'relative',
        },
        input: {
            width: '100%',
            padding: '14px 16px',
            fontSize: '15px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.2s ease',
            background: '#fff',
            boxSizing: 'border-box',
        },
        inputFocused: {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
        },
        passwordToggle: {
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
        },
        forgotLink: {
            display: 'block',
            textAlign: 'right',
            fontSize: '14px',
            color: '#3b82f6',
            textDecoration: 'none',
            marginBottom: '24px',
            fontWeight: '500',
        },
        errorBox: {
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        successBox: {
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            color: '#16a34a',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        submitButton: {
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.35)',
        },
        divider: {
            display: 'flex',
            alignItems: 'center',
            margin: '28px 0',
            gap: '16px',
        },
        dividerLine: {
            flex: 1,
            height: '1px',
            background: '#e2e8f0',
        },
        dividerText: {
            fontSize: '13px',
            color: '#94a3b8',
            fontWeight: '500',
        },
        registerLink: {
            textAlign: 'center',
            fontSize: '15px',
            color: '#64748b',
        },
        registerLinkAnchor: {
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '6px',
        },
    };

    return (
        <div style={styles.container}>
            {/* Left Branding Panel */}
            <div style={styles.leftPanel}>
                <div style={styles.decorativeCircle1}></div>
                <div style={styles.decorativeCircle2}></div>
                <div style={styles.brandSection}>
                    <div style={styles.logoIcon}></div>
                    <h1 style={styles.brandTitle}>Đặt vé xe khách<br />trực tuyến</h1>
                    <p style={styles.brandTagline}>
                        Trải nghiệm đặt vé dễ dàng, nhanh chóng với hàng nghìn tuyến đường trên khắp Việt Nam.
                    </p>
                    <div style={styles.featureList}>
                        <div style={styles.featureItem}>
                            <span style={styles.featureIcon}>✓</span>
                            <span>Đặt vé 24/7, không cần xếp hàng</span>
                        </div>
                        <div style={styles.featureItem}>
                            <span style={styles.featureIcon}>🎫</span>
                            <span>Vé điện tử tiện lợi, không lo thất lạc</span>
                        </div>
                        <div style={styles.featureItem}>
                            <span style={styles.featureIcon}>💰</span>
                            <span>Giá vé cạnh tranh, nhiều ưu đãi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div style={styles.rightPanel}>
                <div style={styles.formContainer}>
                    <p style={styles.welcomeText}>Chào mừng trở lại</p>
                    <h2 style={styles.formTitle}>Đăng nhập tài khoản</h2>
                    <p style={styles.formSubtitle}>
                        Đăng nhập để quản lý đặt vé và theo dõi các chuyến đi của bạn
                    </p>

                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={styles.successBox}>
                            <span>✅</span>
                            {success}
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>Địa chỉ email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="name@company.com"
                            style={{
                                ...styles.input,
                                ...(focusedField === 'email' ? styles.inputFocused : {}),
                            }}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Mật khẩu</label>
                        <div style={styles.inputWrapper}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Nhập mật khẩu của bạn"
                                style={{
                                    ...styles.input,
                                    paddingRight: '80px',
                                    ...(focusedField === 'password' ? styles.inputFocused : {}),
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.passwordToggle}
                            >
                                {showPassword ? '🙈 Ẩn' : '👁️ Hiện'}
                            </button>
                        </div>
                    </div>

                    <a href="/reset-password" style={styles.forgotLink}>
                        Quên mật khẩu?
                    </a>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        style={styles.submitButton}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.35)';
                        }}
                    >
                        {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
                    </button>

                    <div style={styles.divider}>
                        <div style={styles.dividerLine}></div>
                        <span style={styles.dividerText}>hoặc</span>
                        <div style={styles.dividerLine}></div>
                    </div>

                    <p style={styles.registerLink}>
                        Chưa có tài khoản?
                        <a href="/register" style={styles.registerLinkAnchor}>
                            Đăng ký ngay
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
