<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Register - Nexus Campus"); %>
<%@ include file="header.jsp" %>
<script src="/static/js/auth.js"></script>
<script src="/static/js/validation.js"></script>

    <div class="auth-container">
        <div class="auth-card">
            <h2>INITIALIZE</h2>
            <p class="auth-subtitle">Create your Nexus identity</p>
            <div id="reg-error" class="alert alert-error hidden"></div>
            <form onsubmit="event.preventDefault();validateRegisterForm();">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="reg-username" class="form-control" placeholder="Choose a unique username" required>
                    <div id="reg-username-error" class="field-feedback"></div>
                </div>
                <div class="form-group">
                    <label>Nickname</label>
                    <input type="text" id="reg-nickname" class="form-control" placeholder="Your display name" required>
                    <div id="reg-nickname-error" class="field-feedback"></div>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="reg-password" class="form-control" placeholder="Min 6 characters" required>
                    <div id="reg-password-error" class="field-feedback"></div>
                </div>
                <button type="submit" class="btn btn-primary w-full btn-lg">Initialize</button>
            </form>
            <div class="auth-link">Already connected? <a href="/login">Login</a></div>
        </div>
    </div>

<%@ include file="footer.jsp" %>
<script>
function validateRegisterForm() {
    var valid = true;
    clearFieldError("reg-username");
    clearFieldError("reg-nickname");
    clearFieldError("reg-password");
    if (!validateRequired("reg-username", "Username")) valid = false;
    if (!validateRequired("reg-nickname", "Nickname")) valid = false;
    if (!validateMinLength("reg-password", 6)) valid = false;
    if (valid) submitRegister();
}
</script>