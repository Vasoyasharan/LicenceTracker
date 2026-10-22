# 🔑 LicenseTracker

A modern, fully responsive, client-side web application to track software licenses, keys, and expiry dates. Built with pure HTML, CSS, and Vanilla JavaScript — **no backend required**. Perfect for hosting on GitHub Pages.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## ✨ Features

- **Multi-Category Tracking:** Pre-defined tabs for AutoCAD, Antivirus, Office Apps, Server OS, etc. You can also add your own custom categories.
- **Lifetime & Timed Licenses:** Supports both lifetime licenses (no expiry) and timed licenses.
- **Auto-Calculate Expiry:** Select a duration (e.g., 12 months) and the app automatically calculates the expiry date based on the start date. Manual override is also available.
- **Bulk Quantity Tracking:** Record how many seats/keys you bought at once (e.g., `× 130`).
- **Key Assignment:** Store the actual license key/serial and assign it to a specific person (e.g., `Mr. Thavathason`).
- **Attachments:** Add a URL link (Google Drive, OneDrive, etc.) to the invoice or license file.
- **Visual Urgency Tiers:** Cards get a colored left border based on urgency:
  - 🟢 Active (> 60 days)
  - 🟡 Watch (21–60 days)
  - 🟠 Alert (6–20 days)
  - 🔴 Critical (≤ 5 days or Expired)
- **Smart Dashboard & Notifications:** Animated stats strip (Total, Expiring, Expired, Lifetime) and a notification bell showing upcoming expiries.
- **Search, Filter & Sort:** Instantly search across all fields, filter by status, and sort by expiry date or vendor.
- **Data Portability:** 
  - Export/Import JSON (for backups and moving between devices).
  - Export to CSV (opens in Excel).
  - Bulk Import from CSV.
- **Print Report:** One-click print mode designed for paper/PDF reports.
- **Dark/Light Mode:** Seamless theme switching with local storage memory.
- **Fully Responsive:** Looks great on desktops, tablets, and mobile phones.

---

## 🚀 How to Deploy (GitHub Pages)

Since this is a pure static site, it takes less than 2 minutes to go live:

1. Create a new repository on GitHub (e.g., `license-tracker`).
2. Upload the 3 files to the root of the repository:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md` (this file)
3. Go to your repository **Settings** > **Pages**.
4. Under **Build and deployment**, set the source to **Deploy from a branch**.
5. Select the `main` (or `master`) branch and the `/root` folder, then click **Save**.
6. Wait a minute, and your site will be live at `https://<your-username>.github.io/license-tracker/`.

---

## 📧 Email Alerts (Formspree)

The app includes built-in logic to send email alerts via **Formspree** exactly **20, 15, 10, and 5 days** before a license expires.

### How to set it up:
1. Go to [Formspree.io](https://formspree.io/) and create a free account.
2. Create a new form. You will get an Endpoint URL (e.g., `https://formspree.io/f/xxxxxx`).
3. Open your deployed LicenseTracker.
4. Click the **"Formspree"** button in the top right header.
5. Paste your Formspree URL and click **Save Settings**.

### ⚠️ Important Note on Automation
Because this app is purely client-side (no backend), the email alert triggers **only when the webpage is open** in a browser tab. If the site is closed, no emails will be sent. 

*(We are working on a Batch 3 update to add a GitHub Actions or Google Apps Script integration for 100% background automation!)*

---

## 💾 Data Storage

All data is stored securely and locally in your browser's **`localStorage`**. 
- **No data is sent to any server** (except the Formspree payload when an alert fires).
- Because it's stored in your browser, clearing your cache/cookies will delete your data. 
- **Highly Recommended:** Use the **Data > Export JSON** button every week to keep a safe backup on your computer.

---

## 🗺️ Roadmap / Upcoming Features

- [x] Batch 1: JSON/CSV Export & Import, Search, Filters, Sorting, Urgency Tiers, Notification Bell, File URLs.
- [ ] **Batch 2 (Next):** Calendar View, Keyboard Shortcuts, Analytics Dashboard (Chart.js), Cost Tracking, Renew/Archive Workflow.
- [ ] **Batch 3:** Multi-User Sync (JSONBin), PWA support (installable app, offline mode), fully automated background emails.

---

## 🛠️ Built With

- **HTML5** & **Vanilla JavaScript (ES6)**
- **CSS3** (Custom Properties, Flexbox, CSS Grid, Backdrop-filter)
- **FontAwesome** (Icons)
- **Google Fonts** (Inter & JetBrains Mono)

---

## 📝 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT). Feel free to fork it, modify it, and use it for your company!