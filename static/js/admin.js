document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("news-modal");
    const btn = document.getElementById("add-news-btn");
    const span = document.querySelector(".close");
    const form = document.getElementById("news-form");

    const imageUpload = document.getElementById("news-image-upload");
    const previewContainer = document.getElementById("preview-container");

    // === Открытие модального окна ===
    if (btn && modal) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            form.reset();
            document.getElementById("news-id").value = "";
            document.getElementById("news-title").value = "";
            document.getElementById("news-description").value = "";
            document.getElementById("news-date").value = "";
            previewContainer.innerHTML = "";
            document.getElementById("modal-title").innerText = "Добавить новость";
            modal.style.display = "block";
        });
    }

    // === Закрытие модального окна ===
    if (span && modal) {
        span.onclick = function () {
            modal.style.display = "none";
        };
    }

    // === Превью перед загрузкой ===
    if (imageUpload && previewContainer) {
        imageUpload.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Превью" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">
                        <button type="button" onclick="removePreview()" class="remove-preview service-btn">Удалить</button>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    window.removePreview = function () {
        if (imageUpload) imageUpload.value = '';
        if (previewContainer) previewContainer.innerHTML = "";
    };

    // === Сохранение новости ===
    if (form && modal) {
        form.onsubmit = function (e) {
            e.preventDefault();

            const title = document.getElementById("news-title").value.trim();
            const description = document.getElementById("news-description").value.trim();
            const date = document.getElementById("news-date").value.trim();

            const file = imageUpload ? imageUpload.files[0] : null;

            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!title || !description || !date || (!file && !document.getElementById("news-id").value)) {
                alert("Все поля обязательны!");
                return;
            }

            if (!dateRegex.test(date)) {
                alert("Неверный формат даты. Используйте дд/мм/гггг");
                return;
            }

            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("date", date);

            if (file) {
                formData.append("image", file);
            } else {
                const imagePath = document.getElementById("news-image").value;
                formData.append("image_path", imagePath);
            }

            const newsId = document.getElementById("news-id").value;
            const method = newsId ? "PUT" : "POST";
            const url = newsId ? `/api/news/${newsId}` : "/api/news";

            fetch(url, {
                method: method,
                body: formData
            }).then(() => {
                modal.style.display = "none";
                loadNews(); // Перезагружаем список
            }).catch(err => {
                console.error("Ошибка сохранения:", err);
                alert("Произошла ошибка при сохранении новости.");
            });
        };
    }

    // === Редактирование новости ===
    window.editNews = function (news) {
        const idField = document.getElementById("news-id");
        const titleField = document.getElementById("news-title");
        const descField = document.getElementById("news-description");
        const dateField = document.getElementById("news-date");
        const imageField = document.getElementById("news-image");

        if (idField) idField.value = news.id;
        if (titleField) titleField.value = news.title;
        if (descField) descField.value = news.description;
        if (dateField) dateField.value = news.date.replace(/\//g, '.');
        if (imageField) imageField.value = news.image;

        const modalTitle = document.getElementById("modal-title");
        if (modalTitle) modalTitle.innerText = "Редактировать новость";
        if (previewContainer) {
            previewContainer.innerHTML = `
                <img src="${news.image}" width="100%" style="border-radius: 8px; margin-top: 10px;">
                <button type="button" onclick="removePreview()" class="remove-preview service-btn">Удалить</button>
            `;
        }

        if (modal) modal.style.display = "block";
    };

    // === Удаление новости ===
    window.deleteNews = function (id) {
        if (confirm("Вы уверены?")) {
            fetch(`/api/news/${id}`, { method: "DELETE" })
                .then(() => loadNews());
        }
    };

    // === Загрузка списка новостей ===
    function loadNews() {
        fetch("/api/news?page=1&limit=100")
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById("news-table-body");
                if (!tbody) return;

                tbody.innerHTML = "";

                data.news.forEach(news => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${news.id}</td>
                        <td>${news.title}</td>
                        <td>${news.date}</td>
                        <td><img src="${news.image}" width="100"></td>
                        <td>
                            <button onclick="editNews(${JSON.stringify(news)})" class="service-btn">Редактировать</button>
                            <button onclick="deleteNews(${news.id})" class="service-btn">Удалить</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            });
    }

    // Показываем новости только если таблица существует
    const table = document.getElementById("news-table-body");
    if (table) {
        loadNews();
    }
});