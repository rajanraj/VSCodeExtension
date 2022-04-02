/***  VS Code Extension to save file changes in SF Org ***/
// The module 'vscode' contains the VS Code extensibility API
//FusionApp
const is = require("sharp/lib/is");
const vscode = require("vscode");
/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
  const fs = require("fs");
  let XMLHttpRequest = require("xhr2");
  let pjson;
  let x = new XMLHttpRequest();
  let wf;
  let componentName;
  let parentrecordId;
  let accsToken;
  let isFile;
  let gitConnect;
  let head;
  let dupeRes;
  let localRepopath;
  let today;
  let date;
  let time;
  let lmdateTime;
  let nameOfComponent;
  let recordID;
  let reId;
  let parentResStatus;
  let gitLocalRepoPath;
  let gitUrl;
  let gitRepoURL;
  let repoName;
  let gitBranchName;
  let repoBranchName;
  let projectDir;
  // To get Access token
  let getaccToken = vscode.commands.registerCommand(
    "sync-sf-org.accstoken",
    function () {
      projectDir = vscode.workspace.workspaceFolders[0].uri.path; // getting working project directory absolute path.
      var os = require("os");
      let osName = os.platform();
      //if not macos will get in
      if (osName !== "darwin") {
        projectDir = projectDir.substring(projectDir.indexOf("/") + 1); // Removing  window absolute path first slash
      }
      let configFile = fs.existsSync(projectDir + "/config.json"); //checking config.json file there in the project or not
      if (!configFile) {
        // if config.json file not  exists will create the file.
        let orgInfo = {
          connectToOrg: {
            clientId: "give your org client ID here",
            clientSecret: "give your org client secrete here",
            redirectURL: "give your org connected app call back URL here",
            password: "give your org password here",
            username: "give your org username here",
            posturl: "give your org component RestApi endpoint here",
            childUrl: "give your org subcomponent RestApi endpoint here",
          },
        };
        var orgInfoAsJSON = JSON.stringify(orgInfo);
        fs.writeFile(
          projectDir + "/config.json",
          orgInfoAsJSON,
          function (err) {
            if (err) {
              vscode.window.showErrorMessage("unable to create file");
            } else {
              vscode.window.showInformationMessage(
                '"config.json" file created please update it to connect with your Org'
              );
            }
          }
        );
      }
      // Getting access token to connect with Fusion Org
      pjson = require(projectDir + "/config.json");
      x.open(
        "POST",
        "https://login.salesforce.com/services/oauth2/token?client_id=" +
          pjson.connectToOrg.clientId +
          "&client_secret=" +
          pjson.connectToOrg.clientSecret +
          "&redirect_uri=" +
          pjson.connectToOrg.redirectURL +
          "&password=" +
          pjson.connectToOrg.password +
          "&username=" +
          pjson.connectToOrg.username +
          "&grant_type=password",
        true
      );
      x.setRequestHeader("Content-Type", "application/json");
      x.onload = function () {
        let authToken = JSON.parse(this.response);
        accsToken = authToken.access_token;
        if (this.status == "200") {
          vscode.window.showInformationMessage(
            "Successfully Authorized with fusion Org"
          );
        } else {
          vscode.window.showErrorMessage("Unable to connect with Fusion Org");
        }
      };
      x.send(null);
      // }
      context.subscriptions.push(getaccToken);
    }
  );
  //To send component details to Fusion org
  let createFile = vscode.commands.registerCommand(
    "sync-sf-org.fileInfo",
    async (folder) => {
      if (accsToken == undefined) {
        vscode.window.showWarningMessage(
          "Please Run 'Connect with Fusion Org' command "
        );
      } else {
        let dir;
        //let workingdirr = vscode.workspace.workspaceFolders[0].uri.path;
        //Getting selected file/folder path
        await vscode.commands.executeCommand("copyFilePath");
        folder = await vscode.env.clipboard.readText(); // returns a string
        fs.readdir(projectDir, (err, file) => {
          // `file` is an array of file paths
          //converting arry to string
          dir = file + "";
          //});
          //validating the converted string have salesforce file structure  or not
          if (
            dir.includes(
              ".sfdx" &&
                "force-app/main/default" &&
                "manifest/package.xml" &&
                "sfdx-project.json"
            )
          ) {
            today = new Date();
            date =
              today.getFullYear() +
              "-" +
              (today.getMonth() + 1) +
              "-" +
              today.getDate();
            time =
              today.getHours() +
              ":" +
              today.getMinutes() +
              ":" +
              today.getSeconds();
            lmdateTime = date + " " + time;
            //Checking selected folder component type
            if (folder.includes("aura")) {
              componentName = "Aura Component";
            } else if (folder.includes("classes")) {
              componentName = "Apex Class";
            } else if (folder.includes("lwc")) {
              componentName = "LWC components";
            } else if (folder.includes("pages")) {
              componentName = "Pages";
            } else if (folder.includes("staticresources")) {
              componentName = "staticresources";
            } else if (folder.includes("triggers")) {
              componentName = "Triggers";
            } else if (folder.includes("applications")) {
              componentName = "Applications";
            } else if (folder.includes("components")) {
              componentName = "components";
            } else if (folder.includes("contentassets")) {
              componentName = "contentassets";
            } else if (folder.includes("flexipages")) {
              componentName = "flexipages";
            } else if (folder.includes("layouts")) {
              componentName = "layouts";
            } else if (folder.includes("topicsForObjects")) {
              componentName = "topicsForObjects";
            } else if (folder.includes("objects")) {
              componentName = "objects";
            } else if (folder.includes("permissionsets")) {
              componentName = "permissionsets";
            } else if (folder.includes("tabs")) {
              componentName = "tabs";
            } else if (folder.includes("testSuites")) {
              componentName = "testSuites";
            } else if (folder.includes("apex")) {
              componentName = "Apex Script file";
            } else if (folder.includes("soql")) {
              componentName = "SOQL Script file";
            } else if (folder.includes("contentassets")) {
              componentName = "ContentAsset";
            } else if (folder.includes("flowDefinitions")) {
              componentName = "flowDefinitions";
            } else if (folder.includes("flows")) {
              componentName = "Flow";
            } else if (folder.includes("namedCredentials")) {
              componentName = "namedCredentials";
            } else if (folder.includes("networkBranding")) {
              componentName = "networkBranding";
            } else if (folder.includes("notificationtypes")) {
              componentName = "notificationtypes";
            } else if (folder.includes("objectTranslations")) {
              componentName = "objectTranslations";
            } else if (folder.includes("pathAssistants")) {
              componentName = "pathAssistants";
            } else if (folder.includes("profiles")) {
              componentName = "ProfileSessionSetting";
            } else if (folder.includes("quickActions")) {
              componentName = "quickActions";
            } else if (folder.includes("lightningExperienceThemes")) {
              componentName = "lightningExperienceThemes";
            } else if (folder.includes("remoteSiteSettings")) {
              componentName = "RemoteSiteSetting";
            } else if (folder.includes("email")) {
              componentName = "email";
            } else if (folder.includes("reportTypes")) {
              componentName = "reportTypes";
            } else if (folder.includes("roles")) {
              componentName = "roles";
            } else if (folder.includes("sharingRules")) {
              componentName = "sharingRules";
            } else if (folder.includes("unfiled$public")) {
              componentName = "reports";
            } else if (folder.includes("sites")) {
              componentName = "sites";
            } else if (folder.includes("messageChannels")) {
              componentName = "messageChannels";
            } else if (folder.includes("cleanDataServices")) {
              componentName = "cleanDataServices";
            } else if (folder.includes("queues")) {
              componentName = "queues";
            } else if (folder.includes("workflows")) {
              componentName = "workflows";
            } else if (folder.includes("autoResponseRules")) {
              componentName = "autoResponseRules";
            } else if (folder.includes("assignmentRules")) {
              componentName = "assignmentRules";
            } else if (folder.includes("certs")) {
              componentName = "certs";
            } else if (folder.includes("groups")) {
              componentName = "groups";
            } else if (folder.includes("globalValueSets")) {
              componentName = "globalValueSets";
            } else if (folder.includes("installedPackages")) {
              componentName = "installedPackages";
            } else if (folder.includes("duplicateRule")) {
              componentName = "duplicateRule";
            } else if (folder.includes("homePageLayouts")) {
              componentName = "homePageLayouts";
            } else if (folder.includes("brandingSets")) {
              componentName = "brandingSets";
            } else if (folder.includes("labels")) {
              componentName = "Labels";
            } else {
              componentName = "others";
            }
            //Promise to check the project directory connected with Git or not
            /* var x = new Promise((resolve, reject) => {
          const gitExtension =
            vscode.extensions.getExtension("vscode.git").exports;
          const api = gitExtension.getAPI(1);
          const repo = api.repositories[0];
          head = repo.state.HEAD;
          });
          x.then(
          function () {},
          function () {
            gitConnect = true;
            vscode.window.showWarningMessage("Project not connected with Git");
          }
          ); */
            //If connected with Git will get in
            // if (!gitConnect) {
            let changedFile;
            let dirName;
            gitLocalRepoPath = vscode.workspace.workspaceFolders[0].uri.path;
            //getting OS details
            var os = require("os");
            let osName = os.platform();
            //if not macos will get in
            if (osName !== "darwin") {
              let splittedString = gitLocalRepoPath.split("/");
              dirName = splittedString[1];
              gitLocalRepoPath = gitLocalRepoPath.split(":").pop();
              repoName = splittedString[splittedString.length - 1];
              changedFile = folder.split(repoName).pop();
              changedFile = changedFile.split(".").slice(0, -1).join(".");
              //vscode.window.showWarningMessage('win32:'+changedFile);
              gitBranchName =
                dirName +
                "&&" +
                "cd " +
                gitLocalRepoPath +
                "&&git rev-parse --abbrev-ref HEAD";
              gitUrl =
                dirName +
                "&&" +
                "cd " +
                gitLocalRepoPath +
                "&&git config --get remote.origin.url";
            } else {
              const splittedString = gitLocalRepoPath.split("/");
              repoName = splittedString[splittedString.length - 1];
              changedFile = folder.split(repoName).pop();
              changedFile = changedFile.split(".").slice(0, -1).join(".");
              gitBranchName =
                "cd " + gitLocalRepoPath + "&&git rev-parse --abbrev-ref HEAD";
              gitUrl =
                "cd " +
                gitLocalRepoPath +
                "&&git config --get remote.origin.url";
            }
            try {
              const exec = require("child_process").execSync;
              gitRepoURL = exec(gitUrl, { encoding: "utf-8" });
              gitRepoURL = gitRepoURL.split(".").slice(0, -1).join(".");
              repoBranchName = exec(gitBranchName, { encoding: "utf-8" });
            } catch (err) {
              vscode.window.showWarningMessage(err);
            }
            const { exec } = require("child_process");
            const headName = gitBranchName;

            const execRun = (cmd) => {
              return new Promise((resolve, reject) => {
                exec(cmd, (error, stdout, stderr) => {
                  if (error) {
                    if (error.code === 1) {
                      // leaks present
                      resolve(stdout);
                    } else {
                      // gitleaks error
                      reject(error);
                    }
                  } else {
                    // no leaks
                    resolve(stdout);
                  }
                });
              });
            };

            (async () => {
              try {
                const repoHeadName = await execRun(headName);
              } catch (e) {
                vscode.window.showErrorMessage(
                  "Project not connected with Git,Please connect with Git and try"
                );
                console.log(e);
              }
            })();
            //if (gitConnect) {
            if (osName !== "darwin") {
              changedFile = changedFile.replace(/\\/g, "/");
              localRepopath = gitRepoURL + changedFile;
            } else {
              localRepopath = gitRepoURL + changedFile;
            }
            var stats = fs.statSync(folder);
            isFile = stats.isFile();
            nameOfComponent = folder.replace(/^.*[\\\/]/, "");
            // if selected item is folder and LWC Or Objects  will get in
            if (
              isFile == false &&
              (folder.includes("objectTranslations") ||
                folder.includes("lwc") ||
                folder.includes("aura"))
            ) {
              let subCopmDupe;
              changedFile = folder.split(repoName).pop();
              if (osName !== "darwin") {
                changedFile = changedFile.replace(/\\/g, "/");
                localRepopath = gitRepoURL + changedFile;
              } else {
                localRepopath = gitRepoURL + changedFile;
              }
              //localRepopath = gitRepoURL + changedFile;
              // changedFile = changedFile.split(".")
              var x = new XMLHttpRequest();
              x.open("POST", pjson.connectToOrg.posturl, true);
              x.setRequestHeader("Authorization", "Bearer " + accsToken);
              x.setRequestHeader("Content-Type", "application/json");
              x.send(
                JSON.stringify({
                  Name: nameOfComponent,
                  API_Name__c: componentName,
                  Last_Modified_Date__c: lmdateTime,
                  Component_Type__c: componentName,
                  Git_Branch__c: repoBranchName,
                  Component_Path__c: localRepopath,
                })
              );
              x.onload = function () {
                console.log(this.response);
                recordID = JSON.parse(this.response);
                try {
                  dupeRes = recordID[0].message;
                  dupeRes = dupeRes.split("id:").pop();
                  dupeRes = dupeRes.trim();
                  if (dupeRes !== undefined) {
                    var x = new XMLHttpRequest();
                    x.open(
                      "PATCH",
                      pjson.connectToOrg.posturl + "/" + dupeRes,
                      true
                    );
                    x.setRequestHeader("Authorization", "Bearer " + accsToken);
                    x.setRequestHeader("Content-Type", "application/json");
                    x.send(
                      JSON.stringify({
                        Name: nameOfComponent,
                        API_Name__c: componentName,
                        Last_Modified_Date__c: lmdateTime,
                        Component_Type__c: componentName,
                        Git_Branch__c: repoBranchName,
                      })
                    );
                    x.onload = function () {
                      console.log(this.response);
                      fs.readdir(folder, (err, file) => {
                        for (let i = 0; i < file.length; i++) {
                          let componentFileNames = file[i];
                          var x = new XMLHttpRequest();
                          x.open("POST", pjson.connectToOrg.childUrl, true);
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              Name: componentFileNames,
                              Component__c: dupeRes,
                              Sub_Component_Type__c: componentName,
                              Git_Branch__c: repoBranchName,
                              SubComponentName__c: componentFileNames,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                            recordID = JSON.parse(this.response);
                            try {
                              dupeRes = recordID[0].message;
                              dupeRes = dupeRes.split("id:").pop();
                              dupeRes = dupeRes.trim();
                              if (dupeRes !== undefined) {
                                var x = new XMLHttpRequest();
                                x.open(
                                  "PATCH",
                                  pjson.connectToOrg.childUrl + "/" + dupeRes,
                                  true
                                );
                                x.setRequestHeader(
                                  "Authorization",
                                  "Bearer " + accsToken
                                );
                                x.setRequestHeader(
                                  "Content-Type",
                                  "application/json"
                                );
                                x.send(
                                  JSON.stringify({
                                    Name: componentFileNames,
                                    Sub_Component_Type__c: componentName,
                                    Git_Branch__c: repoBranchName,
                                  })
                                );
                                x.onload = function () {
                                  console.log(this.response);
                                  let lwcLength = file.length - 1;
                                  if (lwcLength == i) {
                                    if (this.status == "204") {
                                      vscode.window.showInformationMessage(
                                        "Successfully records updated in RangerFusion App"
                                      );
                                    } else {
                                      vscode.window.showErrorMessage(
                                        "Unable to create/update Record in RangerFusion App"
                                      );
                                    }
                                  }
                                };
                              }
                            } catch (err) {
                              vscode.window.showErrorMessage(err);
                            }
                          };
                        }
                      });
                    };
                  }
                } catch (err) {
                  vscode.window.showErrorMessage(err);
                }
                reId = recordID.id;
                parentResStatus = recordID.success;
                //Getting selcted folder files
                if (parentResStatus) {
                  fs.readdir(folder, (err, file) => {
                    for (let i = 0; i < file.length; i++) {
                      let componentFileNames = file[i];
                      var x = new XMLHttpRequest();
                      x.open("POST", pjson.connectToOrg.childUrl, true);
                      x.setRequestHeader(
                        "Authorization",
                        "Bearer " + accsToken
                      );
                      x.setRequestHeader("Content-Type", "application/json");
                      x.send(
                        JSON.stringify({
                          Name: componentFileNames,
                          Component__c: reId,
                          Sub_Component_Type__c: componentName,
                          Git_Branch__c: repoBranchName,
                          SubComponentName__c: componentFileNames,
                        })
                      );
                      x.onload = function () {
                        console.log(this.response);
                        let lwcLength = file.length - 1;
                        if (lwcLength == i) {
                          if (this.status == "201") {
                            vscode.window.showInformationMessage(
                              "Successfully records created in RangerFusion App"
                            );
                          }
                        }
                        recordID = JSON.parse(this.response);
                        subCopmDupe = recordID.success;
                      };
                    }
                  });
                }
              };
            } else if (
              isFile == false &&
              (folder.includes("classes") ||
                folder.includes("triggers") ||
                folder.includes("contentassets") ||
                folder.includes("pages") ||
                folder.includes("networkBranding") ||
                folder.includes("certs") ||
                folder.includes("siteDotComSites") ||
                folder.includes("components"))
            ) {
              // if selected item is folder and not LWC Or Objects will get in
              let compFilename = new Array();
              let compId = new Array();
              let updateRecord;
              fs.readdir(folder, (err, file) => {
                for (let i = 0; i < file.length; i++) {
                  let repoappend = folder + "/" + file[i];
                  changedFile = repoappend.split(repoName).pop();
                  changedFile = changedFile.split(".").slice(0, -1).join(".");
                  if (osName !== "darwin") {
                    changedFile = changedFile.replace(/\\/g, "/");
                    localRepopath = gitRepoURL + changedFile;
                  } else {
                    localRepopath = gitRepoURL + changedFile;
                  }
                  //localRepopath = gitRepoURL + changedFile;
                  let fileName = file[i].replace(/^.*[\\\/]/, "");
                  //filtering component and sub-components i.e files and its meta.xml file
                  if (!fileName.includes("-meta.xml")) {
                    compFilename[i] = fileName;
                    var x = new XMLHttpRequest();
                    x.open("POST", pjson.connectToOrg.posturl, true);
                    x.setRequestHeader("Authorization", "Bearer " + accsToken);
                    x.setRequestHeader("Content-Type", "application/json");
                    x.send(
                      JSON.stringify({
                        Name: fileName.split(".").slice(0, -1).join("."),
                        API_Name__c: componentName,
                        Full_Name_with_extension__c: fileName,
                        Last_Modified_Date__c: lmdateTime,
                        Component_Type__c: componentName,
                        Git_Branch__c: repoBranchName,
                        Component_Path__c: localRepopath,
                      })
                    );
                    x.onload = function () {
                      console.log(this.response);
                      recordID = JSON.parse(this.response);
                      try {
                        dupeRes = recordID[0].message;
                        dupeRes = dupeRes.split("id:").pop();
                        dupeRes = dupeRes.trim();
                        if (dupeRes !== undefined) {
                          var x = new XMLHttpRequest();
                          x.open(
                            "PATCH",
                            pjson.connectToOrg.posturl + "/" + dupeRes,
                            true
                          );
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              API_Name__c: componentName,
                              Full_Name_with_extension__c: fileName,
                              Last_Modified_Date__c: lmdateTime,
                              Component_Type__c: componentName,
                              Git_Branch__c: repoBranchName,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                          };
                          updateRecord = true;
                        }
                      } catch (err) {
                        vscode.window.showErrorMessage(err);
                      }
                      reId = recordID.id;
                      parentResStatus = recordID.success;
                      compId[i] = reId;
                      var x = new XMLHttpRequest();
                      x.open("POST", pjson.connectToOrg.childUrl, true);
                      x.setRequestHeader(
                        "Authorization",
                        "Bearer " + accsToken
                      );
                      x.setRequestHeader("Content-Type", "application/json");
                      x.send(
                        JSON.stringify({
                          Name: fileName + "-meta.xml",
                          Component__c: reId,
                          Sub_Component_Type__c: componentName,
                          Git_Branch__c: repoBranchName,
                          SubComponentName__c: fileName + "-meta.xml",
                        })
                      );
                      x.onload = function () {
                        console.log(this.response);
                        let respn = JSON.parse(this.response);
                        let childResponseStatus = respn.success;
                        if (
                          (parentResStatus && childResponseStatus) ||
                          updateRecord
                        ) {
                          vscode.window.showInformationMessage(
                            "Successfully records created in RangerFusion App"
                          );
                        } else {
                          vscode.window.showErrorMessage(
                            "Unable to create Record in RangerFusion App"
                          );
                        }
                      };
                    };
                  }
                }
              });
            } else if (isFile == false && folder.includes("flowDefinitions")) {
              vscode.window.showWarningMessage(
                "FlowDefinations can not be send ! Please send Flows only"
              );
            } else if (isFile == false && folder.includes("flows")) {
              // if selected item is folder and not LWC Or Objects will get in
              let isFlow = folder.replace(/^.*[\\\/]/, "");
              if (isFlow == "flows") {
                let updateRecord;
                let compFilename = new Array();
                let compId = new Array();
                fs.readdir(folder, (err, file) => {
                  for (let i = 0; i < file.length; i++) {
                    let repoappend = folder + "/" + file[i];
                    changedFile = repoappend.split(repoName).pop();
                    changedFile = changedFile.split(".").slice(0, -1).join(".");
                    if (osName !== "darwin") {
                      changedFile = changedFile.replace(/\\/g, "/");
                      localRepopath = gitRepoURL + changedFile;
                    } else {
                      localRepopath = gitRepoURL + changedFile;
                    }
                    //localRepopath = gitRepoURL + changedFile;
                    let fileName = file[i].replace(/^.*[\\\/]/, "");
                    compFilename[i] = fileName;
                    let flowDef = compFilename[i].split("-meta.xml")[0];
                    var x = new XMLHttpRequest();
                    x.open("POST", pjson.connectToOrg.posturl, true);
                    x.setRequestHeader("Authorization", "Bearer " + accsToken);
                    x.setRequestHeader("Content-Type", "application/json");
                    x.send(
                      JSON.stringify({
                        Name: fileName.split(".").slice(0, -1).join("."),
                        API_Name__c: componentName,
                        Full_Name_with_extension__c: fileName,
                        Last_Modified_Date__c: lmdateTime,
                        Component_Type__c: componentName,
                        Git_Branch__c: repoBranchName,
                        Component_Path__c: localRepopath,
                      })
                    );
                    x.onload = function () {
                      console.log(this.response);
                      let flowLength = file.length - 1;
                      if (flowLength == i) {
                        if (this.status == "201") {
                          vscode.window.showInformationMessage(
                            "Successfully records created in RangerFusion App"
                          );
                        }
                      }
                      recordID = JSON.parse(this.response);
                      try {
                        dupeRes = recordID[0].message;
                        dupeRes = dupeRes.split("id:").pop();
                        dupeRes = dupeRes.trim();
                        if (dupeRes !== undefined) {
                          var x = new XMLHttpRequest();
                          x.open(
                            "PATCH",
                            pjson.connectToOrg.posturl + "/" + dupeRes,
                            true
                          );
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              API_Name__c: componentName,
                              Full_Name_with_extension__c: fileName,
                              Last_Modified_Date__c: lmdateTime,
                              Component_Type__c: componentName,
                              Git_Branch__c: repoBranchName,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                            let flowLength = file.length - 1;
                            if (flowLength == i) {
                              if (this.status == "204") {
                                vscode.window.showInformationMessage(
                                  "Successfully records updated in RangerFusion App"
                                );
                              } else {
                                vscode.window.showErrorMessage(
                                  "unable to create/update records in RangerFusion App"
                                );
                              }
                            }
                          };
                          updateRecord = true;
                        }
                      } catch (err) {
                        vscode.window.showErrorMessage(err);
                      }
                      reId = recordID.id;
                      parentResStatus = recordID.success;
                      compId[i] = reId;
                      var x = new XMLHttpRequest();
                      x.open("POST", pjson.connectToOrg.childUrl, true);
                      x.setRequestHeader(
                        "Authorization",
                        "Bearer " + accsToken
                      );
                      x.setRequestHeader("Content-Type", "application/json");
                      x.send(
                        JSON.stringify({
                          Name: flowDef + "Defination-meta.xml",
                          Component__c: reId,
                          Sub_Component_Type__c: componentName,
                          Git_Branch__c: repoBranchName,
                          SubComponentName__c: flowDef + "Defination-meta.xml",
                        })
                      );
                      x.onload = function () {
                        console.log(this.response);
                        let respn = JSON.parse(this.response);
                        let childResponseStatus = respn.success;
                      };
                    };
                  }
                });
              }
            } else if (isFile && folder.includes("flows")) {
              let flowname = folder.split("/");
              if (flowname[flowname.length - 2] == "flows") {
                let subCopmDupe;
                let componentFileName = folder.replace(/^.*[\\\/]/, "");
                let flowDef = componentFileName.split("-meta.xml")[0];
                var x = new XMLHttpRequest();
                x.open("POST", pjson.connectToOrg.posturl, true);
                x.setRequestHeader("Authorization", "Bearer " + accsToken);
                x.setRequestHeader("Content-Type", "application/json");
                x.send(
                  JSON.stringify({
                    Name: componentFileName.split(".").slice(0, -1).join("."),
                    API_Name__c: componentName,
                    Full_Name_with_extension__c: componentFileName,
                    Last_Modified_Date__c: lmdateTime,
                    Component_Type__c: componentName,
                    Git_Branch__c: repoBranchName,
                    Component_Path__c: localRepopath,
                  })
                );
                x.onload = function () {
                  console.log(this.response);
                  if (this.status == "201") {
                    vscode.window.showInformationMessage(
                      "Successfully record created in RangerFusion App"
                    );
                  }
                  recordID = JSON.parse(this.response);
                  try {
                    dupeRes = recordID[0].message;
                    dupeRes = dupeRes.split("id:").pop();
                    dupeRes = dupeRes.trim();
                    if (dupeRes !== undefined) {
                      var x = new XMLHttpRequest();
                      x.open(
                        "PATCH",
                        pjson.connectToOrg.posturl + "/" + dupeRes,
                        true
                      );
                      x.setRequestHeader(
                        "Authorization",
                        "Bearer " + accsToken
                      );
                      x.setRequestHeader("Content-Type", "application/json");
                      x.send(
                        JSON.stringify({
                          Name: componentFileName
                            .split(".")
                            .slice(0, -1)
                            .join("."),
                          API_Name__c: componentName,
                          Full_Name_with_extension__c: componentFileName,
                          Last_Modified_Date__c: lmdateTime,
                          Component_Type__c: componentName,
                          Git_Branch__c: repoBranchName,
                        })
                      );
                      x.onload = function () {
                        if (this.status == "204") {
                          vscode.window.showInformationMessage(
                            "Successfully record updated in RangerFusion App"
                          );
                        } else {
                          vscode.window.showErrorMessage(
                            "unable to create/updated record in RangerFusion App"
                          );
                        }
                        console.log(this.response);
                      };
                      subCopmDupe = true;
                    }
                  } catch (err) {
                    vscode.window.showErrorMessage(err);
                  }
                  reId = recordID.id;
                  parentResStatus = recordID.success;
                  // compId[i] = reId;
                  var x = new XMLHttpRequest();
                  x.open("POST", pjson.connectToOrg.childUrl, true);
                  x.setRequestHeader("Authorization", "Bearer " + accsToken);
                  x.setRequestHeader("Content-Type", "application/json");
                  x.send(
                    JSON.stringify({
                      Name: flowDef + "Defination-meta.xml",
                      Component__c: reId,
                      Sub_Component_Type__c: componentName,
                      Git_Branch__c: repoBranchName,
                    })
                  );
                  x.onload = function () {
                    console.log(this.response);
                    let respn = JSON.parse(this.response);
                    let childResponseStatus = respn.success;
                  };
                };
              }
            }
            if (
              (isFile == false || isFile == true) &&
              (folder.includes("labels") ||
                folder.includes("namedCredentials") ||
                folder.includes("notificationtypes") ||
                folder.includes("pathAssistants") ||
                folder.includes("permissionsets") ||
                folder.includes("profiles") ||
                folder.includes("queues") ||
                folder.includes("quickActions") ||
                folder.includes("remoteSiteSettings") ||
                folder.includes("reports") ||
                folder.includes("reportTypes") ||
                folder.includes("roles") ||
                folder.includes("sharingRules") ||
                folder.includes("sites") ||
                folder.includes("messageChannels") ||
                folder.includes("cleanDataServices") ||
                folder.includes("applications") ||
                folder.includes("assignmentRules") ||
                folder.includes("autoResponseRules") ||
                folder.includes("brandingSets") ||
                folder.includes("cleanDataServices") ||
                folder.includes("duplicateRules") ||
                folder.includes("globalValueSets") ||
                folder.includes("groups") ||
                folder.includes("homePageLayouts") ||
                folder.includes("installedPackages") ||
                folder.includes("lightningExperienceThemes") ||
                folder.includes("pathAssistants") ||
                folder.includes("flexipages") ||
                folder.includes("layouts"))
            ) {
              let patchRes;
              let fileLength;
              if (isFile == false) {
                let compFilename = new Array();
                let compId = new Array();
                fs.readdir(folder, (err, file) => {
                  for (let i = 0; i < file.length; i++) {
                    let repoappend = folder + "/" + file[i];
                    changedFile = repoappend.split(repoName).pop();
                    changedFile = changedFile.split(".").slice(0, -1).join(".");
                    if (osName !== "darwin") {
                      changedFile = changedFile.replace(/\\/g, "/");
                      localRepopath = gitRepoURL + changedFile;
                    } else {
                      localRepopath = gitRepoURL + changedFile;
                    }
                    //localRepopath = gitRepoURL + changedFile;
                    let fileName = file[i].replace(/^.*[\\\/]/, "");
                    //filtering component and sub-components i.e files and its meta.xml file
                    compFilename[i] = fileName;
                    var x = new XMLHttpRequest();
                    x.open("POST", pjson.connectToOrg.posturl, true);
                    x.setRequestHeader("Authorization", "Bearer " + accsToken);
                    x.setRequestHeader("Content-Type", "application/json");
                    x.send(
                      JSON.stringify({
                        Name: fileName.split(".").slice(0, -1).join("."),
                        API_Name__c: componentName,
                        Full_Name_with_extension__c: fileName,
                        Last_Modified_Date__c: lmdateTime,
                        Component_Type__c: componentName,
                        Git_Branch__c: repoBranchName,
                        Component_Path__c: localRepopath,
                      })
                    );
                    x.onload = function () {
                      console.log(this.response);
                      fileLength = file.length - 1;
                      let newRecordStatus = this.status;
                      if (fileLength == i) {
                        if (newRecordStatus == "201") {
                          vscode.window.showInformationMessage(
                            "Successfully records created in RangerFusion App"
                          );
                        }
                      }
                      recordID = JSON.parse(this.response);
                      try {
                        dupeRes = recordID[0].message;
                        dupeRes = dupeRes.split("id:").pop();
                        dupeRes = dupeRes.trim();
                        if (dupeRes !== undefined) {
                          var x = new XMLHttpRequest();
                          x.open(
                            "PATCH",
                            pjson.connectToOrg.posturl + "/" + dupeRes,
                            true
                          );
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              API_Name__c: componentName,
                              Full_Name_with_extension__c: fileName,
                              Last_Modified_Date__c: lmdateTime,
                              Component_Type__c: componentName,
                              Git_Branch__c: repoBranchName,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                            let updatelenth = file.length - 1;
                            let newRecordStatus = this.status;
                            if (updatelenth == i) {
                              if (newRecordStatus == "204") {
                                vscode.window.showInformationMessage(
                                  "Successfully records updated in RangerFusion App"
                                );
                              } else {
                                vscode.window.showErrorMessage(
                                  "unable to  created/update records in RangerFusion App"
                                );
                              }
                            }
                          };
                        }
                      } catch (err) {
                        vscode.window.showErrorMessage(err);
                      }
                      reId = recordID.id;
                      compId[i] = reId;
                    };
                  }
                });
              } else {
                let Firstfile;
                let componentFileName = folder.replace(/^.*[\\\/]/, "");
                let componentLebel = componentFileName
                  .split(".")
                  .slice(0, -1)
                  .join(".");
                var x = new XMLHttpRequest();
                x.open("POST", pjson.connectToOrg.posturl, true);
                x.setRequestHeader("Authorization", "Bearer " + accsToken);
                x.setRequestHeader("Content-Type", "application/json");
                x.send(
                  JSON.stringify({
                    Name: componentLebel,
                    API_Name__c: componentName,
                    Full_Name_with_extension__c: componentFileName,
                    Last_Modified_Date__c: lmdateTime,
                    Component_Type__c: componentName,
                    Git_Branch__c: repoBranchName,
                    Component_Path__c: localRepopath,
                  })
                );
                x.onload = function () {
                  console.log(this.response);
                  Firstfile = true;
                  recordID = JSON.parse(this.response);
                  try {
                    dupeRes = recordID[0].message;
                    dupeRes = dupeRes.split("id:").pop();
                    dupeRes = dupeRes.trim();
                    if (dupeRes !== undefined) {
                      var x = new XMLHttpRequest();
                      x.open(
                        "PATCH",
                        pjson.connectToOrg.posturl + "/" + dupeRes,
                        true
                      );
                      x.setRequestHeader(
                        "Authorization",
                        "Bearer " + accsToken
                      );
                      x.setRequestHeader("Content-Type", "application/json");
                      x.onload = function () {
                        console.log(this.response);
                      };
                      x.send(
                        JSON.stringify({
                          Name: componentLebel,
                          API_Name__c: componentName,
                          Full_Name_with_extension__c: componentFileName,
                          Last_Modified_Date__c: lmdateTime,
                          Component_Type__c: componentName,
                          Git_Branch__c: repoBranchName,
                        })
                      );
                      patchRes = true;
                    }
                  } catch (err) {
                    vscode.window.showErrorMessage(err);
                  }
                  reId = recordID.id;
                  parentResStatus = recordID.success;

                  //compId[i] = reId;
                  if (patchRes || Firstfile) {
                    vscode.window.showInformationMessage(
                      "Successfully records created in RangerFusion App"
                    );
                  } else {
                    vscode.window.showErrorMessage(
                      "Unable to create Record in RangerFusion App"
                    );
                  }
                };
              }
            }
            if (
              //If selected item is files  will get in
              isFile &&
              !folder.includes("-meta.xml") &&
              !folder.includes(".xml") &&
              !folder.includes("aura") &&
              !folder.includes("lwc" || "objects")
            ) {
              let subCopmDupe;
              let compUpdate;
              let componentFileName = folder.replace(/^.*[\\\/]/, "");
              var x = new XMLHttpRequest();
              x.open("POST", pjson.connectToOrg.posturl, true);
              x.setRequestHeader("Authorization", "Bearer " + accsToken);
              x.setRequestHeader("Content-Type", "application/json");
              x.send(
                JSON.stringify({
                  Name: componentFileName.split(".").slice(0, -1).join("."),
                  API_Name__c: componentName,
                  Full_Name_with_extension__c: componentFileName,
                  Last_Modified_Date__c: lmdateTime,
                  Component_Type__c: componentName,
                  Git_Branch__c: repoBranchName,
                  Component_Path__c: localRepopath,
                })
              );
              x.onload = function () {
                console.log(this.response);
                if (this.status == "201") {
                  vscode.window.showInformationMessage(
                    "Successfully records created in RangerFusion App"
                  );
                }
                recordID = JSON.parse(this.response);
                try {
                  dupeRes = recordID[0].message;
                  dupeRes = dupeRes.split("id:").pop();
                  dupeRes = dupeRes.trim();
                  if (dupeRes !== undefined) {
                    var x = new XMLHttpRequest();
                    x.open(
                      "PATCH",
                      pjson.connectToOrg.posturl + "/" + dupeRes,
                      true
                    );
                    x.setRequestHeader("Authorization", "Bearer " + accsToken);
                    x.setRequestHeader("Content-Type", "application/json");
                    x.send(
                      JSON.stringify({
                        Name: componentFileName
                          .split(".")
                          .slice(0, -1)
                          .join("."),
                        API_Name__c: componentName,
                        Full_Name_with_extension__c: componentFileName,
                        Last_Modified_Date__c: lmdateTime,
                        Component_Type__c: componentName,
                        Git_Branch__c: repoBranchName,
                      })
                    );
                    x.onload = function () {
                      console.log(this.response);
                      let updateresponse = this.status;
                      if (updateresponse == "204") {
                        vscode.window.showInformationMessage(
                          "Successfully records updated in RangerFusion App"
                        );
                      } else {
                        vscode.window.showErrorMessage(
                          "unable to create/update in RangerFusion App"
                        );
                      }
                    };
                  }
                } catch (err) {
                  vscode.window.showErrorMessage(err);
                }
                reId = recordID.id;
                parentResStatus = recordID.success;
                var x = new XMLHttpRequest();
                x.open("POST", pjson.connectToOrg.childUrl, true);
                x.setRequestHeader("Authorization", "Bearer " + accsToken);
                x.setRequestHeader("Content-Type", "application/json");
                x.send(
                  JSON.stringify({
                    Name: componentFileName + "-meta.xml",
                    Component__c: reId,
                    Sub_Component_Type__c: componentName,
                    Git_Branch__c: repoBranchName,
                  })
                );
                x.onload = function () {
                  console.log(this.response);
                  let respn = JSON.parse(this.response);
                  let childResponseStatus = respn.success;
                };
              };
            } else if (
              isFile &&
              (folder.includes("lwc") ||
                folder.includes("aura") ||
                folder.includes("objects"))
            ) {
              vscode.window.showWarningMessage(
                "Send by click on component folder name !"
              );
            }
            // if selected item is object will get in
            if (!isFile && folder.includes("objects")) {
              let objFolder;
              let objList;
              let objs;
              let childComp = false;
              let updateRecord = false;
              let objName = folder.split("/");
              let objectName = objName[objName.length - 1];
              changedFile = folder.split(repoName).pop();
              if (osName !== "darwin") {
                changedFile = changedFile.replace(/\\/g, "/");
                localRepopath = gitRepoURL + changedFile;
              } else {
                localRepopath = gitRepoURL + changedFile;
              }
              //localRepopath = gitRepoURL + changedFile;
              var x = new XMLHttpRequest();
              x.open("POST", pjson.connectToOrg.posturl, true);
              x.setRequestHeader("Authorization", "Bearer " + accsToken);
              x.setRequestHeader("Content-Type", "application/json");
              x.send(
                JSON.stringify({
                  Name: objectName,
                  API_Name__c: componentName,
                  Last_Modified_Date__c: lmdateTime,
                  Component_Type__c: componentName,
                  Git_Branch__c: repoBranchName,
                  Component_Path__c: localRepopath,
                })
              );
              x.onload = function () {
                console.log(this.response);
                recordID = JSON.parse(this.response);
                try {
                  dupeRes = recordID[0].message;
                  dupeRes = dupeRes.split("id:").pop();
                  dupeRes = dupeRes.trim();
                  parentrecordId = dupeRes;
                  if (dupeRes !== undefined) {
                    var x = new XMLHttpRequest();
                    x.open(
                      "PATCH",
                      pjson.connectToOrg.posturl + "/" + parentrecordId,
                      true
                    );
                    x.setRequestHeader("Authorization", "Bearer " + accsToken);
                    x.setRequestHeader("Content-Type", "application/json");
                    x.send(
                      JSON.stringify({
                        Name: objectName,
                        API_Name__c: componentName,
                        Last_Modified_Date__c: lmdateTime,
                        Component_Type__c: componentName,
                        Git_Branch__c: repoBranchName,
                        Component_Path__c: localRepopath,
                      })
                    );
                    x.onload = function () {
                      console.log(this.response);
                      // if(this.status =='204'){
                      updateRecord = true;
                      // }
                      fs.readdir(folder, (err, objs) => {
                        for (let j = 0; j < objs.length; j++) {
                          objFolder = objs[j].includes(".xml");
                          objList = objs[j];
                          if (!objFolder && objList == "fields") {
                            fs.readdir(
                              folder + "/" + objList,
                              (err, subfold) => {
                                for (let i = 0; i < subfold.length; i++) {
                                  let componentFileNames = subfold[i];
                                  var x = new XMLHttpRequest();
                                  x.open(
                                    "POST",
                                    pjson.connectToOrg.childUrl,
                                    true
                                  );
                                  x.setRequestHeader(
                                    "Authorization",
                                    "Bearer " + accsToken
                                  );
                                  x.setRequestHeader(
                                    "Content-Type",
                                    "application/json"
                                  );
                                  x.send(
                                    JSON.stringify({
                                      Name: componentFileNames,
                                      Component__c: parentrecordId,
                                      Sub_Component_Type__c: "fields",
                                      Git_Branch__c: repoBranchName,
                                      SubComponentName__c: componentFileNames,
                                    })
                                  );
                                  x.onload = function () {
                                    console.log(this.response);
                                    recordID = JSON.parse(this.response);
                                    try {
                                      dupeRes = recordID[0].message;
                                      dupeRes = dupeRes.split("id:").pop();
                                      dupeRes = dupeRes.trim();
                                      if (dupeRes !== undefined) {
                                        var x = new XMLHttpRequest();
                                        x.open(
                                          "PATCH",
                                          pjson.connectToOrg.childUrl +
                                            "/" +
                                            dupeRes,
                                          true
                                        );
                                        x.setRequestHeader(
                                          "Authorization",
                                          "Bearer " + accsToken
                                        );
                                        x.setRequestHeader(
                                          "Content-Type",
                                          "application/json"
                                        );
                                        x.send(
                                          JSON.stringify({
                                            Name: componentFileNames,
                                            Sub_Component_Type__c: "fields",
                                            Git_Branch__c: repoBranchName,
                                          })
                                        );
                                        x.onload = function () {
                                          console.log(this.response);
                                        };
                                      }
                                    } catch (err) {
                                      vscode.window.showErrorMessage(err);
                                    }
                                  };
                                }
                              }
                            );
                          } else if (!objFolder && objList == "listViews") {
                            fs.readdir(
                              folder + "/" + objList,
                              (err, subfold) => {
                                for (let i = 0; i < subfold.length; i++) {
                                  let componentFileNames = subfold[i];
                                  var x = new XMLHttpRequest();
                                  x.open(
                                    "POST",
                                    pjson.connectToOrg.childUrl,
                                    true
                                  );
                                  x.setRequestHeader(
                                    "Authorization",
                                    "Bearer " + accsToken
                                  );
                                  x.setRequestHeader(
                                    "Content-Type",
                                    "application/json"
                                  );
                                  x.send(
                                    JSON.stringify({
                                      Name: componentFileNames,
                                      Sub_Component_Type__c: "listViews",
                                      Git_Branch__c: repoBranchName,
                                      SubComponentName__c: componentFileNames,
                                    })
                                  );
                                  x.onload = function () {
                                    console.log(this.response);
                                    recordID = JSON.parse(this.response);
                                    try {
                                      dupeRes = recordID[0].message;
                                      dupeRes = dupeRes.split("id:").pop();
                                      dupeRes = dupeRes.trim();
                                      if (dupeRes !== undefined) {
                                        var x = new XMLHttpRequest();
                                        x.open(
                                          "PATCH",
                                          pjson.connectToOrg.childUrl +
                                            "/" +
                                            dupeRes,
                                          true
                                        );
                                        x.setRequestHeader(
                                          "Authorization",
                                          "Bearer " + accsToken
                                        );
                                        x.setRequestHeader(
                                          "Content-Type",
                                          "application/json"
                                        );
                                        x.send(
                                          JSON.stringify({
                                            Name: componentFileNames,
                                            Sub_Component_Type__c: "listViews",
                                            Git_Branch__c: repoBranchName,
                                          })
                                        );
                                        x.onload = function () {
                                          console.log(this.response);
                                        };
                                      }
                                    } catch (err) {
                                      vscode.window.showErrorMessage(err);
                                    }
                                  };
                                }
                              }
                            );
                          } else if (
                            !objFolder &&
                            objList == "compactLayouts"
                          ) {
                            fs.readdir(
                              folder + "/" + objList,
                              (err, subfold) => {
                                for (let i = 0; i < subfold.length; i++) {
                                  let componentFileNames = subfold[i];
                                  var x = new XMLHttpRequest();
                                  x.open(
                                    "POST",
                                    pjson.connectToOrg.childUrl,
                                    true
                                  );
                                  x.setRequestHeader(
                                    "Authorization",
                                    "Bearer " + accsToken
                                  );
                                  x.setRequestHeader(
                                    "Content-Type",
                                    "application/json"
                                  );
                                  x.send(
                                    JSON.stringify({
                                      Name: componentFileNames,
                                      Component__c: parentrecordId,
                                      Sub_Component_Type__c: "compactLayouts",
                                      Git_Branch__c: repoBranchName,
                                      SubComponentName__c: componentFileNames,
                                    })
                                  );
                                  x.onload = function () {
                                    console.log(this.response);
                                    recordID = JSON.parse(this.response);
                                    try {
                                      dupeRes = recordID[0].message;
                                      dupeRes = dupeRes.split("id:").pop();
                                      dupeRes = dupeRes.trim();
                                      if (dupeRes !== undefined) {
                                        var x = new XMLHttpRequest();
                                        x.open(
                                          "PATCH",
                                          pjson.connectToOrg.childUrl +
                                            "/" +
                                            dupeRes,
                                          true
                                        );
                                        x.setRequestHeader(
                                          "Authorization",
                                          "Bearer " + accsToken
                                        );
                                        x.setRequestHeader(
                                          "Content-Type",
                                          "application/json"
                                        );
                                        x.send(
                                          JSON.stringify({
                                            Name: componentFileNames,
                                            Sub_Component_Type__c:
                                              "compactLayouts",
                                            Git_Branch__c: repoBranchName,
                                          })
                                        );
                                        x.onload = function () {
                                          console.log(this.response);
                                        };
                                      }
                                    } catch (err) {
                                      vscode.window.showErrorMessage(err);
                                    }
                                  };
                                }
                              }
                            );
                          } else if (!objFolder && objList == "recordTypes") {
                            fs.readdir(
                              folder + "/" + objList,
                              (err, subfold) => {
                                for (let i = 0; i < subfold.length; i++) {
                                  let componentFileNames = subfold[i];
                                  var x = new XMLHttpRequest();
                                  x.open(
                                    "POST",
                                    pjson.connectToOrg.childUrl,
                                    true
                                  );
                                  x.setRequestHeader(
                                    "Authorization",
                                    "Bearer " + accsToken
                                  );
                                  x.setRequestHeader(
                                    "Content-Type",
                                    "application/json"
                                  );
                                  x.send(
                                    JSON.stringify({
                                      Name: componentFileNames,
                                      Component__c: parentrecordId,
                                      Sub_Component_Type__c: "recordTypes",
                                      Git_Branch__c: repoBranchName,
                                      SubComponentName__c: componentFileNames,
                                    })
                                  );
                                  x.onload = function () {
                                    console.log(this.response);
                                    recordID = JSON.parse(this.response);
                                    try {
                                      dupeRes = recordID[0].message;
                                      dupeRes = dupeRes.split("id:").pop();
                                      dupeRes = dupeRes.trim();
                                      if (dupeRes !== undefined) {
                                        var x = new XMLHttpRequest();
                                        x.open(
                                          "PATCH",
                                          pjson.connectToOrg.childUrl +
                                            "/" +
                                            dupeRes,
                                          true
                                        );
                                        x.setRequestHeader(
                                          "Authorization",
                                          "Bearer " + accsToken
                                        );
                                        x.setRequestHeader(
                                          "Content-Type",
                                          "application/json"
                                        );
                                        x.send(
                                          JSON.stringify({
                                            Name: componentFileNames,
                                            Sub_Component_Type__c:
                                              "recordTypes",
                                            Git_Branch__c: repoBranchName,
                                          })
                                        );
                                        x.onload = function () {
                                          console.log(this.response);
                                        };
                                      }
                                    } catch (err) {
                                      vscode.window.showErrorMessage(err);
                                    }
                                  };
                                }
                              }
                            );
                          } else if (!objFolder && objList == "webLinks") {
                            fs.readdir(
                              folder + "/" + objList,
                              (err, subfold) => {
                                for (let i = 0; i < subfold.length; i++) {
                                  let componentFileNames = subfold[i];
                                  var x = new XMLHttpRequest();
                                  x.open(
                                    "POST",
                                    pjson.connectToOrg.childUrl,
                                    true
                                  );
                                  x.setRequestHeader(
                                    "Authorization",
                                    "Bearer " + accsToken
                                  );
                                  x.setRequestHeader(
                                    "Content-Type",
                                    "application/json"
                                  );
                                  x.send(
                                    JSON.stringify({
                                      Name: componentFileNames,
                                      Component__c: parentrecordId,
                                      Sub_Component_Type__c: "webLinks",
                                      Git_Branch__c: repoBranchName,
                                      SubComponentName__c: componentFileNames,
                                    })
                                  );
                                  x.onload = function () {
                                    console.log(this.response);
                                    recordID = JSON.parse(this.response);
                                    try {
                                      dupeRes = recordID[0].message;
                                      dupeRes = dupeRes.split("id:").pop();
                                      dupeRes = dupeRes.trim();
                                      if (dupeRes !== undefined) {
                                        var x = new XMLHttpRequest();
                                        x.open(
                                          "PATCH",
                                          pjson.connectToOrg.childUrl +
                                            "/" +
                                            dupeRes,
                                          true
                                        );
                                        x.setRequestHeader(
                                          "Authorization",
                                          "Bearer " + accsToken
                                        );
                                        x.setRequestHeader(
                                          "Content-Type",
                                          "application/json"
                                        );
                                        x.send(
                                          JSON.stringify({
                                            Name: componentFileNames,
                                            Sub_Component_Type__c: "webLinks",
                                            Git_Branch__c: "repoBranchName",
                                          })
                                        );
                                        x.onload = function () {
                                          console.log(this.response);
                                        };
                                      }
                                    } catch (err) {
                                      vscode.window.showErrorMessage(err);
                                    }
                                  };
                                }
                              }
                            );
                          }
                        }
                      });
                    };
                  }
                } catch (err) {
                  vscode.window.showErrorMessage(err);
                }
                reId = recordID.id;
                parentResStatus = recordID.success;
                // if (statusCode == "201") {
                var x = new XMLHttpRequest();
                x.open("POST", pjson.connectToOrg.childUrl, true);
                x.setRequestHeader("Authorization", "Bearer " + accsToken);
                x.setRequestHeader("Content-Type", "application/json");
                x.send(
                  JSON.stringify({
                    Name: objectName + ".object-meta.xml",
                    Component__c: reId,
                    Sub_Component_Type__c: componentName,
                    Git_Branch__c: repoBranchName,
                    SubComponentName__c: objectName + ".object-meta.xml",
                  })
                );
                x.onload = function () {
                  console.log(this.response);
                  childComp = true;
                  if (parentResStatus || childComp || updateRecord) {
                    vscode.window.showInformationMessage(
                      "Successfully records created in RangerFusion App"
                    );
                  } else {
                    vscode.window.showErrorMessage(
                      "Unable to create Record in RangerFusion App"
                    );
                  }
                };
                fs.readdir(folder, (err, objs) => {
                  for (let j = 0; j < objs.length; j++) {
                    objFolder = objs[j].includes(".xml");
                    objList = objs[j];
                    if (!objFolder && objList == "fields") {
                      fs.readdir(folder + "/" + objList, (err, subfold) => {
                        for (let i = 0; i < subfold.length; i++) {
                          let componentFileNames = subfold[i];
                          var x = new XMLHttpRequest();
                          x.open("POST", pjson.connectToOrg.childUrl, true);
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              Name: componentFileNames,
                              Component__c: reId,
                              Sub_Component_Type__c: "fields",
                              Git_Branch__c: repoBranchName,
                              SubComponentName__c: componentFileNames,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                          };
                        }
                      });
                    } else if (!objFolder && objList == "listViews") {
                      fs.readdir(folder + "/" + objList, (err, subfold) => {
                        for (let i = 0; i < subfold.length; i++) {
                          let componentFileNames = subfold[i];
                          var x = new XMLHttpRequest();
                          x.open("POST", pjson.connectToOrg.childUrl, true);
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              Name: componentFileNames,
                              Component__c: reId,
                              Sub_Component_Type__c: "listViews",
                              Git_Branch__c: repoBranchName,
                              SubComponentName__c: componentFileNames,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                          };
                        }
                      });
                    } else if (!objFolder && objList == "compactLayouts") {
                      fs.readdir(folder + "/" + objList, (err, subfold) => {
                        for (let i = 0; i < subfold.length; i++) {
                          let componentFileNames = subfold[i];
                          var x = new XMLHttpRequest();
                          x.open("POST", pjson.connectToOrg.childUrl, true);
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          console.log(parentResStatus);
                          x.send(
                            JSON.stringify({
                              Name: componentFileNames,
                              Component__c: reId,
                              Sub_Component_Type__c: "compactLayouts",
                              Git_Branch__c: repoBranchName,
                              SubComponentName__c: componentFileNames,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                          };
                        }
                      });
                    } else if (!objFolder && objList == "recordTypes") {
                      fs.readdir(folder + "/" + objList, (err, subfold) => {
                        for (let i = 0; i < subfold.length; i++) {
                          let componentFileNames = subfold[i];
                          var x = new XMLHttpRequest();
                          x.open("POST", pjson.connectToOrg.childUrl, true);
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              Name: componentFileNames,
                              Component__c: reId,
                              Sub_Component_Type__c: "recordTypes",
                              Git_Branch__c: repoBranchName,
                              SubComponentName__c: componentFileNames,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                          };
                        }
                      });
                    } else if (!objFolder && objList == "webLinks") {
                      fs.readdir(folder + "/" + objList, (err, subfold) => {
                        for (let i = 0; i < subfold.length; i++) {
                          let componentFileNames = subfold[i];
                          var x = new XMLHttpRequest();
                          x.open("POST", pjson.connectToOrg.childUrl, true);
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              Name: componentFileNames,
                              Component__c: reId,
                              Sub_Component_Type__c: "webLinks",
                              Git_Branch__c: repoBranchName,
                              SubComponentName__c: componentFileNames,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                          };
                        }
                      });
                    }
                  }
                });
                // }
              };
            }
            //To send email component info
            if (!isFile && folder.includes("email")) {
              changedFile = folder.split(repoName).pop();
              if (osName !== "darwin") {
                changedFile = changedFile.replace(/\\/g, "/");
                localRepopath = gitRepoURL + changedFile;
              } else {
                localRepopath = gitRepoURL + changedFile;
              }
              var x = new XMLHttpRequest();
              x.open("POST", pjson.connectToOrg.posturl, true);
              x.setRequestHeader("Authorization", "Bearer " + accsToken);
              x.setRequestHeader("Content-Type", "application/json");
              x.send(
                JSON.stringify({
                  Name: nameOfComponent,
                  API_Name__c: componentName,
                  Last_Modified_Date__c: lmdateTime,
                  Component_Type__c: componentName,
                  Git_Branch__c: repoBranchName,
                  Component_Path__c: localRepopath,
                })
              );
              x.onload = function () {
                console.log(this.response);
                if (this.status == "400") {
                  recordID = JSON.parse(this.response);
                  dupeRes = recordID[0].message;
                  dupeRes = dupeRes.split("id:").pop();
                  dupeRes = dupeRes.trim();
                  var x = new XMLHttpRequest();
                  x.open(
                    "PATCH",
                    pjson.connectToOrg.posturl + "/" + dupeRes,
                    true
                  );
                  x.setRequestHeader("Authorization", "Bearer " + accsToken);
                  x.setRequestHeader("Content-Type", "application/json");
                  x.send(
                    JSON.stringify({
                      Name: nameOfComponent,
                      API_Name__c: componentName,
                      Last_Modified_Date__c: lmdateTime,
                      Component_Type__c: componentName,
                      Git_Branch__c: repoBranchName,
                    })
                  );
                  x.onload = function () {
                    console.log(this.response);
                    fs.readdir(folder, (err, file) => {
                      for (let i = 0; i < file.length; i++) {
                        let componentFileNames = file[i];
                        var x = new XMLHttpRequest();
                        x.open("POST", pjson.connectToOrg.childUrl, true);
                        x.setRequestHeader(
                          "Authorization",
                          "Bearer " + accsToken
                        );
                        x.setRequestHeader("Content-Type", "application/json");
                        x.send(
                          JSON.stringify({
                            Name: componentFileNames,
                            Component__c: dupeRes,
                            Sub_Component_Type__c: componentName,
                            Git_Branch__c: repoBranchName,
                            SubComponentName__c: componentFileNames,
                          })
                        );
                        x.onload = function () {
                          console.log(this.response);
                          if (this.status == "400") {
                            recordID = JSON.parse(this.response);
                            dupeRes = recordID[0].message;
                            dupeRes = dupeRes.split("id:").pop();
                            dupeRes = dupeRes.trim();
                            var x = new XMLHttpRequest();
                            x.open(
                              "PATCH",
                              pjson.connectToOrg.childUrl + "/" + dupeRes,
                              true
                            );
                            x.setRequestHeader(
                              "Authorization",
                              "Bearer " + accsToken
                            );
                            x.setRequestHeader(
                              "Content-Type",
                              "application/json"
                            );
                            x.send(
                              JSON.stringify({
                                Name: componentFileNames,
                                Sub_Component_Type__c: componentName,
                                Git_Branch__c: repoBranchName,
                              })
                            );
                            x.onload = function () {
                              console.log(this.response);
                              if (this.status == "204") {
                                vscode.window.showInformationMessage(
                                  "Successfully Records Updated in RangerFusion App"
                                );
                              } else {
                                vscode.window.showErrorMessage(
                                  "Unable to Create/Update Record in RangerFusion App"
                                );
                              }
                            };
                          }
                        };
                      }
                    });
                  };
                }
                recordID = JSON.parse(this.response);
                reId = recordID.id;
                //Getting selcted folder files
                fs.readdir(folder, (err, file) => {
                  for (let i = 0; i < file.length; i++) {
                    let componentFileNames = file[i];
                    var x = new XMLHttpRequest();
                    x.open("POST", pjson.connectToOrg.childUrl, true);
                    x.setRequestHeader("Authorization", "Bearer " + accsToken);
                    x.setRequestHeader("Content-Type", "application/json");
                    x.send(
                      JSON.stringify({
                        Name: componentFileNames,
                        Component__c: reId,
                        Sub_Component_Type__c: componentName,
                        Git_Branch__c: repoBranchName,
                        SubComponentName__c: componentFileNames,
                      })
                    );
                    x.onload = function () {
                      console.log(this.response);
                      if (this.status == "201") {
                        vscode.window.showInformationMessage(
                          "Successfully records created in RangerFusion App"
                        );
                      }
                    };
                  }
                });
              };
            }
            if (!isFile || isFile || folder.includes("workflows")) {
              if (isFile) {
                let alertsArray = new Array();
                let fieldUpdatesArray = new Array();
                let rulesArray = new Array();
                let tasksArray = new Array();
                let newRecord;
                let updateRecord;
                let flowname = folder.split("/");
                if (flowname[flowname.length - 2] == "workflows") {
                  let filesy = require("fs");
                  var notes = filesy.readFileSync(folder);
                  //var notes =require('./test.xml')
                  var convert = require("xml-js");
                  var xml = notes;
                  var result = convert.xml2json(xml, {
                    compact: true,
                    spaces: 4,
                  });
                  result = JSON.parse(result);
                  try {
                    let istasks = Array.isArray(result.Workflow.tasks);
                    let isalerts = Array.isArray(result.Workflow.alerts);
                    let isfieldUpdates = Array.isArray(
                      result.Workflow.fieldUpdates
                    );
                    let isrules = Array.isArray(result.Workflow.rules);
                    if (isrules && result.Workflow.rules !== undefined) {
                      for (let i = 0; i < result.Workflow.rules.length; i++) {
                        rulesArray[i] = result.Workflow.rules[i].fullName._text;
                      }
                    } else if (
                      !isrules &&
                      result.Workflow.rules !== undefined
                    ) {
                      rulesArray = result.Workflow.rules.fullName._text;
                    }
                    if (
                      isfieldUpdates &&
                      result.Workflow.fieldUpdates !== undefined
                    ) {
                      for (
                        let i = 0;
                        i < result.Workflow.fieldUpdates.length;
                        i++
                      ) {
                        fieldUpdatesArray[i] =
                          result.Workflow.fieldUpdates[i].fullName._text;
                      }
                    } else if (
                      !isfieldUpdates &&
                      result.Workflow.fieldUpdates !== undefined
                    ) {
                      fieldUpdatesArray =
                        result.Workflow.fieldUpdates.fullName._text;
                    }
                    if (isalerts && result.Workflow.alerts !== undefined) {
                      for (let i = 0; i < result.Workflow.alerts.length; i++) {
                        alertsArray[i] =
                          result.Workflow.alerts[i].fullName._text;
                      }
                    } else if (
                      !isalerts &&
                      result.Workflow.alerts !== undefined
                    ) {
                      alertsArray = result.Workflow.alerts.fullName._text;
                    }
                    if (istasks && result.Workflow.tasks !== undefined) {
                      for (let i = 0; i < result.Workflow.tasks.length; i++) {
                        tasksArray[i] = result.Workflow.tasks[i].fullName._text;
                      }
                    } else if (
                      !istasks &&
                      result.Workflow.tasks !== undefined
                    ) {
                      rulesArray = result.Workflow.tasks.fullName._text;
                    }
                  } catch (err) {
                    console.log(err);
                  }
                  let allWorkFlows = alertsArray.concat(
                    fieldUpdatesArray,
                    rulesArray,
                    tasksArray
                  );
                  for (let i = 0; i < allWorkFlows.length; i++) {
                    var x = new XMLHttpRequest();
                    x.open("POST", pjson.connectToOrg.posturl, true);
                    x.setRequestHeader("Authorization", "Bearer " + accsToken);
                    x.setRequestHeader("Content-Type", "application/json");
                    x.send(
                      JSON.stringify({
                        Name: allWorkFlows[i],
                        API_Name__c: "WorkFlow",
                        Full_Name_with_extension__c: allWorkFlows[i],
                        Last_Modified_Date__c: lmdateTime,
                        Component_Type__c: "WorkFlow",
                        Git_Branch__c: repoBranchName,
                        Component_Path__c: localRepopath + i,
                      })
                    );
                    x.onload = function () {
                      console.log(this.response);
                      let fileLength = allWorkFlows.length;
                      let workFlowComponent = this.status;
                      if (fileLength - 1 == i) {
                        if (workFlowComponent == "201") {
                          vscode.window.showInformationMessage(
                            "Records created successfully in Fusion Org"
                          );
                        }
                      }
                      recordID = JSON.parse(this.response);
                      try {
                        dupeRes = recordID[0].message;
                        dupeRes = dupeRes.split("id:").pop();
                        dupeRes = dupeRes.trim();
                        if (dupeRes !== undefined) {
                          var x = new XMLHttpRequest();
                          x.open(
                            "PATCH",
                            pjson.connectToOrg.posturl + "/" + dupeRes,
                            true
                          );
                          x.setRequestHeader(
                            "Authorization",
                            "Bearer " + accsToken
                          );
                          x.setRequestHeader(
                            "Content-Type",
                            "application/json"
                          );
                          x.send(
                            JSON.stringify({
                              Name: allWorkFlows[i],
                              API_Name__c: "WorkFlow",
                              Full_Name_with_extension__c: allWorkFlows[i],
                              Last_Modified_Date__c: lmdateTime,
                              Component_Type__c: "WorkFlow",
                              Git_Branch__c: repoBranchName,
                            })
                          );
                          x.onload = function () {
                            console.log(this.response);
                            let fileLength = allWorkFlows.length;
                            updateRecord = this.status;
                            if (fileLength - 1 == i) {
                              if (updateRecord == "204") {
                                vscode.window.showInformationMessage(
                                  "Records updated successfully in Fusion Org"
                                );
                              } else {
                                vscode.window.showInformationMessage(
                                  "unable create/update records in Fusion Org"
                                );
                              }
                            }
                          };
                        }
                      } catch (err) {
                        console.log(err);
                      }
                    };
                  }
                } 
              }else if (!isFile) {
                let isFlow = folder.replace(/^.*[\\\/]/, "");
                if (isFlow == "workflows") {
                  vscode.window.showWarningMessage(
                    "Plaes send by click on individual flow"
                  );
                }
              }
            }
          } else if (dir.includes("angular.json")) {
            vscode.window.showInformationMessage("Its  a angular Project");
          } else {
            vscode.window.showErrorMessage("its not a SFDX nor Angular ");
          }
        });
      }
    }
  );
  context.subscriptions.push(createFile);

  // To send project component details to Fusion org
  let disposable = vscode.commands.registerCommand(
    "sync-sf-org.ext",
    function () {
      var recursive = require("recursive-readdir");
      let dir;
      let fsTimeout;
      let delay = 300;
      // getting current working directory
      if (vscode.workspace.workspaceFolders !== undefined) {
        wf = vscode.workspace.workspaceFolders[0].uri.path;
      } else {
        vscode.window.showErrorMessage(
          "Please open Sfdx project in this Work Place"
        );
      }
      recursive(wf, function (err, files) {
        // `files` is an array of file paths
        //converting arry to string
        dir = files + "";

        //validating the converted string have salesforce file structure  or not
        if (
          dir.includes(
            ".sfdx" &&
              "config" &&
              "force-app/main/default" &&
              "manifest/package.xml" &&
              "sfdx-project.json"
          )
        ) {
          vscode.window.showInformationMessage("It's a SF Project");
          //const fs = require("fs");
          // Watching this directory
          fs.watch(wf, { recursive: true }, function (event, fileName) {
            let componentLebel;
            let metaDataType;
            let componentName;
            let changeFile = wf + "/" + fileName;
            fileName = fileName.replace(/^.*[\\\/]/, "");
            componentLebel = fileName.split(".").slice(0, -1).join(".");
            let eventType = event;
            // Addressing which file changed
            if (changeFile.includes("force-app/main/default/aura")) {
              if (!fsTimeout) {
                componentName = "Aura Component";
                metaDataType = "AuraDefinitionBundle";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("force-app/main/default/classes")) {
              if (!fsTimeout) {
                componentName = "Apex Class";
                metaDataType = "ApexClass";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("force-app/main/default/lwc")) {
              if (!fsTimeout) {
                componentName = "LWC components";
                metaDataType = "LightningComponentBundle";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("force-app/main/default/pages")) {
              if (!fsTimeout) {
                componentName = "Pages";
                metaDataType = "LightningComponentBundle";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (
              changeFile.includes("force-app/main/default/staticresources")
            ) {
              if (!fsTimeout) {
                componentName = "staticresources";
                metaDataType = "StaticResource";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("force-app/main/default/triggers")) {
              if (!fsTimeout) {
                componentName = "Triggers";
                metaDataType = "ApexTrigger";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (
              changeFile.includes("force-app/main/default/applications")
            ) {
              if (!fsTimeout) {
                componentName = "Applications";
                metaDataType = "CustomApplication";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (
              changeFile.includes("force-app/main/default/components")
            ) {
              if (!fsTimeout) {
                componentName = "components";
                metaDataType = "ApexComponent";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (
              changeFile.includes("force-app/main/default/contentassets")
            ) {
              if (!fsTimeout) {
                componentName = "contentassets";
                metaDataType = "ContentAsset";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (
              changeFile.includes("force-app/main/default/flexipages")
            ) {
              if (!fsTimeout) {
                componentName = "flexipages";
                metaDataType = "FlexiPage";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("force-app/main/default/layouts")) {
              if (!fsTimeout) {
                componentName = "layouts";
                metaDataType = "Layout";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("force-app/main/default/objects")) {
              if (!fsTimeout) {
                componentName = "objects";
                metaDataType = "TopicsForObjects";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (
              changeFile.includes("force-app/main/default/permissionsets")
            ) {
              if (!fsTimeout) {
                componentName = "permissionsets";
                metaDataType = "PermissionSet";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("force-app/main/default/tabs")) {
              if (!fsTimeout) {
                componentName = "tabs";
                metaDataType = "CustomTab";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (
              changeFile.includes("force-app/main/default/testSuites")
            ) {
              if (!fsTimeout) {
                componentName = "testSuites";
                // metaDataType = "deployment file";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("scripts/apex")) {
              if (!fsTimeout) {
                componentName = "Apex Script file";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else if (changeFile.includes("scripts/soql")) {
              if (!fsTimeout) {
                componentName = "SOQL Script file";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            } else {
              if (!fsTimeout) {
                componentName = "others";
                fsTimeout = setTimeout(function () {
                  fsTimeout = null;
                }, delay);
              }
            }
            //  Request to create record in Saledforce Org with file change details
            if (eventType == "rename") {
              var XMLHttpRequest = require("xhr2");
              var x = new XMLHttpRequest();
              x.open("POST", pjson.connectToOrg.posturl, true);
              x.setRequestHeader("Authorization", "Bearer " + accsToken);
              x.setRequestHeader("Content-Type", "application/json");
              x.onload = function () {
                console.log(this.response);
                vscode.window.showInformationMessage(
                  "file Name  " + fileName,
                  "Component Name  " + componentName
                );
              };
              x.send(
                JSON.stringify({
                  Name: componentLebel,
                  Full_Name_with_extension__c: fileName,
                  Last_Modified_Date__c: lmdateTime,
                  ComponentType__c: componentName,
                })
              );
            }
          });
        } else {
          vscode.window.showInformationMessage(
            "It is not a SalesForce project"
          );
        }
      });
      // listing  All the avialable components, Apex class, LWC , Etc details in the project
      let compname = [
        "Aura Components",
        "Apex Classes",
        "Components",
        "LWC",
        "pages",
      ];
      let testFolder = [
        wf + "/force-app/main/default/aura",
        wf + "/force-app/main/default/classes",
        wf + "/force-app/main/default/components",
        wf + "/force-app/main/default/lwc",
        wf + "/force-app/main/default/pages",
      ];

      for (let i = 0; i <= testFolder.length; i++) {
        fs.readdir(testFolder[i], (err, file) => {
          if (
            testFolder[i].includes("/force-app/main/default/classes") ||
            testFolder[i].includes("/force-app/main/default/components") ||
            testFolder[i].includes("/force-app/main/default/pages")
          ) {
          } else {
          }
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
