export function timeline() {
    const listEL = document.querySelector("timeline-list");
    const titleEL = document.querySelector("timeline-title");
    const dateEL = document.querySelector("timeline-date");
    const descriptionEL = document.querySelector("timeline-description");

    if(!listEL || !titleEL || !dateEL || !descriptionEL) return;

    fetch("../data/timeline.json")
        .then((response) => {
            if(!response.ok) {
                throw new Error("Failed to Load timeline.json");
            }
            return response.json();
        })
        .then((timelineData) => {
            if(!Array.isArray(timelineData)) {
                throw new Error("timeline.json has no arrays");
            }
            timelineData.forEach((item, index) => {
                const li = document.createElement("li");
                li.classList.add("timeline-item");
                if (index === 0) li.classList.add("active");

                li.textContent = item.label || item.year || item.date || `Item ${index + 1}`;

                li.dataset.title = item.title || "";
                li.dataset.date = item.date || "";
                li.dataset.description = item.description || "";

                li.addEventListener("click", () => setActiveItem(li));

                listEL.appendChild(li);
            });

            const firstItem = listEL.querySelector(".timeline-item");
            if (firstItem) {
                setActiveItem(firstItem);
            }
        })
        .catch((error) => {
            console.error("Error loading timeline: ", error);
            titleEL.textContent = "Timeline unavailable";
            descriptionEL.textContent = "There was a problem loading the timeline data.";
        });

    function setActiveItem(item) {
        const allItems = document.querySelectorAll(".timeline-item");
        allItems.forEach((i) => i.classList.remove("active"));

        item.classList.add("active");

        titleEL.textContent = item.dataset.title || ""; 
        dateEL.textContent = item.dataset.date || "";
        descriptionEL.textContent = item.dataset.description || "";
    }
}