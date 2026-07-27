const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf-8');

const oldCss = `.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loader-logo {
  width: 80px;
  animation: pulse-glow 2s infinite alternate;
}

@keyframes pulse-glow {
  0% { transform: scale(0.95); filter: drop-shadow(0 0 10px rgba(111, 76, 255, 0.4)); }
  100% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(111, 76, 255, 0.8)); }
}

.global-spinner, .spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-magenta);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.global-spinner {
  width: 40px;
  height: 40px;
  border-top-color: var(--accent-blue);
}`;

const newCss = `.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circular-dot-loader {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-spin {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: spin 1.5s linear infinite;
}

.loader-center-logo {
  width: 60px;
  z-index: 10;
  animation: pulse-glow 2s infinite alternate;
}

.loader-bouncing-dots {
  display: flex;
  gap: 8px;
  margin-top: 1.5rem;
}
.loader-bouncing-dots .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-purple { background: #b854ff; box-shadow: 0 0 8px #b854ff; animation: bounce 1s infinite alternate; }
.dot-blue { background: #5475ff; box-shadow: 0 0 8px #5475ff; animation: bounce 1s infinite alternate 0.3s; }
.dot-cyan { background: #00f2fe; box-shadow: 0 0 8px #00f2fe; animation: bounce 1s infinite alternate 0.6s; }

@keyframes bounce {
  0% { transform: translateY(0); opacity: 0.5; }
  100% { transform: translateY(-8px); opacity: 1; }
}

.loader-title {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0;
  color: #fff;
  letter-spacing: 1px;
}

.loader-text {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  font-size: 1rem;
  margin-top: 0.5rem;
}

@keyframes pulse-glow {
  0% { transform: scale(0.95); filter: drop-shadow(0 0 10px rgba(111, 76, 255, 0.4)); opacity: 0.7;}
  100% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(111, 76, 255, 0.8)); opacity: 1;}
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-magenta);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}`;

css = css.replace(oldCss, newCss);
fs.writeFileSync('public/styles.css', css);
