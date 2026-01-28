const functions = require("firebase-functions");
const admin = require("firebase-admin");
const AdmZip = require("adm-zip");
const xml2js = require("xml2js");
const path = require("path");
const os = require("os");
const fs = require("fs-extra");

admin.initializeApp();

/**
 * Triggers when a file is uploaded to Storage.
 * Checks if it's a SCORM zip package and processes it.
 */
exports.processScormPackage = functions.storage.bucket("skills-locker-dev.firebasestorage.app").object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name; // e.g., scorm-packages/{courseId}/{timestamp}-{filename}
    const contentType = object.contentType;

    // 1. Validation: Check if it's a zip and in the right folder
    if (!contentType.includes("zip") && !object.name.endsWith(".zip")) {
        return console.log("Not a zip file.");
    }
    if (!filePath.startsWith("scorm-packages/")) {
        return console.log("Not in scorm-packages folder.");
    }

    const fileName = path.basename(filePath);
    const courseId = filePath.split("/")[1];
    const bucket = admin.storage().bucket(fileBucket);

    // Create a processing status doc
    const docId = filePath.replace(/\//g, "_");
    const statusRef = admin.firestore().collection("scorm_statuses").doc(docId);

    await statusRef.set({
        status: "PROCESSING",
        storagePath: filePath,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    const workingDir = path.join(os.tmpdir(), "scorm", fileName);
    const zipPath = path.join(workingDir, fileName);
    const extractPath = path.join(workingDir, "extracted");

    try {
        // 2. Download
        await fs.ensureDir(workingDir);
        await bucket.file(filePath).download({ destination: zipPath });
        console.log("Downloaded zip to:", zipPath);

        // 3. Unzip
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);
        console.log("Unzipped to:", extractPath);

        // 4. Parse Manifest
        const manifestPath = path.join(extractPath, "imsmanifest.xml");
        if (!(await fs.pathExists(manifestPath))) {
            throw new Error("imsmanifest.xml not found");
        }

        const manifestXml = await fs.readFile(manifestPath, "utf-8");
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(manifestXml);

        // 4.1 Parse Resources into a map
        const resources = result.manifest.resources[0].resource || [];
        const resourceMap = {};
        for (const r of resources) {
            if (r.$.identifier) {
                resourceMap[r.$.identifier] = r;
            }
        }

        // 4.2 Parse Organization Tree
        // SCORM Packages can have multiple organizations, we usually take the default or first.
        const organizations = result.manifest.organizations[0].organization;
        if (!organizations || organizations.length === 0) {
            throw new Error("No organization found in manifest");
        }
        const defaultOrg = organizations[0];
        const items = defaultOrg.item || [];

        const packageId = fileName.replace(".zip", "");
        const destinationPrefix = `scorm-extracted/${courseId}/${packageId}`;

        let modules = [];

        // Check if this is a single-item SCORM (needs folder-based parsing)
        if (items.length === 1 && (!items[0].item || items[0].item.length === 0)) {
            console.log("Single-item SCORM detected - using folder-based parsing");
            // Parse based on folder structure instead of manifest items
            modules = await parseFolderStructure(extractPath, packageId, destinationPrefix, fileBucket);
        } else {
            // Multi-item SCORM - use manifest-based parsing
            console.log(`Parsing ${items.length} items from manifest structure`);
            modules = parseManifestItems(items, packageId, destinationPrefix, fileBucket, resourceMap, filePath);
        }

        console.log(`Parsed ${modules.length} modules from structure.`);


        // 5. Upload Extracted Files
        const uploadPromises = [];
        const files = await getFilesRecursive(extractPath);

        for (const file of files) {
            const relativePath = path.relative(extractPath, file);
            const destination = path.join(destinationPrefix, relativePath).replace(/\\/g, "/");

            uploadPromises.push(
                bucket.upload(file, {
                    destination: destination,
                    metadata: {
                        cacheControl: 'public, max-age=31536000',
                    }
                })
            );
        }

        await Promise.all(uploadPromises);
        console.log("Uploaded extracted files to:", destinationPrefix);

        // 6. Update Status
        await statusRef.update({
            status: "READY",
            courseStructure: modules, // Helper for frontend to import
            packageId: packageId
        });

    } catch (error) {
        console.error("Error processing SCORM:", error);
        await statusRef.update({
            status: "ERROR",
            error: error.message
        });
    } finally {
        // Cleanup temp
        await fs.remove(workingDir);
    }
});

async function getFilesRecursive(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFilesRecursive(res) : res;
    }));
    return Array.prototype.concat(...files);
}

/**
 * Parse SCORM package based on folder structure (for single-item packages)
 */
async function parseFolderStructure(extractPath, packageId, destinationPrefix, fileBucket) {
    const modules = [];

    // Get top-level folders (excluding common shared/manifest files)
    const files = await fs.readdir(extractPath, { withFileTypes: true });
    const folders = files.filter(f => f.isDirectory() && !f.name.startsWith('.') && f.name !== 'shared');

    console.log(`Found ${folders.length} folders for module creation: ${folders.map(f => f.name).join(', ')}`);

    for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        const folderPath = path.join(extractPath, folder.name);

        // Create module from folder name
        const module = {
            id: `m-${Math.random().toString(36).substr(2, 9)}`,
            title: folder.name.replace(/([A-Z])/g, ' $1').trim(), // "Etiquette" or "HavingFun" -> "Having Fun"
            order: i,
            lessons: []
        };

        // Find HTML files in folder to create lessons
        const folderFiles = await fs.readdir(folderPath);
        const htmlFiles = folderFiles.filter(f => f.toLowerCase().endsWith('.html'));

        console.log(`  ${folder.name}: Found ${htmlFiles.length} HTML files`);

        htmlFiles.forEach((htmlFile, idx) => {
            const launchUrl = `https://storage.googleapis.com/${fileBucket}/${destinationPrefix}/${folder.name}/${htmlFile}`;

            module.lessons.push({
                id: `l-${Math.random().toString(36).substr(2, 9)}`,
                title: htmlFile.replace('.html', '').replace(/([A-Z])/g, ' $1').trim(),
                order: idx,
                blocks: [{
                    id: `b-${Math.random().toString(36).substr(2, 9)}`,
                    type: "HTML_VIEWER",
                    content: htmlFile.replace('.html', ''),
                    launchUrl: launchUrl,
                    order: 0
                }]
            });
        });

        if (module.lessons.length > 0) {
            modules.push(module);
        }
    }

    return modules;
}

/**
 * Parse SCORM package based on manifest items (for multi-item packages)
 */
function parseManifestItems(items, packageId, destinationPrefix, fileBucket, resourceMap, filePath) {
    const modules = [];

    // Helper to find launch file for a resource
    const getLaunchFile = (resourceId) => {
        const res = resourceMap[resourceId];
        if (res && res.$.href) return res.$.href;
        return null;
    };

    // Helper to Generate Block
    const createScormBlock = (title, resourceId) => {
        const href = getLaunchFile(resourceId);

        return {
            id: `b-${Math.random().toString(36).substr(2, 9)}`,
            type: "SCORM",
            content: title,
            scormMetadata: {
                status: "READY",
                packageId: packageId,
                storagePath: filePath,
                launchPath: href ? `${destinationPrefix}/${href}` : null,
                launchUrl: href ? `https://storage.googleapis.com/${fileBucket}/${destinationPrefix}/${href}` : null
            },
            order: 0
        };
    };

    // Process Top Level Items (Modules)
    let moduleOrder = 0;
    for (const item of items) {
        const moduleTitle = item.title?.[0] || "Untitled Module";
        const module = {
            id: `m-${Math.random().toString(36).substr(2, 9)}`,
            title: moduleTitle,
            order: moduleOrder++,
            lessons: []
        };

        // Process Level 2 Items (Lessons)
        const lessonItems = item.item || [];
        let lessonOrder = 0;

        // If the module item itself references a resource, it's a "One Lesson Module"
        if (item.$.identifierref) {
            const lesson = {
                id: `l-${Math.random().toString(36).substr(2, 9)}`,
                title: moduleTitle,
                order: 0,
                blocks: [createScormBlock(moduleTitle, item.$.identifierref)]
            };
            module.lessons.push(lesson);
        } else if (lessonItems.length > 0) {
            // It has children, those are lessons
            for (const lItem of lessonItems) {
                const lessonTitle = lItem.title?.[0] || "Untitled Lesson";
                const lesson = {
                    id: `l-${Math.random().toString(36).substr(2, 9)}`,
                    title: lessonTitle,
                    order: lessonOrder++,
                    blocks: []
                };

                // If lesson has a resource, add it as a block
                if (lItem.$.identifierref) {
                    lesson.blocks.push(createScormBlock(lessonTitle, lItem.$.identifierref));
                }

                // If lesson has children, add them as blocks
                if (lItem.item) {
                    let blockOrder = lesson.blocks.length;
                    for (const bItem of lItem.item) {
                        if (bItem.$.identifierref) {
                            const block = createScormBlock(bItem.title?.[0] || "Untitled Part", bItem.$.identifierref);
                            block.order = blockOrder++;
                            lesson.blocks.push(block);
                        }
                    }
                }

                module.lessons.push(lesson);
            }
        }

        modules.push(module);
    }

    return modules;
}

/**
 * HTTP Callable Function: Export Course
 * Receives course data, packages it with assets into a ZIP, returns download URL.
 */
exports.exportCourse = functions.https.onCall(async (data, context) => {
    // Auth check (optional for now, but recommended)
    // if (!context.auth) {
    //     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    // }

    const { courseId, courseData } = data;

    if (!courseId || !courseData) {
        throw new functions.https.HttpsError('invalid-argument', 'courseId and courseData are required');
    }

    const workingDir = path.join(os.tmpdir(), "course-export", courseId);
    const assetsDir = path.join(workingDir, "assets");
    const zipPath = path.join(os.tmpdir(), `${courseId}.zip`);

    try {
        await fs.ensureDir(assetsDir);

        // Write course.json
        await fs.writeFile(
            path.join(workingDir, "course.json"),
            JSON.stringify(courseData, null, 2),
            "utf-8"
        );

        // TODO: Download referenced assets from Storage
        // For MVP, we'll skip asset download and just package the JSON
        // In full implementation, parse courseData for asset URLs and download them

        // Create ZIP
        const zip = new AdmZip();
        zip.addLocalFolder(workingDir);
        zip.writeZip(zipPath);

        // Upload ZIP to Storage
        const bucket = admin.storage().bucket();
        const destination = `course-exports/${courseId}/${Date.now()}-${courseData.metadata.title.replace(/\s/g, '-')}.zip`;
        await bucket.upload(zipPath, {
            destination,
            metadata: {
                contentType: 'application/zip',
            }
        });

        // Generate signed URL
        const [url] = await bucket.file(destination).getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });

        return { downloadUrl: url };

    } catch (error) {
        console.error("Export error:", error);
        throw new functions.https.HttpsError('internal', error.message);
    } finally {
        await fs.remove(workingDir);
        await fs.remove(zipPath);
    }
});

/**
 * Storage Trigger: Process Course Import
 * Triggers when a course ZIP is uploaded to course-imports/
 */
exports.processCourseImport = functions.storage.bucket("skills-locker-dev.firebasestorage.app").object().onFinalize(async (object) => {
    const filePath = object.name;

    // Only process files in course-imports/
    if (!filePath.startsWith("course-imports/")) {
        return console.log("Not a course import.");
    }

    const fileName = path.basename(filePath);
    const importId = filePath.split("/")[1]; // Unique ID for this import
    const fileBucket = object.bucket;
    const bucket = admin.storage().bucket(fileBucket);

    const statusRef = admin.firestore().collection("course_import_status").doc(importId);

    await statusRef.set({
        status: "PROCESSING",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    const workingDir = path.join(os.tmpdir(), "course-import", importId);
    const zipPath = path.join(workingDir, fileName);
    const extractPath = path.join(workingDir, "extracted");

    try {
        // Download and extract
        await fs.ensureDir(workingDir);
        await bucket.file(filePath).download({ destination: zipPath });

        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Read course.json
        const courseJsonPath = path.join(extractPath, "course.json");
        if (!(await fs.pathExists(courseJsonPath))) {
            throw new Error("course.json not found in ZIP");
        }

        const courseData = JSON.parse(await fs.readFile(courseJsonPath, "utf-8"));

        // Create new course ID
        const newCourseId = `course_${Date.now()}`;

        // TODO: Upload assets to permanent storage and update references
        // For MVP, we'll just create the course document with the data as-is

        // Create course in Firestore
        await admin.firestore().collection("courses").doc(newCourseId).set({
            ...courseData.metadata,
            modules: courseData.modules,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: "imported",
            status: "draft"
        });

        await statusRef.update({
            status: "READY",
            courseId: newCourseId
        });

        console.log(`Course imported successfully: ${newCourseId}`);

    } catch (error) {
        console.error("Import error:", error);
        await statusRef.update({
            status: "ERROR",
            error: error.message
        });
    } finally {
        await fs.remove(workingDir);
    }
});
