const NEWS_PER_PAGE = 4;
let currentPage = 1;

// Демо-новости
const mockNews = [
    {
        id: 1,
        title: "Встреча с центром занятости",
        description: "В учебном классе ПАТП-1 в Вологде прошла встреча специалистов центра занятости с представителями компании.",
        image: "/static/images/news-item-1.png",
        date: "17.01.2025"
    },
    {
        id: 2,
        title: "Женщины-водители нужны!",
        description: "ПАТП №1 ждёт женщин-водителей на работу! И если кто скажет, что водитель — это не женская работа, то это вовсе не так.",
        image: "/static/images/news-item-3.png",
        date: "22.01.2025"
    },
    {
        id: 3,
        title: "Установка новых терминалов",
        description: "Для более комфортной и быстрой оплаты во всех трёхдверных автобусах ПАТП №1 будут работать четыре терминала.",
        image: "/static/images/news-item-2.jpeg",
        date: "07.02.2025"
    },
    {
        id: 4,
        title: "Новые маршруты в тестовом режиме",
        description: "В тестовом режиме запущены новые маршруты для улучшения транспортного обслуживания населения.",
        image: "/static/images/news-item-4.jpg",
        date: "10.02.2025"
    },
    {
        id: 5,
        title: "Обслуживание техники зимой",
        description: "Зимой особенно важно следить за состоянием автопарка. Механики ПАТП-1 обеспечивают надёжную работу транспорта.",
        image: "/static/images/news-item-5.jpg",
        date: "15.02.2025"
    },
    {
        id: 6,
        title: "Экологические инициативы",
        description: "ПАТП №1 внедряет меры по снижению выбросов и повышению экологичности перевозок.",
        image: "/static/images/news-item-6.jpg",
        date: "18.02.2025"
    }
];

function showPage(page) {
    currentPage = page;
    const container = document.getElementById('news-container');
    const pagination = document.getElementById('news-pagination');

    // Очистка контейнеров
    container.innerHTML = '';
    pagination.innerHTML = '';

    // Выбираем нужные новости для текущей страницы
    const start = (page - 1) * NEWS_PER_PAGE;
    const end = start + NEWS_PER_PAGE;
    const newsToShow = mockNews.slice(start, end);

    // Отображаем новости
    for (let i = 0; i < NEWS_PER_PAGE; i++) {
        if (newsToShow[i]) {
            const news = newsToShow[i];
            container.innerHTML += `
                <div class="news-card">
                    <img src="${news.image}" alt="${news.title}">
                    <div class="news-content">
                        <h3>${news.title}</h3>
                        <p>${news.description}</p>
                        <div class="news-footer">
                            <a href="/single-news/${news.id}" class="news-btn">Подробнее</a>
                            <p class="news-date">${news.date}</p>
                        </div>
                    </div>
                </div>`;
        } else {
            container.innerHTML += `<div class="news-card news-card-empty"></div>`;
        }
    }

    // Построение пагинации
    const totalPages = Math.ceil(mockNews.length / NEWS_PER_PAGE);
    for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = i;
        if (i === page) link.classList.add('active');
        link.onclick = () => {
            showPage(i);
            return false;
        };
        pagination.appendChild(link);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    showPage(1);
});