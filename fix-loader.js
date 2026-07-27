const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf-8');

const loaderHtml = `<!-- GLOBAL LOADER -->
  <div id="globalLoader" class="global-loader">
    <div class="loader-content">
      <div class="circular-dot-loader">
        <svg viewBox="0 0 100 100" class="ring-spin">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#b854ff" stop-opacity="1" />
              <stop offset="60%" stop-color="#00f2fe" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#00f2fe" stop-opacity="0.05" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" fill="none" stroke="url(#ringGrad)" stroke-width="6" stroke-dasharray="0 13.19" stroke-linecap="round" />
        </svg>
        <img src="logo.png" alt="ScappyV Logo" class="loader-center-logo" />
      </div>
      <h2 class="loader-title">Scappy<span style="color: #b854ff;">V</span></h2>
      <p class="loader-text">Almost there...</p>
      
      <div class="loader-bouncing-dots">
        <div class="dot dot-purple"></div>
        <div class="dot dot-blue"></div>
        <div class="dot dot-cyan"></div>
      </div>
    </div>
  </div>`;

// Replace old loader
html = html.replace(/<!-- GLOBAL LOADER -->[\s\S]*?<\/div>\s*<\/div>/, loaderHtml);

fs.writeFileSync('public/index.html', html);
