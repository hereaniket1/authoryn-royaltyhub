        // Notify opener (parent) that auth succeeded, then close popup.
        try{
            if (window.opener && !window.opener.closed) {
                // Use origin for security; if it fails, still attempt to postMessage
                window.opener.postMessage({ type: 'oauth_success' }, window.location.origin);
            }
        }catch(_){
            try{ window.opener.postMessage({ type: 'oauth_success' }, '*') }catch(__){}
        }

        // Close shortly after notifying parent
        setTimeout(() => {
            window.close();
        }, 500);
