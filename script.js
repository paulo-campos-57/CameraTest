let userLatitude = null;
let userLongitude = null;

// Solicitar permissão para acessar a localização do usuário
function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;
        }, error => {
            console.error('Erro ao acessar a geolocalização: ', error);
        });
    } else {
        console.error('Geolocalização não é suportada por este navegador.');
    }
}

// Chama a função para solicitar a localização quando a página é carregada
document.addEventListener('DOMContentLoaded', requestLocation);

// JavaScript para abrir a câmera e tirar foto
const openCameraButton = document.getElementById('openCameraButton');
const takePhotoButton = document.getElementById('takePhotoButton');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const cameraLocation = document.getElementById('cameraLocation');
const photo = document.getElementById('photo');
const photoData = document.getElementById('photoData');
let stream;

openCameraButton.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error('Erro ao acessar a câmera: ', err);
    }
});

takePhotoButton.addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => {
            photo.src = reader.result;
            photo.style.display = 'block';
            photoData.value = reader.result;
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;

            // Usar a localização do navegador
            if (userLatitude && userLongitude) {
                cameraLocation.textContent = `Geolocalização: Latitude: ${userLatitude}, Longitude: ${userLongitude}`;
            } else {
                cameraLocation.textContent = "Geolocalização: sem geolocalização";
            }
        };
        reader.readAsDataURL(blob);
    }, 'image/jpeg');
});

// JavaScript para carregar imagem
const imageInput = document.getElementById('imageInput');
const uploadedImage = document.getElementById('uploadedImage');
const uploadLocation = document.getElementById('uploadLocation');

imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
        getExifData(file, uploadLocation);
    }
});

// JavaScript para carregar PDF
const pdfInput = document.getElementById('pdfInput');
const pdfFileName = document.getElementById('pdfFileName');
const submitPdfButton = document.getElementById('submitPdfButton');

pdfInput.addEventListener('change', () => {
    const file = pdfInput.files[0];
    if (file) {
        pdfFileName.textContent = `Arquivo selecionado: ${file.name}`;
    } else {
        pdfFileName.textContent = 'Nenhum arquivo selecionado';
    }
});

submitPdfButton.addEventListener('click', () => {
    if (!pdfInput.files[0]) {
        alert('Por favor, selecione um arquivo PDF antes de enviar.');
        return;
    }
    alert('PDF enviado com sucesso!');
});

// Função para extrair dados EXIF e geolocalização
function getExifData(file, locationElement) {
    EXIF.getData(file, function() {
        const lat = EXIF.getTag(this, "GPSLatitude");
        const lon = EXIF.getTag(this, "GPSLongitude");
        if (lat && lon) {
            const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "W";
            const latitude = convertDMSToDD(lat, latRef);
            const longitude = convertDMSToDD(lon, lonRef);
            locationElement.textContent = `Geolocalização: Latitude: ${latitude}, Longitude: ${longitude}`;
        } else {
            locationElement.textContent = "Geolocalização: sem geolocalização";
        }
    });
}

// Função para converter de DMS (graus, minutos, segundos) para DD (graus decimais)
function convertDMSToDD(dms, ref) {
    if (!dms) return NaN;
    const degrees = dms[0] || 0;
    const minutes = dms[1] || 0;
    const seconds = dms[2] || 0;
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (ref === "S" || ref === "W") {
        dd = dd * -1;
    }
    return dd;
}
