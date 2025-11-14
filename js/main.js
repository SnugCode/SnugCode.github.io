import { about } from "./about.js";
import { projects } from "./projects.js";
import { stack } from "./stack.js";

const siteTitle = "SnugCode Portfolio";
const currentYear = new Date().getFullYear();

function init() {
    console.log("Welcome to " + siteTitle + " - " + currentYear);
    about();
    projects();
    stack();
}

document.addEventListener("DOMContentLoaded", init);