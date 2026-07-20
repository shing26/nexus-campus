<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page isErrorPage="true" %>
<% request.setAttribute("pageTitle", "Error - Nexus Campus"); %>
<%@ include file="header.jsp" %>

    <div class="error-page">
        <div>
            <div class="error-code">
                ${statusCode != null ? statusCode : (pageContext.errorData.statusCode != null ? pageContext.errorData.statusCode : '404')}
            </div>
            <div class="error-title">
                ${statusCode == 403 ? 'ACCESS DENIED' : statusCode == 404 ? 'SIGNAL LOST' : statusCode == 500 ? 'SYSTEM COLLAPSE' : 'ANOMALY DETECTED'}
            </div>
            <div class="error-divider"></div>
            <p class="error-message">
                ${errorMessage != null ? errorMessage : (pageContext.errorData.throwable != null ? pageContext.errorData.throwable.message : 'The Nexus encountered an unexpected condition. The system administrators have been notified.')}
            </p>
            <a href="/" class="btn btn-primary btn-lg">Return to Nexus</a>
        </div>
    </div>

<%@ include file="footer.jsp" %>