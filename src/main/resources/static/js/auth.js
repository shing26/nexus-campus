/**
 * Nexus Campus - Auth module
 * Login, register, logout
 */
(function() {
    'use strict';

    // ── Logout ─────────────────────────────────────────────
    window.logout = function() {
        window.showToast('Disconnected from Nexus.', 'info');
        window.clearAuth();
    };

    // ── Login ──────────────────────────────────────────────
    window.submitLogin = function() {
        const username = document.getElementById('login-username');
        const password = document.getElementById('login-password');
        const error = document.getElementById('login-error');
        if (!username.value || !password.value) {
            error.textContent = 'All fields required.';
            error.classList.remove('hidden');
            return;
        }
        window.api.post('/auth/login', { username: username.value, password: password.value }).then(function(res) {
            if (res.code === 200 && res.data) {
                window.setAuth(res.data.token, {
                    userId: res.data.userId,
                    username: res.data.username,
                    nickname: res.data.nickname,
                    role: res.data.role,
                    avatar: res.data.avatar,
                    corePower: res.data.corePower,
                    level: res.data.level
                });
                window.showToast(res.message || 'Login successful.', 'success');
                setTimeout(function() { window.location.href = '/'; }, 500);
            } else {
                error.textContent = res.message || 'Login failed.';
                error.classList.remove('hidden');
            }
        });
    };

    // ── Register ───────────────────────────────────────────
    window.submitRegister = function() {
        const username = document.getElementById('reg-username');
        const password = document.getElementById('reg-password');
        const nickname = document.getElementById('reg-nickname');
        const error = document.getElementById('reg-error');
        if (!username.value || !password.value || !nickname.value) {
            error.textContent = 'All fields required.';
            error.classList.remove('hidden');
            return;
        }
        window.api.post('/auth/register', { username: username.value, password: password.value, nickname: nickname.value }).then(function(res) {
            if (res.code === 200 && res.data) {
                window.setAuth(res.data.token, {
                    userId: res.data.userId,
                    username: res.data.username,
                    nickname: res.data.nickname,
                    role: res.data.role,
                    avatar: res.data.avatar,
                    corePower: res.data.corePower,
                    level: res.data.level
                });
                window.showToast(res.message || 'Registration successful.', 'success');
                setTimeout(function() { window.location.href = '/'; }, 500);
            } else {
                error.textContent = res.message || 'Registration failed.';
                error.classList.remove('hidden');
            }
        });
    };

})();
