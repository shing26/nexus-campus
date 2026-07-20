<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% request.setAttribute("pageTitle", "Post - Nexus Campus"); %>
<%@ include file="../common/header.jsp" %>
<script src="/static/js/posts.js"></script>
<script src="/static/js/comments.js"></script>
<script src="/static/js/validation.js"></script>

    <div class="container-fluid">
        <div class="detail-container">
            <div id="post-detail-container">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <span>Decrypting neural packet...</span>
                </div>
            </div>

            <div class="card" style="padding:24px;margin-top:24px;">
                <h3 style="font-family:'Orbitron',monospace;margin-bottom:16px;">TRANSMIT RESPONSE</h3>
                <div id="comment-error" class="alert alert-error hidden"></div>
                <textarea id="comment-content" class="form-control" rows="3" placeholder="Share your thoughts..."></textarea>
                <div id="comment-content-error" class="field-feedback"></div>
                <button onclick="validateComment()" class="btn btn-primary mt-8">Send</button>
            </div>

            <div id="comments-container" style="margin-top:16px;">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <span>Loading comments...</span>
                </div>
            </div>
        </div>
    </div>

<%@ include file="../common/footer.jsp" %>
<script>
function validateComment() {
    clearFieldError("comment-content");
    if (validateRequired("comment-content", "Comment")) {
        submitComment();
    }
}
    document.addEventListener("DOMContentLoaded", function() {
        loadPostDetail();
    });
</script>
