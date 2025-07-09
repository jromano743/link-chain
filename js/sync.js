// sync.js
const sync = (() => {
  let tokenClient;
  let accessToken = null;
  let fileId = localStorage.getItem('driveFileId') || null;

  const saveDriveBtn = document.getElementById('saveDriveBtn');
  const loadDriveBtn = document.getElementById('loadDriveBtn');

  window.addEventListener('load', () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: '462875291727-ub8o5u6na03e0q12v23a892tuajgkcdh.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (tokenResponse) => {
        accessToken = tokenResponse.access_token;
        saveDriveBtn.disabled = false;
        loadDriveBtn.disabled = false;
        alert('✅ Login correcto con Google Drive.');
      },
    });
  });

  async function saveToDrive() {
    if (!accessToken) return;

    const metadata = {
      name: 'tareas.json',
      mimeType: 'application/json'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(data) +
      close_delim;

    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const method = fileId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'multipart/related; boundary=' + boundary
      },
      body: multipartRequestBody
    });

    const result = await res.json();
    fileId = result.id;
    localStorage.setItem('driveFileId', fileId);
    alert('✅ Tareas guardadas en Drive con ID: ' + fileId);
  }

  async function loadFromDrive() {
    if (!accessToken) return;

    if (!fileId) {
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='tareas.json' and trashed=false`, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      });
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        fileId = searchData.files[0].id;
        localStorage.setItem('driveFileId', fileId);
      } else {
        alert('⚠️ No se encontró archivo en Drive.');
        return;
      }
    }

    const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    });

    data = await downloadRes.json();
    saveToCache();
    render();
    alert('📂 Tareas cargadas desde Drive y actualizadas localmente.');
  }

  return {
    login: () => tokenClient.requestAccessToken(),
    saveToDrive,
    loadFromDrive
  };
})();
