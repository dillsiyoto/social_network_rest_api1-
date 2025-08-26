// сабмит формы
regForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(regForm);

  try {
    let avatarId = null;

    // если пользователь загрузил аватар
    const avatarFile = formData.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      const imgForm = new FormData();
      imgForm.append("image", avatarFile);

      const imgResp = await fetch("/api/v1/images/", {
        method: "POST",
        body: imgForm,
      });

      if (!imgResp.ok) {
        const err = await imgResp.json().catch(() => ({}));
        alert("Ошибка загрузки фото: " + (err.detail || imgResp.status));
        return;
      }

      const imgData = await imgResp.json();
      avatarId = imgData.id;
    }

    // готовим JSON для регистрации
    const userData = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      avatar_id: avatarId, // ключ совпадает с сериализатором
    };

    const resp = await fetch("/api/v1/registration/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Ошибка: " + (err.detail || resp.status));
      return;
    }

    alert("Регистрация успешна!");
    regModal.close();
    // window.location.reload(); // если нужно
  } catch (err) {
    alert("Ошибка соединения: " + err);
  }
});
