<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Profile - Nexus Campus"); %>
<%@ include file="../common/header.jsp" %>
<script src="/static/js/profile.js?v=2"></script>
<script src="/static/js/validation.js"></script>

    <div class="container-fluid">
        <div class="detail-container">
            <div class="page-header">
                <h1>USER PROFILE</h1>
                <div class="flex gap-8">
                    <button onclick="toggleEditMode()" id="edit-toggle-btn" class="btn btn-secondary btn-sm">Edit Profile</button>
                    <button onclick="togglePasswordCard()" class="btn btn-secondary btn-sm">Change Password</button>
                </div>
            </div>
            <div id="profile-container">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <span>Loading profile...</span>
                </div>
            </div>
            <!-- Edit Profile Card -->
            <div id="profile-edit-card" class="card" style="padding:32px;margin-top:20px;display:none;">
                <h3 style="font-family:Orbitron,monospace;margin-bottom:20px;">EDIT PROFILE</h3>
                <form onsubmit="event.preventDefault();submitProfileUpdate();">
                    <div class="form-group">
                        <label>Nickname</label>
                        <input type="text" id="edit-nickname" class="form-control" placeholder="Enter new nickname">
                        <div id="edit-nickname-error" class="field-feedback"></div>
                    </div>
                    <div class="form-group">
                        <label>Avatar URL</label>
                        <input type="url" id="edit-avatar" class="form-control" placeholder="https://example.com/avatar.png">
                        <div style="margin-top:8px;">
                            <img id="edit-avatar-preview" src="" alt="Preview" style="width:64px;height:64px;border-radius:50%;border:2px solid var(--neon-cyan);object-fit:cover;display:none;">
                        </div>
                    </div>
                    <div class="flex gap-16">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" onclick="toggleEditMode()" class="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
            <!-- Change Password Card -->
            <div id="password-change-card" class="card" style="padding:32px;margin-top:20px;display:none;">
                <h3 style="font-family:Orbitron,monospace;margin-bottom:20px;">CHANGE PASSWORD</h3>
                <form onsubmit="event.preventDefault();submitPasswordChange();">
                    <div class="form-group">
                        <label>Current Password</label>
                        <input type="password" id="change-old-password" class="form-control" placeholder="Enter current password" required>
                        <div id="change-old-password-error" class="field-feedback"></div>
                    </div>
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" id="change-new-password" class="form-control" placeholder="Enter new password" required>
                        <div id="change-new-password-error" class="field-feedback"></div>
                    </div>
                    <div class="flex gap-16">
                        <button type="submit" class="btn btn-primary">Update Password</button>
                        <button type="button" onclick="togglePasswordCard()" class="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

<%@ include file="../common/footer.jsp" %>
<script>
    var isEditMode = false;
    document.addEventListener('DOMContentLoaded', function() {
        loadProfile();
        if (isAuthenticated()) {
            api.get('/users/profile').then(function(res) {
                if (res.data) {
                    document.getElementById('edit-nickname').value = res.data.nickname || '';
                }
            });
        }
    });
    function toggleEditMode() {
        isEditMode = !isEditMode;
        var card = document.getElementById('profile-edit-card');
        var btn = document.getElementById('edit-toggle-btn');
        if (isEditMode) {
            card.style.display = 'block';
            btn.textContent = 'Hide Edit';
        } else {
            card.style.display = 'none';
            btn.textContent = 'Edit Profile';
        }
    }
    function togglePasswordCard() {
        var card = document.getElementById('password-change-card');
        card.style.display = card.style.display === 'none' ? 'block' : 'none';
    }
    function submitProfileUpdate() {
        var nickname = document.getElementById('edit-nickname').value.trim();
        var avatar = document.getElementById('edit-avatar').value.trim();
        if (!nickname) {
            showToast('Nickname cannot be empty.', 'error');
            return;
        }
        var data = {nickname: nickname};
        if (avatar) data.avatar = avatar;
        api.put('/users/profile', data).then(function(res) {
            if (res.code === 200) {
                showToast(res.message || 'Profile updated.', 'success');
                var user = getUser();
                if (user && res.data) {
                    user.nickname = res.data.nickname;
                    setAuth(getToken(), user);
                }
                toggleEditMode();
                loadProfile();
            } else {
                showToast(res.message || 'Update failed.', 'error');
            }
        }).catch(function() {
            showToast('Connection failed.', 'error');
        });
    }
    function submitPasswordChange() {
        var oldPwd = document.getElementById('change-old-password');
        var newPwd = document.getElementById('change-new-password');
        if (!oldPwd.value || !newPwd.value) {
            showToast('Both password fields are required.', 'error');
            return;
        }
        api.put('/users/password', {oldPassword: oldPwd.value, newPassword: newPwd.value}).then(function(res) {
            if (res.code === 200) {
                showToast(res.message || 'Password changed.', 'success');
                oldPwd.value = '';
                newPwd.value = '';
                togglePasswordCard();
            } else {
                showToast(res.message || 'Password change failed.', 'error');
            }
        }).catch(function() {
            showToast('Connection failed.', 'error');
        });
    }
    document.getElementById('edit-avatar').addEventListener('input', function() {
        var preview = document.getElementById('edit-avatar-preview');
        var url = this.value.trim();
        if (url) {
            preview.src = url;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });
</script>