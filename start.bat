pm2 start app.js services/auth/auth.js services/image_hosting/image_hosting.js services/blog/blog.js
pm2 status
pause >nul