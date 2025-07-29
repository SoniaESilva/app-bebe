const lista = document.getElementById('listaRegistros');
const formulario = document.getElementById('formulario');
const fechaInput = document.getElementById('fecha');
const pesoInput = document.getElementById('peso');
const alturaInput = document.getElementById('altura');
const exportarJsonBtn = document.getElementById('exportarJson');
const exportarTxtBtn = document.getElementById('exportarTxt');
const graficoCanvas = document.getElementById('grafico');

let registros = JSON.parse(localStorage.getItem('crecimientoGael')) || [];
let editandoId = null;

formulario.addEventListener('submit', function(e) {
  e.preventDefault();

  const fecha = fechaInput.value;
  const peso = parseFloat(pesoInput.value);
  const altura = parseFloat(alturaInput.value);

  if (!fecha || isNaN(peso) || isNaN(altura)) return;

  if (editandoId) {
    // EDITAR
    registros = registros.map(r =>
      r.id === editandoId ? { ...r, fecha, peso, altura } : r
    );
    editandoId = null;
  } else {
    // NUEVO
    const nuevoRegistro = { id: Date.now(), fecha, peso, altura };
    registros.push(nuevoRegistro);
  }

  localStorage.setItem('crecimientoGael', JSON.stringify(registros));
  formulario.reset();
  mostrarRegistros();
  actualizarGrafico();
});

function mostrarRegistros() {
  lista.innerHTML = '';

  registros.forEach(registro => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>📅 ${registro.fecha} – ⚖️ ${registro.peso} kg – 📏 ${registro.altura} cm</span>
      <button onclick="editarRegistro(${registro.id})">✏️</button>
      <button onclick="borrarRegistro(${registro.id})">🗑️</button>
    `;
    lista.appendChild(li);
  });
}

function borrarRegistro(id) {
  registros = registros.filter(r => r.id !== id);
  localStorage.setItem('crecimientoGael', JSON.stringify(registros));
  mostrarRegistros();
  actualizarGrafico();
}

function editarRegistro(id) {
  const registro = registros.find(r => r.id === id);
  if (registro) {
    fechaInput.value = registro.fecha;
    pesoInput.value = registro.peso;
    alturaInput.value = registro.altura;
    editandoId = id;
  }
}

exportarJsonBtn.addEventListener('click', function () {
  const blob = new Blob([JSON.stringify(registros, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  descargarArchivo(url, 'crecimiento_gael.json');
});

exportarTxtBtn.addEventListener('click', function () {
  let contenido = 'Historial de Crecimiento de Gael\n\n';
  registros.forEach(r => {
    contenido += `Fecha: ${r.fecha} – Peso: ${r.peso} kg – Altura: ${r.altura} cm\n`;
  });

  const blob = new Blob([contenido], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  descargarArchivo(url, 'crecimiento_gael.txt');
});

function descargarArchivo(url, nombre) {
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

// === GRÁFICO ===
let chart = null;

function actualizarGrafico() {
  const fechas = registros.map(r => r.fecha);
  const pesos = registros.map(r => r.peso);
  const alturas = registros.map(r => r.altura);

  if (chart) chart.destroy();

  chart = new Chart(graficoCanvas, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [
        {
          label: 'Peso (kg)',
          data: pesos,
          borderColor: '#f49e4c',
          backgroundColor: 'rgba(244, 158, 76, 0.2)',
          tension: 0.3
        },
        {
          label: 'Altura (cm)',
          data: alturas,
          borderColor: '#7a9d54',
          backgroundColor: 'rgba(122, 157, 84, 0.2)',
          tension: 0.3
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#555',
            font: {
              size: 14
            }
          }
        }
      }
    }
  });
}

// Inicializar
mostrarRegistros();
actualizarGrafico();