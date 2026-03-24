let currentComplaintId = "";
let latitude = "";
let longitude = "";

const API = "http://localhost:3000";

/* =========================
   GET USER LOCATION
========================= */

const locationText = document.getElementById("locationText");

if (locationText && navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(function (position) {

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        locationText.innerText =
            "Location: " + latitude + ", " + longitude;

    }, function () {

        locationText.innerText = "Location access denied";

    });

}

/* =========================
   SHOW OTHER CATEGORY INPUT
========================= */

function checkOther() {

    const category = document.getElementById("category").value;
    const otherBox = document.getElementById("otherCategory");

    if (category === "Other") {
        otherBox.style.display = "block";
    } else {
        otherBox.style.display = "none";
        otherBox.value = "";
    }

}

/* =========================
   REPORT COMPLAINT
========================= */

const form = document.getElementById("complaintForm");

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        /* GET CATEGORY FROM SELECT */
        let category = document.getElementById("category").value;

        /* IF USER SELECTED OTHER */
        if (category === "Other") {
            category = document.getElementById("otherCategory").value.trim();
        }

        const description = document.getElementById("description").value;

        /* VALIDATION */
        if (!category) {
            alert("Please enter the issue type");
            return;
        }

        try {

            const imageFile = document.getElementById("image").files[0];

            const formData = new FormData();
            formData.append("category", category);
            formData.append("description", description);
            formData.append("location", latitude + "," + longitude);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await fetch(API + "/report", {
                method: "POST",
                body: formData
            });

            const data = await res.json();


            /* SAVE COMPLAINT TO LOCAL STORAGE */

            let complaints = JSON.parse(localStorage.getItem("myComplaints")) || [];

            complaints.push({
                id: data.id,
                category: category
            });

            localStorage.setItem("myComplaints", JSON.stringify(complaints));

            /* REDIRECT TO TRACK PAGE */

            window.location.href = "track.html";

        } catch (error) {

            alert("Error submitting complaint");

        }

    });

}


/* =========================
   SHOW USER COMPLAINT LIST
========================= */

function loadMyComplaints() {

    const container = document.getElementById("myComplaints");

    if (!container) return;

    const complaints = JSON.parse(localStorage.getItem("myComplaints")) || [];

    let html = `
<h2>Your Complaints</h2>

<table class="complaint-table">
<tr>
<th>Category</th>
<th>Complaint ID</th>
<th>Action</th>
</tr>
`;

    complaints.forEach(c => {

        html += `
<tr>
<td>${c.category}</td>

<td class="cid">${c.id}</td>

<td>
<button class="track-btn" onclick="fillComplaint('${c.id}')">
Track
</button>
</td>
</tr>
`;

    });

    html += `</table>`;

    container.innerHTML = html;

}


/* =========================
   AUTO FILL COMPLAINT ID
========================= */

function fillComplaint(id) {

    document.getElementById("complaintId").value = id;

    trackComplaint();

}


/* =========================
   TRACK COMPLAINT
========================= */

async function trackComplaint() {

    const id = document.getElementById("complaintId").value;
    const box = document.getElementById("statusBox");

    if (!id) {
        alert("Enter Complaint ID");
        return;
    }

    currentComplaintId = id;

    box.innerHTML = "Checking complaint status...";

    try {

        const res = await fetch(API + "/complaint/" + id);

        if (!res.ok) {
            throw new Error("Complaint not found");
        }

        const data = await res.json();

        box.innerHTML = `
<h2>Status: ${data.status}</h2>
<p><b>Category:</b> ${data.category}</p>
<p><b>Complaint ID:</b> ${data._id}</p>
<p><b>Description:</b> ${data.description}</p>
`;

    } catch (error) {

        box.innerHTML = `
<p style="color:red;">Complaint not found. Please check the ID.</p>
`;

    }

}


/* =========================
   ADMIN PANEL
========================= */

async function loadComplaints() {

    const res = await fetch(API + "/complaints");
    const data = await res.json();

    const list = document.getElementById("complaintList");

    if (!list) return;

    list.innerHTML = "";

    data.forEach(c => {

        const row = document.createElement("tr");

        row.innerHTML = `
<td>${c.category}</td>
<td>${c.description}</td>
<td>${c.status}</td>
<td>
<button onclick="resolveComplaint('${c._id}')">
Resolve
</button>
</td>
`;

        list.appendChild(row);

    });

}


/* =========================
   RESOLVE COMPLAINT
========================= */

async function resolveComplaint(id) {

    await fetch(API + "/update/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            status: "Resolved"
        })

    });

    alert("Complaint Resolved");

    loadComplaints();

}
/* =========================
   AUTO REFRESH TRACK STATUS
========================= */

setInterval(async () => {

    if (!currentComplaintId) return;

    try {

        const res = await fetch(API + "/complaint/" + currentComplaintId);
        const data = await res.json();

        const box = document.getElementById("statusBox");

        if (box) {

            box.innerHTML = `
<h2>Status: ${data.status}</h2>
<p><b>Complaint ID:</b> ${data._id}</p>
<p><b>Category:</b> ${data.category}</p>
<p><b>Description:</b> ${data.description}</p>
`;

        }

    } catch (err) {
        console.log("Auto refresh error");
    }

}, 5000);