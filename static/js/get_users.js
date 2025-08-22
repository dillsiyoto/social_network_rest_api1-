const mainBlock = document.querySelector("#main-block");
const friendButton = document.querySelector("#friend-finder");
const access = localStorage.getItem("access");

// создаём блоки динамически
const searchBlock = document.createElement("div");
searchBlock.id = "search-block";

const usersBlock = document.createElement("div");
usersBlock.id = "users-list";

const paginationDiv = document.createElement("div");
paginationDiv.id = "pagination";
paginationDiv.className = "flex gap-2 mt-4";

// при первом клике вставим в DOM
function initFriendsUI() {
    if (!mainBlock.contains(searchBlock)) {
        mainBlock.appendChild(searchBlock);
    }
    if (!mainBlock.contains(usersBlock)) {
        mainBlock.appendChild(usersBlock);
    }
    if (!mainBlock.contains(paginationDiv)) {
        mainBlock.appendChild(paginationDiv);
    }
}

async function getFriends(page = 1) {
    try {
        const response = await fetch(`/api/v1/users/?page=${page}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        const apiData = await response.json();
        console.log(apiData);

        // показываем пользователей
        usersBlock.innerHTML = apiData.results.map(user => `
            <div class="user-card flex items-center gap-4 p-4 mb-3 bg-white border rounded-xl shadow hover:shadow-md transition" 
            data-user-id="${user.id}">
                <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    ${user.avatar 
                        ? `<img src="${user.avatar}" alt="${user.username}" class="w-full h-full object-cover">` 
                        : `<span class="flex items-center justify-center w-full h-full text-gray-500">👤</span>`}
                </div>
                <div>
                    <div class="font-semibold text-gray-800">${user.username}</div>
                    <div class="text-sm text-gray-600">${user.first_name} ${user.last_name}</div>
                </div>
            </div>
        `).join("");

        // вешаем клики на карточки
        document.querySelectorAll(".user-card").forEach(card => {
            card.addEventListener("click", async () => {
                const userId = card.dataset.userId;
                console.log("Открываю профиль:", userId);

                try {
                    const response = await fetch(`/api/v1/users/${userId}/`, {
                        headers: { "Authorization": `Bearer ${access}` }
                    });

                    if (!response.ok) {
                        throw new Error(`Ошибка ${response.status}`);
                    }

                    const userData = await response.json();
                    console.log("Детали пользователя:", userData);

                    usersBlock.innerHTML = `
                        <div class="p-4 border rounded-xl bg-white shadow">
                            <div class="flex items-center gap-4">
                                <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                                    ${userData.avatar 
                                        ? `<img src="${userData.avatar.image}" alt="${userData.username}" class="w-full h-full object-cover">`
                                        : `<span class="flex items-center justify-center w-full h-full text-gray-500">👤</span>`}
                                </div>
                                <div>
                                    <h2 class="text-xl font-bold">${userData.username}</h2>
                                    <p class="text-gray-600">${userData.first_name} ${userData.last_name}</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <p class="text-gray-700">Email: ${userData.email ?? "не указан"}</p>
                            </div>
                        </div>
                    `;
                } catch (err) {
                    console.error("Ошибка при получении пользователя:", err);
                }
            });
        });

        // считаем количество страниц (если page_size = 10)
        const totalPages = Math.ceil(apiData.count / 10);
        renderPagination(totalPages, page);

    } catch (err) {
        console.error("Ошибка при запросе:", err);
        usersBlock.innerHTML = `<p style="color:red;">Не удалось загрузить пользователей</p>`;
    }
}

function renderPagination(totalPages, currentPage) {
    paginationDiv.innerHTML = "";

    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "←";
        prev.className = "px-3 py-1 bg-gray-200 rounded hover:bg-gray-300";
        prev.onclick = () => getFriends(currentPage - 1);
        paginationDiv.appendChild(prev);
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className =
            "px-3 py-1 rounded " +
            (i === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300");
        btn.onclick = () => getFriends(i);
        paginationDiv.appendChild(btn);
    }

    if (currentPage < totalPages) {
        const next = document.createElement("button");
        next.textContent = "→";
        next.className = "px-3 py-1 bg-gray-200 rounded hover:bg-gray-300";
        next.onclick = () => getFriends(currentPage + 1);
        paginationDiv.appendChild(next);
    }
}

async function makeSearch(username) {
    try {
        const response = await fetch(`/api/v1/users/?search=${username}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        const apiData = await response.json();
        console.log(apiData);

        usersBlock.innerHTML = apiData.results.map(user => `
            <div class="user-card flex items-center gap-4 p-4 mb-3 bg-white border rounded-xl shadow hover:shadow-md transition" 
            data-user-id="${user.id}">
                <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    ${user.avatar 
                        ? `<img src="${user.avatar}" alt="${user.username}" class="w-full h-full object-cover">` 
                        : `<span class="flex items-center justify-center w-full h-full text-gray-500">👤</span>`}
                </div>
                <div>
                    <div class="font-semibold text-gray-800">${user.username}</div>
                    <div class="text-sm text-gray-600">${user.first_name} ${user.last_name}</div>
                </div>
            </div>
        `).join("");

    } catch (err) {
        console.error("Ошибка при запросе:", err);
        usersBlock.innerHTML = `<p style="color:red;">Не удалось загрузить пользователей</p>`;
    }
}

function renderSearch() {
    searchBlock.innerHTML = `
        <div class="mb-4">
            <div class="flex gap-2">
                <input 
                    id="search-input"
                    type="text" 
                    placeholder="Поиск друзей..." 
                    class="flex-1 p-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
                >
                <button 
                    id="search-btn"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Искать
                </button>
            </div>
        </div>
    `;

    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");

    searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        makeSearch(searchInput.value.trim());
    });
};

friendButton.addEventListener("click", async (e) => {
    e.preventDefault();
    initFriendsUI();
    renderSearch();
    await getFriends(1);
});
