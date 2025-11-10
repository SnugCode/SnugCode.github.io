const siteTitle = "SnugCode Portfolio";
const currentYear = new Date().getFullYear();

function inti() {
    console.log('Welcome to ' + siteTitle + ' - ' + currentYear);
    
    setFooterYear();
}

function setFooterYear() {
    const yearSpan = $("#year");
    if (yearSpan.length) {
        yearSpan.text(currentYear);
    }
}