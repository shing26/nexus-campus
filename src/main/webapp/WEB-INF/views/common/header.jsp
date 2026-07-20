<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle != null ? pageTitle : 'Nexus Campus'}</title>
    <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/static/css/cyberpunk.css">
    <script src="/static/js/axios.min.js"></script>
    <script src="/static/js/main.js?v=3"></script>
</head>
<body>
    <nav class="navbar">
        <div class="navbar-inner">
            <a href="/" class="navbar-brand">NEXUS<span>CAMPUS</span></a>
            <button class="navbar-toggle" id="navbar-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div class="navbar-nav" id="navbar-user-area">
    <!-- Static fallback buttons (JS replaces this on load) -->
    <a href="/login" class="btn btn-login" style="padding:8px 16px;border-radius:4px;border:1px solid var(--neon-cyan);color:var(--neon-cyan);text-decoration:none;">Login</a>
    <a href="/register" class="btn btn-register" style="padding:8px 16px;border-radius:4px;background:linear-gradient(135deg,var(--neon-magenta),var(--neon-purple));color:#fff;text-decoration:none;">Register</a>
</div>
<script>
// Inline fallback: populate navbar immediately (before main.js DOMContentLoaded)
(function() {
    var nav = document.getElementById("navbar-user-area");
    if (!nav) return;
    try {
        var raw = localStorage.getItem("nexus_user");
        if (!raw) return;
        var user = JSON.parse(raw);
        if (!user || !user.nickname) return;
        nav.innerHTML =
            '<a href="/user/messages" class="nav-icon-link" title="Messages">' +
            '  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>' +
            '    <polyline points="22,6 12,13 2,6"/>' +
            '  </svg>' +
            "</a>" +
            '<a href="/post/create" class="btn btn-primary btn-sm">+ New Post</a>' +
            (user.role === "ADMIN"
                ? '<a href="/admin/audit" style="color:var(--text-secondary);padding:8px 16px;text-decoration:none;">Audit</a>' +
                  '<a href="/admin/dashboard" style="color:var(--text-secondary);padding:8px 16px;text-decoration:none;">Dashboard</a>'
                : "") +
            '<a href="/user/profile" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:var(--text-secondary);">' +
            '  <img src="https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nickname) + "&background=1a1a3e&color=00f0ff&size=32" + '" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);">' +
            '  <span>' + user.nickname + "</span>" +
            "</a>" +
            '<button onclick="logout()" class="btn btn-secondary btn-sm">Disconnect</button>';
    } catch(e) {
        // localStorage not available or parse error — keep static buttons
    }
})();
</script>
        </div>
    </nav>

