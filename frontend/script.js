// Medicine Tracker - frontend script.
//
// The backend API runs at BASE_URL (default http://localhost:8000).
//
// TASKS
// -----
// Core task 1: implement fetchMedicines() and renderMedicines(data) so the page
//   fetches /medicines and displays it WITHOUT crashing on missing or invalid
//   data. The data contains records with a null name, an empty-string name, a
//   missing name, a null price, a missing price, and a non-numeric price. Decide
//   how to display each case (e.g. show "Unknown" or flag it) without throwing.
//
// Core task 2: implement fetchUnreliable() so it calls /medicines/unreliable,
//   shows a useful message in the #error area when it fails, and retries
//   sensibly. Do NOT hammer the server: use a small number of retries with a
//   short delay between them, and give up cleanly after a few tries. The
//   endpoint fails about 30% of the time.
//
// Stretch: add an average-price endpoint in backend/main.py and call it here.

const BASE_URL = "http://localhost:8000";

// DOM elements (already present in index.html - no layout work needed).
const resultsEl = document.getElementById("results");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");

/**
 * TODO (Core task 1): fetch the list of medicines from /medicines.
 * Return the medicines array. Surface network/HTTP errors so the caller can show them.
 */
async function fetchMedicines() {
    const response = await fetch(`${BASE_URL}/medicines`);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return data.medicines;
}

/**
 * TODO (Core task 1): render the medicines into #results without crashing on
 * missing or invalid fields. Handle: null name, empty-string name, missing name,
 * null price, missing price, non-numeric price. Show something sensible for each.
 * TODO: clear the #error area on success.
 */


/**
 * TODO (Core task 2): fetch from /medicines/unreliable with sensible retries.
 * Retry a few times with a short delay between attempts (do not hammer the
 * server). When you give up, show a useful message in #error. On success,
 * render the data and clear #error. Show/hide the #loading area while working.
 */
async function fetchUnreliable() {
    const maxAttempts = 3;
    const retryDelay = 1000;

    loadingEl.hidden = false;
    errorEl.hidden = true;
    errorEl.textContent = "";

    try {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await fetch(
                    `${BASE_URL}/medicines/unreliable`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();

                renderMedicines(data.medicines);
                return;

            } catch (error) {
                errorEl.hidden = false;

                if (attempt === maxAttempts) {
                    errorEl.textContent =
                        "Unable to load medicines after 3 attempts. Please try again later.";
                    return;
                }

                errorEl.textContent =
                    `Attempt ${attempt} failed. Retrying in 1 second...`;

                await new Promise(resolve =>
                    setTimeout(resolve, retryDelay)
                );
            }
        }
    } finally {
        loadingEl.hidden = true;
    }
}

// ---- Button wiring (already works - no need to change) ----
function renderMedicines(data) {
    resultsEl.replaceChildren();

    const table = document.createElement("table");

    table.innerHTML = `
        <thead>
            <tr>
                <th>Medicine Name</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    for (const medicine of data) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const priceCell = document.createElement("td");

        const validName =
            typeof medicine.name === "string" &&
            medicine.name.trim() !== "";

        const validPrice =
            typeof medicine.price === "number" &&
            Number.isFinite(medicine.price);

        if (validName) {
            nameCell.textContent = medicine.name.trim();
        } else {
            nameCell.textContent = "Unknown medicine";
            nameCell.classList.add("invalid");
        }

        if (validPrice) {
            priceCell.textContent = medicine.price.toFixed(2);
        } else {
            priceCell.textContent = "Price unavailable";
            priceCell.classList.add("invalid");
        }

        row.append(nameCell, priceCell);
        tbody.appendChild(row);
    }

    resultsEl.appendChild(table);

    errorEl.textContent = "";
    errorEl.hidden = true;
}

document.getElementById("load-medicines").addEventListener("click", async () => {
    if (!loadingEl.hidden) return;

    loadingEl.hidden = false;
    errorEl.hidden = true;
    errorEl.textContent = "";

    try {
        const medicines = await fetchMedicines();
        renderMedicines(medicines);
    } catch (error) {
        errorEl.textContent = `Unable to load medicines: ${error.message}`;
        errorEl.hidden = false;
    } finally {
        loadingEl.hidden = true;
    }
});

document.getElementById("load-unreliable").addEventListener("click", async () => {
    if (!loadingEl.hidden) return;

    await fetchUnreliable();
});