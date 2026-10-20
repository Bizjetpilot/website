const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = __dirname;

const aircraftImages = {
  'Phenom 300E': 'Phenom-300E.jpg',
  'Cirrus SF50': 'Cirrus-SF50.jpg',
  'Citation Longitude': 'Cessna-Longitude.jpg',
  'Citation X': 'Cessna-Citation-X.jpg',
  'Challenger 650': 'Challenger-650.jpg'
};

const WIDTH = 1536;
const HEIGHT = 864;

function escapeXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  })[char]);
}

function formatDate(value) {
  if (!value) return '';

  const parts = String(value).split('-');

  if (parts.length !== 3) return String(value);

  const [year, month, day] = parts;

  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  const monthName = months[Number(month) - 1];

  return monthName
    ? `${Number(day)} ${monthName} ${year}`
    : String(value);
}

function formatTime(value) {
  if (!value) return '';

  const time = String(value).trim().replace(/Z$/i, '');

  return `${time}Z`;
}

async function generateThumbnail(stream) {
  const aircraftFile = aircraftImages[stream.aircraft];

  if (!aircraftFile) {
    console.log(`No aircraft photograph for: ${stream.aircraft}`);
    return null;
  }

  const aircraftPath = path.join(
    root,
    'assets',
    'aircraft',
    aircraftFile
  );

const overlayPath = path.join(root, 'assets', 'livestream-aircraft-overlay.png');

  const outputDir = path.join(
    root,
    'dist',
    'assets',
    'generated'
  );

  fs.mkdirSync(outputDir, { recursive: true });

  const slug = String(stream.slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');

  if (!slug) return null;

  const outputName = `${slug}.png`;
  const outputPath = path.join(outputDir, outputName);

  const photo = await sharp(aircraftPath)
    .resize(WIDTH, HEIGHT, {
      fit: 'cover',
      position: 'centre'
    })
    .png()
    .toBuffer();

  const fields = [
    { text: stream.aircraft, x: 225, y: 620, size: 30 },
    { text: stream.from, x: 565, y: 620, size: 34 },
    { text: stream.to, x: 960, y: 620, size: 34 },
    { text: stream.simulator, x: 1300, y: 620, size: 30 },
    { text: formatDate(stream.date), x: 340, y: 785, size: 34 },
    { text: formatTime(stream.time_utc), x: 915, y: 785, size: 34 }
  ];

  const textSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}"
         xmlns="http://www.w3.org/2000/svg">
      ${fields.map(field => `
        <text
          x="${field.x}"
          y="${field.y}"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="${field.size}"
          font-weight="bold"
          fill="#07343b">
          ${escapeXml(field.text)}
        </text>
      `).join('')}
    </svg>
  `;

  await sharp(photo)
    .composite([
{
  input: await sharp(overlayPath)
    .resize(WIDTH, HEIGHT, { fit: 'fill' })
    .png()
    .toBuffer(),
  top: 0,
  left: 0
},
      {
        input: Buffer.from(textSvg),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

  console.log(`Generated thumbnail: ${outputName}`);

  return `/assets/generated/${outputName}`;
}

module.exports = { generateThumbnail };
