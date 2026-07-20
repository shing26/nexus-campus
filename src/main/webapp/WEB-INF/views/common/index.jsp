<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Nexus Campus - Cyberpunk Forum"); %>
<%@ include file="header.jsp" %>
<script src="/static/js/posts.js"></script>

    <div class="container-fluid">
        <section class="hero">
            <h1>NEXUS CAMPUS</h1>
            <p>Welcome to the future of campus discussions. Share knowledge, connect with peers, and explore the frontiers of technology and ideas.</p>
            <div class="search-bar" style="max-width:600px;margin:0 auto;">
                <input type="text" id="search-input" class="form-control" placeholder="Search the Nexus..." onkeyup="if(event.key==='Enter')searchPosts()">
                <button class="btn btn-primary" onclick="searchPosts()">Search</button>
            </div>
        </section>

        <div class="category-filter" id="category-filter"></div>

    <div id="post-container">
    </div>
    </div>

<%@ include file="footer.jsp" %>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        loadCategories();
        loadPosts();
    });
</script>