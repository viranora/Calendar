const API_URL = 'http://localhost:5001/api/events'; 

const calendarElement = document.getElementById('calendar');
const eventModal = document.getElementById('eventModal');
const closeModal = document.querySelector('.close');
const saveEventButton = document.getElementById('saveEventButton');
const prevMonthButton = document.getElementById('prevMonthButton');
const nextMonthButton = document.getElementById('nextMonthButton');
const monthYearDisplay = document.getElementById('monthYear');

const addEventButton = document.getElementById('addEventButton');
const viewEventsButton = document.getElementById('viewEventsButton');
const addEventForm = document.getElementById('addEventForm');
const eventList = document.getElementById('eventList');

let currentDate = new Date();
const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

// Backend'den etkinlikleri çekme
async function fetchEvents(date = null) {
    try {
        const url = date ? `${API_URL}/date/${date}` : API_URL;
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Etkinlikler yüklenirken hata oluştu:', error);
        return [];
    }
}

async function createCalendar() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    calendarElement.innerHTML = '';

const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
weekDays.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.classList.add('weekday');
    dayElement.innerText = day;
    calendarElement.appendChild(dayElement);
});

const startDay = firstDay.getDay();
const daysOffset = (startDay === 0) ? 6 : startDay - 1;

for (let i = 0; i < daysOffset; i++) {
    calendarElement.appendChild(document.createElement('div'));
}

const events = await fetchEvents();

for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('day');

    const dayNumber = document.createElement('span');
    dayNumber.classList.add('day-number'); 
    dayNumber.innerText = i; 

    dayElement.appendChild(dayNumber); 

    const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    dayElement.dataset.date = dateString;
    dayElement.addEventListener('click', () => openModal(dateString));

    const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toISOString().split('T')[0] === dateString;
    });

    if (dayEvents.length > 0) {
        const eventCountElement = document.createElement('div');
        eventCountElement.classList.add('event-count');
        eventCountElement.innerText = `${dayEvents.length} etkinlik`;
        dayElement.appendChild(eventCountElement);
    }

    calendarElement.appendChild(dayElement);
}

}

// Etkinlik silme 
window.deleteEvent = async (eventId) => {
    if (confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`${API_URL}/${eventId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                createCalendar();
            }
        } catch (error) {
            console.error('Silme hatası:', error);
        }
    }
};

// Etkinlik ekleme 
saveEventButton.addEventListener('click', async () => {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;

    console.log('Etkinlik ekleniyor:', { title, date, time });

    if (title && date) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    date: new Date(date).toISOString(),
                    time
                })
            });

            if (response.ok) {
                createCalendar();
                eventModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
        }
    } else {
        alert('Lütfen etkinlik başlığını ve tarihini doldurun.');
    }
});

// Etkinlikleri listeleme
async function loadEvents() {
    eventList.innerHTML = '';
    try {
        const events = await fetchEvents();

        console.log('Gelen etkinlikler:', events); 

        events.forEach(event => {
            const listItem = document.createElement('div');
            listItem.classList.add('event-item');
            listItem.innerHTML = `
                <span>${event.title} - ${new Date(event.date).toLocaleDateString()}</span>
                <button onclick="deleteEvent('${event._id}')">Sil</button>
            `;
            eventList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Listeleme hatası:', error);
    }
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    createCalendar();
}

function openModal(date) {
    eventModal.style.display = 'block';
    document.getElementById('eventDate').value = date;
    document.getElementById('eventTitle').value = '';
    switchToAddEvent();
}

function switchToAddEvent() {
    addEventForm.style.display = 'block';
    eventList.style.display = 'none';
}

function switchToViewEvents() {
    addEventForm.style.display = 'none';
    eventList.style.display = 'block';
    loadEvents();
}

closeModal.onclick = () => eventModal.style.display = 'none';
window.onclick = (e) => e.target === eventModal && (eventModal.style.display = 'none');
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));
addEventButton.addEventListener('click', switchToAddEvent);
viewEventsButton.addEventListener('click', switchToViewEvents);

createCalendar();
