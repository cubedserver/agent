const { shell } = require("electron");
const Alpine = require("./static/js/alpine");

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.external-link');

    [].forEach.call(links, link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            shell.openExternal(e.target.href);
        });
    });
})