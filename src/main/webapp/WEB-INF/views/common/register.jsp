<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Register - Nexus Campus"); %>
<%@ include file="header.jsp" %>
<script src="/static/js/auth.js?v=3"></script>

    <div class="auth-container">
        <div class="auth-card">
            <h2>INITIALIZE</h2>
            <p class="auth-subtitle">Create your Nexus identity</p>
            <div id="reg-error" class="alert alert-error hidden"></div>
            <form onsubmit="event.preventDefault();window.submitRegister();">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="reg-username" class="form-control" placeholder="Choose a unique username" required>
                </div>
                <div class="form-group">
                    <label>Nickname</label>
                    <input type="text" id="reg-nickname" class="form-control" placeholder="Your display name" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="reg-password" class="form-control" placeholder="Min 6 characters" required>
                </div>
                <button type="submit" id="register-submit" class="btn btn-primary w-full btn-lg">Initialize</button>
            </form>
            <div class="auth-link">Already connected? <a href="/login">Login</a></div>
        </div>
    </div>

<%@ include file="footer.jsp" %>