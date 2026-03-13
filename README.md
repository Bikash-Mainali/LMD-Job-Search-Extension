# BM Job Search Extension

## Description
BM-JobSearch is a Chrome extension for job seekers who are tired of manually scanning through dozens of postings. Define a personal list of keywords — skills, roles, work arrangements, seniority levels — and instantly highlight every match on any job listing page, so the signal jumps out without reading every line.
The extension also solves a specific pain point for candidates who require visa sponsorship: it automatically scans the page for known positive and negative sponsorship language, surfacing phrases like "visa sponsorship available" or "must be authorized to work without sponsorship" the moment you click Highlight. No more reaching the end of a detailed job description only to find a disqualifying line buried in the fine print.
Keywords and sponsorship phrase lists are saved locally in the browser and persist across sessions. Works on any job board or company careers page — no accounts, no external servers, no tracking.

[![](./images/job-search-ext1.png)](./images/job-search-ext1.png) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [![](./images/job-search-ext2.png)](./images/job-search-ext2.png)



## Features
1. Keyword Highlighting — Add any keywords and highlight all matches on the active tab instantly
2. Sponsorship Detection — Scans the page for visa sponsorship signals and labels them 🟢 positive or 🔴 negative
3. Built-in Phrase Library — Ships with 100+ common US employer sponsorship phrases covering H1B, OPT/CPT, green card, and citizenship requirements
4. Custom Phrase Lists — Add and remove your own positive and negative sponsorship phrases at any time
5. Persistent Storage — Keywords and phrase lists are saved locally and survive browser restarts
6. Match Counter — Shows exactly how many keyword matches were found on the current page
7. One-Click Clear — Strips all highlights from the page instantly
8. Works Everywhere — Compatible with any job board or careers page (LinkedIn, Indeed, Greenhouse, Lever, Workday, and more)

## Installation Instructions

### Development Setup
1. Clone the repository:  
   `git clone https://github.com/Bikash-Mainali/BM-Job-Search-Extension.git`
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right.
4. Click on "Load unpacked" and select the downloaded extension folder.
5. The extension will be added to your Chrome browser.

## Usage Guide
1. Click on the extension icon in your Chrome toolbar.
2. Use the search bar to enter job titles or keywords.
3. Apply filters based on your preferences.
4. Browse through the listings and click on any job to view more details or application options.

## File Structure
- `manifest.json` - Metadata for the extension.
- `background.js` - Script for background processes.
- `popup.html` - HTML for the popup interface.
- `content.js` - Script for manipulating content on job sites.
- `styles.css` - Styles for the extension interface.

## Troubleshooting Tips
- If the extension isn't working, ensure it's enabled in the `chrome://extensions/` page.
- Check for any updates to the extension.
- If you encounter specific errors, consult the issue tracker on GitHub for solutions or open a new issue for assistance.
