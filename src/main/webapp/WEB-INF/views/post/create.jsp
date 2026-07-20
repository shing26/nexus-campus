<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "New Post - Nexus Campus"); %>
<%@ include file="../common/header.jsp" %>
<script src="/static/js/posts.js?v=3"></script>
<script src="/static/js/validation.js"></script>

    <div class="container-fluid">
        <div class="detail-container">
            <div class="page-header">
                <h1>NEW TRANSMISSION</h1>
            </div>
            <div class="card" style="padding:32px;">
                <div id="post-error" class="alert alert-error hidden"></div>
                <form onsubmit="event.preventDefault();validatePostForm();">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="post-title" class="form-control" placeholder="Brief your data packet" required>
                        <div id="post-title-error" class="field-feedback"></div>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="post-category" class="form-control">
                            <option value="">Select category...</option>
                        </select>
                        <div id="post-category-error" class="field-feedback"></div>
                    </div>
                    <div class="form-group">
                        <label>Content</label>
                        <textarea id="post-content" class="form-control" rows="12" placeholder="Write your content here... HTML is supported."></textarea>
                        <div id="post-content-error" class="field-feedback"></div>
                    </div>
                    <div class="flex gap-16">
                        <button type="submit" id="post-submit" class="btn btn-primary btn-lg">Submit</button>
                        <a href="/" class="btn btn-secondary btn-lg">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

<%@ include file="../common/footer.jsp" %>
<script>
function validatePostForm() {
    clearFieldError("post-title");
    clearFieldError("post-category");
    clearFieldError("post-content");
    var valid = true;
    if (!validateRequired("post-title", "Title")) valid = false;
    if (!validateRequired("post-content", "Content")) valid = false;
    if (valid) submitPost();
}
    document.addEventListener("DOMContentLoaded", function() {
        if (!isAuthenticated()) {
            showToast("Login required to create posts.", "info");
            setTimeout(function() { window.location.href = "/login"; }, 1000);
            return;
        }
        loadPostCategories();
    });
</script>