document.addEventListener("DOMContentLoaded", () => {
  const incomingDiv = document.getElementById("incoming-invites");
  const outgoingDiv = document.getElementById("outgoing-invites");
  const form = document.getElementById("invite-form");
  const msgBox = document.getElementById("invite-message");
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;

  async function loadInvites() {
    const res = await fetch("/api/friend-invites/");
    const invites = await res.json();

    incomingDiv.innerHTML = "<h2 class='font-semibold mb-2'>Входящие</h2>";
    outgoingDiv.innerHTML = "<h2 class='font-semibold mb-2'>Исходящие</h2>";

    if (invites.length === 0) {
      incomingDiv.innerHTML += "<p>Нет заявок</p>";
      return;
    }

    invites.forEach(invite => {
      if (invite.to_client === CURRENT_USER_ID) {
        incomingDiv.innerHTML += `
          <div class="flex gap-2 items-center mb-2">
            <span>От: ${invite.from_client_username}</span>
            <button data-action="accept" data-id="${invite.id}" class="bg-green-600 text-white px-2 py-1 rounded">Принять</button>
            <button data-action="decline" data-id="${invite.id}" class="bg-red-600 text-white px-2 py-1 rounded">Отклонить</button>
          </div>`;
      } else {
        outgoingDiv.innerHTML += `
          <div class="flex gap-2 items-center mb-2">
            <span>Кому: ${invite.to_client_username}</span>
            <button data-action="cancel" data-id="${invite.id}" class="bg-gray-600 text-white px-2 py-1 rounded">Отменить</button>
          </div>`;
      }
    });
  }

  async function sendInvite(username) {
    const res = await fetch("/api/friend-invites/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ username })
    });
    if (res.ok) {
      msgBox.textContent = "Заявка отправлена!";
      msgBox.className = "text-green-600";
      loadInvites();
    } else {
      msgBox.textContent = "Ошибка при отправке.";
      msgBox.className = "text-red-600";
    }
  }

  async function updateInvite(id, action) {
    let data = {};
    if (action === "accept") data = { status: "accepted" };
    if (action === "decline") data = { status: "declined" };

    await fetch(`/api/friend-invites/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(data)
    });
    loadInvites();
  }

  async function deleteInvite(id) {
    await fetch(`/api/friend-invites/${id}/`, {
      method: "DELETE",
      headers: { "X-CSRFToken": csrftoken }
    });
    loadInvites();
  }

  // слушаем клики по кнопкам
  document.body.addEventListener("click", e => {
    if (e.target.dataset.action) {
      const id = e.target.dataset.id;
      const action = e.target.dataset.action;
      if (action === "accept" || action === "decline") updateInvite(id, action);
      else if (action === "cancel") deleteInvite(id);
    }
  });

  // форма отправки
  form.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    sendInvite(username);
  });

  loadInvites();
});
