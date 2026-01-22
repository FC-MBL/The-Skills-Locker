const AdmZip = require('adm-zip');
const fs = require('fs');

const zip = new AdmZip();

const manifest = `<?xml version="1.0" standalone="no" ?>
<manifest identifier="com.scorm.minimal" version="1"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 3rd Edition</schemaversion>
  </metadata>
  <organizations default="org_1">
    <organization identifier="org_1">
      <title>Minimal SCORM Title</title>
      <item identifier="item_1" identifierref="res_1">
        <title>Minimal Item</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_1" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html" />
    </resource>
  </resources>
</manifest>`;

const html = `<html>
<head><title>Minimal SCORM</title></head>
<body>
  <h1>SCORM Content Launched!</h1>
  <p>This is a test package.</p>
  <script>
    console.log("SCORM Content Loaded");
    // Mock API discovery
    window.API_1484_11 = {
        Initialize: () => "true",
        Terminate: () => "true",
        GetValue: () => "",
        SetValue: () => "true",
        Commit: () => "true",
        GetLastError: () => "0",
        GetErrorString: () => "",
        GetDiagnostic: () => ""
    };
  </script>
</body>
</html>`;

zip.addFile("imsmanifest.xml", Buffer.from(manifest, "utf8"));
zip.addFile("index.html", Buffer.from(html, "utf8"));

zip.writeZip("dummy_scorm.zip");
console.log("Created dummy_scorm.zip");
