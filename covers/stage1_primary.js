const fs = require('fs');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

const PRIMARY_BOOKS = [
  // Class 1 (Latest NEP NCF-FS)
  { title: "Class 1 Sarangi (Hindi)", isbn: "9789352924127" },
  { title: "Class 1 Mridang (English)", isbn: "9789352924158" },
  { title: "Class 1 Joyful Mathematics", isbn: "9789352924172" },
  { title: "Class 1 Anandmay Ganit", isbn: "9789352924189" },
  // Class 2 (Latest NEP NCF-FS)
  { title: "Class 2 Sarangi (Hindi)", isbn: "9789352924196" },
  { title: "Class 2 Mridang (English)", isbn: "9789352924219" },
  { title: "Class 2 Joyful Mathematics", isbn: "9789352924233" },
  // Class 3 (New NCF Syllabus)
  { title: "Class 3 Veena (Hindi)", isbn: "9789352925544" },
  { title: "Class 3 Santoor (English)", isbn: "9789352925568" },
  { title: "Class 3 Maths Mela", isbn: "9789352925582" },
  { title: "Class 3 Our Wondrous World (EVS)", isbn: "9789352925605" },
  // Class 4
  { title: "Class 4 Rimjhim (Hindi)", isbn: "9788174506641" },
  { title: "Class 4 Marigold (English)", isbn: "9788174507105" },
  { title: "Class 4 Math-Magic", isbn: "9788174506979" },
  { title: "Class 4 Looking Around (EVS)", isbn: "9788174507273" },
  // Class 5
  { title: "Class 5 Rimjhim (Hindi)", isbn: "9788174508188" },
  { title: "Class 5 Marigold (English)", isbn: "9788174508133" },
  { title: "Class 5 Math-Magic", isbn: "9788174508270" },
  { title: "Class 5 Looking Around (EVS)", isbn: "9788174508317" }
];

function fetchCover(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(dest);
          if (stats.size > 1200) resolve(true);
          else { fs.unlinkSync(dest); resolve(false); }
        });
      } else {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        resolve(false);
      }
    }).on('error', () => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve(false);
    });
  });
}

async function run() {
  console.log(`📦 Downloading Stage 1 (Primary - ${PRIMARY_BOOKS.length} books)...`);
  for (const b of PRIMARY_BOOKS) {
    const dest = path.join(__dirname, `${b.isbn}.jpg`);
    if (fs.existsSync(dest)) continue;
    let ok = await fetchCover(`https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg?default=false`, dest);
    if (!ok) {
      ok = await fetchCover(`https://books.google.com/books/content?vid=isbn${b.isbn}&printsec=frontcover&img=1&zoom=1`, dest);
    }
    console.log(ok ? `✔ [~20KB] ${b.isbn}.jpg -> ${b.title}` : `✖ [Needs NCERT Scan] ${b.isbn} (${b.title})`);
  }
  execSync('git add . && git commit -m "Add Stage 1 Primary NCERT covers" && git push origin main', { stdio: 'inherit' });
  console.log("✅ Stage 1 Synced to GitHub!");
}
run();
