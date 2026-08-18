const $ = (id) => document.getElementById(id);

let data = [];

function login() {
    const adminId = $("adminId").value.trim();
    const password = $("password").value;

    if (adminId === ADMIN_ID && password === ADMIN_PASSWORD) {
        sessionStorage.setItem("vimAdmin", "1");

        $("login").hidden = true;
        $("dashboard").hidden = false;

        load();
    } else {
        $("loginMsg").textContent = "❌ Admin ID या Password गलत है।";
    }
}

$("loginBtn").addEventListener("click", login);

$("password").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        login();
    }
});

$("eye").addEventListener("click", function () {
    const password = $("password");

    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
});

$("logout").addEventListener("click", function () {
    sessionStorage.removeItem("vimAdmin");
    location.reload();
});

async function load() {
    try {
        const response = await fetch(
            ADMIN_API_URL + "?action=list"
        );

        const result = await response.json();

        if (!result.success) {
            throw new Error("API Error");
        }

        data = result.rows || [];

        render();

    } catch (error) {

        $("rows").innerHTML = `
            <tr>
                <td colspan="7">
                    ⚠️ Complaints data load नहीं हो पाया।
                </td>
            </tr>
        `;
    }
}

function render() {

    const search =
        $("search").value.toLowerCase();

    const filter =
        $("filter").value;

    const filtered = data.filter(function (item) {

        const matchesFilter =
            !filter || item.status === filter;

        const matchesSearch =
            JSON.stringify(item)
                .toLowerCase()
                .includes(search);

        return matchesFilter && matchesSearch;
    });

    $("total").textContent = data.length;

    $("received").textContent =
        data.filter(
            x => x.status === "Received"
        ).length;

    $("progress").textContent =
        data.filter(
            x =>
                ["Verified", "Forwarded", "Under Process"]
                .includes(x.status)
        ).length;

    $("resolved").textContent =
        data.filter(
            x => x.status === "Resolved"
        ).length;

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

        }).join("") ||

        `
            <tr>
                <td colspan="7">
                    कोई complaint नहीं मिली।
                </td>
            </tr>
        `;
}

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

$("cancel").addEventListener("click", function () {
    $("editor").hidden = true;
});

$("save").addEventListener("click", async function () {

    const params = {

        action: "update",

        id: $("editId").value,

        status: $("editStatus").value,

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

        const response = await fetch(
            ADMIN_API_URL,
            {
                method: "POST",
                body: new URLSearchParams(params)
            }
        );

        const result =
            await response.json();

        if (!result.success) {
            throw new Error("Update failed");
        }

        $("editMsg").textContent =
            "✅ Update successfully saved";

        $("editor").hidden = true;

        load();

    } catch (error) {

        $("editMsg").textContent =
            "❌ Update failed";
    }
});

$("refresh").addEventListener(
    "click",
    load
);

$("search").addEventListener(
    "input",
    render
);

$("filter").addEventListener(
    "change",
    render
);

if (
    sessionStorage.getItem("vimAdmin") === "1"
) {

    $("login").hidden = true;

    $("dashboard").hidden = false;

    load();
}
