
# PointGuard Production Deployment Guide (VPS/Ubuntu)

This guide provides step-by-step instructions for deploying the PointGuard application (React frontend and NestJS backend) to a production environment on a VPS running Ubuntu.

The deployment strategy uses:
- **Nginx:** As a high-performance web server to serve the static React frontend and as a reverse proxy to handle API requests to the backend.
- **PM2:** A process manager to run the NestJS backend, ensuring it stays alive and can be easily managed.
- **Certbot:** To automatically provision and manage free SSL/TLS certificates from Let's Encrypt for HTTPS.

---

### Prerequisites

Before you begin, ensure you have:
1.  An Ubuntu VPS (20.04 or newer recommended).
2.  A domain name (e.g., `app.yourdomain.com`) pointed to your VPS's IP address.
3.  SSH access to your VPS as a user with `sudo` privileges.
4.  Node.js (v18 or newer) and npm installed on your VPS.

---

### Step 1: Deploy the NestJS Backend

First, we'll set up and run the backend API service. This guide assumes your NestJS code is in a `server` directory within your project.

1.  **Clone Your Project:**
    Log in to your VPS and clone your repository.
    ```bash
    git clone <your_repository_url>
    cd <your_project_directory>/server 
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Your application requires sensitive information like a database connection string and JWT secret. Create a `.env` file for production.
    ```bash
    # Create a new .env file in the 'server' directory
    nano .env
    ```
    Add your production configuration. **Security Note:** Use long, random strings for all secrets.
    ```env
    # Example .env content
    NODE_ENV=production
    PORT=3001 # Or any port you wish to run the backend on
    DATABASE_URL="mongodb://user:password@localhost:27017/pointguard_prod"
    JWT_SECRET="use_a_very_strong_and_long_random_secret_string_here_1"
    CSRF_SECRET="use_another_very_strong_and_long_random_secret_here_2"
    COOKIE_SECRET="use_a_third_very_strong_and_long_random_secret_here_3"
    ```

4.  **Build for Production:**
    Compile the TypeScript code into optimized JavaScript.
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the compiled code.

5.  **Install and Run with PM2:**
    Install PM2 globally, then use it to start your application.
    ```bash
    sudo npm install pm2 -g
    pm2 start dist/main.js --name "pointguard-api"
    ```
    -   `--name "pointguard-api"` gives the process a memorable name.

6.  **Verify Backend is Running:**
    Check the status of your app.
    ```bash
    pm2 status
    ```
    You should see `pointguard-api` with a status of `online`.

7.  **Enable PM2 Startup on Boot:**
    This ensures your app will restart automatically if the server reboots.
    ```bash
    pm2 startup
    # Follow the command's instructions to complete setup.
    pm2 save
    ```

---

### Step 2: Deploy the React Frontend

The frontend consists of static files that will be served by Nginx.

1.  **Understanding the "Buildless" Frontend:**
    This project uses an `importmap` in `index.html` to load React and other dependencies directly from a CDN (`esm.sh`). This means there is **no build step** (like `npm run build`) for the frontend.
    -   **Advantage:** Simple to deploy—just copy the files.
    -   **Disadvantage:** Relies on an external service (CDN), which can be a single point of failure. For higher performance and reliability, consider adding a build tool like Vite to bundle assets.

2.  **Create a Directory for Frontend Files:**
    ```bash
    sudo mkdir -p /var/www/pointguard
    ```

3.  **Copy Frontend Files to Server:**
    From your **local machine's project root**, copy all frontend files to the directory you just created on the VPS. The `rsync` command is ideal for this.
    ```bash
    # This command syncs the current directory to the server,
    # excluding the server code and git files.
    rsync -avz --delete --exclude 'server/' --exclude '.git/' ./ <your_vps_user>@<your_vps_ip>:/var/www/pointguard/
    ```

4.  **Set Permissions:**
    On your VPS, ensure the Nginx user can read the files.
    ```bash
    sudo chown -R www-data:www-data /var/www/pointguard
    sudo chmod -R 755 /var/www/pointguard
    ```

---

### Step 3: Configure Nginx

Nginx will serve the frontend and route API calls to the backend.

1.  **Install Nginx:**
    ```bash
    sudo apt update
    sudo apt install nginx
    ```

2.  **Create an Nginx Server Block:**
    Create a new configuration file for your site.
    ```bash
    sudo nano /etc/nginx/sites-available/pointguard
    ```

3.  **Add the Configuration:**
    Paste the following configuration into the file. Replace `app.yourdomain.com` with your actual domain and `3001` with your backend port if you changed it.

    ```nginx
    server {
        listen 80;
        server_name app.yourdomain.com;

        # Path to your frontend files
        root /var/www/pointguard;
        index index.html;

        # Serve static files directly
        location / {
            # This is the key for Single Page Applications (SPAs).
            # It tries to find a file with the given URI, then a directory,
            # and if not found, falls back to serving /index.html.
            try_files $uri $uri/ /index.html;
        }

        # Reverse proxy for API requests
        location /api/ { # Note the trailing slash
            # Forward requests to the NestJS backend
            proxy_pass http://localhost:3001/; # Note the trailing slash
            
            # Standard proxy headers
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # Headers to pass client info to the backend
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # --- Security Headers ---
        # It's best practice to set security headers here instead of in HTML meta tags.
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://esm.sh; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' ws:;" always;
    }
    ```

4.  **Enable the Site and Restart Nginx:**
    Create a symbolic link to enable the config, test it for errors, and restart Nginx.
    ```bash
    sudo ln -s /etc/nginx/sites-available/pointguard /etc/nginx/sites-enabled/
    sudo nginx -t  # Test for syntax errors
    sudo systemctl restart nginx
    ```

At this point, you should be able to visit `http://app.yourdomain.com` and see your application.

---

### Step 4: Secure with HTTPS using Certbot

Finally, let's enable SSL to secure your application.

1.  **Install Certbot:**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    ```

2.  **Obtain and Install SSL Certificate:**
    Run Certbot. It will read your Nginx configuration, ask which domain you want to secure, and automatically update your config file to handle HTTPS.
    ```bash
    sudo certbot --nginx -d app.yourdomain.com
    ```
    -   Follow the prompts. It's recommended to choose the option to **redirect HTTP traffic to HTTPS**.

3.  **Verify Auto-Renewal:**
    Certbot sets up a cron job to automatically renew your certificates. You can test it with:
    ```bash
    sudo certbot renew --dry-run
    ```

You can now visit `https://app.yourdomain.com` and see your fully deployed and secured application.

---

### Step 5: Maintenance and Updates

Here’s how to manage your application after deployment.

1.  **Viewing Logs:**
    To see logs from your backend application (e.g., for debugging):
    ```bash
    pm2 logs pointguard-api
    ```

2.  **Updating the Application:**
    When you have new code changes to deploy:
    
    -   **Update Backend:**
        ```bash
        cd <your_project_directory>/server
        git pull
        npm install # In case dependencies changed
        npm run build
        pm2 restart pointguard-api
        ```
    
    -   **Update Frontend:**
        From your **local machine**:
        ```bash
        rsync -avz --delete --exclude 'server/' --exclude '.git/' ./ <your_vps_user>@<your_vps_ip>:/var/www/pointguard/
        ```
        Then, clear your browser cache to ensure you see the latest version.
```