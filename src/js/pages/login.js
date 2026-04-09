import { signIn } from '../supabase-client.js';

export function renderLoginPage(onSuccess) {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <div class="login-header">
                    <div class="login-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h1 class="login-title">Pladis Max</h1>
                    <p class="login-subtitle">Вход в систему</p>
                </div>

                <div id="error-message"></div>

                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label" for="phone">Номер телефона</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-weight: 600; white-space: nowrap;">+998</span>
                            <input
                                type="tel"
                                id="phone"
                                class="form-input"
                                placeholder="90 123 45 67"
                                required
                                maxlength="12"
                                style="flex: 1;"
                            />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="password">Пароль</label>
                        <div style="position: relative;">
                            <input
                                type="password"
                                id="password"
                                class="form-input"
                                placeholder="Введите пароль"
                                required
                                style="padding-right: 48px;"
                            />
                            <button
                                type="button"
                                id="toggle-password"
                                style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; color: var(--text-gray);"
                                title="Показать пароль"
                            >
                                <svg id="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg id="eye-off-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" id="login-btn">
                        Войти
                    </button>
                </form>

                <p class="text-center text-gray mt-3" style="color: var(--text-gray); font-size: 14px;">
                    Доступ только для авторизованных пользователей
                </p>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeOffIcon = document.getElementById('eye-off-icon');

    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        if (type === 'text') {
            eyeIcon.style.display = 'none';
            eyeOffIcon.style.display = 'block';
            togglePasswordBtn.title = 'Скрыть пароль';
        } else {
            eyeIcon.style.display = 'block';
            eyeOffIcon.style.display = 'none';
            togglePasswordBtn.title = 'Показать пароль';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const phoneRaw = phoneInput.value.trim().replace(/\D/g, '');
        const password = passwordInput.value;

        if (phoneRaw.length !== 9) {
            errorMessage.innerHTML = `
                <div class="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Введите 9 цифр номера телефона</span>
                </div>
            `;
            return;
        }

        const phone = '+998' + phoneRaw;


        errorMessage.innerHTML = '';
        loginBtn.disabled = true;
        loginBtn.textContent = 'Вход...';

        try {
           const { data, error } = await signIn(phone, password);

            if (error) {
                throw error;
            }

            if (data.user) {
                onSuccess();
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.innerHTML = `
                <div class="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Неверный номер телефона или пароль</span>
                </div>
            `;
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Войти';
        }
    });
}
