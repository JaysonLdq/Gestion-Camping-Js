// Import de la feuille de style
import '../assets/css/style.css';

const REFUGEVERT_URL = 'http://localhost/api/rentals';
const LOGEMENT_URL = 'http://localhost/api/logements';

class App {
    // Liste des réservations d'entrée (données fictives)
    listeEntry = [];
    // Liste des réservations de sortie (données fictives)
    listeExit = [];
    // Semaine actuelle
    selectedWeek = 0;

    /**
     * Démarre l'application
     */
    start() {
        console.log('Application démarrée ...');
        // Calculer la semaine actuelle
        this.selectedWeek = this.getCurrentWeek();
        // Rendu de l'Interface Utilisateur
        this.renderBaseUI();
        // Rendu des réservations
        this.renderReservations();
        this.initCampings();
        // Rendu des semaines
        this.renderWeeks();
        this.renderMap();
    }

    /**
     * Calculer la semaine actuelle
     */
    getCurrentWeek() {
        const currentDate = new Date();
        const firstJan = new Date(currentDate.getFullYear(), 0, 1);
        const days = Math.floor((currentDate - firstJan) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    }

    initCampings() {
        fetch(REFUGEVERT_URL)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Filtrer les réservations d'entrée et de sortie uniquement en fonction de la semaine
                this.listeEntry = data.member.filter(logement => this.isInWeek(new Date(logement.dateStart), this.selectedWeek));
                this.listeExit = data.member.filter(logement => this.isInWeek(new Date(logement.dateEnd), this.selectedWeek));
                console.log("Arrivées filtrées:", this.listeEntry);
                console.log("Départs filtrés:", this.listeExit);
                this.renderReservations();
            })
            .catch(error => console.error(error));
    }

    /**
     * Vérifier si une réservation (par date de début ou de fin) se situe dans la semaine donnée
     */
    isInWeek(date, weekNumber) {
        const weekStartDate = this.getWeekStartDate(weekNumber);
        const weekEndDate = this.getWeekEndDate(weekNumber);
        return date >= weekStartDate && date <= weekEndDate;
    }

    /**
     * Obtenir la date de début de la semaine pour une semaine donnée
     */
    getWeekStartDate(weekNumber) {
        const currentYear = new Date().getFullYear();
        const firstJan = new Date(currentYear, 0, 1);
        const firstDayOfWeek = firstJan.getDate() - firstJan.getDay() + (weekNumber - 1) * 7;
        return new Date(currentYear, 0, firstDayOfWeek);
    }

    /**
     * Obtenir la date de fin de la semaine pour une semaine donnée
     */
    getWeekEndDate(weekNumber) {
        const startOfWeek = this.getWeekStartDate(weekNumber);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Fin de semaine (7 jours après le début)
        return endOfWeek;
    }

    /**
     * Rendu de l'interface utilisateur
     */
    renderBaseUI() {
        // Vérifier si l'élément principal existe déjà, pour éviter la duplication
        if (document.querySelector('header')) return;

        // -- <header>
        const elHeader = document.createElement('header');
        elHeader.innerHTML = '<h1>Mon application de camping</h1>';
        

        // -- <main>
        const elMain = document.createElement('main');
        elMain.innerHTML = '<h2>Liste des arrivées</h2>';

        // -- <table> pour les arrivées
        const elTableEntry = document.createElement('table');
        const elTheadEntry = document.createElement('thead');
        elTheadEntry.innerHTML = `
            <tr>
                <th>Date d'arrivée</th>
                <th>Date de départ</th>
                <th>Nom</th>
                <th>Emplacement</th>
                <th>Disponibilité</th>
                <th>Actions</th>
            </tr>
        `;
        const elTbodyEntry = document.createElement('tbody');
        elTbodyEntry.id = 'liste-entry';
        

        // -- <h2> Liste des départs
        const elTitleExit = document.createElement('h2');
        elTitleExit.textContent = 'Liste des départs';

        // -- <table> pour les départs
        const elTableExit = document.createElement('table');
        const elTheadExit = document.createElement('thead');
        elTheadExit.innerHTML = `
            <tr>
                <th>Date de départ</th>
                <th>Date d'arrivée</th>
                <th>Nom</th>
                <th>Emplacement</th>
                <th>Disponibilité</th>
                <th>Actions</th>
            </tr>
        `;
        const elTbodyExit = document.createElement('tbody');
        elTbodyExit.id = 'liste-exit';

        // -- Assemblage des tableaux
        elTableEntry.appendChild(elTheadEntry);
        elTableEntry.appendChild(elTbodyEntry);

        elTableExit.appendChild(elTheadExit);
        elTableExit.appendChild(elTbodyExit);

        elMain.appendChild(elTableEntry);
        elMain.appendChild(elTitleExit);  // Ajout du titre des départs
        elMain.appendChild(elTableExit);  // Ajout du tableau des départs

        // -- Assemblage final de la page
        document.body.appendChild(elHeader);
        document.body.appendChild(elMain);
    }

    /**
     * Rendu des réservations dans les tableaux
     */
    renderReservations() {
        const elTbodyEntry = document.getElementById('liste-entry');
        const elTbodyExit = document.getElementById('liste-exit');

        // Vider les anciens éléments des tableaux avant d'ajouter de nouvelles lignes
        elTbodyEntry.innerHTML = '';
        elTbodyExit.innerHTML = '';

        // Rendu des réservations d'entrée
        this.listeEntry.forEach(logement => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.formatDate(logement.dateStart)}</td>
                <td>${this.formatDate(logement.dateEnd)}</td>
                <td>${logement.users ? logement.users.lastname : ''}</td>
                <td>${logement.logement ? logement.logement.label : ''}</td>
                <td>
                    <select class="status-select" data-id="${logement.logement.id}">
                        <option value="pending" ${logement.status === 'pending' ? 'selected' : ''}>En attente...</option>
                        <option value="available" ${logement.status === 'available' ? 'selected' : ''}>Dispo</option>
                        <option value="unavailable" ${logement.status === 'unavailable' ? 'selected' : ''}>Pas dispo</option>
                    </select>
                </td>
                <td><button class="update-btn" data-id="${logement.id}">Mettre à jour</button></td>
            `;
            elTbodyEntry.appendChild(tr);
        });

        // Rendu des réservations de sortie
        this.listeExit.forEach(logement => {
            const tr = document.createElement('tr');
            console.log("logement", logement);
            tr.innerHTML = `
                <td>${this.formatDate(logement.dateEnd)}</td>
                <td>${this.formatDate(logement.dateStart)}</td>
                <td>${logement.users ? logement.users.firstname : ''} ${logement.users ? logement.users.lastname : ''}</td>
                <td>${logement.logement ? logement.logement.label : ''}</td>
                <td>
                    <select class="status-select" data-id="${logement.logement.id}">
                        <option value="pending" ${logement.status === 'pending' ? 'selected' : ''}>En attente...</option>
                        <option value="available" ${logement.status === 'available' ? 'selected' : ''}>Dispo</option>
                        <option value="unavailable" ${logement.status === 'unavailable' ? 'selected' : ''}>Pas dispo</option>
                    </select>
                </td>
                <td><button class="update-btn" data-id="${logement.id}">Mettre à jour</button></td>
            `;
            elTbodyExit.appendChild(tr);
        });
    
        
        
        // Ajout des écouteurs d'événements pour les boutons et les select
        document.querySelectorAll('.update-btn').forEach(button => {
            button.addEventListener('click', (event) => this.updateStatus(event));
        });

        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (event) => this.updateStatus(event));
        });

        
    }

    /**
 * Récupérer l'ID du logement depuis le bouton "Mettre à jour"
 */
getLogementId(event) {
    // Récupérer l'ID directement depuis l'attribut 'data-id' du bouton
    const logementId = event.target.dataset.id;

    // Log pour vérifier si l'ID est correctement récupéré
    console.log("ID du logement récupéré dans getLogementId :", logementId);

    // Retourner l'ID si trouvé, sinon retourner null
    return logementId || null;
}


    /**
     * Mettre à jour le statut de la réservation dans la base de données
     */
    updateStatus(event) {
        // Récupérer l'ID du logement depuis le bouton
        console.log("event.target.dataset.id", event.target);
        const logementId = event.target.dataset.id; // TODO : Récuperer l'ID du logement
        
    
       
    
        if (!logementId) {
            console.error("ID de logement non trouvé");
            return;  // Ne pas continuer si l'ID est invalide
        }
    
        const newStatus = event.target.closest('tr').querySelector('.status-select').value;  // Récupérer le statut sélectionné
    
        // Si le statut est "En attente...", ne rien faire
        if (newStatus === 'pending') {
            console.log('Aucune mise à jour effectuée (En attente...)');
            return;
        }
    
    
        console.log(`Mise à jour du statut pour le logement ${logementId} : ${newStatus}`);
        // Faire la requête PATCH pour mettre à jour le statut du logement
     
        fetch(`${LOGEMENT_URL}/${logementId}/update-status?status=${encodeURIComponent(newStatus)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/merge-patch+json" },
           
        })
        .then(response => response.json())
        .then(() => {
            console.log(`Statut mis à jour pour le logement ${logementId}: ${newStatus}`);
            
            // Mettre à jour l'interface utilisateur avec le nouveau statut
            const statusSelect = document.querySelector(`select[data-id="${logementId}"]`);
            if (statusSelect) {
                statusSelect.value = newStatus;  // Mettre à jour la valeur dans le select
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du statut:', error);
        });
    }
    
    /**
     * Fonction pour formater la date (jour/mois/année)
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Rendu des semaines avec navigation
     */
    renderWeeks() {
        if (document.getElementById('weeks-container')) return; // Si elle existe, ne pas la recréer
    
        const elWeeksContainer = document.createElement('div');
        elWeeksContainer.id = 'weeks-container';
        document.body.appendChild(elWeeksContainer);
    
        const elPrevWeekButton = document.createElement('button');
        elPrevWeekButton.textContent = '← Semaines précédentes';
        elPrevWeekButton.addEventListener('click', () => this.changeWeek(-1)); 
        elWeeksContainer.appendChild(elPrevWeekButton);
    
        const elCurrentWeekDisplay = document.createElement('span');
        elCurrentWeekDisplay.id = 'current-week';
        elWeeksContainer.appendChild(elCurrentWeekDisplay);
    
        const elNextWeekButton = document.createElement('button');
        elNextWeekButton.textContent = 'Semaines suivantes →';
        elNextWeekButton.addEventListener('click', () => this.changeWeek(1)); 
        elWeeksContainer.appendChild(elNextWeekButton);
    
        this.displayCurrentWeek();
    }

    renderMap() {
        // Ajouter le CSS de Leaflet
        const elLink = document.createElement('link');
        elLink.type = 'text/css';
        elLink.rel = 'stylesheet';
        elLink.href = "https://unpkg.com/leaflet/dist/leaflet.css";
        elLink.crossOrigin = "";
        document.head.appendChild(elLink);
    
        // Créer le conteneur pour la carte
        const elDiv = document.createElement('div');
        elDiv.id = 'map';
        document.body.appendChild(elDiv);
    
        // Ajouter le script de Leaflet
        const elScript = document.createElement('script');
        elScript.src = "https://unpkg.com/leaflet/dist/leaflet-src.js";
        elScript.crossOrigin = "";
        
        // Ajouter un écouteur d'événement pour initialiser la carte après que le script Leaflet soit chargé
        elScript.onload = function() {
            const elMapScript = document.createElement('script');
            elMapScript.innerHTML = `
                var map = L.map('map', {
                    layers: [
                        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            'attribution': 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                        })
                    ],
                    center: [43.6117, 3.8777], // Coordonnée initiale pour Montpellier
                    zoom: 10
                });
    
                // Ajouter des épingles pour Montpellier et Perpignan
                var montpellierPin = L.marker([43.6117, 3.8777]).addTo(map);
                montpellierPin.bindPopup('<b>Montpellier</b><br/><a href="http://localhost">Le Refuge vert.</a>');
    
                var perpignanPin = L.marker([42.6977, 2.8953]).addTo(map);
                perpignanPin.bindPopup('<b>Perpignan</b><br/>Ville du sud de la France, près de la mer.');
    
                // Autres pins possibles, en fonction de tes besoins
                var anotherPin = L.marker([43.5, 3.8]).addTo(map);  // Par exemple un pin entre Montpellier et Perpignan
                anotherPin.bindPopup('<b>Autre lieu</b><br/>Localisation intermédiaire.');
            `;
            document.body.appendChild(elMapScript);
        };
    
        document.body.appendChild(elScript);
    }
    

    /**
     * Changer la semaine actuelle avec la flèche de navigation
     */
    changeWeek(direction) {
        this.selectedWeek += direction;
        if (this.selectedWeek < 1) this.selectedWeek = 1;
        if (this.selectedWeek > 52) this.selectedWeek = 52;
        this.displayCurrentWeek();
        this.initCampings(); 
    }

    /**
     * Afficher la semaine actuelle
     */
    displayCurrentWeek() {
        const elCurrentWeekDisplay = document.getElementById('current-week');
        elCurrentWeekDisplay.textContent = `Semaine ${this.selectedWeek}`;
    }
}



// Lancer l'application
const app = new App();


// Exporter l'application
export default app;
