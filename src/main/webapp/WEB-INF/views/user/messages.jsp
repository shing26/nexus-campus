<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Messages - Nexus Campus"); %>
<%@ include file="../common/header.jsp" %>
<script src="/static/js/profile.js"></script>

    <div class="container-fluid">
        <div class="page-header">
            <h1>MESSAGE INBOX</h1>
            <p class="section-subtitle" style="margin:0;">System communications and notifications</p>
        </div>
        <div class="card" style="padding:24px;">
            <div id="messages-container">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <span>Decrypting message stream...</span>
                </div>
            </div>
        </div>
    </div>

<%@ include file="../common/footer.jsp" %>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }
        loadMessages();
    });
</script>