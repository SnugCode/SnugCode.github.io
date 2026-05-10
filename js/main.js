import { about } from "./about.js";
import { projects } from "./projects.js";
import { stack } from "./stack.js";
import { education } from "./education.js";
import { initTheme } from "./theme.js";
import { initFooterTyping } from "./footerTyping.js";
import { initSectionMarker } from "./sectionMarker.js";

const siteTitle = "SnugCode Portfolio";
const currentYear = new Date().getFullYear();

function init() {
    console.log("Welcome to " + siteTitle + " - " + currentYear);
    initTheme();
    about();
    projects();
    stack(); 
    education();
    initFooterTyping();
    initSectionMarker();
}

document.addEventListener("DOMContentLoaded", init);
