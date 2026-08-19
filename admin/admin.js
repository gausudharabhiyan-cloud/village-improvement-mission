const $ = (id) => document.getElementById(id);

let data = [];

// Google Apps Script API
const API_URL =
    "https://script.google.com/macros/s/AKfycbwBBIMpl5n2Dmq91D2fvc1-skWBjgQOCduWptQbjjvqr9k-_krgHOgCpX06Vy1G8qsn8A/exec";


// =========================
// LOGIN
// =========================

function login() {

    const adminId = $("adminId").value.trim();
    const password = $("password").value;

    if (adminId === ADMIN_ID && password === ADMIN_PASSWORD) {

        sessionStorage.setItem("vimAdmin", "1");

        $("login").hidden = true;
        $("dashboard").hidden = false;

        load();

    } else {

        $("loginMsg").textContent =
            "❌ Admin ID या Password गलत है।";
    }
}


// =========================
// LOGIN BUTTON
// =========================

$("loginBtn").addEventListener("click", login);

$("password").addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        login();
    }

});


// =========================
// SHOW / HIDE PASSWORD
// =========================

$("eye").addEventListener("click", function () {

    const password = $("password");

    password.type =
        password.type === "password"
            ? "text"
            : "password";

});


// =========================
// LOGOUT
// =========================

$("logout").addEventListener("click", function () {

    sessionStorage.removeItem("vimAdmin");

    location.reload();

});


// =========================
// LOAD COMPLAINTS
// =========================

async function load() {

    try {

        $("rows").innerHTML = `
            <tr>
                <td colspan="7">
                    ⏳ Complaints loading...
                </td>
            </tr>
        `;

        const response = await fetch(
            API_URL + "?action=list&t=" + Date.now(),
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Server Error: " + response.status
            );
        }

        const result = await response.json();

        console.log("API RESULT:", result);

        if (result.success !== true) {

            throw new Error(
                result.error || "API Error"
            );
        }

        data = Array.isArray(result.rows)
            ? result.rows
            : [];

        render();

    } catch (error) {

        console.error("Complaint Load Error:", error);

        $("rows").innerHTML = `
            <tr>
                <td colspan="7">
                    ⚠️ Complaints data load नहीं हो पाया।<br>
                    <small>${error.message}</small>
                </td>
            </tr>
        `;
    }
}


// =========================
// RENDER
// =========================

function render() {

    const search =
        $("search").value.toLowerCase();

    const filter =
        $("filter").value;

    const filtered =
        data.filter(function (item) {

            const matchesFilter =
                !filter ||
                item.status === filter;

            const matchesSearch =
                JSON.stringify(item)
                    .toLowerCase()
                    .includes(search);

            return (
                matchesFilter &&
                matchesSearch
            );
        });


    // TOTAL

    $("total").textContent =
        data.length;


    // RECEIVED

    $("received").textContent =
        data.filter(
            x => x.status === "Received"
        ).length;


    // IN PROCESS

    $("progress").textContent =
        data.filter(
            x =>
                [
                    "Verified",
                    "Forwarded",
                    "Under Process"
                ].includes(x.status)
        ).length;


    // RESOLVED

    $("resolved").textContent =
        data.filter(
            x => x.status === "Resolved"
        ).length;


    // TABLE

    $("rows").innerHTML =

        filtered.map(function (x) {

            return `
                <tr>

                    <td>
                        <b>${x.id || ""}</b>
                    </td>

                    <td>
                        ${x.name || ""}
                    </td>

                    <td>
                        ${x.district || ""}
                    </td>

                    <td>
                        ${x.village || ""}
                    </td>

                    <td>
                        ${x.category || ""}
                    </td>

                    <td>
                        ${x.status || ""}
                    </td>

                    <td>

                        <button
                            onclick='edit(${JSON.stringify(x)})'>
                            Edit
                        </button>

                    </td>

                </tr>
            `;

        }).join("")

        ||

        `
            <tr>
                <td colspan="7">
                    कोई complaint नहीं मिली।
                </td>
            </tr>
        `;
}


// =========================
// EDIT COMPLAINT
// =========================

function edit(x) {

    $("editor").hidden = false;

    $("editId").value =
        x.id || "";

    $("editStatus").value =
        x.status || "Received";

    $("editVerification").value =
        x.verification || "Pending";

    $("editDept").value =
        x.dept || "";

    $("editRef").value =
        x.ref || "";

    $("editFollow").value =
        x.follow || "";

    $("editAction").value =
        x.action || "";

    $("editRemarks").value =
        x.remarks || "";


    window.scrollTo({

        top: document.body.scrollHeight,

        behavior: "smooth"

    });

}


// =========================
// CANCEL EDIT
// =========================

$("cancel").addEventListener(
    "click",
    function () {

        $("editor").hidden = true;

    }
);


// =========================
// SAVE UPDATE
// =========================

$("save").addEventListener(
    "click",
    async function () {

        const params = {

            action: "update",

            id:
                $("editId").value,

            status:
                $("editStatus").value,

            verification:
                $("editVerification").value,

            dept:
                $("editDept").value,

            ref:
                $("editRef").value,

            follow:
                $("editFollow").value,

            actionTaken:
                $("editAction").value,

            remarks:
                $("editRemarks").value
        };


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        body:
                            new URLSearchParams(
                                params
                            )
                    }
                );


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.error ||
                    "Update failed"
                );

            }


            $("editMsg").textContent =
                "✅ Update successfully saved";


            $("editor").hidden = true;


            await load();


        } catch (error) {

            console.error(
                "Update Error:",
                error
            );

            $("editMsg").textContent =
                "❌ Update failed: " +
                error.message;
        }

    }
);


// =========================
// REFRESH
// =========================

$("refresh").addEventListener(
    "click",
    load
);


// =========================
// SEARCH
// =========================

$("search").addEventListener(
    "input",
    render
);


// =========================
// FILTER
// =========================

$("filter").addEventListener(
    "change",
    render
);


// =========================
// AUTO LOGIN
// =========================

if (
    sessionStorage.getItem("vimAdmin") === "1"
) {

    $("login").hidden = true;

    $("dashboard").hidden = false;

    load();

}
