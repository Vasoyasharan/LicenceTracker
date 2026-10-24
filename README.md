# LicenseTracker

LicenseTracker is a responsive, client-side web app for tracking software licenses, product keys, renewal dates, vendors, and renewal alerts. It is designed for IT admins, procurement teams, and small businesses that want a lightweight way to manage license inventory without a backend or database.

Built with plain HTML, CSS, and JavaScript, the app runs entirely in the browser and stores data locally in `localStorage`.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Features

- Track software licenses by vendor, product name, type, start date, expiry date, and quantity
- Support both lifetime and time-based licenses
- Auto-calculate expiry from a chosen duration or allow manual expiry dates
- Create and manage custom license types and vendor records
- Assign licenses to users or departments
- Save product keys, notes, and file attachments via URL
- See instant urgency states:
  - Green: active
  - Yellow: expiring soon
  - Orange: critical window
  - Red: expired or within the final warning period
- Focus on expiring licenses with a notifications panel and live stats summary
- Browse licenses in grid view or calendar view
- Search, filter, and sort the license list by status, vendor, name, or date
- Export data as JSON or CSV, and import data back in bulk
- Print a clean report for audits, procurement reviews, or paper records
- Toggle between light and dark themes
- Configure multiple Formspree alert endpoints and enable/disable them individually
- Renew a license directly from the UI by extending the current expiry date
- Keyboard shortcuts for quick actions (search, add license, close dialogs)

## Project structure

```text
.
├── index.html       # App layout and modal structure
├── style.css        # UI styling, responsive layout, themes, and cards
├── script.js        # License logic, rendering, storage, import/export, notifications, alerts
└── README.md        # Project documentation
```

## How it works

The application stores all data in the browser's `localStorage` under a single key named `licenseTracker`. This means:

- no server is required
- no database setup is required
- the app works well for local personal use and GitHub Pages hosting
- browser cache clearing may remove saved data, so backups are recommended

The app reads saved licenses, vendors, custom types, and Formspree endpoint settings when loading and writes back automatically after changes.

## Quick start

### Run locally

1. Clone this repository.
2. Open `index.html` in a browser.
3. Start adding licenses.

### Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. Open the repository in GitHub.
3. Go to Settings > Pages.
4. Set the source to your default branch and the root folder.
5. Save the settings.
6. GitHub will give you a URL similar to:
   `https://<your-username>.github.io/<repository-name>/`

## Data management

### Export and import

From the Data menu, you can:

- Export JSON backup files
- Import JSON backup files
- Export CSV files for spreadsheet use
- Import CSV files in bulk
- Print a report

This makes the app useful for backup, migration, or team handoff workflows.

### CSV import format

The CSV importer expects common column names such as:

- Vendor
- License Name
- Type
- Duration
- Qty
- Raise Date
- Start Date
- Expire Date
- License Key
- Assigned To
- Notes
- File URL

The importer is flexible and matches common header variations, but vendor and license name columns are required.

## Email alerts setup

The app includes support for Formspree-based alerts. Alerts can be configured to send reminder emails when a license is close to expiry.

### Setup

1. Create a Formspree account and a form.
2. Copy the form endpoint URL, for example:
   `https://formspree.io/f/xxxxxx`
3. Open the app and click the Alerts button.
4. Add the recipient name and endpoint URL.
5. Enable the endpoint if needed.

The app is built to trigger reminder checks while the page is open in the browser. Since it is fully client-side, it does not run background jobs when the browser is closed.

## Keyboard shortcuts

- `/` — focus the search box
- `N` — open the add-license modal
- `Esc` — close open dialogs and panels

## Customization

You can customize the app by:

- adding new license categories
- adding vendor records
- editing default expiry and duration logic in `script.js`
- updating colors, spacing, and layout in `style.css`
- changing the app title or branding in `index.html`

## Notes

- This project intentionally avoids a backend to keep setup simple and hosting cheap.
- The design is optimized for personal or small-team tracking rather than multi-user collaboration.
- Because data is stored in the browser, regular JSON exports are recommended as a safety measure.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
