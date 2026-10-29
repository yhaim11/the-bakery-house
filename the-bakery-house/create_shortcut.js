const fs = require('fs');
const { execSync } = require('child_process');

const vbsScript = `
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "C:\\Users\\yosef haim\\Desktop\\The Bakery House.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
oLink.Arguments = "--app=https://the-bakery-house-app.netlify.app"
oLink.Description = "בית האפיות - The Bakery House"
oLink.IconLocation = "C:\\Users\\yosef haim\\Desktop\\the-bakery-house\\favicon.ico, 0"
oLink.Save
`;

fs.writeFileSync('temp_create_sc.vbs', vbsScript);
execSync('cscript //nologo temp_create_sc.vbs');
fs.unlinkSync('temp_create_sc.vbs');
console.log('Shortcut created successfully on Desktop: The Bakery House.lnk');
