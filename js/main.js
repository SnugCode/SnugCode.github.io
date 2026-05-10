import { about } from "./about.js";
import { projects } from "./projects.js";
import { stack } from "./stack.js";
import { education } from "./education.js";
import { initTheme } from "./theme.js";

const siteTitle = "SnugCode Portfolio";
const currentYear = new Date().getFullYear();

function init() {
    console.log("Welcome to " + siteTitle + " - " + currentYear);
    initTheme();
    about();
    projects();
    stack(); 
    education();
}

document.addEventListener("DOMContentLoaded", init);
