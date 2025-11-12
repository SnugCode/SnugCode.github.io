import { about } from "./about.js";
import { projects } from "./projects.js";

const siteTitle = "SnugCode Portfolio";
const currentYear = new Date().getFullYear();

function init() {
    console.log("Welcome to " + siteTitle + " - " + currentYear);
    about();
    projects();
}

document.addEventListener("DOMContentLoaded", init);