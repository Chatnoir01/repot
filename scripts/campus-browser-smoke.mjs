import {chromium} from "playwright";
import {spawn} from "node:child_process";
import assert from "node:assert/strict";
const server=spawn("python3",["-m","http.server","8765","--bind","127.0.0.1","--directory","."],{stdio:"ignore"});
let browser;
const failures=[];
const base="http://127.0.0.1:8765/campus/";
async function ready(){
 for(let i=0;i<40;i++){
  try{const res=await fetch(base);if(res.ok)return;}catch{}
  await new Promise(r=>setTimeout(r,250));
 }
 throw Error("Local HTTP server failed to start");
}
async function expectText(page,id,expected,ms=20000){
 await page.waitForFunction(({id,expected})=>document.getElementById(id)?.textContent?.trim()===expected,{id,expected},{timeout:ms});
}
try{
 await ready();
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||"/usr/bin/google-chrome",args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1366,height:900},acceptDownloads:true});
 page.on("pageerror",e=>failures.push("Browser JS error: "+e.message));
 const response=await page.goto(base,{waitUntil:"load"});
 assert.equal(response.status(),200);
 await page.waitForSelector("#project-navigation button");
 console.log("PASS Campus UI loads");
 await expectText(page,"learning-step-counter","ÉTAPE 1 / 3");
 assert.ok((await page.locator("#learning-explainer").textContent()).length>70);
 assert.equal(await page.locator(".walkthrough-card").count(),3);
 await page.locator('[data-learn-step="1"]').click();
 await expectText(page,"learning-step-counter","ÉTAPE 2 / 3");
 await page.locator('[data-learn-step="2"]').click();
 await expectText(page,"learning-step-counter","ÉTAPE 3 / 3");
 assert.equal(await page.locator("#question-choices button").count(),3);
 await page.locator("#question-choices button").nth(0).click();
 await page.locator("#lesson-answer").click();
 assert.match(await page.locator("#answer-feedback").textContent(),/Pas encore/);
 await page.locator("#question-choices button").nth(1).click();
 await page.locator("#lesson-answer").click();
 assert.match(await page.locator("#answer-feedback").textContent(),/Bien compris/);
 await page.locator("#btn-restart-lesson").click();
 await expectText(page,"learning-step-counter","ÉTAPE 1 / 3");
 console.log("PASS interactive guided lesson with explanation, steps and honest knowledge checks");
 await page.locator('[data-track-select="js"]').click();
 await expectText(page,"breadcrumb-track","JAVASCRIPT");
 await page.locator("#code-editor").fill('function doubler(n){return n*2;}\nconsole.log("preuve",doubler(4));');
 await page.locator("#btn-test").click();
 await expectText(page,"checks-count","3 / 3",16000);
 assert.match(await page.locator("#result-console").textContent(),/preuve 8/);
 console.log("PASS JavaScript engine executes and grades three real calls");
 await page.locator("#milestone-dialog[open]").waitFor({timeout:4000});
 assert.match(await page.locator("#milestone-description").textContent(),/réellement réussi/);
 await page.locator("#close-milestone").click();
 await page.locator("#code-editor").fill("while(true){}");
 await page.locator("#btn-run").click();
 await expectText(page,"runtime-status","ERREUR JS",12000);
 console.log("PASS infinite JavaScript loop is interrupted");
 await page.locator('[data-track-select="web"]').click();
 await expectText(page,"breadcrumb-track","HTML & CSS");
 const preview=page.frameLocator("#preview-frame");
 await preview.locator("h1").waitFor({timeout:10000});
 assert.match(await preview.locator("h1").textContent(),/Une idée prend forme/);
 assert.equal(await page.locator("#preview-frame").getAttribute("sandbox"),"");
 await page.locator("#btn-practised").click();
 await expectText(page,"checks-count","PRATIQUÉ");
 console.log("PASS HTML/CSS preview and honest manual checkpoint");
 await page.locator("#milestone-dialog[open]").waitFor({timeout:4000});
 assert.match(await page.locator("#milestone-description").textContent(),/pas évaluée automatiquement/);
 await page.locator("#close-milestone").click();
 await page.locator('[data-track-select="c"]').click();
 await expectText(page,"breadcrumb-track","LANGAGE C");
 await page.locator("#code-editor").fill('#include <stdio.h>\nint main(void){printf("Bonjour DEVLAB !\\n");return 0;}');
 await page.locator("#btn-test").click();
 await expectText(page,"checks-count","1 / 1",40000);
 assert.match(await page.locator("#result-console").textContent(),/Bonjour DEVLAB/);
 console.log("PASS C is actually compiled to WASM in browser and validated");
 await page.locator("#milestone-dialog[open]").waitFor({timeout:4000});
 await page.locator("#close-milestone").click();
 await page.reload({waitUntil:"load"});
 await page.waitForSelector("#project-navigation button");
 assert.match(await page.locator("#code-editor").inputValue(),/Bonjour DEVLAB/);
 console.log("PASS projects and progress survive reload");
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 mobile.on("pageerror",e=>failures.push("Mobile JS error: "+e.message));
 const mobileResponse=await mobile.goto(base,{waitUntil:"load"});
 assert.equal(mobileResponse.status(),200);
 await mobile.waitForSelector("#project-navigation button");
 await mobile.locator('[data-learn-step="1"]').click();
 await expectText(mobile,"learning-step-counter","ÉTAPE 2 / 3");
 const widths=await mobile.evaluate(()=>({view:window.innerWidth,document:document.documentElement.scrollWidth}));
 assert.ok(widths.document<=widths.view+3,"Unexpected mobile overflow: "+JSON.stringify(widths));
 console.log("PASS mobile lesson navigation at 390px without horizontal page overflow");
 await mobile.close();
 assert.deepEqual(failures,[]);
 console.log("PASS all Campus browser tests");
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
