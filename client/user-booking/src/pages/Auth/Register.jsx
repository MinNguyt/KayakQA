import { useState } from 'react';
import apiService from '../../services/api.service.js';

export default function Register() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const checkPasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const handlePasswordChange = (e) => {
        const pwd = e.target.value;
        setPassword(pwd);
        setPasswordStrength(checkPasswordStrength(pwd));
    };

    const validate = () => {
        if (!email || !phone || !password || !age) {
            return 'Vui lòng điền đầy đủ thông tin.';
        }
        const phoneRegex = /^\+?[0-9]{9,15}$/;
        if (!phoneRegex.test(phone)) {
            return 'Số điện thoại không hợp lệ.';
        }
        const parsedAge = Number(age);
        if (!Number.isFinite(parsedAge) || parsedAge < 13 || parsedAge > 120) {
            return 'Tuổi phải là số hợp lệ từ 13 đến 120.';
        }
        if (password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            return 'Mật khẩu phải có ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationMessage = validate();
        if (validationMessage) {
            setError(validationMessage);
            return;
        }

        setLoading(true);
        const result = await apiService.register({ email, phone, password, age });
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Đăng ký thất bại');
            return;
        }

        setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return '#ef4444';
        if (passwordStrength <= 3) return '#f59e0b';
        return '#10b981';
    };

    const getStrengthText = () => {
        if (passwordStrength <= 2) return 'Yếu';
        if (passwordStrength <= 3) return 'Trung bình';
        return 'Mạnh';
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            fontFamily: "'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        leftPanel: {
            flex: 1,
            background: 'linear-gradient(155deg, #0f766e 0%, #115e59 40%, #134e4a 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            position: 'relative',
            overflow: 'hidden',
        },
        decorativeShape1: {
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)',
            top: '-150px',
            right: '-150px',
        },
        decorativeShape2: {
            position: 'absolute',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(94, 234, 212, 0.1) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
        },
        brandSection: {
            position: 'relative',
            zIndex: 1,
            color: '#fff',
        },
        logoIcon: {
            width: '68px',
            height: '68px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            fontSize: '30px',
            boxShadow: '0 8px 32px rgba(20, 184, 166, 0.35)',
        },
        brandTitle: {
            fontSize: '34px',
            fontWeight: '700',
            marginBottom: '16px',
            letterSpacing: '-0.5px',
            lineHeight: '1.25',
        },
        brandTagline: {
            fontSize: '17px',
            color: 'rgba(255, 255, 255, 0.75)',
            lineHeight: '1.7',
            maxWidth: '360px',
        },
        benefitsList: {
            marginTop: '48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
        },
        benefitItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '15px',
        },
        benefitIcon: {
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
        },
        benefitText: {
            paddingTop: '8px',
        },
        rightPanel: {
            flex: 1,
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            overflowY: 'auto',
        },
        formContainer: {
            width: '100%',
            maxWidth: '480px',
        },
        stepIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
        },
        stepDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#14b8a6',
        },
        stepLine: {
            width: '24px',
            height: '2px',
            background: '#e2e8f0',
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
            marginBottom: '32px',
            lineHeight: '1.5',
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
        },
        inputGroup: {
            marginBottom: '20px',
        },
        inputGroupFull: {
            gridColumn: '1 / -1',
            marginBottom: '0',
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
            borderColor: '#14b8a6',
            boxShadow: '0 0 0 4px rgba(20, 184, 166, 0.1)',
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
        },
        strengthBar: {
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        strengthTrack: {
            flex: 1,
            height: '4px',
            background: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden',
        },
        strengthFill: {
            height: '100%',
            background: getStrengthColor(),
            width: `${(passwordStrength / 5) * 100}%`,
            transition: 'all 0.3s ease',
            borderRadius: '2px',
        },
        strengthText: {
            fontSize: '12px',
            fontWeight: '600',
            color: getStrengthColor(),
            minWidth: '70px',
        },
        hint: {
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '6px',
        },
        errorBox: {
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#dc2626',
            fontSize: '14px',
            marginTop: '20px',
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
            marginTop: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        submitButton: {
            width: '100%',
            marginTop: '24px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(20, 184, 166, 0.35)',
        },
        loginLink: {
            textAlign: 'center',
            fontSize: '15px',
            color: '#64748b',
            marginTop: '24px',
        },
        loginLinkAnchor: {
            color: '#14b8a6',
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '6px',
        },
        terms: {
            fontSize: '13px',
            color: '#94a3b8',
            textAlign: 'center',
            marginTop: '20px',
            lineHeight: '1.5',
        },
        termsLink: {
            color: '#0f766e',
            textDecoration: 'none',
        },
    };

    return (
        <div style={styles.container}>
            {/* Left Branding Panel */}
            <div style={styles.leftPanel}>
                <div style={styles.decorativeShape1}></div>
                <div style={styles.decorativeShape2}></div>
                <div style={styles.brandSection}>
                    <div style={styles.logoIcon}>🎫</div>
                    <h1 style={styles.brandTitle}>Tham gia hàng nghìn<br />khách hàng hài lòng</h1>
                    <p style={styles.brandTagline}>
                        Đăng ký để nhận những ưu đãi độc quyền và trải nghiệm đặt vé thuận tiện nhất.
                    </p>
                    <div style={styles.benefitsList}>
                        <div style={styles.benefitItem}>
                            <span style={styles.benefitIcon}>🎁</span>
                            <span style={styles.benefitText}>Nhận ngay 50.000đ cho lần đặt vé đầu tiên</span>
                        </div>
                        <div style={styles.benefitItem}>
                            <span style={styles.benefitIcon}>📱</span>
                            <span style={styles.benefitText}>Quản lý vé dễ dàng trên mọi thiết bị</span>
                        </div>
                        <div style={styles.benefitItem}>
                            <span style={styles.benefitIcon}>🔔</span>
                            <span style={styles.benefitText}>Thông báo ưu đãi và lịch trình mới nhất</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div style={styles.rightPanel}>
                <div style={styles.formContainer}>
                    <div style={styles.stepIndicator}>
                        <div style={styles.stepDot}></div>
                        <div style={styles.stepLine}></div>
                        <div style={{ ...styles.stepDot, opacity: 0.3 }}></div>
                    </div>
                    <h2 style={styles.formTitle}>Tạo tài khoản mới</h2>
                    <p style={styles.formSubtitle}>
                        Chỉ mất vài phút để bắt đầu hành trình cùng chúng tôi
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label htmlFor="email" style={styles.label}>Email</label>
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
                                <label htmlFor="phone" style={styles.label}>Số điện thoại</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="0912 345 678"
                                    style={{
                                        ...styles.input,
                                        ...(focusedField === 'phone' ? styles.inputFocused : {}),
                                    }}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="age" style={styles.label}>Tuổi</label>
                                <input
                                    id="age"
                                    type="number"
                                    min="13"
                                    max="120"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    onFocus={() => setFocusedField('age')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="25"
                                    style={{
                                        ...styles.input,
                                        ...(focusedField === 'age' ? styles.inputFocused : {}),
                                    }}
                                />
                            </div>
                            <div style={{ ...styles.inputGroup, ...styles.inputGroupFull }}>
                                <label htmlFor="password" style={styles.label}>Mật khẩu</label>
                                <div style={styles.inputWrapper}>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Tạo mật khẩu mạnh"
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
                                {password && (
                                    <div style={styles.strengthBar}>
                                        <div style={styles.strengthTrack}>
                                            <div style={styles.strengthFill}></div>
                                        </div>
                                        <span style={styles.strengthText}>{getStrengthText()}</span>
                                    </div>
                                )}
                                <p style={styles.hint}>
                                    Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div style={styles.errorBox}>
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div style={styles.successBox}>
                                <span>🎉</span>
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={styles.submitButton}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 14px rgba(20, 184, 166, 0.35)';
                            }}
                        >
                            {loading ? '⏳ Đang tạo tài khoản...' : 'Tạo tài khoản'}
                        </button>

                        <p style={styles.terms}>
                            Bằng việc đăng ký, bạn đồng ý với{' '}
                            <a href="#" style={styles.termsLink}>Điều khoản dịch vụ</a>
                            {' '}và{' '}
                            <a href="#" style={styles.termsLink}>Chính sách bảo mật</a>
                        </p>
                    </form>

                    <p style={styles.loginLink}>
                        Đã có tài khoản?
                        <a href="/login" style={styles.loginLinkAnchor}>
                            Đăng nhập
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
