<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Dashboard - Nexus Campus"); %>
<%@ include file="../common/header.jsp" %>
<script src="/static/js/admin.js"></script>

    <div class="container-fluid">
        <div class="page-header">
            <h1>ADMIN DASHBOARD</h1>
            <p class="section-subtitle" style="margin:0;">Global Nexus system overview</p>
        </div>

        <div id="stats-container">
            <div class="loading-container">
                <div class="spinner"></div>
                <span>Scanning Nexus core...</span>
            </div>
        </div>

        <div class="card" style="padding:24px;">
            <h3 style="font-family:'Orbitron',monospace;margin-bottom:8px;">Quick Links</h3>
            <div class="flex gap-16 mt-16">
                <a href="/admin/audit" class="btn btn-secondary">Content Audit</a>
                <a href="/" class="btn btn-secondary">View Forum</a>
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
        loadAdminStats();
    });
</script>