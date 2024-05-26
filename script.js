const BASE_URL = "https://equran.id/api/v2";
let selectedAudio = "01"; 

const audioNames = {
    "01": "Abdullah-Al-Juhany",
    "02": "Abdul-Muhsin-Al-Qasim",
    "03": "Abdurrahman-as-Sudais",
    "04": "Ibrahim-Al-Dossari",
    "05": "Misyari-Rasyid-Al-Afasi"
};

const quranSurah = async () => {
    const endpoint = `${BASE_URL}/surat`;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data.data;
};

const quranDetail = async (nomor) => {
    const endpoint = `${BASE_URL}/surat/${nomor}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data.data;
};

quranSurah().then((surat) => {
    surat.forEach((surah) => {
        const list = `<a href="#" class="list-group-item list-group-item-action" id="surah-${surah.nomor}">
            <span class="star-icon"><i class="fa fa-moon-o fa-lg"></i><i class="fa fa-star fa-xs"></i> ${surah.nomor}.</span>
            ${surah.namaLatin} (${surah.nama})
        </a>`;
        document.querySelector("#daftar-surah").insertAdjacentHTML("beforeend", list);

        document.querySelector(`#surah-${surah.nomor}`).addEventListener("click", function (event) {
            event.preventDefault();
            document.querySelector(`#text-arabic`).innerHTML = "Loading...";

            quranDetail(surah.nomor).then((detail) => {
                let detailHtml = `
                    <h2>${detail.namaLatin} (${detail.nama})</h2>
                    <p><strong>Arti:</strong> ${detail.arti}</p>
                    <p><strong>Jumlah Ayat:</strong> ${detail.jumlahAyat}</p>
                    <p><strong>Tempat Turun:</strong> ${detail.tempatTurun}</p>
                    <p><strong>Deskripsi:</strong> ${detail.deskripsi}</p>
                    <p><strong>Qari:</strong></p>
                    <select id="audio-selector">
                        ${Object.keys(detail.audioFull).map(key => `<option value="${key}">${audioNames[key]}</option>`).join('')}
                    </select>
                    <h3>Ayat:</h3>
                `;

                detail.ayat.forEach((ayah, index) => {
                    detailHtml += `
                        <div class="row mt-4 align-items-center" id="ayah-${index}">
                            <div class="col-1">
                                <button class="btn btn-link play-audio" data-audio="${ayah.audio[selectedAudio]}" data-index="${index}">
                                    <i class="fa fa-play"></i>
                                    Play
                                </button>
                                <button class="btn btn-link stop-audio" data-index="${index}">
                                    <i class="fa fa-stop"></i>
                                    Stop
                                </button>
                            </div>                                    
                            <div class="col-10">
                                <div class="list-group fs-3 text-end amiri bg-pink" title="${ayah.teksIndonesia}">
                                    ${ayah.teksArab}
                                </div>
                            </div>                                                                      
                        </div>`;
                });

                if (detail.suratSebelumnya) {
                    detailHtml += `
                        <p><strong>Surat Sebelumnya:</strong> <a href="#" id="previous-surah">${detail.suratSebelumnya.namaLatin}</a></p>
                    `;
                }

                if (detail.suratSelanjutnya) {
                    detailHtml += `
                        <p><strong>Surat Selanjutnya:</strong> <a href="#" id="next-surah">${detail.suratSelanjutnya.namaLatin}</a></p>
                    `;
                }

                document.querySelector(`#text-arabic`).innerHTML = detailHtml;

                document.querySelector('#audio-selector').addEventListener('change', function () {
                    selectedAudio = this.value;
                    document.querySelectorAll('.play-audio').forEach(button => {
                        const ayatIndex = button.getAttribute('data-index');
                        const ayat = detail.ayat[ayatIndex];
                        button.setAttribute('data-audio', ayat.audio[selectedAudio]);
                    });
                });

                const scrollToElement = (element) => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                };

                const playNextAyah = (currentIndex) => {
                    const nextIndex = parseInt(currentIndex) + 1;
                    const nextAyahButton = document.querySelector(`.play-audio[data-index="${nextIndex}"]`);
                    if (nextAyahButton) {
                        nextAyahButton.click();
                    }
                };

                document.querySelectorAll('.play-audio').forEach(button => {
                    button.addEventListener('click', function () {
                        const audioSrc = this.getAttribute('data-audio');
                        const audioPlayer = document.querySelector('#audio-player');
                        const ayahIndex = this.getAttribute('data-index');
                        const ayahElement = document.querySelector(`#ayah-${ayahIndex}`);
                        
                        scrollToElement(ayahElement);

                        document.querySelectorAll('.play-audio').forEach(btn => btn.classList.remove('active'));
                        document.querySelectorAll('.row').forEach(row => row.classList.remove('highlight'));
                        this.classList.add('active');
                        ayahElement.classList.add('highlight');

                        if (!audioPlayer) {
                            const audioElement = document.createElement('audio');
                            audioElement.id = 'audio-player';
                            audioElement.controls = false;
                            audioElement.src = audioSrc;
                            document.body.appendChild(audioElement);

                            audioElement.addEventListener('ended', function () {
                                const currentAyatButton = document.querySelector('.play-audio.active');
                                if (currentAyatButton) {
                                    const currentIndex = currentAyatButton.getAttribute('data-index');
                                    playNextAyah(currentIndex);
                                }
                            });

                            audioElement.play();
                        } else {
                            audioPlayer.src = audioSrc;
                            audioPlayer.play();
                        }
                    });
                });

                if (detail.suratSebelumnya) {
                    document.querySelector('#previous-surah').addEventListener('click', function (event) {
                        event.preventDefault();
                        document.querySelector(`#surah-${detail.suratSebelumnya.nomor}`).click();
                    });
                }

                if (detail.suratSelanjutnya) {
                    document.querySelector('#next-surah').addEventListener('click', function (event) {
                        event.preventDefault();
                        document.querySelector(`#surah-${detail.suratSelanjutnya.nomor}`).click();
                    });
                }

                document.querySelectorAll('.stop-audio').forEach(button => {
                    button.addEventListener('click', function () {
                        const audioPlayer = document.querySelector('#audio-player');
                        audioPlayer.pause();
                    });
                });
            });
        });
    });
});