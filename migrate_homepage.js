const fs = require('fs');
const path = require('path');

const legacyHtmlPath = path.join(__dirname, 'legacy_ui', 'index.html');
const landingPageOutPath = path.join(__dirname, 'frontend', 'src', 'pages', 'LandingPage.jsx');

let html = fs.readFileSync(legacyHtmlPath, 'utf8');

// Helper to convert HTML to JSX loosely
function toJSX(str) {
    return str
        .replace(/class=/g, 'className=')
        .replace(/onclick=/g, 'onClick=')
        .replace(/tabindex=/g, 'tabIndex=')
        .replace(/for=/g, 'htmlFor=')
        .replace(/<!--(.*?)-->/gs, '{/* $1 */}')
        .replace(/<img([^>]*[^/])>/g, '<img$1 />')
        .replace(/<input([^>]*[^/])>/g, '<input$1 />')
        .replace(/<br>/g, '<br />')
        .replace(/style="([^"]*)"/g, (match, p1) => {
            // Very simple style to object converter for known inline styles in this file
            let styles = p1.split(';').filter(s => s.trim() !== '').map(s => {
                let [key, val] = s.split(':');
                if (!key || !val) return null;
                key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                return `${key}: '${val.trim()}'`;
            }).filter(Boolean).join(', ');
            return `style={{${styles}}}`;
        })
        .replace(/style='([^']*)'/g, (match, p1) => {
            // Do similar for single quotes if any
            return `style={{}}`;
        });
}

// Extract Header
let headerMatch = html.match(/(<!-- GOV TOPBAR -->.*?)<!-- COMMAND BAR/s);
let headerStr = headerMatch ? headerMatch[1] : '';

// Gallery 
let galleryMatch = html.match(/(<!-- REAL SCHOOL GALLERY -->.*?)</section >/s);
let galleryStr = galleryMatch ? galleryMatch[1] + '</section>' : '';

// Features
let featuresMatch = html.match(/(<!-- PLATFORM FEATURES -->.*?)</section >/s);
let featuresStr = featuresMatch ? featuresMatch[1] + '</section>' : '';

// Notices
let noticesMatch = html.match(/(<!-- NOTICE BOARD & EVENTS -->.*?)</section >/s);
let noticesStr = noticesMatch ? noticesMatch[1] + '</section>' : '';

// Footer
let footerMatch = html.match(/(<!-- FOOTER -->.*?)<script/s);
let footerStr = footerMatch ? footerMatch[1] : '';

// Clean up inline JS like document.getElementById(...)
headerStr = headerStr.replace(/onClick="document.getElementById\('[^]*?\)"/g, 'onClick={() => navigate("/login")}');

galleryStr = galleryStr.replace(/<img(.*?)>/g, '<img$1 />').replace(/\/\/\s*>/g, '/>');
featuresStr = featuresStr.replace(/<img(.*?)>/g, '<img$1 />').replace(/\/\/\s*>/g, '/>');
noticesStr = noticesStr.replace(/<img(.*?)>/g, '<img$1 />').replace(/\/\/\s*>/g, '/>');
noticesStr = noticesStr.replace(/<input(.*?)>/g, '<input$1 />').replace(/\/\/\s*>/g, '/>');
headerStr = headerStr.replace(/<img(.*?)>/g, '<img$1 />').replace(/\/\/\s*>/g, '/>');
footerStr = footerStr.replace(/<img(.*?)>/g, '<img$1 />').replace(/\/\/\s*>/g, '/>');


let landingPageJSX = fs.readFileSync(landingPageOutPath, 'utf8');

// We need to inject header before <main, inject sections before </main>, and footer after </main>
let mainParts = landingPageJSX.split(/<main id="main-content" tabIndex="-1">/);
let bottomParts = mainParts[1].split(/<\/main>/);

let finalComponent = `
${mainParts[0]}
            ${toJSX(headerStr)}
            <main id="main-content" tabIndex="-1">
${bottomParts[0]}
                ${toJSX(galleryStr)}
                ${toJSX(featuresStr)}
                ${toJSX(noticesStr)}
            </main>
            ${toJSX(footerStr)}
${bottomParts[1]}
`;

// Also fix the hrefs or buttons with raw strings
finalComponent = finalComponent.replace(/href="parent_portal.html"/g, 'onClick={() => navigate("/parent")}');

fs.writeFileSync(landingPageOutPath, finalComponent);
console.log('Successfully injected sections into LandingPage.jsx');
