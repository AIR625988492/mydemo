const fs = require('fs');
const express = require("express");
const multer = require("multer");
const app1 = express();
const crypto = require('crypto');
const port = 3000;
const db = require('nedb-promises')
const { app,shell } = require('electron');
const path = require('path');
const os = require('os')
const moment = require('moment');
const { PDFDocument,StandardFonts, rgb } = require('pdf-lib');
const bodyParser = require('body-parser');
let {PythonShell} = require('python-shell')


let currentPath = "C:\\OCR\\";
let out = `${currentPath}uploads\\result\\`;
let from = `${currentPath}uploads\\orgin\\`;

if (!fs.existsSync(currentPath)) {
  fs.mkdirSync(currentPath,{ recursive: true });
}
if (!fs.existsSync(out)) {
  fs.mkdirSync(out,{ recursive: true });
}
if (!fs.existsSync(from)) {
  fs.mkdirSync(from,{ recursive: true });
}

function simpleLog(log) {
  if(log)
    fs.appendFileSync(path.join(currentPath,'log.log'),moment().format('YYYY-MM-DD HH:mm:ss')+"  "+ log.toString() + os.EOL);
}

let dbpath = path.join(currentPath, 'db.db');
let datastore = db.create(dbpath);

app1.use(bodyParser.json());

let outputPath = path.join(out, 'result.pdf');
// 设置存储配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, from);
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname)
    let name = `${crypto.createHash('md5').update(file.originalname).digest('hex')}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

app1.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET');
  next();
});

app1.post("/upload", upload.array("file"), async function (req, res, next) {
  simpleLog('upload ')
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  
  for (const file of req.files) {
    simpleLog("File(s) uploaded successfully!" + file.originalname || file.filename);
    await datastore.updateOne({ name: file.originalname || file.filename, type: 'orgin' }, { name: file.originalname || file.filename, type: 'orgin' }, { upsert: true });
  }

  simpleLog("上传成功了");
  res.send({});
  next();
});

app1.get('/getFileList', async function (req, res, next) {
  let body = req.query;
  console.log(body);
  let pageSize = body.pageSize || 100;
  let pageNumber = body.pageNumber || 1;
  let skipCount = (pageNumber - 1) * pageSize;
  let name = body.name;
  let type = body.type || 'orgin';
  let filter = { type };
  if (name) {
    filter = { name: new RegExp(name, 'i'), type }
  }
  let data = await datastore.find(filter).skip(skipCount).limit(pageSize);
  let count = (await datastore.find(filter)).length;
  simpleLog("getFileList" + JSON.stringify({ count, data }));
  res.send({ count, data });
  next();
});

app1.post('/combine', async function (req, res, next) {
  let names = req.body;
  if (names.length) {
    let pdfPaths = names.map(item => {
      let ext = path.extname(item);
      return {
        oname: item,
        md5Name: path.join(from, `${crypto.createHash('md5').update(item).digest('hex')}${ext}`)
      }
    });
    const mergedPdf = await PDFDocument.create();
    for (const pdfPath of pdfPaths) {
      console.log('pdfPath:', pdfPath)
      const existingPdfBytes = fs.readFileSync(pdfPath.md5Name);
      const existingPdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await existingPdfDoc.embedFont(StandardFonts.Helvetica);
      let ext = path.extname(pdfPath.oname);
      const basename = path.basename(pdfPath.oname, ext);
      for (let pageNum = 0; pageNum < existingPdfDoc.getPages().length; pageNum++) {
        let p = existingPdfDoc.getPages()[pageNum];
        const xPosition = p.getWidth(), yPosition = p.getHeight();
        const copiedPage = await mergedPdf.copyPages(existingPdfDoc, [pageNum]);
        let txtWith = font.widthOfTextAtSize(basename, 12);
        copiedPage[0].drawText(basename, {
          x: Number((xPosition - txtWith) / 2),
          y: 5,
          size: 12,
          font: font,
          color: rgb(0, 0, 0)
        });
        mergedPdf.addPage(copiedPage[0]);
      }
    }
    const pdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);
    res.send({})
    next();
  }
});

app1.post('/delAtlas', async(req, res, next) => {
  let _id = req.body._id ;
  let one = await datastore.findOne({ _id });
  let ext = path.extname(one.name);
  if(fs.existsSync(`${crypto.createHash('md5').update(one.name).digest('hex')}${ext}`)) {
    fs.unlinkSync(`${crypto.createHash('md5').update(one.name).digest('hex')}${ext}`)
  }
  await datastore.deleteOne({ _id })
  res.send({});
  next();
});

app1.get('/open', async function (req, res, next) {
  shell.openPath(path.dirname(out));
  res.send({})
  simpleLog(out)
  next()
});


app1.get('pdf2docx', async (req, res) => {
  // https://pdf2docx.readthedocs.io/en/latest/quickstart.convert.html
  // cv = Converter(pdf_file)
  // cv.convert(docx_file)
  // cv.close()
});
module.exports = function startServer() {
  app1.listen(port, () => {
    simpleLog('server has started!!!!!!!!!!!!!!'+port)
    console.log(`port: ${port}`);
  });
};

process.on('uncaughtException', function (err) {
  console.error('An uncaught error occurred!');
  simpleLog(e.stack.toString());
  console.error(err.stack);
  app.quit();
});
