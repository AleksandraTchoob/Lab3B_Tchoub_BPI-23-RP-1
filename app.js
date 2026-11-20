// Глобальная переменная для хранения загруженных пользователей (для поиска без новых запросов)
let allUsers = [];

const messageEl = document.getElementById('message');
const loadBtn = document.getElementById('load-btn');
const searchInput = document.getElementById('search-input');
const usersList = document.getElementById('users-list');
const postsMessage = document.getElementById('posts-message');
const postsPlaceholder = document.getElementById('posts-placeholder');
const postsList = document.getElementById('posts-list');

// Функция для отображения сообщений, пока запрос выполняется
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = 'message ' + type; // 'loading', 'success', 'error'
}

function clearMessage(element) {
  element.textContent = '';
  element.className = 'message';
}

// Загрузка пользователей (GET)
async function loadUsers() {
  loadBtn.disabled = true; // Блокируем кнопку на время запроса
  searchInput.disabled = true; // Блокируем поле поиска на время запроса
  showMessage(messageEl, 'Загрузка пользователей...', 'loading');
  usersList.innerHTML = ''; // Очищаем список перед новой загрузкой
  clearMessage(postsMessage);
  postsList.innerHTML = ''; // Очищаем область публикаций перед новой загрузкой
  postsPlaceholder.style.display = 'block';

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    
    // Проверка на успешный HTTP-ответ (response.ok)
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    allUsers = await response.json(); // Сохраняем данные в память
    renderUsers(allUsers); // Отрисовываем всех пользователей

    // Разблокируем поле поиска после успешной загрузки
    searchInput.disabled = false;
    clearMessage(messageEl); // Убираем сообщение о загрузке при успехе
  } catch (error) {
    showMessage(messageEl, `Ошибка при загрузке. ${error.message}. Попробуйте еще раз.`, 'error');
  } finally {
    loadBtn.disabled = false; // Снова активируем кнопку в любом случае
  }
}

// Отрисовка списка пользователей
function renderUsers(usersToRender) {
  usersList.innerHTML = ''; // Очищаем список перед новой загрузкой

  // Если массив пустой, показываем сообщение
  if (usersToRender.length === 0) {
    showMessage(messageEl, 'Пользователи не найдены', 'error');
    return;
  } 
  
  // Если это не результат поиска, убираем сообщение об ошибке, если оно было
  if (searchInput.value === '') {
    clearMessage(messageEl);
  }

  // Создаем карточки для каждого пользователя
  usersToRender.forEach(user => {
    const card = document.createElement('div');
    card.className = 'user-card';

    const info = document.createElement('div');
    info.className = 'user-info';
    
    const name = document.createElement('h3');
    name.textContent = user.name;

    const email = document.createElement('p');
    email.textContent = `Email: ${user.email}`;
    
    const city = document.createElement('p');
    city.textContent = `Город: ${user.address.city}`;

    info.append(name, email, city);

    // Кнопка для загрузки публикаций
    const postBtn = document.createElement('button');
    postBtn.textContent = 'Показать публикации';
    // При клике передаем ID и имя пользователя в функцию загрузки постов
    postBtn.addEventListener('click', () => loadUserPosts(user.id, user.name));

    card.append(info, postBtn);
    usersList.appendChild(card);
  });
}

// Поиск по имени (фильтрация уже загруженных данных)
searchInput.addEventListener('input', (event) => {
  const searchTerm = event.target.value.toLowerCase().trim();
  
  // Фильтруем массив allUsers
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm)
  );
  
  renderUsers(filteredUsers);
});

// Загрузка публикаций выбранного пользователя (GET)
async function loadUserPosts(userId, userName) {
  // Показываем загрузку в области публикаций
  postsList.innerHTML = '';
  postsPlaceholder.style.display = 'none';
  showMessage(postsMessage, `Загрузка публикаций для ${userName}...`, 'loading');

  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const posts = await response.json();

    const topThreePosts = posts.slice(0, 3);

    if (topThreePosts.length === 0) {
      showMessage(postsMessage, 'У этого пользователя нет публикаций.', 'error');
      postsPlaceholder.style.display = 'block';
      return;
    }

    clearMessage(postsMessage);

    // Отрисовываем публикации
    topThreePosts.forEach(post => {
      const postCard = document.createElement('div');
      postCard.className = 'post-card';

      const title = document.createElement('h4');
      title.textContent = post.title;

      const body = document.createElement('p');
      body.textContent = post.body;

      postCard.append(title, body);
      postsList.appendChild(postCard);
    });

    } catch (error) {
    showMessage(postsMessage, `Ошибка при загрузке публикаций: ${error.message}`, 'error');
    postsPlaceholder.style.display = 'block';
  }
}

// Привязка обработчика события
loadBtn.addEventListener('click', loadUsers);
