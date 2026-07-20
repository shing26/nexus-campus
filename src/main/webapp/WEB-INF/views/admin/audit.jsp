<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Content Audit - Nexus Campus"); %>
<%@ include file="../common/header.jsp" %>
<script src="/static/js/admin.js"></script>

    <div class="container-fluid">
        <div class="page-header">
            <h1>FIREWALL QUEUE</h1>
            <p class="section-subtitle" style="margin:0;">Content moderation panel</p>
        </div>
        <div class="card" style="padding:24px;overflow-x:auto;">
            <div id="audit-container">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <span>Scanning firewall queue...</span>
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
        loadAuditPosts();
    });
</script>