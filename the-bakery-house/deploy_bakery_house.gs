/**
 * =========================================================================================
 * סקריפט סנכרון ייעודי ומבודד: בית האפיות (The Bakery House) ל-Netlify
 * קובץ: deploy_bakery_house.gs
 * =========================================================================================
 * 
 * ⚠️ אזהרת בידוד ואי-דריסה:
 * סקריפט זה מוגדר אך ורק עבור האתר הייעודי של "בית האפיות" (the-bakery-house-app).
 * הוא אינו משפיע ואינו דורס בשום מצב את:
 * 1. אפליקציית ניהול הקונדיטוריה הקודמת (artisan-bakery-management, ID: c6927a30-6175-4b05-8313-7472f46a3a44)
 * 2. פלטפורמת האם המלונה של קשת (keshets-kennel, ID: b4dfb436-da3e-4f1c-aa9b-260a8ea195bb)
 * =========================================================================================
 */

function deployBakeryHouseToNetlify() {
  // 1. הגדרות האתר הייעודי של בית האפיות
  const BAKERY_HOUSE_SITE_ID = "92ada39a-453a-48fe-aa97-04f537f0978d"; // the-bakery-house-app
  const NETLIFY_TOKEN = "nfp_pQkgGiGKUPjWx8SUBCmMu2miayPd8LC2a699";
  
  // מזהה תיקיית Google Drive של פרויקט "בית האפיות" (אם קיים / מוגדר)
  const FOLDER_ID = "1Lilu-ICskX7K6JpuOkCAlI77ZYuxTnRd"; 

  // בדיקת בטיחות קפדנית - מניעת דריסה של אפליקציית ניהול הקונדיטוריה
  const FORBIDDEN_SITES = [
    "c6927a30-6175-4b05-8313-7472f46a3a44", // artisan-bakery-management
    "b4dfb436-da3e-4f1c-aa9b-260a8ea195bb"  // keshets-kennel
  ];

  if (FORBIDDEN_SITES.indexOf(BAKERY_HOUSE_SITE_ID) !== -1) {
    throw new Error("🚨 שגיאת אבטחה חמורה: הוגדר מזהה אתר של פרויקט קודם! הפריסה בוטלה להגנה על המערכת.");
  }

  Logger.log("🥖 מתחיל תהליך פריסה וסנכרון של 'בית האפיות' (The Bakery House)...");
  Logger.log("🎯 אתר יעד: the-bakery-house-app.netlify.app (ID: " + BAKERY_HOUSE_SITE_ID + ")");

  let folder = null;
  try {
    folder = DriveApp.getFolderById(FOLDER_ID);
  } catch (e) {
    Logger.log("⚠️ תיקיית Drive לא נמצאה או שאין הרשאה ישירה, יש לוודא שה-FOLDER_ID שייך לבית האפיות.");
  }

  let zipBlob = null;

  if (folder) {
    // א. בדיקה האם קיים קובץ ZIP מוכן של בית האפיות
    const zipFiles = folder.getFilesByName("bakery_house_deploy.zip");
    let newestZip = null;
    while (zipFiles.hasNext()) {
      const zf = zipFiles.next();
      if (!newestZip || zf.getLastUpdated() > newestZip.getLastUpdated()) {
        newestZip = zf;
      }
    }

    if (newestZip) {
      zipBlob = newestZip.getBlob();
      Logger.log("📦 נמצא קובץ ZIP עדכני: " + newestZip.getName());
    } else {
      // ב. אריזה עצמאית של קובצי התשתית של בית האפיות מתוך התיקייה
      const targetNames = ["index.html", "style.css", "app.js", "recipes.json", "manifest.json"];
      const latestFilesByName = {};
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        const name = file.getName();
        if (targetNames.indexOf(name) !== -1) {
          if (!latestFilesByName[name] || file.getLastUpdated() > latestFilesByName[name].getLastUpdated()) {
            latestFilesByName[name] = file;
          }
        }
      }

      const blobs = [];
      for (let i = 0; i < targetNames.length; i++) {
        const fname = targetNames[i];
        if (latestFilesByName[fname]) {
          blobs.push(latestFilesByName[fname].getBlob().setName(fname));
          Logger.log("  + נארז קובץ: " + fname);
        }
      }

      if (blobs.length > 0) {
        zipBlob = Utilities.zip(blobs, "bakery_house_deploy.zip");
      }
    }
  }

  if (!zipBlob) {
    Logger.log("❌ לא נמצאו קבצים ב-Drive לפריסה אוטומטית. ניתן להשתמש בסקריפט הפריסה המקומי (deploy_to_netlify.js).");
    return;
  }

  // שליחה ישירה ל-Netlify API עבור אתר בית האפיות בלבד
  const url = "https://api.netlify.com/api/v1/sites/" + BAKERY_HOUSE_SITE_ID + "/deploys";
  const options = {
    method: "post",
    headers: {
      "Authorization": "Bearer " + NETLIFY_TOKEN,
      "Content-Type": "application/zip",
      "User-Agent": "BakeryHouseDeployer/1.0"
    },
    payload: zipBlob.getBytes(),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode === 200 || responseCode === 201) {
    Logger.log("🎉 פריסה מוצלחת! אתר 'בית האפיות' עודכן בכתובת: https://the-bakery-house-app.netlify.app");
  } else {
    Logger.log("❌ שגיאה בפריסה (קוד " + responseCode + "): " + response.getContentText());
  }
}
