<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Login - Nexus Campus"); %>
<%@ include file="header.jsp" %>
<script src="/static/js/auth.js"></script>
<script src="/static/js/validation.js"></script>

    <div class="auth-container">
        <div class="auth-card">
            <h2>NEURAL LINK</h2>
            <p class="auth-subtitle">Authenticate to access the Nexus</p>
            <div id="login-error" class="alert alert-error hidden"></div>
            <form onsubmit="event.preventDefault();validateLoginForm();">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="login-username" class="form-control" placeholder="Enter your username" required>
                    <div id="login-username-error" class="field-feedback"></div>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-password" class="form-control" placeholder="Enter your password" required>
                    <div id="login-password-error" class="field-feedback"></div>
                </div>
                <button type="submit" class="btn btn-primary w-full btn-lg">Connect</button>
            </form>
            <div class="auth-link">Don't have an account? <a href="/register">Register</a></div>
            <div class="auth-link mt-8">Demo: admin / admin123</div>
        </div>
    </div>

<%@ include file="footer.jsp" %>
<script>
function validateLoginForm() {
    var valid = true;
    clearFieldError("login-username");
    clearFieldError("login-password");
    if (!validateRequired("login-username", "Username")) valid = false;
    if (!validateRequired("login-password", "Password")) valid = false;
    if (valid) submitLogin();
}
</script>